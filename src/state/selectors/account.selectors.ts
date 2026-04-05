import {
  estimateMonthlyInterest,
  estimatePostPromoInterest,
  getDaysUntilDue,
  getNextDueDate,
  getPromoDaysRemaining,
  getPromoStatus,
  getRemainingDueThisMonth,
  getIsOverdue,
  projectDebtFreeDate,
  rankCardsByStrategy,
  buildProjectionSeries,
} from "../../calculations";
import { CreditCardAccount } from "../../domain/accounts/account.types";
import { PaymentRecord } from "../../domain/payments/payment.types";
import {
  getAggregateDeferredInterestDetails,
  getCardLevelPromoSummary,
  getRolledUpCurrentBalance,
  getWeightedActiveAprSummary,
} from "../../calculations/split-balances/splitBalance.helpers";
import { AppState } from "../appState.types";

function isAccount(value: CreditCardAccount | undefined): value is CreditCardAccount {
  return Boolean(value);
}

function isPayment(value: PaymentRecord | undefined): value is PaymentRecord {
  return Boolean(value);
}

export function selectAccounts(state: AppState) {
  return state.domain.accountOrder
    .map((id) => state.domain.accountsById[id])
    .filter(isAccount);
}

export function selectPayments(state: AppState) {
  return state.domain.paymentOrder
    .map((id) => state.domain.paymentsById[id])
    .filter(isPayment);
}

export function selectOpenAccounts(state: AppState) {
  return selectAccounts(state).filter((account) => !account.isClosed);
}

export function selectSelectedAccount(state: AppState) {
  const selectedAccountId = state.ui.selection.selectedAccountId;

  return selectedAccountId ? state.domain.accountsById[selectedAccountId] ?? null : null;
}

export function selectPaymentsForAccount(state: AppState, accountId: string) {
  return selectPayments(state).filter((payment) => payment.cardId === accountId);
}



export function selectComputedAccountMetrics(
  state: AppState,
  accountId: string,
  asOfDate?: Date | string,
) {
  const account = state.domain.accountsById[accountId];

  if (!account) {
    return null;
  }

  const payments = selectPaymentsForAccount(state, accountId);
  const projection = projectDebtFreeDate([account], {
    ...state.domain.activePayoffPlan,
    strategy: "custom",
    customPriorityOrder: [account.id],
  }, asOfDate);
  const ranking = rankCardsByStrategy(selectOpenAccounts(state), state.domain.activePayoffPlan, asOfDate);
  const livePlanProjection = ranking.find((item) => item.accountId === accountId) ?? null;
  const splitSummary = getCardLevelPromoSummary(
    account,
    livePlanProjection?.projectedPayoffDate ?? null,
    asOfDate,
  );
  const activeApr = getWeightedActiveAprSummary(account, asOfDate);

  return {
    activeApr,
    utilizationPercent: account.creditLimit > 0
      ? Number((((getRolledUpCurrentBalance(account) / account.creditLimit) * 100).toFixed(2)))
      : null,
    estimatedMonthlyInterest: splitSummary.rolledUpEstimatedMonthlyInterest,
    nextDueDate: getNextDueDate(account, asOfDate),
    daysUntilDue: getDaysUntilDue(account, asOfDate),
    promoDaysRemaining: splitSummary.earliestPromoDaysRemaining,
    promoStatus: splitSummary.earliestPromoStatus,
    postPromoEstimatedMonthlyInterest: estimatePostPromoInterest(account),
    projectedPayoffDate: projection.debtFreeDate,
    projectedMonthsRemaining: projection.projectedMonthsRemaining,
    remainingDueThisMonth: getRemainingDueThisMonth(account, payments, asOfDate),
    isOverdue: getIsOverdue(account, payments, asOfDate),
    deferredInterest: getAggregateDeferredInterestDetails(
      account,
      livePlanProjection?.projectedPayoffDate ?? null,
      asOfDate,
    ),
    livePlanProjectedPayoffDate: livePlanProjection?.projectedPayoffDate ?? null,
    livePlanProjectedMonthsRemaining: livePlanProjection?.projectedMonthsRemaining ?? null,
    splitBalance: splitSummary,
    rolledUpCurrentBalance: getRolledUpCurrentBalance(account),
    cardHasMixedAprs: splitSummary.mixedAprs,
    cardHasMixedPromoRules: splitSummary.mixedPromoRules,
    splitBalanceLabel: splitSummary.splitBalanceLabel,
  };
}
