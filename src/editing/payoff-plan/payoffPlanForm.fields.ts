import { PAYOFF_STRATEGIES } from "../../domain/shared/enums";
import { FieldOption } from "../shared/form.types";

export const payoffStrategyOptions: FieldOption[] = PAYOFF_STRATEGIES.map((strategy) => ({
  value: strategy,
  label:
    strategy === "avalanche"
      ? "Avalanche"
      : strategy === "snowball"
        ? "Snowball"
        : "Custom",
}));
