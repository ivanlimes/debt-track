import { BalanceBucket, CreditCardAccount } from "../../domain/accounts/account.types";
import { PayoffPlan } from "../../domain/payoff-plan/payoffPlan.types";
import { estimateMonthlyInterest } from "../interest/estimateMonthlyInterest";
import {
  getAccountBalanceBuckets,
  getBucketActiveApr,
  getCardLevelPromoSummary,
  getRolledUpCurrentBalance,
  getRolledUpEstimatedMonthlyInterest,
  getWeightedActiveAprSummary,
} from "../split-balances/splitBalance.helpers";
import { addMonths, endOfMonth, roundCurrency, toIsoDate } from "../shared/calculation.helpers";
import { RankedAccount } from "../shared/calculation.types";

const MAX_PROJECTION_MONTHS = 600;

type WorkingBucket = BalanceBucket;

function getWorkingBuckets(account: CreditCardAccount): WorkingBucket[] {
  return getAccountBalanceBuckets(account).map((bucket) => ({
    ...bucket,
    currentBalance: roundCurrency(Math.max(bucket.currentBalance, 0)),
  }));
}

function createBucketAccountLike(account: CreditCardAccount, bucket: WorkingBucket) {
  return {
    hasPromoApr: bucket.hasPromoApr,
    promoApr: bucket.promoApr,
    promoEndDate: bucket.promoEndDate,
    currentBalance: bucket.currentBalance,
    isDeferredInterest: bucket.isDeferredInterest,
    deferredInterestAprBasis: account.deferredInterestAprBasis ?? bucket.aprAfterPromo ?? bucket.apr,
    deferredInterestStartDate: account.deferredInterestStartDate,
    aprAfterPromo: bucket.aprAfterPromo,
    standardApr: bucket.apr,
  };
}

function getWorkingBalance(buckets: WorkingBucket[]) {
  return roundCurrency(buckets.reduce((sum, bucket) => sum + bucket.currentBalance, 0));
}

function getLowestAprAllocationOrder(account: CreditCardAccount, buckets: WorkingBucket[], asOfDate?: Date | string) {
  return [...buckets]
    .filter((bucket) => bucket.currentBalance > 0)
    .sort((left, right) => {
      const leftApr = getBucketActiveApr(left, asOfDate);
      const rightApr = getBucketActiveApr(right, asOfDate);
      if (leftApr !== rightApr) {
        return leftApr - rightApr;
      }
      return left.label.localeCompare(right.label);
    });
}

function getHighestAprAllocationOrder(account: CreditCardAccount, buckets: WorkingBucket[], asOfDate?: Date | string) {
  return [...buckets]
    .filter((bucket) => bucket.currentBalance > 0)
    .sort((left, right) => {
      const leftLike = createBucketAccountLike(account, left);
      const rightLike = createBucketAccountLike(account, right);
      const leftDays = leftLike.promoEndDate ? Math.max(new Date(leftLike.promoEndDate).getTime() - new Date(asOfDate ?? new Date()).setHours(0, 0, 0, 0), 0) : null;
      const rightDays = rightLike.promoEndDate ? Math.max(new Date(rightLike.promoEndDate).getTime() - new Date(asOfDate ?? new Date()).setHours(0, 0, 0, 0), 0) : null;
      const leftDeferredPriority = left.isDeferredInterest && left.currentBalance > 0 && leftDays !== null ? 1 : 0;
      const rightDeferredPriority = right.isDeferredInterest && right.currentBalance > 0 && rightDays !== null ? 1 : 0;
      if (leftDeferredPriority !== rightDeferredPriority) {
        return rightDeferredPriority - leftDeferredPriority;
      }
      if (leftDeferredPriority === 1 && rightDeferredPriority === 1 && left.promoEndDate && right.promoEndDate && left.promoEndDate !== right.promoEndDate) {
        return left.promoEndDate.localeCompare(right.promoEndDate);
      }
      const leftApr = getBucketActiveApr(left, asOfDate);
      const rightApr = getBucketActiveApr(right, asOfDate);
      if (leftApr !== rightApr) {
        return rightApr - leftApr;
      }
      return left.label.localeCompare(right.label);
    });
}

function allocatePaymentAcrossBuckets(
  account: CreditCardAccount,
  buckets: WorkingBucket[],
  totalPayment: number,
  minimumPayment: number,
  asOfDate?: Date | string,
) {
  const safePayment = roundCurrency(Math.max(totalPayment, 0));
  if (safePayment <= 0) return 0;

  const totalBalance = getWorkingBalance(buckets);
  if (totalBalance <= 0) return 0;

  const minimumPortion = Math.min(safePayment, Math.min(Math.max(minimumPayment, 0), totalBalance));
  let remainingPayment = safePayment;
  let applied = 0;

  for (const bucket of getLowestAprAllocationOrder(account, buckets, asOfDate)) {
    if (remainingPayment <= 0 || applied >= minimumPortion) break;
    const bucketAllowance = Math.min(bucket.currentBalance, minimumPortion - applied);
    bucket.currentBalance = roundCurrency(Math.max(bucket.currentBalance - bucketAllowance, 0));
    applied = roundCurrency(applied + bucketAllowance);
    remainingPayment = roundCurrency(remainingPayment - bucketAllowance);
  }

  for (const bucket of getHighestAprAllocationOrder(account, buckets, asOfDate)) {
    if (remainingPayment <= 0) break;
    const payment = Math.min(bucket.currentBalance, remainingPayment);
    bucket.currentBalance = roundCurrency(Math.max(bucket.currentBalance - payment, 0));
    remainingPayment = roundCurrency(remainingPayment - payment);
    applied = roundCurrency(applied + payment);
  }

  return applied;
}

