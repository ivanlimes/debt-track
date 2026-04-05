import { BalanceBucket, CreditCardAccount } from "../../domain/accounts/account.types";
import { PayoffPlan } from "../../domain/payoff-plan/payoffPlan.types";
import { estimateMonthlyInterest } from "../interest/estimateMonthlyInterest";
import { getAccountBalanceBuckets, getBucketActiveApr, getRolledUpCurrentBalance } from "../split-balances/splitBalance.helpers";
import {
  addMonths,
  endOfMonth,
  roundCurrency,
  toIsoDate,
  toStartOfDay,
} from "../shared/calculation.helpers";
import {
  ProjectionSeriesAccountPoint,
  ProjectionSeriesPoint,
  ProjectionSeriesResult,
  ProjectionTippingPoint,
} from "../shared/calculation.types";
import { rankCardsByStrategy } from "./rankCardsByStrategy";

const MAX_PROJECTION_MONTHS = 600;

type WorkingBucket = BalanceBucket;

type WorkingAccount = {
  id: string;
  name: string;
  minimumPayment: number;
  source: CreditCardAccount;
  buckets: WorkingBucket[];
};

function getWorkingBuckets(account: CreditCardAccount): WorkingBucket[] {
  return getAccountBalanceBuckets(account).map((bucket) => ({
    ...bucket,
    currentBalance: roundCurrency(Math.max(bucket.currentBalance, 0)),
  }));
}

function getWorkingAccountBalance(account: WorkingAccount) {
  return roundCurrency(account.buckets.reduce((sum, bucket) => sum + bucket.currentBalance, 0));
}

function getMonthlyBudget(accounts: WorkingAccount[], payoffPlan: PayoffPlan) {
  if (payoffPlan.monthlyDebtBudget !== null) {
    return Math.max(payoffPlan.monthlyDebtBudget, 0);
  }

  const minimums = payoffPlan.useMinimumsFirst
    ? accounts.reduce((sum, account) => sum + Math.min(account.minimumPayment, getWorkingAccountBalance(account)), 0)
    : 0;

  return roundCurrency(minimums + Math.max(payoffPlan.extraPaymentAmount, 0));
}

function applyInterest(account: WorkingAccount, cycleDate: Date | string) {
  let totalInterestAdded = 0;
  account.buckets.forEach((bucket) => {
    const interest = estimateMonthlyInterest(bucket.currentBalance, getBucketActiveApr(bucket, cycleDate));
    bucket.currentBalance = roundCurrency(bucket.currentBalance + interest);
    totalInterestAdded = roundCurrency(totalInterestAdded + interest);
  });
  return totalInterestAdded;
}

function allocateMinimumPayments(accounts: WorkingAccount[], monthlyBudget: number) {
  const requiredMinimums = accounts.reduce(
    (sum, account) => sum + Math.min(account.minimumPayment, getWorkingAccountBalance(account)),
    0,
  );

  const allocations = new Map<string, number>();

  if (requiredMinimums <= 0 || monthlyBudget <= 0) {
    return allocations;
  }

  if (monthlyBudget >= requiredMinimums) {
    accounts.forEach((account) => {
      allocations.set(account.id, Math.min(account.minimumPayment, getWorkingAccountBalance(account)));
    });

    return allocations;
  }

  accounts.forEach((account) => {
    const accountMinimum = Math.min(account.minimumPayment, getWorkingAccountBalance(account));
    const proportionalShare = requiredMinimums === 0 ? 0 : monthlyBudget * (accountMinimum / requiredMinimums);
    allocations.set(account.id, Math.min(getWorkingAccountBalance(account), roundCurrency(proportionalShare)));
  });

  return allocations;
}

function sortBucketsForMinimum(account: WorkingAccount, cycleDate: Date | string) {
  return [...account.buckets]
    .filter((bucket) => bucket.currentBalance > 0)
    .sort((left, right) => {
      const leftApr = getBucketActiveApr(left, cycleDate);
      const rightApr = getBucketActiveApr(right, cycleDate);
      if (leftApr !== rightApr) {
        return leftApr - rightApr;
      }
      return left.label.localeCompare(right.label);
    });
}

