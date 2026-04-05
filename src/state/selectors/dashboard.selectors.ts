import { getDashboardSummary } from "../../calculations";
import { AppState } from "../appState.types";
import { selectAccounts, selectPayments } from "./account.selectors";
import { selectActivePayoffPlan } from "./paymentPlan.selectors";

export function selectDashboardSummary(state: AppState, asOfDate?: Date | string) {
  return getDashboardSummary(
    selectAccounts(state),
    selectPayments(state),
    selectActivePayoffPlan(state),
    asOfDate,
  );
}
