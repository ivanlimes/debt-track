import { CreditCardAccount } from "../../domain/accounts/account.types";
import { diffInCalendarDays, toStartOfDay } from "../shared/calculation.helpers";

export function getPromoDaysRemaining(
  account: Pick<CreditCardAccount, "hasPromoApr" | "promoEndDate">,
  asOfDate?: Date | string,
) {
  if (!account.hasPromoApr || !account.promoEndDate) {
    return null;
  }

  return diffInCalendarDays(account.promoEndDate, toStartOfDay(asOfDate));
}
