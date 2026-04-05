import { CreditCardAccount } from "../../domain/accounts/account.types";
import { getCardLevelPromoSummary } from "../split-balances/splitBalance.helpers";

export function getNextPromoExpiration(
  accounts: CreditCardAccount[],
  asOfDate?: Date | string,
) {
  const promoAccounts = accounts
    .filter((account) => !account.isClosed)
    .map((account) => ({
      account,
      summary: getCardLevelPromoSummary(account, null, asOfDate),
    }))
    .filter((item) => item.summary.earliestPromoEndDate !== null && item.summary.earliestPromoDaysRemaining !== null && item.summary.earliestPromoDaysRemaining >= 0)
    .sort((left, right) => (left.summary.earliestPromoDaysRemaining ?? 0) - (right.summary.earliestPromoDaysRemaining ?? 0));

  if (promoAccounts.length === 0) {
    return null;
  }

  const nextPromo = promoAccounts[0];

  return {
    account: nextPromo.account,
    promoEndDate: nextPromo.summary.earliestPromoEndDate!,
    daysRemaining: nextPromo.summary.earliestPromoDaysRemaining!,
  };
}
