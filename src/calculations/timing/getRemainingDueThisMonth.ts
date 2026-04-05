import { CreditCardAccount } from "../../domain/accounts/account.types";
import { PaymentRecord } from "../../domain/payments/payment.types";
import {
  createDateForDay,
  roundCurrency,
  toStartOfDay,
} from "../shared/calculation.helpers";
import { getDueCycleStartDate } from "./getDueCycleStartDate";

function getCurrentMonthDueDate(account: Pick<CreditCardAccount, "dueDayOfMonth">, asOfDate?: Date | string) {
  const referenceDate = toStartOfDay(asOfDate);
  return createDateForDay(referenceDate.getFullYear(), referenceDate.getMonth(), account.dueDayOfMonth);
}

function getPaymentsWithinWindow(
  payments: PaymentRecord[],
  accountId: string,
  startDate: Date | string,
  endDate: Date | string,
) {
  const start = toStartOfDay(startDate).getTime();
  const end = toStartOfDay(endDate).getTime();

  return payments
    .filter((payment) => payment.cardId === accountId)
    .filter((payment) => {
      const paymentTime = toStartOfDay(payment.paymentDate).getTime();
      return paymentTime >= start && paymentTime <= end;
    })
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function getRemainingDueThisMonth(
  account: Pick<
    CreditCardAccount,
    "id" | "minimumPayment" | "dueDayOfMonth" | "statementDayOfMonth" | "lastKnownStatementDate"
  >,
  payments: PaymentRecord[],
  asOfDate?: Date | string,
) {
  const referenceDate = toStartOfDay(asOfDate);
  const currentMonthDueDate = getCurrentMonthDueDate(account, referenceDate);
  const cycleStart = getDueCycleStartDate(account, currentMonthDueDate);
  const paymentWindowEnd = referenceDate.getTime() <= currentMonthDueDate.getTime()
    ? referenceDate
    : currentMonthDueDate;
  const appliedPayments = getPaymentsWithinWindow(
    payments,
    account.id,
    cycleStart,
    paymentWindowEnd,
  );

  return roundCurrency(Math.max(account.minimumPayment - appliedPayments, 0));
}
