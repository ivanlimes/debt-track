import { CreditCardAccount } from "../../domain/accounts/account.types";
import { diffInCalendarDays, toStartOfDay } from "../shared/calculation.helpers";
import { getNextDueDate } from "./getNextDueDate";

export function getDaysUntilDue(
  account: Pick<CreditCardAccount, "dueDayOfMonth">,
  asOfDate?: Date | string,
) {
  const nextDueDate = getNextDueDate(account, asOfDate);
  return diffInCalendarDays(nextDueDate, toStartOfDay(asOfDate));
}
