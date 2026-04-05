import { CreditCardAccount } from "../../domain/accounts/account.types";
import { getAccountBalanceBuckets } from "../split-balances/splitBalance.helpers";
import { estimateMonthlyInterest } from "./estimateMonthlyInterest";

export function estimatePostPromoInterest(account: CreditCardAccount) {
  if (account.hasSplitBalances) {
    return getAccountBalanceBuckets(account).reduce((sum, bucket) => {
      const postPromoApr = bucket.hasPromoApr ? bucket.aprAfterPromo ?? bucket.apr : bucket.apr;
      return sum + estimateMonthlyInterest(bucket.currentBalance, postPromoApr);
    }, 0);
  }

  if (!account.hasPromoApr) {
    return estimateMonthlyInterest(account.currentBalance, account.standardApr);
  }

  const postPromoApr = account.aprAfterPromo ?? account.standardApr;
  return estimateMonthlyInterest(account.currentBalance, postPromoApr);
}
