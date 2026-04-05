import { CreditCardAccount } from "../../domain/accounts/account.types";
import { PromoStatus } from "../shared/calculation.types";
import { getPromoDaysRemaining } from "./getPromoDaysRemaining";

const PROMO_ENDING_SOON_THRESHOLD_DAYS = 30;

export function getPromoStatus(
  account: Pick<CreditCardAccount, "hasPromoApr" | "promoEndDate">,
  asOfDate?: Date | string,
): PromoStatus {
  if (!account.hasPromoApr) {
    return "none";
  }

  if (!account.promoEndDate) {
    return "active";
  }

  const daysRemaining = getPromoDaysRemaining(account, asOfDate);

  if (daysRemaining === null) {
    return "active";
  }

  if (daysRemaining < 0) {
    return "expired";
  }

  if (daysRemaining <= PROMO_ENDING_SOON_THRESHOLD_DAYS) {
    return "ending_soon";
  }

  return "active";
}
