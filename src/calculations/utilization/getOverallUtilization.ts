import { CreditCardAccount } from "../../domain/accounts/account.types";
import { roundPercent } from "../shared/calculation.helpers";

export function getOverallUtilization(accounts: CreditCardAccount[]) {
  const openAccounts = accounts.filter((account) => !account.isClosed);
  const totalBalance = openAccounts.reduce(
    (sum, account) => sum + Math.max(account.currentBalance, 0),
    0,
  );
  const totalLimit = openAccounts.reduce(
    (sum, account) => sum + Math.max(account.creditLimit, 0),
    0,
  );

  if (totalLimit <= 0) {
    return null;
  }

  return roundPercent((totalBalance / totalLimit) * 100);
}
