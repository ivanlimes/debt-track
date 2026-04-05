import { PayoffPlan } from "../../domain/payoff-plan/payoffPlan.types";
import { validatePayoffPlan } from "../../domain/payoff-plan/payoffPlan.validators";
import { PayoffStrategy } from "../../domain/shared/enums";
import { FieldErrorMap } from "../shared/form.types";
import { validationMessages } from "../shared/validationMessages";

export type PayoffPlanFormState = {
  strategy: PayoffStrategy;
  monthlyDebtBudget: string;
  extraPaymentAmount: string;
  customPriorityOrder: string[];
  useMinimumsFirst: boolean;
};

export function createPayoffPlanFormState(plan: PayoffPlan): PayoffPlanFormState {
  return {
    strategy: plan.strategy,
    monthlyDebtBudget: plan.monthlyDebtBudget === null ? "" : String(plan.monthlyDebtBudget),
    extraPaymentAmount: String(plan.extraPaymentAmount),
    customPriorityOrder: [...plan.customPriorityOrder],
    useMinimumsFirst: plan.useMinimumsFirst,
  };
}

export function mapPayoffPlanFormToInput(form: PayoffPlanFormState) {
  return {
    strategy: form.strategy,
    monthlyDebtBudget: form.monthlyDebtBudget.trim() ? Number(form.monthlyDebtBudget.trim()) : null,
    extraPaymentAmount: Number(form.extraPaymentAmount.trim()),
    customPriorityOrder: form.strategy === "custom" ? form.customPriorityOrder : [],
    useMinimumsFirst: form.useMinimumsFirst,
  };
}

export function validatePayoffPlanForm(form: PayoffPlanFormState, openAccountIds: string[]): FieldErrorMap {
  const errors: FieldErrorMap = {};
  const input = mapPayoffPlanFormToInput(form);

  if (!form.extraPaymentAmount.trim() || Number.isNaN(input.extraPaymentAmount)) {
    errors.extraPaymentAmount = validationMessages.numberRequired;
  }

  if (form.monthlyDebtBudget.trim() && input.monthlyDebtBudget === null) {
    errors.monthlyDebtBudget = validationMessages.numberRequired;
  }

  const schemaMessages = validatePayoffPlan(input);
  for (const message of schemaMessages) {
    if (message.includes("Extra payment")) errors.extraPaymentAmount = message;
    if (message.includes("Monthly debt budget")) errors.monthlyDebtBudget = message;
    if (message.includes("Custom priority")) errors.customPriorityOrder = message;
  }

  if (form.strategy === "custom") {
    if (form.customPriorityOrder.length === 0) {
      errors.customPriorityOrder = validationMessages.customPriorityMissing;
    } else if (form.customPriorityOrder.some((id) => !openAccountIds.includes(id))) {
      errors.customPriorityOrder = "Custom priority must reference open accounts only.";
    }
  }

  return errors;
}
