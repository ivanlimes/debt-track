import { CreditCardAccount } from "../../domain/accounts/account.types";
import { getWeightedActiveAprSummary } from "../split-balances/splitBalance.helpers";
import { getPromoStatus } from "../timing/getPromoStatus";

export function getActiveApr(account: CreditCardAccount, asOfDate?: Date | string) {
  if (account.hasSplitBalances) {
    return getWeightedActiveAprSummary(account, asOfDate);
  }

  const promoStatus = getPromoStatus(account, asOfDate);

  if ((promoStatus === "active" || promoStatus === "ending_soon") && account.promoApr !== null) {
    return Math.max(account.promoApr, 0);
  }

  if (account.aprAfterPromo !== null) {
    return Math.max(account.aprAfterPromo, 0);
  }

  return Math.max(account.standardApr, 0);
}
