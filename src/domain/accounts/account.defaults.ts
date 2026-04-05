import { nowIsoDateTime } from "../shared/dates";
import { createStableId } from "../shared/ids";
import { synchronizeSplitBalanceInput } from "./account.split";
import {
  CreateCreditCardAccountInput,
  CreditCardAccount,
} from "./account.types";

export function createCreditCardAccount(
  input: CreateCreditCardAccountInput,
): CreditCardAccount {
  const timestamp = nowIsoDateTime();
  const normalizedInput = synchronizeSplitBalanceInput(input);

  return {
    id: createStableId("card"),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...normalizedInput,
  };
}

export function createEmptyCreditCardAccountDraft(): CreateCreditCardAccountInput {
  return {
    name: "",
    issuer: "",
    currentBalance: 0,
    creditLimit: 1,
    standardApr: 0,
    minimumPayment: 0,
    dueDayOfMonth: 1,
    statementDayOfMonth: null,
    lastPaymentDate: null,
    lastKnownStatementDate: null,
    hasPromoApr: false,
    promoApr: null,
    promoEndDate: null,
    aprAfterPromo: null,
    isDeferredInterest: false,
    deferredInterestAprBasis: null,
    deferredInterestStartDate: null,
    hasSplitBalances: false,
    balanceBuckets: null,
    annualFee: null,
    notes: null,
    isClosed: false,
  };
}
