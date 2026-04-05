import { getPromoDaysRemaining } from "../timing/getPromoDaysRemaining";
import { getPromoStatus } from "../timing/getPromoStatus";
import { estimateMonthlyInterest } from "../interest/estimateMonthlyInterest";
import { getDeferredInterestDetails } from "../promo/getDeferredInterestDetails";
import { BalanceBucket, CreditCardAccount } from "../../domain/accounts/account.types";
import {
  getBucketDeferredInterestAprBasis,
  getBucketPromoKinds,
  getEarliestBucketPromoEndDate,
  getPromoStartReferenceDate,
  hasMixedAprs,
  hasMixedPromoRules,
  normalizeBalanceBuckets,
  pickEarliestPromoBucket,
} from "../../domain/accounts/account.split";
import {
  addDays,
  diffInCalendarDays,
  roundCurrency,
  roundPercent,
  toIsoDate,
  toStartOfDay,
} from "../shared/calculation.helpers";
import { DeferredInterestDetails } from "../shared/calculation.types";

type BucketMetrics = {
  bucket: BalanceBucket;
  activeApr: number;
  estimatedMonthlyInterest: number;
  promoStatus: ReturnType<typeof getPromoStatus>;
  promoDaysRemaining: number | null;
  deferredInterest: DeferredInterestDetails;
};

function createBucketAsAccountLike(account: CreditCardAccount, bucket: BalanceBucket) {
  return {
    hasPromoApr: bucket.hasPromoApr,
    promoApr: bucket.promoApr,
    promoEndDate: bucket.promoEndDate,
    currentBalance: bucket.currentBalance,
    isDeferredInterest: bucket.isDeferredInterest,
    deferredInterestAprBasis: bucket.isDeferredInterest
      ? getBucketDeferredInterestAprBasis(bucket, account)
      : null,
    deferredInterestStartDate: bucket.isDeferredInterest
      ? getPromoStartReferenceDate(account)
      : null,
    aprAfterPromo: bucket.aprAfterPromo,
    standardApr: bucket.apr,
  };
}

export function getAccountBalanceBuckets(account: CreditCardAccount): BalanceBucket[] {
  return normalizeBalanceBuckets(account.balanceBuckets, account);
}

export function getBucketActiveApr(bucket: BalanceBucket, asOfDate?: Date | string) {
  const promoLike = createBucketAsAccountLike(
    {
      ...({} as CreditCardAccount),
      deferredInterestAprBasis: null,
      deferredInterestStartDate: null,
      createdAt: new Date().toISOString(),
      lastKnownStatementDate: null,
    },
    bucket,
  );
  const promoStatus = getPromoStatus(promoLike, asOfDate);
  if ((promoStatus === "active" || promoStatus === "ending_soon") && bucket.hasPromoApr && bucket.promoApr !== null) {
    return Math.max(bucket.promoApr, 0);
  }

  if (bucket.hasPromoApr && bucket.aprAfterPromo !== null && promoStatus !== "active" && promoStatus !== "ending_soon") {
    return Math.max(bucket.aprAfterPromo, 0);
  }

  return Math.max(bucket.apr, 0);
}

export function getBucketMetrics(
  account: CreditCardAccount,
  projectedPayoffDate: string | null,
  asOfDate?: Date | string,
): BucketMetrics[] {
  return getAccountBalanceBuckets(account).map((bucket) => {
    const accountLike = createBucketAsAccountLike(account, bucket);
    const activeApr = getBucketActiveApr(bucket, asOfDate);
    return {
      bucket,
      activeApr,
      estimatedMonthlyInterest: estimateMonthlyInterest(bucket.currentBalance, activeApr),
      promoStatus: getPromoStatus(accountLike, asOfDate),
      promoDaysRemaining: getPromoDaysRemaining(accountLike, asOfDate),
      deferredInterest: getDeferredInterestDetails(accountLike, projectedPayoffDate, asOfDate),
    };
  });
}

export function getRolledUpCurrentBalance(account: CreditCardAccount) {
  return roundCurrency(
    getAccountBalanceBuckets(account).reduce((sum, bucket) => sum + Math.max(bucket.currentBalance, 0), 0),
  );
}

export function getRolledUpEstimatedMonthlyInterest(account: CreditCardAccount, asOfDate?: Date | string) {
  return roundCurrency(
    getBucketMetrics(account, null, asOfDate).reduce(
      (sum, bucketMetrics) => sum + bucketMetrics.estimatedMonthlyInterest,
      0,
    ),
  );
}

