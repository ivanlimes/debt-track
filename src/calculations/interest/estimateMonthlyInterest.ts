import { roundCurrency } from "../shared/calculation.helpers";

export function estimateMonthlyInterest(balance: number, apr: number) {
  const safeBalance = Math.max(balance, 0);
  const safeApr = Math.max(apr, 0);

  if (safeBalance === 0 || safeApr === 0) {
    return 0;
  }

  return roundCurrency(safeBalance * (safeApr / 100 / 12));
}
