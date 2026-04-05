import {
  createCreditCardAccount,
} from "../../domain/accounts/account.defaults";
import { synchronizeSplitBalanceInput } from "../../domain/accounts/account.split";
import { validateCreditCardAccount } from "../../domain/accounts/account.validators";
import {
  CreditCardAccount,
  CreateCreditCardAccountInput,
  UpdateCreditCardAccountInput,
} from "../../domain/accounts/account.types";
import { nowIsoDateTime } from "../../domain/shared/dates";
import { DomainState } from "../appState.types";

function isValidAccountInput(input: CreateCreditCardAccountInput): boolean {
  return validateCreditCardAccount(synchronizeSplitBalanceInput(input)).length === 0;
}

export function createAccountInState(
  state: DomainState,
  input: CreateCreditCardAccountInput,
): DomainState {
  if (!isValidAccountInput(input)) return state;

  const account = createCreditCardAccount(synchronizeSplitBalanceInput(input));

  return {
    ...state,
    accountsById: {
      ...state.accountsById,
      [account.id]: account,
    },
    accountOrder: [account.id, ...state.accountOrder],
  };
}

export function updateAccountInState(
  state: DomainState,
  accountId: string,
  patch: UpdateCreditCardAccountInput,
): DomainState {
  const existing = state.accountsById[accountId];

  if (!existing) return state;

  const updated: CreditCardAccount = {
    ...existing,
    ...patch,
    updatedAt: nowIsoDateTime(),
  };

  const nextInput: CreateCreditCardAccountInput = synchronizeSplitBalanceInput({
    name: updated.name,
    issuer: updated.issuer,
    currentBalance: updated.currentBalance,
    creditLimit: updated.creditLimit,
    standardApr: updated.standardApr,
    minimumPayment: updated.minimumPayment,
    dueDayOfMonth: updated.dueDayOfMonth,
    statementDayOfMonth: updated.statementDayOfMonth,
    lastPaymentDate: updated.lastPaymentDate,
    lastKnownStatementDate: updated.lastKnownStatementDate,
    hasPromoApr: updated.hasPromoApr,
    promoApr: updated.promoApr,
    promoEndDate: updated.promoEndDate,
    aprAfterPromo: updated.aprAfterPromo,
    isDeferredInterest: updated.isDeferredInterest,
    deferredInterestAprBasis: updated.deferredInterestAprBasis,
    deferredInterestStartDate: updated.deferredInterestStartDate,
    hasSplitBalances: updated.hasSplitBalances,
    balanceBuckets: updated.balanceBuckets,
    annualFee: updated.annualFee,
    notes: updated.notes,
    isClosed: updated.isClosed,
  });

  if (!isValidAccountInput(nextInput)) return state;

  return {
    ...state,
    accountsById: {
      ...state.accountsById,
      [accountId]: {
        ...updated,
        ...nextInput,
      },
    },
  };
}

export function markAccountClosedInState(
  state: DomainState,
  accountId: string,
): DomainState {
  return updateAccountInState(state, accountId, { isClosed: true });
}
