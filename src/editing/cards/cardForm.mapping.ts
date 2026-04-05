import { createEmptyCreditCardAccountDraft } from "../../domain/accounts/account.defaults";
import { synchronizeSplitBalanceInput } from "../../domain/accounts/account.split";
import {
  BalanceBucket,
  CreateCreditCardAccountInput,
  CreditCardAccount,
} from "../../domain/accounts/account.types";
import { validateCreditCardAccount } from "../../domain/accounts/account.validators";
import { FieldErrorMap } from "../shared/form.types";
import { validationMessages } from "../shared/validationMessages";

export type BucketFormState = {
  id: string;
  label: string;
  bucketType: BalanceBucket["bucketType"];
  currentBalance: string;
  apr: string;
  hasPromoApr: boolean;
  promoApr: string;
  promoEndDate: string;
  aprAfterPromo: string;
  isDeferredInterest: boolean;
  notes: string;
};

export type CardFormState = {
  name: string;
  issuer: string;
  currentBalance: string;
  creditLimit: string;
  standardApr: string;
  minimumPayment: string;
  dueDayOfMonth: string;
  statementDayOfMonth: string;
  lastPaymentDate: string;
  lastKnownStatementDate: string;
  hasPromoApr: boolean;
  promoApr: string;
  promoEndDate: string;
  aprAfterPromo: string;
  isDeferredInterest: boolean;
  deferredInterestAprBasis: string;
  deferredInterestStartDate: string;
  hasSplitBalances: boolean;
  balanceBuckets: BucketFormState[];
  annualFee: string;
  notes: string;
  isClosed: boolean;
};

function toOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function toRequiredNumber(value: string): number {
  const numeric = Number(value.trim());
  return Number.isFinite(numeric) ? numeric : NaN;
}

