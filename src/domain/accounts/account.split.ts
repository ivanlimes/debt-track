import {
  BALANCE_BUCKET_TYPES,
  BalanceBucket,
  CreateCreditCardAccountInput,
  CreditCardAccount,
} from "./account.types";

const VALID_BUCKET_TYPES = new Set<string>(BALANCE_BUCKET_TYPES);

function roundCurrency(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toDateValue(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildFallbackBucketLabel(index: number) {
  return `Balance bucket ${index + 1}`;
}

function weightedAverage(values: Array<{ value: number; weight: number }>) {
  const totalWeight = values.reduce((sum, item) => sum + Math.max(item.weight, 0), 0);
  if (totalWeight <= 0) return 0;
  return roundCurrency(
    values.reduce((sum, item) => sum + item.value * Math.max(item.weight, 0), 0) / totalWeight,
  );
}

function createNormalizedBucketId(index: number, id: string | undefined) {
  const trimmed = typeof id === "string" ? id.trim() : "";
  return trimmed || `bucket_${index + 1}`;
}

export function normalizeBalanceBuckets(
  buckets: unknown,
  fallbackBase?: Pick<
    CreateCreditCardAccountInput,
    | "currentBalance"
    | "standardApr"
    | "hasPromoApr"
    | "promoApr"
    | "promoEndDate"
    | "aprAfterPromo"
    | "isDeferredInterest"
    | "notes"
  >,
): BalanceBucket[] {
  if (Array.isArray(buckets) && buckets.length > 0) {
    return buckets.map((bucket, index) => {
      const record = typeof bucket === "object" && bucket !== null ? (bucket as Record<string, unknown>) : {};
      const rawType = typeof record.bucketType === "string" ? record.bucketType : "purchase";
      const bucketType = VALID_BUCKET_TYPES.has(rawType) ? rawType : "purchase";
      const balance = typeof record.currentBalance === "number" && Number.isFinite(record.currentBalance)
        ? Math.max(record.currentBalance, 0)
        : 0;
      const apr = typeof record.apr === "number" && Number.isFinite(record.apr)
        ? Math.max(record.apr, 0)
        : 0;
      const hasPromoApr = record.hasPromoApr === true;
      const promoApr = hasPromoApr && typeof record.promoApr === "number" && Number.isFinite(record.promoApr)
        ? Math.max(record.promoApr, 0)
        : null;
      const promoEndDate = hasPromoApr && typeof record.promoEndDate === "string" && record.promoEndDate.trim()
        ? record.promoEndDate.trim()
        : null;
      const aprAfterPromo = hasPromoApr && typeof record.aprAfterPromo === "number" && Number.isFinite(record.aprAfterPromo)
        ? Math.max(record.aprAfterPromo, 0)
        : null;
      const isDeferredInterest =
        bucketType === "deferred_interest" || record.isDeferredInterest === true;
      return {
        id: createNormalizedBucketId(index, typeof record.id === "string" ? record.id : undefined),
        label: typeof record.label === "string" && record.label.trim()
          ? record.label.trim()
          : buildFallbackBucketLabel(index),
        bucketType: bucketType as BalanceBucket["bucketType"],
        currentBalance: roundCurrency(balance),
        apr: roundCurrency(apr),
        hasPromoApr,
        promoApr,
        promoEndDate,
        aprAfterPromo,
        isDeferredInterest,
        notes: typeof record.notes === "string" && record.notes.trim() ? record.notes.trim() : null,
      };
    });
  }

  if (!fallbackBase) {
    return [];
  }

  return [
    {
      id: "bucket_1",
      label: fallbackBase.hasPromoApr
        ? fallbackBase.isDeferredInterest
          ? "Deferred-interest balance"
          : "Promo balance"
        : "Standard balance",
      bucketType: fallbackBase.isDeferredInterest
        ? "deferred_interest"
        : fallbackBase.hasPromoApr
          ? "promo_purchase"
          : "purchase",
      currentBalance: roundCurrency(Math.max(fallbackBase.currentBalance, 0)),
      apr: roundCurrency(Math.max(fallbackBase.standardApr, 0)),
      hasPromoApr: fallbackBase.hasPromoApr,
      promoApr: fallbackBase.hasPromoApr ? fallbackBase.promoApr : null,
      promoEndDate: fallbackBase.hasPromoApr ? fallbackBase.promoEndDate : null,
      aprAfterPromo: fallbackBase.hasPromoApr ? fallbackBase.aprAfterPromo : null,
      isDeferredInterest: fallbackBase.hasPromoApr && fallbackBase.isDeferredInterest,
      notes: fallbackBase.notes,
    },
  ];
}

export function getSplitBalanceRollups(
  buckets: BalanceBucket[],
  fallbackApr = 0,
  fallbackPromoFields?: Pick<
    CreateCreditCardAccountInput,
    | "promoApr"
    | "promoEndDate"
    | "aprAfterPromo"
    | "deferredInterestAprBasis"
    | "deferredInterestStartDate"
  >,
) {
  const totalBalance = roundCurrency(
    buckets.reduce((sum, bucket) => sum + Math.max(bucket.currentBalance, 0), 0),
  );
  const standardApr = weightedAverage(
    buckets.map((bucket) => ({ value: Math.max(bucket.apr, 0), weight: bucket.currentBalance })),
  );
  const promoBuckets = buckets.filter((bucket) => bucket.hasPromoApr && bucket.promoEndDate);
  const sortedPromoBuckets = [...promoBuckets].sort((left, right) => {
    if (left.promoEndDate === right.promoEndDate) {
      return left.label.localeCompare(right.label);
    }
    if (!left.promoEndDate) return 1;
    if (!right.promoEndDate) return -1;
    return left.promoEndDate.localeCompare(right.promoEndDate);
  });
  const earliestPromo = sortedPromoBuckets[0] ?? null;
  const promoApr = promoBuckets.length > 0
    ? weightedAverage(
        promoBuckets.map((bucket) => ({ value: bucket.promoApr ?? 0, weight: bucket.currentBalance })),
      )
    : fallbackPromoFields?.promoApr ?? null;
  const aprAfterPromo = promoBuckets.length > 0
    ? weightedAverage(
        promoBuckets.map((bucket) => ({
          value: bucket.aprAfterPromo ?? bucket.apr,
          weight: bucket.currentBalance,
        })),
      )
    : fallbackPromoFields?.aprAfterPromo ?? null;
  const deferredBuckets = buckets.filter((bucket) => bucket.isDeferredInterest);
  const deferredInterestAprBasis = deferredBuckets.length > 0
    ? weightedAverage(
        deferredBuckets.map((bucket) => ({
          value: bucket.aprAfterPromo ?? bucket.apr,
          weight: bucket.currentBalance,
        })),
      )
    : fallbackPromoFields?.deferredInterestAprBasis ?? null;

  return {
    currentBalance: totalBalance,
    standardApr: totalBalance > 0 ? standardApr : roundCurrency(Math.max(fallbackApr, 0)),
    hasPromoApr: promoBuckets.length > 0,
    promoApr,
    promoEndDate: earliestPromo?.promoEndDate ?? fallbackPromoFields?.promoEndDate ?? null,
    aprAfterPromo,
    isDeferredInterest: deferredBuckets.length > 0,
    deferredInterestAprBasis,
    deferredInterestStartDate: fallbackPromoFields?.deferredInterestStartDate ?? null,
  };
}

export function synchronizeSplitBalanceInput(
  input: CreateCreditCardAccountInput,
): CreateCreditCardAccountInput {
  if (!input.hasSplitBalances) {
    return {
      ...input,
      balanceBuckets: null,
    };
  }

  const balanceBuckets = normalizeBalanceBuckets(input.balanceBuckets, input);
  const rollups = getSplitBalanceRollups(balanceBuckets, input.standardApr, input);

  return {
    ...input,
    ...rollups,
    balanceBuckets,
  };
}

export function synchronizeSplitBalanceAccount(account: CreditCardAccount): CreditCardAccount {
  if (!account.hasSplitBalances) {
    return {
      ...account,
      balanceBuckets: null,
    };
  }

  const balanceBuckets = normalizeBalanceBuckets(account.balanceBuckets, account);
  const rollups = getSplitBalanceRollups(balanceBuckets, account.standardApr, account);

  return {
    ...account,
    ...rollups,
    balanceBuckets,
  };
}

export function getEarliestBucketPromoEndDate(buckets: BalanceBucket[]) {
  const dates = buckets
    .map((bucket) => bucket.promoEndDate)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => left.localeCompare(right));

  return dates[0] ?? null;
}

export function getBucketPromoKinds(buckets: BalanceBucket[]) {
  return new Set(
    buckets
      .filter((bucket) => bucket.hasPromoApr)
      .map((bucket) => (bucket.isDeferredInterest ? "deferred_interest" : "promo")),
  );
}

export function hasMixedAprs(buckets: BalanceBucket[]) {
  const aprValues = new Set(buckets.map((bucket) => roundCurrency(bucket.apr)));
  return aprValues.size > 1;
}

export function hasMixedPromoRules(buckets: BalanceBucket[]) {
  const promoKinds = getBucketPromoKinds(buckets);
  return promoKinds.size > 1 || (promoKinds.size === 1 && buckets.filter((bucket) => bucket.hasPromoApr).length !== buckets.length);
}

export function getBucketAprSummaryLabel(buckets: BalanceBucket[]) {
  if (buckets.length === 0) return "No balance buckets";
  if (!hasMixedAprs(buckets)) {
    return `${roundCurrency(Math.max(buckets[0]?.apr ?? 0, 0)).toFixed(2)}% across 1 rate`;
  }
  const sortedAprs = [...new Set(buckets.map((bucket) => roundCurrency(bucket.apr).toFixed(2)))].sort();
  return `${sortedAprs[0]}%–${sortedAprs[sortedAprs.length - 1]}% across ${sortedAprs.length} rates`;
}

export function getLatestPromoDeadlineLabel(buckets: BalanceBucket[]) {
  const earliest = getEarliestBucketPromoEndDate(buckets);
  return earliest;
}

export function pickEarliestPromoBucket(buckets: BalanceBucket[]) {
  return [...buckets]
    .filter((bucket) => bucket.hasPromoApr && bucket.promoEndDate)
    .sort((left, right) => {
      if (!left.promoEndDate) return 1;
      if (!right.promoEndDate) return -1;
      if (left.promoEndDate === right.promoEndDate) {
        return left.label.localeCompare(right.label);
      }
      return left.promoEndDate.localeCompare(right.promoEndDate);
    })[0] ?? null;
}

export function getPromoStartReferenceDate(account: Pick<CreditCardAccount, "deferredInterestStartDate" | "lastKnownStatementDate" | "createdAt">) {
  return account.deferredInterestStartDate ?? account.lastKnownStatementDate ?? account.createdAt.slice(0, 10);
}

export function getBucketDeferredInterestAprBasis(bucket: BalanceBucket, account: Pick<CreditCardAccount, "deferredInterestAprBasis">) {
  return account.deferredInterestAprBasis ?? bucket.aprAfterPromo ?? bucket.apr;
}

export function getBucketEarliestDate(buckets: BalanceBucket[]) {
  const dates = buckets
    .map((bucket) => toDateValue(bucket.promoEndDate))
    .filter((value): value is Date => Boolean(value))
    .sort((left, right) => left.getTime() - right.getTime());
  return dates[0] ?? null;
}
