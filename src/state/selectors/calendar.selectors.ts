import { getNextDueDate } from "../../calculations";
import { getCardLevelPromoSummary } from "../../calculations/split-balances/splitBalance.helpers";
import { AppState } from "../appState.types";
import { selectAccounts, selectPayments } from "./account.selectors";
import { selectPayoffRanking } from "./paymentPlan.selectors";

export type CalendarEvent = {
  id: string;
  type: "due_date" | "promo_end" | "payment";
  accountId: string;
  accountName: string;
  date: string;
  label: string;
};

export function selectCalendarEvents(state: AppState, asOfDate?: Date | string): CalendarEvent[] {
  const ranking = selectPayoffRanking(state, asOfDate);
  const projectedPayoffDates = new Map(ranking.map((item) => [item.accountId, item.projectedPayoffDate ?? null]));

  const accountEvents = selectAccounts(state)
    .filter((account) => !account.isClosed)
    .flatMap((account) => {
      const events: CalendarEvent[] = [
        {
          id: `due_${account.id}`,
          type: "due_date",
          accountId: account.id,
          accountName: account.name,
          date: getNextDueDate(account, asOfDate),
          label: `${account.name} due`,
        },
      ];

      const promoSummary = getCardLevelPromoSummary(
        account,
        projectedPayoffDates.get(account.id) ?? null,
        asOfDate,
      );

      if (promoSummary.earliestPromoEndDate && promoSummary.earliestPromoStatus !== "none") {
        const label = promoSummary.earliestPromoIsDeferred
          ? promoSummary.deferred.deferredInterestSafeByDeadline
            ? `${account.name} deferred-interest deadline (on track)`
            : `${account.name} deferred-interest deadline — avoid retroactive interest`
          : account.hasSplitBalances && promoSummary.bucketCount > 1
            ? `${account.name} bucket promo deadline`
            : `${account.name} promo ends`;

        events.push({
          id: `promo_${account.id}`,
          type: "promo_end",
          accountId: account.id,
          accountName: account.name,
          date: promoSummary.earliestPromoEndDate,
          label,
        });
      }

      return events;
    });

  const paymentEvents: CalendarEvent[] = selectPayments(state).map((payment) => ({
    id: payment.id,
    type: "payment",
    accountId: payment.cardId,
    accountName: state.domain.accountsById[payment.cardId]?.name ?? "Unknown card",
    date: payment.paymentDate,
    label: "Payment recorded",
  }));

  return [...accountEvents, ...paymentEvents].sort((left, right) =>
    left.date.localeCompare(right.date),
  );
}
