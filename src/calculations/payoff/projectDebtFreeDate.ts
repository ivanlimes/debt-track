import { CreditCardAccount } from "../../domain/accounts/account.types";
import { PayoffPlan } from "../../domain/payoff-plan/payoffPlan.types";
import { buildProjectionSeries } from "./buildProjectionSeries";

export function projectDebtFreeDate(
  accounts: CreditCardAccount[],
  payoffPlan: PayoffPlan,
  asOfDate?: Date | string,
) {
  const projection = buildProjectionSeries(accounts, payoffPlan, asOfDate);

  return {
    debtFreeDate: projection.debtFreeDate,
    projectedMonthsRemaining: projection.projectedMonthsRemaining,
    projectedInterestRemaining: projection.projectedInterestRemaining,
  };
}
