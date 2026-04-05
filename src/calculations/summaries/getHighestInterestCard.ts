import { CreditCardAccount } from "../../domain/accounts/account.types";
import { getRolledUpCurrentBalance, getRolledUpEstimatedMonthlyInterest } from "../split-balances/splitBalance.helpers";

export function getHighestInterestCard(
  accounts: CreditCardAccount[],
  asOfDate?: Date | string,
) {
  const openAccounts = accounts.filter((account) => !account.isClosed && getRolledUpCurrentBalance(account) > 0);

  if (openAccounts.length === 0) {
    return null;
  }

  return openAccounts.reduce((highest, current) => {
    const currentEstimate = getRolledUpEstimatedMonthlyInterest(current, asOfDate);

    if (!highest || currentEstimate > highest.estimatedMonthlyInterest) {
      return {
        account: current,
        estimatedMonthlyInterest: currentEstimate,
      };
    }

    return highest;
  }, null as { account: CreditCardAccount; estimatedMonthlyInterest: number } | null);
}
