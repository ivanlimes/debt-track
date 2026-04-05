import { CreditCardAccount } from "../../domain/accounts/account.types";
import { PaymentRecord } from "../../domain/payments/payment.types";
import { PayoffPlan } from "../../domain/payoff-plan/payoffPlan.types";
import { roundCurrency, isSameMonth } from "../shared/calculation.helpers";
import { getHighestInterestCard } from "./getHighestInterestCard";
import { getNextPromoExpiration } from "./getNextPromoExpiration";
import { getUpcomingRiskItems } from "./getUpcomingRiskItems";
import { getOverallUtilization } from "../utilization/getOverallUtilization";
import { projectDebtFreeDate } from "../payoff/projectDebtFreeDate";
import { rankCardsByStrategy } from "../payoff/rankCardsByStrategy";
import { getRolledUpCurrentBalance, getRolledUpEstimatedMonthlyInterest } from "../split-balances/splitBalance.helpers";

export function getDashboardSummary(
  accounts: CreditCardAccount[],
  payments: PaymentRecord[],
  payoffPlan: PayoffPlan,
  asOfDate?: Date | string,
) {
  const openAccounts = accounts.filter((account) => !account.isClosed);
  const totalDebt = roundCurrency(
    openAccounts.reduce((sum, account) => sum + Math.max(getRolledUpCurrentBalance(account), 0), 0),
  );
  const totalAvailableCredit = roundCurrency(
    openAccounts.reduce(
      (sum, account) => sum + Math.max(account.creditLimit - getRolledUpCurrentBalance(account), 0),
      0,
    ),
  );
  const totalMinimumDueThisMonth = roundCurrency(
    openAccounts.reduce((sum, account) => sum + Math.max(account.minimumPayment, 0), 0),
  );
  const totalEstimatedMonthlyInterest = roundCurrency(
    openAccounts.reduce(
      (sum, account) => sum + getRolledUpEstimatedMonthlyInterest(account, asOfDate),
      0,
    ),
  );
  const totalPaidThisMonth = roundCurrency(
    payments
      .filter((payment) => isSameMonth(payment.paymentDate, asOfDate ?? new Date()))
      .reduce((sum, payment) => sum + payment.amount, 0),
  );

  const projection = projectDebtFreeDate(accounts, payoffPlan, asOfDate);
  const ranking = rankCardsByStrategy(openAccounts, payoffPlan, asOfDate);
  const projectedPayoffDates = new Map(
    ranking.map((item) => [item.accountId, item.projectedPayoffDate ?? null]),
  );

  return {
    totalDebt,
    totalAvailableCredit,
    overallUtilizationPercent: getOverallUtilization(accounts),
    totalMinimumDueThisMonth,
    totalPaidThisMonth,
    totalEstimatedMonthlyInterest,
    projectedDebtFreeDate: projection.debtFreeDate,
    projectedMonthsRemaining: projection.projectedMonthsRemaining,
    highestInterestCard: getHighestInterestCard(accounts, asOfDate),
    nextPromoExpiration: getNextPromoExpiration(accounts, asOfDate),
    upcomingRiskItems: getUpcomingRiskItems(accounts, projectedPayoffDates, asOfDate),
  };
}
