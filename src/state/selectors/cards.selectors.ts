import { FilterKey, SortKey } from "../../domain/shared/enums";
import { AppState } from "../appState.types";
import { selectAccounts, selectComputedAccountMetrics } from "./account.selectors";
import { selectPayoffRanking } from "./paymentPlan.selectors";

export type CardsViewRow = {
  accountId: string;
  name: string;
  issuer: string;
  currentBalance: number;
  creditLimit: number;
  minimumPayment: number;
  isClosed: boolean;
  activeApr: number;
  activeAprSummary: string;
  utilizationPercent: number | null;
  estimatedMonthlyInterest: number;
  nextDueDate: string;
  daysUntilDue: number;
  promoEndDate: string | null;
  promoStatus: string;
  promoDaysRemaining: number | null;
  projectedPayoffDate: string | null;
  projectedMonthsRemaining: number | null;
  remainingDueThisMonth: number;
  isOverdue: boolean;
  payoffRank: number | null;
  isDeferredInterest: boolean;
  deferredInterestRiskStatus: string;
  deferredInterestPenaltyExposure: number | null;
  payoffByPromoDeadlineMonthlyTarget: number | null;
  deferredInterestSafeByDeadline: boolean | null;
  deferredInterestWarningMessage: string | null;
  hasSplitBalances: boolean;
  splitBucketCount: number;
  cardHasMixedAprs: boolean;
  cardHasMixedPromoRules: boolean;
  splitBalanceLabel: string;
};

function compareNullableNumber(left: number | null, right: number | null, direction: "asc" | "desc") {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return direction === "asc" ? left - right : right - left;
}

function compareNullableDate(left: string | null, right: string | null, direction: "asc" | "desc") {
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  return direction === "asc" ? left.localeCompare(right) : right.localeCompare(left);
}

export function selectCardsViewRows(state: AppState, asOfDate?: Date | string): CardsViewRow[] {
  const ranking = selectPayoffRanking(state, asOfDate);
  const rankingMap = new Map(ranking.map((item) => [item.accountId, item.rank]));

  return selectAccounts(state).flatMap((account) => {
    const metrics = selectComputedAccountMetrics(state, account.id, asOfDate);

    if (!metrics) {
      return [];
    }

    return [{
      accountId: account.id,
      name: account.name,
      issuer: account.issuer,
      currentBalance: metrics.rolledUpCurrentBalance,
      creditLimit: account.creditLimit,
      minimumPayment: account.minimumPayment,
      isClosed: account.isClosed,
      activeApr: metrics.activeApr,
      activeAprSummary: metrics.splitBalance.activeAprSummary,
      utilizationPercent: metrics.utilizationPercent,
      estimatedMonthlyInterest: metrics.estimatedMonthlyInterest,
      nextDueDate: metrics.nextDueDate,
      daysUntilDue: metrics.daysUntilDue,
      promoEndDate: metrics.splitBalance.earliestPromoEndDate,
      promoStatus: metrics.promoStatus,
      promoDaysRemaining: metrics.promoDaysRemaining,
      projectedPayoffDate: metrics.projectedPayoffDate,
      projectedMonthsRemaining: metrics.projectedMonthsRemaining,
      remainingDueThisMonth: metrics.remainingDueThisMonth,
      isOverdue: metrics.isOverdue,
      payoffRank: rankingMap.get(account.id) ?? null,
      isDeferredInterest: account.isDeferredInterest,
      deferredInterestRiskStatus: metrics.deferredInterest.deferredInterestRiskStatus,
      deferredInterestPenaltyExposure: metrics.deferredInterest.deferredInterestPenaltyExposure,
      payoffByPromoDeadlineMonthlyTarget: metrics.deferredInterest.payoffByPromoDeadlineMonthlyTarget,
      deferredInterestSafeByDeadline: metrics.deferredInterest.deferredInterestSafeByDeadline,
      deferredInterestWarningMessage: metrics.deferredInterest.deferredInterestWarningMessage,
      hasSplitBalances: account.hasSplitBalances,
      splitBucketCount: metrics.splitBalance.bucketCount,
      cardHasMixedAprs: metrics.cardHasMixedAprs,
      cardHasMixedPromoRules: metrics.cardHasMixedPromoRules,
      splitBalanceLabel: metrics.splitBalanceLabel,
    }];
  });
}

export function filterCardsViewRows(rows: CardsViewRow[], filterKey: FilterKey | null) {
  switch (filterKey) {
    case null:
    case "all_open":
      return rows.filter((row) => !row.isClosed);
    case "due_soon":
      return rows.filter((row) => !row.isClosed && row.daysUntilDue >= 0 && row.daysUntilDue <= 7);
    case "overdue":
      return rows.filter((row) => !row.isClosed && row.isOverdue);
    case "high_utilization":
      return rows.filter((row) => !row.isClosed && row.utilizationPercent !== null && row.utilizationPercent >= 70);
    case "promo_active":
      return rows.filter((row) => !row.isClosed && (row.promoStatus === "active" || row.promoStatus === "ending_soon"));
    case "promo_ending_soon":
      return rows.filter((row) => !row.isClosed && row.promoStatus === "ending_soon");
    case "closest_to_payoff":
      return rows
        .filter((row) => !row.isClosed && row.projectedMonthsRemaining !== null)
        .sort((left, right) => compareNullableNumber(left.projectedMonthsRemaining, right.projectedMonthsRemaining, "asc"))
        .slice(0, 5);
    case "largest_balance":
      return rows
        .filter((row) => !row.isClosed)
        .sort((left, right) => right.currentBalance - left.currentBalance)
        .slice(0, 5);
    case "highest_interest_cost":
      return rows
        .filter((row) => !row.isClosed)
        .sort((left, right) => right.estimatedMonthlyInterest - left.estimatedMonthlyInterest)
        .slice(0, 5);
    case "closed_accounts":
      return rows.filter((row) => row.isClosed);
    default:
      return rows;
  }
}

export function sortCardsViewRows(rows: CardsViewRow[], sortKey: SortKey) {
  const sortedRows = [...rows];

  sortedRows.sort((left, right) => {
    switch (sortKey) {
      case "lowest_balance":
        return left.currentBalance - right.currentBalance;
      case "highest_balance":
        return right.currentBalance - left.currentBalance;
      case "lowest_utilization":
        return compareNullableNumber(left.utilizationPercent, right.utilizationPercent, "asc");
      case "highest_utilization":
        return compareNullableNumber(left.utilizationPercent, right.utilizationPercent, "desc");
      case "highest_apr":
        return right.activeApr - left.activeApr;
      case "lowest_apr":
        return left.activeApr - right.activeApr;
      case "highest_monthly_interest":
        return right.estimatedMonthlyInterest - left.estimatedMonthlyInterest;
      case "soonest_due_date":
        return left.nextDueDate.localeCompare(right.nextDueDate);
      case "soonest_payoff":
        return compareNullableDate(left.projectedPayoffDate, right.projectedPayoffDate, "asc");
      case "promo_ending_soon":
        return compareNullableNumber(left.promoDaysRemaining, right.promoDaysRemaining, "asc");
      case "issuer_az":
        return left.issuer.localeCompare(right.issuer) || left.name.localeCompare(right.name);
      case "card_name_az":
        return left.name.localeCompare(right.name) || left.issuer.localeCompare(right.issuer);
      default:
        return 0;
    }
  });

  return sortedRows;
}
