import { CreditCardAccount } from "../../domain/accounts/account.types";
import { PayoffPlan } from "../../domain/payoff-plan/payoffPlan.types";
import { rankCardsByStrategy } from "./rankCardsByStrategy";

export function getRecommendedTargetCard(
  accounts: CreditCardAccount[],
  payoffPlan: PayoffPlan,
  asOfDate?: Date | string,
) {
  const rankedAccounts = rankCardsByStrategy(accounts, payoffPlan, asOfDate);
  return rankedAccounts[0] ?? null;
}
