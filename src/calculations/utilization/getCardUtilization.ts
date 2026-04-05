import { CreditCardAccount } from "../../domain/accounts/account.types";
import { roundPercent } from "../shared/calculation.helpers";

export function getCardUtilization(account: CreditCardAccount) {
  if (account.creditLimit <= 0) {
    return null;
  }

  return roundPercent((Math.max(account.currentBalance, 0) / account.creditLimit) * 100);
}