function toOptionalDate(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function createBucketId(index: number) {
  return `bucket_${index + 1}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyBucketFormState(index: number): BucketFormState {
  return {
    id: createBucketId(index),
    label: "",
    bucketType: "purchase",
    currentBalance: "0",
    apr: "0",
    hasPromoApr: false,
    promoApr: "",
    promoEndDate: "",
    aprAfterPromo: "",
    isDeferredInterest: false,
    notes: "",
  };
}

function createBucketFormState(bucket: BalanceBucket, index: number): BucketFormState {
  return {
    id: bucket.id || createBucketId(index),
    label: bucket.label,
    bucketType: bucket.bucketType,
    currentBalance: String(bucket.currentBalance),
    apr: String(bucket.apr),
    hasPromoApr: bucket.hasPromoApr,
    promoApr: bucket.promoApr === null ? "" : String(bucket.promoApr),
    promoEndDate: bucket.promoEndDate ?? "",
    aprAfterPromo: bucket.aprAfterPromo === null ? "" : String(bucket.aprAfterPromo),
    isDeferredInterest: bucket.isDeferredInterest,
    notes: bucket.notes ?? "",
  };
}

export function createCardFormState(account?: CreditCardAccount | null): CardFormState {
  const source = account ?? createEmptyCreditCardAccountDraft();

  return {
    name: source.name,
    issuer: source.issuer,
    currentBalance: String(source.currentBalance),
    creditLimit: String(source.creditLimit),
    standardApr: String(source.standardApr),
    minimumPayment: String(source.minimumPayment),
    dueDayOfMonth: String(source.dueDayOfMonth),
    statementDayOfMonth: source.statementDayOfMonth === null ? "" : String(source.statementDayOfMonth),
    lastPaymentDate: source.lastPaymentDate ?? "",
    lastKnownStatementDate: source.lastKnownStatementDate ?? "",
    hasPromoApr: source.hasPromoApr,
    promoApr: source.promoApr === null ? "" : String(source.promoApr),
    promoEndDate: source.promoEndDate ?? "",
    aprAfterPromo: source.aprAfterPromo === null ? "" : String(source.aprAfterPromo),
    isDeferredInterest: source.isDeferredInterest,
    deferredInterestAprBasis:
      source.deferredInterestAprBasis === null ? "" : String(source.deferredInterestAprBasis),
    deferredInterestStartDate: source.deferredInterestStartDate ?? "",
    hasSplitBalances: source.hasSplitBalances,
    balanceBuckets: source.balanceBuckets?.length
      ? source.balanceBuckets.map((bucket, index) => createBucketFormState(bucket, index))
      : [createEmptyBucketFormState(0)],
    annualFee: source.annualFee === null ? "" : String(source.annualFee),
    notes: source.notes ?? "",
    isClosed: source.isClosed,
  };
}

function mapBucketFormToInput(bucket: BucketFormState): BalanceBucket {
  return {
    id: bucket.id,
    label: bucket.label.trim(),
    bucketType: bucket.bucketType,
    currentBalance: Math.max(toRequiredNumber(bucket.currentBalance), 0),
    apr: Math.max(toRequiredNumber(bucket.apr), 0),
    hasPromoApr: bucket.hasPromoApr,
    promoApr: bucket.hasPromoApr ? toOptionalNumber(bucket.promoApr) : null,
    promoEndDate: bucket.hasPromoApr ? toOptionalDate(bucket.promoEndDate) : null,
    aprAfterPromo: bucket.hasPromoApr ? toOptionalNumber(bucket.aprAfterPromo) : null,
    isDeferredInterest: bucket.hasPromoApr && bucket.isDeferredInterest,
    notes: bucket.notes.trim() ? bucket.notes.trim() : null,
  };
}

export function mapCardFormToInput(form: CardFormState): CreateCreditCardAccountInput {
  const hasPromoApr = form.hasPromoApr;
  const isDeferredInterest = hasPromoApr && form.isDeferredInterest;
  const splitBuckets = form.hasSplitBalances
    ? form.balanceBuckets.map(mapBucketFormToInput).filter((bucket) => bucket.label)
    : null;

  const input: CreateCreditCardAccountInput = {
    name: form.name.trim(),
    issuer: form.issuer.trim(),
    currentBalance: toRequiredNumber(form.currentBalance),
    creditLimit: toRequiredNumber(form.creditLimit),
    standardApr: toRequiredNumber(form.standardApr),
    minimumPayment: toRequiredNumber(form.minimumPayment),
    dueDayOfMonth: toRequiredNumber(form.dueDayOfMonth),
    statementDayOfMonth: toOptionalNumber(form.statementDayOfMonth),
    lastPaymentDate: toOptionalDate(form.lastPaymentDate),
    lastKnownStatementDate: toOptionalDate(form.lastKnownStatementDate),
    hasPromoApr,
    promoApr: hasPromoApr ? toOptionalNumber(form.promoApr) : null,
    promoEndDate: hasPromoApr ? toOptionalDate(form.promoEndDate) : null,
    aprAfterPromo: hasPromoApr ? toOptionalNumber(form.aprAfterPromo) : null,
    isDeferredInterest,
    deferredInterestAprBasis: isDeferredInterest ? toOptionalNumber(form.deferredInterestAprBasis) : null,
    deferredInterestStartDate: isDeferredInterest ? toOptionalDate(form.deferredInterestStartDate) : null,
    hasSplitBalances: form.hasSplitBalances,
    balanceBuckets: splitBuckets,
    annualFee: toOptionalNumber(form.annualFee),
    notes: form.notes.trim() ? form.notes.trim() : null,
    isClosed: form.isClosed,
  };

  if (form.hasSplitBalances) {
    const hasDeferredBucket = Boolean(splitBuckets?.some((bucket) => bucket.isDeferredInterest));
    return synchronizeSplitBalanceInput({
      ...input,
      currentBalance: 0,
      standardApr: 0,
      hasPromoApr: false,
      promoApr: null,
      promoEndDate: null,
      aprAfterPromo: null,
      isDeferredInterest: hasDeferredBucket,
      deferredInterestAprBasis: hasDeferredBucket ? toOptionalNumber(form.deferredInterestAprBasis) : null,
      deferredInterestStartDate: hasDeferredBucket ? toOptionalDate(form.deferredInterestStartDate) : null,
    });
  }

  return input;
}

export function validateCardForm(form: CardFormState): FieldErrorMap {
  const errors: FieldErrorMap = {};
  const input = mapCardFormToInput(form);

  if (!input.name) {
    errors.name = validationMessages.requiredName;
  }

  if (!input.issuer) {
    errors.issuer = validationMessages.requiredIssuer;
  }

  if (Number.isNaN(input.creditLimit)) {
    errors.creditLimit = validationMessages.numberRequired;
  }

  if (Number.isNaN(input.minimumPayment)) {
    errors.minimumPayment = validationMessages.numberRequired;
  }

  if (Number.isNaN(input.dueDayOfMonth)) {
    errors.dueDayOfMonth = validationMessages.numberRequired;
  }

  if (!form.hasSplitBalances && Number.isNaN(input.currentBalance)) {
    errors.currentBalance = validationMessages.numberRequired;
  }

  if (!form.hasSplitBalances && Number.isNaN(input.standardApr)) {
    errors.standardApr = validationMessages.numberRequired;
  }

  if (form.statementDayOfMonth.trim() && input.statementDayOfMonth === null) {
    errors.statementDayOfMonth = validationMessages.numberRequired;
  }

  if (!form.hasSplitBalances && form.hasPromoApr && form.promoApr.trim() && input.promoApr === null) {
    errors.promoApr = validationMessages.numberRequired;
  }

  if (!form.hasSplitBalances && form.hasPromoApr && form.aprAfterPromo.trim() && input.aprAfterPromo === null) {
    errors.aprAfterPromo = validationMessages.numberRequired;
  }

  if (!form.hasSplitBalances && form.isDeferredInterest && form.deferredInterestAprBasis.trim() && input.deferredInterestAprBasis === null) {
    errors.deferredInterestAprBasis = validationMessages.numberRequired;
  }

  if (form.hasSplitBalances) {
    if (!input.balanceBuckets || input.balanceBuckets.length === 0) {
      errors.balanceBuckets = validationMessages.splitBucketMissing;
    }

    form.balanceBuckets.forEach((bucket, index) => {
      if (!bucket.label.trim()) {
        errors[`balanceBuckets.${index}.label`] = validationMessages.splitBucketLabelRequired;
      }
      if (bucket.currentBalance.trim() === "" || Number.isNaN(Number(bucket.currentBalance)) || Number(bucket.currentBalance) < 0) {
        errors[`balanceBuckets.${index}.currentBalance`] = validationMessages.splitBucketBalanceRequired;
      }
      if (bucket.apr.trim() === "" || Number.isNaN(Number(bucket.apr)) || Number(bucket.apr) < 0) {
        errors[`balanceBuckets.${index}.apr`] = validationMessages.splitBucketAprRequired;
      }
      if (bucket.hasPromoApr && bucket.promoApr.trim() && toOptionalNumber(bucket.promoApr) === null) {
        errors[`balanceBuckets.${index}.promoApr`] = validationMessages.numberRequired;
      }
      if (bucket.hasPromoApr && bucket.aprAfterPromo.trim() && toOptionalNumber(bucket.aprAfterPromo) === null) {
        errors[`balanceBuckets.${index}.aprAfterPromo`] = validationMessages.numberRequired;
      }
    });
  }

  if (form.annualFee.trim() && input.annualFee === null) {
    errors.annualFee = validationMessages.numberRequired;
  }

  const schemaMessages = validateCreditCardAccount(input);
  for (const message of schemaMessages) {
    if (message.includes("Current balance")) errors.currentBalance = message;
    if (message.includes("Credit limit")) errors.creditLimit = message;
    if (message.includes("APR cannot")) errors.standardApr = message;
    if (message.includes("Minimum payment")) errors.minimumPayment = message;
    if (message.includes("Due day")) errors.dueDayOfMonth = message;
    if (message.includes("Promo fields")) {
      errors.promoApr = validationMessages.promoFieldMismatch;
      errors.promoEndDate = validationMessages.promoFieldMismatch;
      errors.aprAfterPromo = validationMessages.promoFieldMismatch;
    }
    if (message.includes("Deferred-interest start date must be on or before the promo end date.")) {
      errors.deferredInterestStartDate = message;
      errors.promoEndDate = message;
    }
    if (message.includes("Deferred-interest fields must stay empty")) {
      errors.deferredInterestAprBasis = validationMessages.deferredInterestFieldMismatch;
      errors.deferredInterestStartDate = validationMessages.deferredInterestFieldMismatch;
    }
    if (message.includes("Deferred-interest promos require a promo end date.")) {
      errors.promoEndDate = message;
    }
    if (message.includes("Split-balance cards require")) {
      errors.balanceBuckets = message;
    }
    if (message.includes("Bucket ")) {
      const bucketMatch = message.match(/^Bucket\s+(\d+):\s+(.+)$/);
      if (bucketMatch) {
        const bucketIndex = Number(bucketMatch[1]) - 1;
        const bucketMessage = bucketMatch[2];
        if (bucketMessage.includes("label")) errors[`balanceBuckets.${bucketIndex}.label`] = bucketMessage;
        if (bucketMessage.includes("balance")) errors[`balanceBuckets.${bucketIndex}.currentBalance`] = bucketMessage;
        if (bucketMessage.includes("APR")) errors[`balanceBuckets.${bucketIndex}.apr`] = bucketMessage;
        if (bucketMessage.includes("promo APR")) errors[`balanceBuckets.${bucketIndex}.promoApr`] = bucketMessage;
        if (bucketMessage.includes("promo end date")) errors[`balanceBuckets.${bucketIndex}.promoEndDate`] = bucketMessage;
        if (bucketMessage.includes("APR after promo")) errors[`balanceBuckets.${bucketIndex}.aprAfterPromo`] = bucketMessage;
        if (bucketMessage.includes("duplicate")) errors.balanceBuckets = bucketMessage;
      }
    }
  }

  return errors;
}