export function getWeightedActiveAprSummary(account: CreditCardAccount, asOfDate?: Date | string) {
  const buckets = getBucketMetrics(account, null, asOfDate);
  const totalBalance = buckets.reduce((sum, item) => sum + Math.max(item.bucket.currentBalance, 0), 0);
  if (totalBalance <= 0) {
    return 0;
  }
  return roundPercent(
    buckets.reduce((sum, item) => sum + item.activeApr * Math.max(item.bucket.currentBalance, 0), 0)
      / totalBalance,
  );
}

export function getSplitBalanceSummary(
  account: CreditCardAccount,
  projectedPayoffDate: string | null,
  asOfDate?: Date | string,
) {
  const buckets = getBucketMetrics(account, projectedPayoffDate, asOfDate);
  const bucketCount = buckets.length;
  const mixedAprs = hasMixedAprs(buckets.map((item) => item.bucket));
  const mixedPromoRules = hasMixedPromoRules(buckets.map((item) => item.bucket));
  const earliestPromoBucket = pickEarliestPromoBucket(buckets.map((item) => item.bucket));
  const earliestPromoMetrics = earliestPromoBucket
    ? buckets.find((item) => item.bucket.id === earliestPromoBucket.id) ?? null
    : null;

  return {
    bucketCount,
    mixedAprs,
    mixedPromoRules,
    hasDeferredInterestBucket: buckets.some((item) => item.bucket.isDeferredInterest),
    earliestPromoEndDate: getEarliestBucketPromoEndDate(buckets.map((item) => item.bucket)),
    earliestPromoIsDeferred: earliestPromoBucket?.isDeferredInterest ?? false,
    earliestPromoStatus: earliestPromoMetrics?.promoStatus ?? "none",
    earliestPromoDaysRemaining: earliestPromoMetrics?.promoDaysRemaining ?? null,
    bucketMetrics: buckets,
    weightedActiveApr: getWeightedActiveAprSummary(account, asOfDate),
    rolledUpEstimatedMonthlyInterest: roundCurrency(
      buckets.reduce((sum, item) => sum + item.estimatedMonthlyInterest, 0),
    ),
    rolledUpCurrentBalance: getRolledUpCurrentBalance(account),
  };
}

