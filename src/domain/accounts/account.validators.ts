import { synchronizeSplitBalanceInput } from "./account.split";
import {
  BALANCE_BUCKET_TYPES,
  BalanceBucket,
  CreateCreditCardAccountInput,
} from "./account.types";

const VALID_BUCKET_TYPES = new Set<string>(BALANCE_BUCKET_TYPES);

function isIsoDate(value: string | null) {
  if (value === null) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function validateBucket(bucket: BalanceBucket, index: number) {
  const errors: string[] = [];

  if (!bucket.label.trim()) {
    errors.push(`Bucket ${index + 1}: label is required.`);
  }

  if (!VALID_BUCKET_TYPES.has(bucket.bucketType)) {
    errors.push(`Bucket ${index + 1}: bucket type is invalid.`);
  }

  if (!Number.isFinite(bucket.currentBalance) || bucket.currentBalance < 0) {
    errors.push(`Bucket ${index + 1}: balance must be zero or greater.`);
  }

  if (!Number.isFinite(bucket.apr) || bucket.apr < 0) {
    errors.push(`Bucket ${index + 1}: APR must be zero or greater.`);
  }

  if (!bucket.hasPromoApr) {
    if (bucket.promoApr !== null || bucket.promoEndDate !== null || bucket.aprAfterPromo !== null || bucket.isDeferredInterest) {
      errors.push(`Bucket ${index + 1}: promo details must stay empty unless promo treatment is active.`);
    }
  } else {
    if (bucket.promoApr === null || !Number.isFinite(bucket.promoApr) || bucket.promoApr < 0) {
      errors.push(`Bucket ${index + 1}: promo APR must be zero or greater when promo treatment is active.`);
    }

    if (bucket.promoEndDate === null || !isIsoDate(bucket.promoEndDate)) {
      errors.push(`Bucket ${index + 1}: promo end date must use ISO date format when promo treatment is active.`);
    }

    if (bucket.aprAfterPromo === null || !Number.isFinite(bucket.aprAfterPromo) || bucket.aprAfterPromo < 0) {
      errors.push(`Bucket ${index + 1}: APR after promo must be zero or greater when promo treatment is active.`);
    }
  }

  return errors;
}

export function validateCreditCardAccount(input: CreateCreditCardAccountInput) {
  const normalizedInput = synchronizeSplitBalanceInput(input);
  const errors: string[] = [];

  if (!normalizedInput.name.trim()) errors.push("Card name is required.");
  if (!normalizedInput.issuer.trim()) errors.push("Issuer is required.");
  if (!Number.isFinite(normalizedInput.currentBalance) || normalizedInput.currentBalance < 0) errors.push("Current balance cannot be negative.");
  if (!Number.isFinite(normalizedInput.creditLimit) || normalizedInput.creditLimit <= 0) errors.push("Credit limit must be greater than zero.");
  if (!Number.isFinite(normalizedInput.standardApr) || normalizedInput.standardApr < 0) errors.push("APR cannot be negative.");
  if (!Number.isFinite(normalizedInput.minimumPayment) || normalizedInput.minimumPayment < 0) errors.push("Minimum payment cannot be negative.");
  if (!Number.isInteger(normalizedInput.dueDayOfMonth) || normalizedInput.dueDayOfMonth < 1 || normalizedInput.dueDayOfMonth > 31) {
    errors.push("Due day must be between 1 and 31.");
  }

  if (normalizedInput.statementDayOfMonth !== null && (!Number.isInteger(normalizedInput.statementDayOfMonth) || normalizedInput.statementDayOfMonth < 1 || normalizedInput.statementDayOfMonth > 31)) {
    errors.push("Statement day must be between 1 and 31 when provided.");
  }

  if (!isIsoDate(normalizedInput.lastPaymentDate)) errors.push("Last payment date must use ISO date format.");
  if (!isIsoDate(normalizedInput.lastKnownStatementDate)) errors.push("Last known statement date must use ISO date format.");
  if (!isIsoDate(normalizedInput.deferredInterestStartDate)) errors.push("Deferred-interest start date must use ISO date format.");

  if (normalizedInput.hasSplitBalances) {
    const balanceBuckets = normalizedInput.balanceBuckets ?? [];

    if (balanceBuckets.length === 0) {
      errors.push("Split-balance cards require at least one valid balance bucket.");
    }

    const seenBucketIds = new Set<string>();
    const seenLabels = new Set<string>();

    balanceBuckets.forEach((bucket, index) => {
      validateBucket(bucket, index).forEach((message) => errors.push(message));

      if (seenBucketIds.has(bucket.id)) {
        errors.push(`Bucket ${index + 1}: duplicate bucket ID.`);
      }
      seenBucketIds.add(bucket.id);

      const normalizedLabel = bucket.label.trim().toLowerCase();
      if (seenLabels.has(normalizedLabel)) {
        errors.push(`Bucket ${index + 1}: duplicate bucket label.`);
      }
      seenLabels.add(normalizedLabel);
    });

    const reconciledBalance = Math.round((balanceBuckets.reduce((sum, bucket) => sum + bucket.currentBalance, 0) + Number.EPSILON) * 100) / 100;
    if (Math.abs(reconciledBalance - normalizedInput.currentBalance) > 0.01) {
      errors.push("Split-balance bucket totals must reconcile to the card balance.");
    }
  }

  if (!normalizedInput.hasPromoApr) {
    if (
      normalizedInput.promoApr !== null ||
      normalizedInput.promoEndDate !== null ||
      normalizedInput.aprAfterPromo !== null ||
      normalizedInput.isDeferredInterest ||
      normalizedInput.deferredInterestAprBasis !== null ||
      normalizedInput.deferredInterestStartDate !== null
    ) {
      errors.push("Promo fields must be null when promo APR is inactive.");
    }
  } else {
    if (normalizedInput.promoApr === null || !Number.isFinite(normalizedInput.promoApr) || normalizedInput.promoApr < 0) {
      errors.push("Promo APR must be zero or greater when promo APR is active.");
    }

    if (normalizedInput.promoEndDate === null || !isIsoDate(normalizedInput.promoEndDate)) {
      errors.push("Promo end date must use ISO date format when promo APR is active.");
    }

    if (normalizedInput.aprAfterPromo === null || !Number.isFinite(normalizedInput.aprAfterPromo) || normalizedInput.aprAfterPromo < 0) {
      errors.push("APR after promo must be zero or greater when promo APR is active.");
    }

    if (normalizedInput.isDeferredInterest) {
      if (!normalizedInput.promoEndDate) {
        errors.push("Deferred-interest promos require a promo end date.");
      }

      if (normalizedInput.deferredInterestStartDate && normalizedInput.promoEndDate && normalizedInput.deferredInterestStartDate > normalizedInput.promoEndDate) {
        errors.push("Deferred-interest start date must be on or before the promo end date.");
      }

      if (normalizedInput.deferredInterestAprBasis !== null && (!Number.isFinite(normalizedInput.deferredInterestAprBasis) || normalizedInput.deferredInterestAprBasis < 0)) {
        errors.push("Deferred-interest APR basis must be zero or greater when provided.");
      }
    }
  }

  if (normalizedInput.annualFee !== null && (!Number.isFinite(normalizedInput.annualFee) || normalizedInput.annualFee < 0)) {
    errors.push("Annual fee cannot be negative.");
  }

  return errors;
}
