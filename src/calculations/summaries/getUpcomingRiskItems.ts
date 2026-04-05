import { CreditCardAccount } from "../../domain/accounts/account.types";
import { getAggregateDeferredInterestDetails, getCardLevelPromoSummary } from "../split-balances/splitBalance.helpers";
import { RiskItem } from "../shared/calculation.types";
import { getDaysUntilDue } from "../timing/getDaysUntilDue";
import { getNextDueDate } from "../timing/getNextDueDate";

const DUE_SOON_THRESHOLD_DAYS = 7;

export function getUpcomingRiskItems(
  accounts: CreditCardAccount[],
  projectedPayoffDates: Map<string, string | null>,
  asOfDate?: Date | string,
): RiskItem[] {
  return accounts
    .filter((account) => !account.isClosed)
    .flatMap((account) => {
      const riskItems: RiskItem[] = [];
      const daysUntilDue = getDaysUntilDue(account, asOfDate);

      if (daysUntilDue <= DUE_SOON_THRESHOLD_DAYS) {
        riskItems.push({
          type: "due_soon",
          severity: daysUntilDue <= 2 ? "critical" : "warning",
          accountId: account.id,
          accountName: account.name,
          date: getNextDueDate(account, asOfDate),
          daysRemaining: daysUntilDue,
          label: `${account.name} due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`,
        });
      }

      const promoSummary = getCardLevelPromoSummary(
        account,
        projectedPayoffDates.get(account.id) ?? null,
        asOfDate,
      );

      if (promoSummary.earliestPromoStatus === "ending_soon" && promoSummary.earliestPromoDaysRemaining !== null && promoSummary.earliestPromoEndDate) {
        riskItems.push({
          type: "promo_ending_soon",
          severity: promoSummary.earliestPromoDaysRemaining <= 7 ? "critical" : "warning",
          accountId: account.id,
          accountName: account.name,
          date: promoSummary.earliestPromoEndDate,
          daysRemaining: promoSummary.earliestPromoDaysRemaining,
          label: `${account.name} promo ends in ${promoSummary.earliestPromoDaysRemaining} day${promoSummary.earliestPromoDaysRemaining === 1 ? "" : "s"}`,
        });
      }

      if (promoSummary.earliestPromoStatus === "expired" && promoSummary.earliestPromoDaysRemaining !== null && promoSummary.earliestPromoEndDate) {
        riskItems.push({
          type: "promo_expired",
          severity: "critical",
          accountId: account.id,
          accountName: account.name,
          date: promoSummary.earliestPromoEndDate,
          daysRemaining: promoSummary.earliestPromoDaysRemaining,
          label: `${account.name} promo expired ${Math.abs(promoSummary.earliestPromoDaysRemaining)} day${Math.abs(promoSummary.earliestPromoDaysRemaining) === 1 ? "" : "s"} ago`,
        });
      }

      const deferred = getAggregateDeferredInterestDetails(
        account,
        projectedPayoffDates.get(account.id) ?? null,
        asOfDate,
      );

      if (["watch", "warning", "critical"].includes(deferred.deferredInterestRiskStatus)) {
        riskItems.push({
          type: "deferred_interest_warning",
          severity:
            deferred.deferredInterestRiskStatus === "critical"
              ? "critical"
              : deferred.deferredInterestRiskStatus === "warning"
                ? "warning"
                : "info",
          accountId: account.id,
          accountName: account.name,
          date: promoSummary.earliestPromoEndDate ?? getNextDueDate(account, asOfDate),
          daysRemaining: deferred.deferredInterestDaysRemaining ?? 0,
          label:
            deferred.deferredInterestWarningMessage ??
            `${account.name} deferred-interest deadline needs attention.`,
        });
      }

      if (deferred.deferredInterestRiskStatus === "expired") {
        riskItems.push({
          type: "deferred_interest_expired",
          severity: "critical",
          accountId: account.id,
          accountName: account.name,
          date: promoSummary.earliestPromoEndDate ?? getNextDueDate(account, asOfDate),
          daysRemaining: deferred.deferredInterestDaysRemaining ?? -1,
          label:
            deferred.deferredInterestWarningMessage ??
            `${account.name} deferred-interest deadline has passed.`,
        });
      }

      return riskItems;
    })
    .sort((left, right) => left.daysRemaining - right.daysRemaining);
}
