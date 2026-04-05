import { synchronizeSplitBalanceInput } from "../../domain/accounts/account.split";
import { validateCreditCardAccount } from "../../domain/accounts/account.validators";
import { BalanceBucket, CreditCardAccount } from "../../domain/accounts/account.types";
import {
  isBoolean,
  isNullableNumber,
  isNullableString,
  isNumber,
  isRecord,
  isString,
} from "./shared";

function deserializeBalanceBuckets(rawValue: unknown): BalanceBucket[] | null {
  if (!Array.isArray(rawValue)) {
    return null;
  }

  return rawValue.flatMap((value, index) => {
    if (!isRecord(value)) return [];

    return [{
      id: isString(value.id) ? value.id : `bucket_${index + 1}`,
      label: isString(value.label) ? value.label : `Balance bucket ${index + 1}`,
      bucketType: isString(value.bucketType) ? value.bucketType as BalanceBucket["bucketType"] : "purchase",
      currentBalance: isNumber(value.currentBalance) ? value.currentBalance : 0,
      apr: isNumber(value.apr) ? value.apr : 0,
      hasPromoApr: isBoolean(value.hasPromoApr) ? value.hasPromoApr : false,
      promoApr: isNullableNumber(value.promoApr) ? value.promoApr : null,
      promoEndDate: isNullableString(value.promoEndDate) ? value.promoEndDate : null,
      aprAfterPromo: isNullableNumber(value.aprAfterPromo) ? value.aprAfterPromo : null,
      isDeferredInterest: isBoolean(value.isDeferredInterest) ? value.isDeferredInterest : false,
      notes: isNullableString(value.notes) ? value.notes : null,
    }];
  });
}

export function serializeAccount(account: CreditCardAccount): CreditCardAccount {
  return { ...account };
}

export function deserializeAccount(value: unknown): CreditCardAccount | null {
  if (!isRecord(value)) return null;

  const raw = value;

  const hasValidBaseShape =
    isString(raw.id) &&
    isString(raw.name) &&
    isString(raw.issuer) &&
    isNumber(raw.currentBalance) &&
    isNumber(raw.creditLimit) &&
    isNumber(raw.standardApr) &&
    isNumber(raw.minimumPayment) &&
    isNumber(raw.dueDayOfMonth) &&
    isNullableNumber(raw.statementDayOfMonth) &&
    isNullableString(raw.lastPaymentDate) &&
    isNullableString(raw.lastKnownStatementDate) &&
    isBoolean(raw.hasPromoApr) &&
    isNullableNumber(raw.promoApr) &&
    isNullableString(raw.promoEndDate) &&
    isNullableNumber(raw.aprAfterPromo) &&
    isNullableNumber(raw.annualFee) &&
    isNullableString(raw.notes) &&
    isBoolean(raw.isClosed) &&
    isString(raw.createdAt) &&
    isString(raw.updatedAt);

  if (!hasValidBaseShape) return null;

  const balanceBuckets = deserializeBalanceBuckets(raw.balanceBuckets);

  const candidate: CreditCardAccount = {
    id: raw.id as string,
    name: raw.name as string,
    issuer: raw.issuer as string,
    currentBalance: raw.currentBalance as number,
    creditLimit: raw.creditLimit as number,
    standardApr: raw.standardApr as number,
    minimumPayment: raw.minimumPayment as number,
    dueDayOfMonth: raw.dueDayOfMonth as number,
    statementDayOfMonth: raw.statementDayOfMonth as number | null,
    lastPaymentDate: raw.lastPaymentDate as string | null,
    lastKnownStatementDate: raw.lastKnownStatementDate as string | null,
    hasPromoApr: raw.hasPromoApr as boolean,
    promoApr: raw.promoApr as number | null,
    promoEndDate: raw.promoEndDate as string | null,
    aprAfterPromo: raw.aprAfterPromo as number | null,
    isDeferredInterest: isBoolean(raw.isDeferredInterest) ? (raw.isDeferredInterest as boolean) : false,
    deferredInterestAprBasis: isNullableNumber(raw.deferredInterestAprBasis)
      ? (raw.deferredInterestAprBasis as number | null)
      : null,
    deferredInterestStartDate: isNullableString(raw.deferredInterestStartDate)
      ? (raw.deferredInterestStartDate as string | null)
      : null,
    hasSplitBalances: isBoolean(raw.hasSplitBalances) ? (raw.hasSplitBalances as boolean) : false,
    balanceBuckets,
    annualFee: raw.annualFee as number | null,
    notes: raw.notes as string | null,
    isClosed: raw.isClosed as boolean,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };

  const normalizedInput = synchronizeSplitBalanceInput({
    name: candidate.name,
    issuer: candidate.issuer,
    currentBalance: candidate.currentBalance,
    creditLimit: candidate.creditLimit,
    standardApr: candidate.standardApr,
    minimumPayment: candidate.minimumPayment,
    dueDayOfMonth: candidate.dueDayOfMonth,
    statementDayOfMonth: candidate.statementDayOfMonth,
    lastPaymentDate: candidate.lastPaymentDate,
    lastKnownStatementDate: candidate.lastKnownStatementDate,
    hasPromoApr: candidate.hasPromoApr,
    promoApr: candidate.promoApr,
    promoEndDate: candidate.promoEndDate,
    aprAfterPromo: candidate.aprAfterPromo,
    isDeferredInterest: candidate.isDeferredInterest,
    deferredInterestAprBasis: candidate.deferredInterestAprBasis,
    deferredInterestStartDate: candidate.deferredInterestStartDate,
    hasSplitBalances: candidate.hasSplitBalances,
    balanceBuckets: candidate.balanceBuckets,
    annualFee: candidate.annualFee,
    notes: candidate.notes,
    isClosed: candidate.isClosed,
  });

  const validationErrors = validateCreditCardAccount(normalizedInput);

  return validationErrors.length === 0
    ? { ...candidate, ...normalizedInput }
    : null;
}