function sortBucketsForExtra(account: WorkingAccount, cycleDate: Date | string) {
  return [...account.buckets]
    .filter((bucket) => bucket.currentBalance > 0)
    .sort((left, right) => {
      const leftDeferredPriority = left.isDeferredInterest && left.promoEndDate ? 1 : 0;
      const rightDeferredPriority = right.isDeferredInterest && right.promoEndDate ? 1 : 0;
      if (leftDeferredPriority !== rightDeferredPriority) {
        return rightDeferredPriority - leftDeferredPriority;
      }
      if (leftDeferredPriority === 1 && rightDeferredPriority === 1 && left.promoEndDate && right.promoEndDate && left.promoEndDate !== right.promoEndDate) {
        return left.promoEndDate.localeCompare(right.promoEndDate);
      }
      const leftApr = getBucketActiveApr(left, cycleDate);
      const rightApr = getBucketActiveApr(right, cycleDate);
      if (leftApr !== rightApr) {
        return rightApr - leftApr;
      }
      return left.label.localeCompare(right.label);
    });
}

function applyPaymentWithinAccount(
  account: WorkingAccount,
  totalPayment: number,
  cycleDate: Date | string,
) {
  const safePayment = roundCurrency(Math.max(totalPayment, 0));
  if (safePayment <= 0) return 0;

  const balanceBeforePayment = getWorkingAccountBalance(account);
  if (balanceBeforePayment <= 0) return 0;

  const minimumPortion = Math.min(safePayment, Math.min(Math.max(account.minimumPayment, 0), balanceBeforePayment));
  let remainingPayment = safePayment;
  let applied = 0;

  for (const bucket of sortBucketsForMinimum(account, cycleDate)) {
    if (applied >= minimumPortion || remainingPayment <= 0) break;
    const payment = Math.min(bucket.currentBalance, minimumPortion - applied);
    bucket.currentBalance = roundCurrency(Math.max(bucket.currentBalance - payment, 0));
    applied = roundCurrency(applied + payment);
    remainingPayment = roundCurrency(remainingPayment - payment);
  }

  for (const bucket of sortBucketsForExtra(account, cycleDate)) {
    if (remainingPayment <= 0) break;
    const payment = Math.min(bucket.currentBalance, remainingPayment);
    bucket.currentBalance = roundCurrency(Math.max(bucket.currentBalance - payment, 0));
    applied = roundCurrency(applied + payment);
    remainingPayment = roundCurrency(remainingPayment - payment);
  }

  return applied;
}

function applySequentialExtraPayments(
  accounts: WorkingAccount[],
  ranking: string[],
  allocations: Map<string, number>,
  extraBudget: number,
  cycleDate: Date | string,
) {
  let remainingBudget = roundCurrency(extraBudget);

  ranking.forEach((accountId) => {
    if (remainingBudget <= 0) {
      return;
    }

    const account = accounts.find((item) => item.id === accountId);

    if (!account) {
      return;
    }

    const currentAllocation = allocations.get(account.id) ?? 0;
    const unpaidBalance = roundCurrency(getWorkingAccountBalance(account) - currentAllocation);

    if (unpaidBalance <= 0) {
      return;
    }

    const payment = Math.min(unpaidBalance, remainingBudget);
    allocations.set(account.id, roundCurrency(currentAllocation + payment));
    remainingBudget = roundCurrency(remainingBudget - payment);
  });

  return allocations;
}

function buildPeriodLabel(cycleDate: Date | string) {
  return toIsoDate(cycleDate).slice(0, 7);
}

function findTippingPoint(series: ProjectionSeriesPoint[]): ProjectionTippingPoint | null {
  if (series.length === 0) {
    return null;
  }

  for (let index = 0; index < series.length; index += 1) {
    const candidate = series[index];
    if (!candidate.principalExceedsInterest) {
      continue;
    }

    const remainsPrincipalDominant = series.slice(index).every((point) => point.principalExceedsInterest);
    if (remainsPrincipalDominant) {
      return {
        monthIndex: candidate.monthIndex,
        monthStartDate: candidate.monthStartDate,
        monthEndDate: candidate.monthEndDate,
        periodLabel: candidate.periodLabel,
      };
    }
  }

  const fallback = series.find((point) => point.principalExceedsInterest);
  if (!fallback) {
    return null;
  }

  return {
    monthIndex: fallback.monthIndex,
    monthStartDate: fallback.monthStartDate,
    monthEndDate: fallback.monthEndDate,
    periodLabel: fallback.periodLabel,
  };
}

