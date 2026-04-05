import {
  buildProjectionSeries,
  getRecommendedTargetCard,
  rankCardsByStrategy,
} from "../../calculations";
import { AppState } from "../appState.types";
import { selectOpenAccounts } from "./account.selectors";

export function selectActivePayoffPlan(state: AppState) {
  return state.domain.activePayoffPlan;
}

export function selectPayoffRanking(state: AppState, asOfDate?: Date | string) {
  return rankCardsByStrategy(selectOpenAccounts(state), selectActivePayoffPlan(state), asOfDate);
}

export function selectRecommendedTargetCard(state: AppState, asOfDate?: Date | string) {
  return getRecommendedTargetCard(
    selectOpenAccounts(state),
    selectActivePayoffPlan(state),
    asOfDate,
  );
}

export function selectProjectionSeries(state: AppState, asOfDate?: Date | string) {
  return buildProjectionSeries(selectOpenAccounts(state), selectActivePayoffPlan(state), asOfDate);
}
