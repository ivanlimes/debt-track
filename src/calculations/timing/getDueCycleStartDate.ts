import { CreditCardAccount } from "../../domain/accounts/account.types";
import { addDays, addMonths, createDateForDay, toIsoDate, toStartOfDay } from "../shared/calculation.helpers";

function resolveStatementDay(account: Pick<CreditCardAccount, "statementDayOfMonth" | "lastKnownStatementDate">) {
  if (account.statementDayOfMonth !== null) {
    return account.statementDayOfMonth;
  }

  if (account.lastKnownStatementDate) {
    return toStartOfDay(account.lastKnownStatementDate).getDate();
  }

  return null;
}

export function getDueCycleStartDate(
  account: Pick<CreditCardAccount, "dueDayOfMonth" | "statementDayOfMonth" | "lastKnownStatementDate">,
  dueDate: Date | string,
) {
  const normalizedDueDate = toStartOfDay(dueDate);
  const statementDay = resolveStatementDay(account);

  if (statementDay !== null) {
    const sameMonthStatementDate = createDateForDay(
      normalizedDueDate.getFullYear(),
      normalizedDueDate.getMonth(),
      statementDay,
    );

    if (sameMonthStatementDate.getTime() < normalizedDueDate.getTime()) {
      return toIsoDate(sameMonthStatementDate);
    }

    return toIsoDate(
      createDateForDay(
        normalizedDueDate.getFullYear(),
        normalizedDueDate.getMonth() - 1,
        statementDay,
      ),
    );
  }

  const previousDueDate = addMonths(
    createDateForDay(
      normalizedDueDate.getFullYear(),
      normalizedDueDate.getMonth(),
      account.dueDayOfMonth,
    ),
    -1,
  );

  return toIsoDate(addDays(previousDueDate, 1));
}
