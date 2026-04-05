import { CreditCardAccount } from "../../domain/accounts/account.types";
import {
  createDateForDay,
  toIsoDate,
  toStartOfDay,
} from "../shared/calculation.helpers";

export function getNextDueDate(
  account: Pick<CreditCardAccount, "dueDayOfMonth">,
  asOfDate?: Date | string,
) {
  const referenceDate = toStartOfDay(asOfDate);
  const currentMonthDueDate = createDateForDay(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    account.dueDayOfMonth,
  );

  if (referenceDate.getTime() <= currentMonthDueDate.getTime()) {
    return toIsoDate(currentMonthDueDate);
  }

  const nextMonthDueDate = createDateForDay(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    account.dueDayOfMonth,
  );

  return toIsoDate(nextMonthDueDate);
}
