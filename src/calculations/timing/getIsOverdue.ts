import { CreditCardAccount } from "../../domain/accounts/account.types";
import { PaymentRecord } from "../../domain/payments/payment.types";
import { createDateForDay, toStartOfDay } from "../shared/calculation.helpers";
import { getRemainingDueThisMonth } from "./getRemainingDueThisMonth";

export function getIsOverdue(
  account: Pick<
    CreditCardAccount,
    "id" | "minimumPayment" | "dueDayOfMonth" | "statementDayOfMonth" | "lastKnownStatementDate" | "isClosed"
  >,
  payments: PaymentRecord[],
  asOfDate?: Date | string,
) {
  if (account.isClosed) {
    return false;
  }

  const referenceDate = toStartOfDay(asOfDate);
  const currentMonthDueDate = createDateForDay(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    account.dueDayOfMonth,
  );

  if (referenceDate.getTime() <= currentMonthDueDate.getTime()) {
    return false;
  }

  return getRemainingDueThisMonth(account, payments, asOfDate) > 0;
}