function getSingleAccountMonthlyBudget(account: CreditCardAccount, payoffPlan: PayoffPlan) {
  if (payoffPlan.monthlyDebtBudget !== null) {
    return Math.max(payoffPlan.monthlyDebtBudget, 0);
  }

  if (payoffPlan.useMinimumsFirst) {
    return roundCurrency(account.minimumPayment + Math.max(payoffPlan.extraPaymentAmount, 0));
  }

  return Math.max(payoffPlan.extraPaymentAmount, 0);
}

function getSingleAccountProjection(
  account: CreditCardAccount,
  payoffPlan: PayoffPlan,
  asOfDate?: Date | string,
) {
  const buckets = getWorkingBuckets(account);
  const monthlyBudget = getSingleAccountMonthlyBudget(account, payoffPlan);
  const referenceDate = asOfDate ?? new Date();

  if (getWorkingBalance(buckets) <= 0) {
    return {
      projectedPayoffDate: toIsoDate(referenceDate),
      projectedMonthsRemaining: 0,
    };
  }

  if (monthlyBudget <= 0) {
    return {
      projectedPayoffDate: null,
      projectedMonthsRemaining: null,
    };
  }

  for (let month = 1; month <= MAX_PROJECTION_MONTHS; month += 1) {
    const cycleDate = addMonths(referenceDate, month - 1);
    buckets.forEach((bucket) => {
      bucket.currentBalance = roundCurrency(
        bucket.currentBalance + estimateMonthlyInterest(bucket.currentBalance, getBucketActiveApr(bucket, cycleDate)),
      );
    });

    allocatePaymentAcrossBuckets(account, buckets, monthlyBudget, account.minimumPayment, cycleDate);

    if (getWorkingBalance(buckets) <= 0.004) {
      return {
        projectedPayoffDate: toIsoDate(endOfMonth(cycleDate)),
        projectedMonthsRemaining: month,
      };
    }
  }

  return {
    projectedPayoffDate: null,
    projectedMonthsRemaining: null,
  };
}

function getComparator(strategy: PayoffPlan["strategy"]) {
  if (strategy === "snowball") {
    return (left: CreditCardAccount, right: CreditCardAccount, asOfDate?: Date | string) => {
      const leftBalance = getRolledUpCurrentBalance(left);
      const rightBalance = getRolledUpCurrentBalance(right);
      if (leftBalance !== rightBalance) {
        return leftBalance - rightBalance;
      }

      const rightApr = getWeightedActiveAprSummary(right, asOfDate);
      const leftApr = getWeightedActiveAprSummary(left, asOfDate);

      if (leftApr !== rightApr) {
        return rightApr - leftApr;
      }

      return left.name.localeCompare(right.name);
    };
  }

  return (left: CreditCardAccount, right: CreditCardAccount, asOfDate?: Date | string) => {
    const rightApr = getWeightedActiveAprSummary(right, asOfDate);
    const leftApr = getWeightedActiveAprSummary(left, asOfDate);

    if (leftApr !== rightApr) {
      return rightApr - leftApr;
    }

    const rightInterest = getRolledUpEstimatedMonthlyInterest(right, asOfDate);
    const leftInterest = getRolledUpEstimatedMonthlyInterest(left, asOfDate);

    if (leftInterest !== rightInterest) {
      return rightInterest - leftInterest;
    }

    const leftBalance = getRolledUpCurrentBalance(left);
    const rightBalance = getRolledUpCurrentBalance(right);

    if (leftBalance !== rightBalance) {
      return rightBalance - leftBalance;
    }

    return left.name.localeCompare(right.name);
  };
}

export function rankCardsByStrategy(
  accounts: CreditCardAccount[],
  payoffPlan: PayoffPlan,
  asOfDate?: Date | string,
): RankedAccount[] {
  const openAccounts = accounts.filter((account) => !account.isClosed && getRolledUpCurrentBalance(account) > 0);

  if (openAccounts.length === 0) {
    return [];
  }

  let rankedAccounts: CreditCardAccount[];

  if (payoffPlan.strategy === "custom") {
    const priority = new Map(payoffPlan.customPriorityOrder.map((id, index) => [id, index]));

    rankedAccounts = [...openAccounts].sort((left, right) => {
      const leftPriority = priority.get(left.id);
      const rightPriority = priority.get(right.id);

      if (leftPriority !== undefined || rightPriority !== undefined) {
        if (leftPriority === undefined) {
          return 1;
        }

        if (rightPriority === undefined) {
          return -1;
        }

        return leftPriority - rightPriority;
      }

      return getComparator("avalanche")(left, right, asOfDate);
    });
  } else {
    rankedAccounts = [...openAccounts].sort((left, right) =>
      getComparator(payoffPlan.strategy)(left, right, asOfDate),
    );
  }

  return rankedAccounts.map((account, index) => {
    const estimate = getSingleAccountProjection(account, payoffPlan, asOfDate);
    const splitSummary = getCardLevelPromoSummary(account, estimate.projectedPayoffDate, asOfDate);

    return {
      accountId: account.id,
      accountName: account.name,
      rank: index + 1,
      currentBalance: getRolledUpCurrentBalance(account),
      activeApr: splitSummary.weightedActiveApr,
      estimatedMonthlyInterest: splitSummary.rolledUpEstimatedMonthlyInterest,
      projectedPayoffDate: estimate.projectedPayoffDate,
      projectedMonthsRemaining: estimate.projectedMonthsRemaining,
      reason:
        payoffPlan.strategy === "snowball"
          ? "Lowest balance first"
          : payoffPlan.strategy === "custom"
            ? "Custom priority order"
            : "Highest active APR first",
    };
  });
}