function finalizeProjectionResult(
  series: ProjectionSeriesPoint[],
  debtFreeDate: string | null,
  projectedMonthsRemaining: number | null,
  projectedInterestRemaining: number,
): ProjectionSeriesResult {
  const tippingPoint = findTippingPoint(series);
  const finalizedSeries = series.map((point, index) => ({
    ...point,
    remainingMonthsAfter:
      projectedMonthsRemaining === null
        ? null
        : Math.max(projectedMonthsRemaining - index - 1, 0),
    isTippingPoint: tippingPoint?.monthIndex === point.monthIndex,
  }));

  return {
    debtFreeDate,
    projectedMonthsRemaining,
    projectedInterestRemaining: roundCurrency(projectedInterestRemaining),
    tippingPoint,
    series: finalizedSeries,
    monthByMonthProjectionSeries: finalizedSeries,
  };
}

export function buildProjectionSeries(
  accounts: CreditCardAccount[],
  payoffPlan: PayoffPlan,
  asOfDate?: Date | string,
): ProjectionSeriesResult {
  const openAccounts = accounts
    .filter((account) => !account.isClosed && getRolledUpCurrentBalance(account) > 0)
    .map((account) => ({
      id: account.id,
      name: account.name,
      minimumPayment: Math.max(account.minimumPayment, 0),
      source: account,
      buckets: getWorkingBuckets(account),
    } satisfies WorkingAccount));

  if (openAccounts.length === 0) {
    return finalizeProjectionResult([], null, 0, 0);
  }

  const monthlyBudget = getMonthlyBudget(openAccounts, payoffPlan);
  const series: ProjectionSeriesPoint[] = [];
  let projectedInterestRemaining = 0;
  let cumulativeInterestPaid = 0;
  let cumulativePrincipalPaid = 0;
  const simulationStart = toStartOfDay(asOfDate);

  if (monthlyBudget <= 0) {
    return finalizeProjectionResult([], null, null, 0);
  }

  for (let monthIndex = 0; monthIndex < MAX_PROJECTION_MONTHS; monthIndex += 1) {
    const activeAccounts = openAccounts.filter((account) => getWorkingAccountBalance(account) > 0.004);

    if (activeAccounts.length === 0) {
      const debtFreeDate = series.length === 0
        ? toIsoDate(simulationStart)
        : series[series.length - 1]?.monthEndDate ?? toIsoDate(simulationStart);

      return finalizeProjectionResult(
        series,
        debtFreeDate,
        series.length,
        projectedInterestRemaining,
      );
    }

    const cycleStartDate = addMonths(simulationStart, monthIndex);
    const openingBalances = new Map<string, number>();
    activeAccounts.forEach((account) => {
      openingBalances.set(account.id, roundCurrency(getWorkingAccountBalance(account)));
    });

    const totalBalanceStart = roundCurrency(
      activeAccounts.reduce((sum, account) => sum + (openingBalances.get(account.id) ?? 0), 0),
    );

    let totalInterestAdded = 0;
    const interestByAccount = new Map<string, number>();

    activeAccounts.forEach((account) => {
      const interest = applyInterest(account, cycleStartDate);
      interestByAccount.set(account.id, interest);
      totalInterestAdded = roundCurrency(totalInterestAdded + interest);
    });

    projectedInterestRemaining = roundCurrency(projectedInterestRemaining + totalInterestAdded);

    const minimumAllocations = payoffPlan.useMinimumsFirst
      ? allocateMinimumPayments(activeAccounts, monthlyBudget)
      : new Map<string, number>();

    const allocatedMinimumTotal = Array.from(minimumAllocations.values()).reduce(
      (sum, value) => roundCurrency(sum + value),
      0,
    );

    const ranking = rankCardsByStrategy(
      activeAccounts.map((account) => ({
        ...account.source,
        currentBalance: getWorkingAccountBalance(account),
      })),
      payoffPlan,
      cycleStartDate,
    ).map((item) => item.accountId);

    const allocations = applySequentialExtraPayments(
      activeAccounts,
      ranking,
      minimumAllocations,
      roundCurrency(monthlyBudget - allocatedMinimumTotal),
      cycleStartDate,
    );

    let totalPaymentApplied = 0;
    const paymentByAccount = new Map<string, number>();

    activeAccounts.forEach((account) => {
      const paymentApplied = Math.min(getWorkingAccountBalance(account), allocations.get(account.id) ?? 0);
      const applied = applyPaymentWithinAccount(account, paymentApplied, cycleStartDate);
      paymentByAccount.set(account.id, applied);
      totalPaymentApplied = roundCurrency(totalPaymentApplied + applied);
    });

    const accountBreakdown: ProjectionSeriesAccountPoint[] = activeAccounts.map((account) => {
      const openingBalance = openingBalances.get(account.id) ?? 0;
      const interestCharged = interestByAccount.get(account.id) ?? 0;
      const minimumPaymentApplied = roundCurrency(Math.min(paymentByAccount.get(account.id) ?? 0, minimumAllocations.get(account.id) ?? 0));
      const totalPaymentForAccount = roundCurrency(paymentByAccount.get(account.id) ?? 0);
      const extraPaymentApplied = roundCurrency(Math.max(totalPaymentForAccount - minimumPaymentApplied, 0));
      const endingBalance = roundCurrency(getWorkingAccountBalance(account));
      const principalPaid = roundCurrency(totalPaymentForAccount - interestCharged);

      return {
        accountId: account.id,
        accountName: account.name,
        openingBalance,
        minimumPaymentApplied,
        extraPaymentApplied,
        totalPaymentApplied: totalPaymentForAccount,
        interestCharged,
        principalPaid,
        endingBalance,
        isTargetCard: ranking[0] === account.id,
      };
    });

    const reconciledTotalPayment = roundCurrency(
      accountBreakdown.reduce((sum, point) => sum + point.totalPaymentApplied, 0),
    );
    const reconciledTotalInterest = roundCurrency(
      accountBreakdown.reduce((sum, point) => sum + point.interestCharged, 0),
    );
    const reconciledTotalPrincipal = roundCurrency(
      accountBreakdown.reduce((sum, point) => sum + point.principalPaid, 0),
    );
    const reconciledEndingBalance = roundCurrency(
      accountBreakdown.reduce((sum, point) => sum + point.endingBalance, 0),
    );

    cumulativeInterestPaid = roundCurrency(cumulativeInterestPaid + reconciledTotalInterest);
    cumulativePrincipalPaid = roundCurrency(cumulativePrincipalPaid + reconciledTotalPrincipal);

    series.push({
      monthIndex,
      periodLabel: buildPeriodLabel(cycleStartDate),
      monthStartDate: toIsoDate(cycleStartDate),
      monthEndDate: toIsoDate(endOfMonth(cycleStartDate)),
      totalBalanceStart,
      openingBalance: totalBalanceStart,
      minimumPaymentTotal: roundCurrency(allocatedMinimumTotal),
      extraPaymentTotal: roundCurrency(Math.max(reconciledTotalPayment - allocatedMinimumTotal, 0)),
      totalInterestAdded: reconciledTotalInterest,
      interestCharged: reconciledTotalInterest,
      totalPaymentApplied: reconciledTotalPayment,
      totalPayment: reconciledTotalPayment,
      principalPaid: reconciledTotalPrincipal,
      totalBalanceEnd: reconciledEndingBalance,
      endingBalance: reconciledEndingBalance,
      cumulativeInterestPaid,
      cumulativePrincipalPaid,
      remainingMonthsAfter: null,
      principalExceedsInterest: reconciledTotalPrincipal > reconciledTotalInterest,
      isTippingPoint: false,
      targetCardId: ranking[0] ?? null,
      planStrategy: payoffPlan.strategy,
      remainingAccountBalances: activeAccounts
        .filter((account) => getWorkingAccountBalance(account) > 0.004)
        .map((account) => ({
          accountId: account.id,
          accountName: account.name,
          balance: roundCurrency(getWorkingAccountBalance(account)),
        })),
      accountBreakdown,
    });
  }

  return finalizeProjectionResult(series, null, null, projectedInterestRemaining);
}