export function getAggregateDeferredInterestDetails(
  account: CreditCardAccount,
  projectedPayoffDate: string | null,
  asOfDate?: Date | string,
): DeferredInterestDetails {
  const bucketMetrics = getBucketMetrics(account, projectedPayoffDate, asOfDate).filter(
    (item) => item.bucket.isDeferredInterest,
  );

  if (bucketMetrics.length === 0) {
    return getDeferredInterestDetails(account, projectedPayoffDate, asOfDate);
  }

  const activeBuckets = bucketMetrics.filter((item) => item.deferredInterest.isDeferredInterestActive);
  const daysRemaining = activeBuckets.length === 0
    ? bucketMetrics.reduce<number | null>((minimum, item) => {
        const value = item.deferredInterest.deferredInterestDaysRemaining;
        if (value === null) return minimum;
        if (minimum === null || value < minimum) return value;
        return minimum;
      }, null)
    : activeBuckets.reduce<number | null>((minimum, item) => {
        const value = item.deferredInterest.deferredInterestDaysRemaining;
        if (value === null) return minimum;
        if (minimum === null || value < minimum) return value;
        return minimum;
      }, null);

  const orderedStatuses = ["none", "safe", "watch", "warning", "critical", "expired"] as const;
  const riskStatus = bucketMetrics.reduce<typeof orderedStatuses[number]>((current, item) => {
    const nextStatus = item.deferredInterest.deferredInterestRiskStatus;
    return orderedStatuses.indexOf(nextStatus) > orderedStatuses.indexOf(current)
      ? nextStatus
      : current;
  }, "none");

  const payoffTarget = roundCurrency(
    bucketMetrics.reduce(
      (sum, item) => sum + (item.deferredInterest.payoffByPromoDeadlineMonthlyTarget ?? 0),
      0,
    ),
  );
  const accrued = roundCurrency(
    bucketMetrics.reduce(
      (sum, item) => sum + (item.deferredInterest.deferredInterestShadowAccrued ?? 0),
      0,
    ),
  );
  const exposure = roundCurrency(
    bucketMetrics.reduce(
      (sum, item) => sum + (item.deferredInterest.deferredInterestPenaltyExposure ?? 0),
      0,
    ),
  );
  const safeByDeadline = bucketMetrics.every(
    (item) => item.deferredInterest.deferredInterestSafeByDeadline === true,
  );
  const warningMessages = bucketMetrics
    .map((item) => item.deferredInterest.deferredInterestWarningMessage)
    .filter((message): message is string => Boolean(message));

  const promoRiskBadges = [...new Set(bucketMetrics.flatMap((item) => item.deferredInterest.promoRiskBadges))];

  const bucketNames = bucketMetrics.map((item) => item.bucket.label).join(", ");
  const deadlineDate = daysRemaining === null
    ? null
    : toIsoDate(addDays(toStartOfDay(asOfDate), daysRemaining));
  const warningMessage = safeByDeadline
    ? deadlineDate
      ? `On track to clear deferred-interest bucket balances by ${deadlineDate}.`
      : `On track to clear deferred-interest bucket balances before the active promo deadline.`
    : warningMessages[0] ?? (deadlineDate
      ? `Pay ${payoffTarget.toFixed(2)} / month to clear deferred-interest buckets (${bucketNames}) by ${deadlineDate} and avoid approximately ${exposure.toFixed(2)} in retroactive interest.`
      : `Deferred-interest buckets (${bucketNames}) still carry retroactive-interest risk.`);

  return {
    isDeferredInterestActive: activeBuckets.length > 0,
    deferredInterestDaysRemaining: daysRemaining,
    deferredInterestShadowAccrued: accrued,
    deferredInterestPenaltyExposure: exposure,
    payoffByPromoDeadlineMonthlyTarget: payoffTarget > 0 ? payoffTarget : null,
    deferredInterestRiskStatus: riskStatus,
    deferredInterestSafeByDeadline: safeByDeadline,
    deferredInterestWarningMessage: warningMessage,
    promoRiskBadges,
    deferredInterestAprBasis: roundPercent(
      bucketMetrics.reduce(
        (sum, item) => sum + (item.deferredInterest.deferredInterestAprBasis ?? 0) * item.bucket.currentBalance,
        0,
      ) / Math.max(bucketMetrics.reduce((sum, item) => sum + item.bucket.currentBalance, 0), 1),
    ),
  };
}

export function getCardLevelPromoSummary(
  account: CreditCardAccount,
  projectedPayoffDate: string | null,
  asOfDate?: Date | string,
) {
  const summary = getSplitBalanceSummary(account, projectedPayoffDate, asOfDate);
  const deferred = getAggregateDeferredInterestDetails(account, projectedPayoffDate, asOfDate);
  const bucketCount = summary.bucketCount;

  return {
    ...summary,
    deferred,
    activeAprSummary: summary.mixedAprs
      ? `${summary.weightedActiveApr.toFixed(2)}% blended active APR`
      : `${summary.weightedActiveApr.toFixed(2)}% active APR`,
    splitBalanceLabel: bucketCount > 1 ? `${bucketCount} balance buckets` : "1 balance bucket",
  };
}

export function getBucketAllocationPrioritySummary(
  account: CreditCardAccount,
  asOfDate?: Date | string,
) {
  const bucketMetrics = getBucketMetrics(account, null, asOfDate).filter(
    (item) => item.bucket.currentBalance > 0,
  );

  const minimumOrder = [...bucketMetrics]
    .sort((left, right) => {
      if (left.activeApr !== right.activeApr) {
        return left.activeApr - right.activeApr;
      }
      return left.bucket.label.localeCompare(right.bucket.label);
    })
    .map((item) => item.bucket.label);

  const extraOrder = [...bucketMetrics]
    .sort((left, right) => {
      const leftDeferred = left.deferredInterest.deferredInterestRiskStatus;
      const rightDeferred = right.deferredInterest.deferredInterestRiskStatus;
      const leftDeferredPriority = ["critical", "warning", "watch"].includes(leftDeferred) ? 1 : 0;
      const rightDeferredPriority = ["critical", "warning", "watch"].includes(rightDeferred) ? 1 : 0;
      if (leftDeferredPriority !== rightDeferredPriority) {
        return rightDeferredPriority - leftDeferredPriority;
      }
      if (left.activeApr !== right.activeApr) {
        return right.activeApr - left.activeApr;
      }
      return left.bucket.label.localeCompare(right.bucket.label);
    })
    .map((item) => item.bucket.label);

  return {
    minimumOrder,
    extraOrder,
  };
}
