import { ReactNode } from "react";
import { Button } from "../../../components/primitives/Button";
import { Panel } from "../../../components/primitives/Panel";
import { Stack } from "../../../components/primitives/Stack";
import { PayoffPlan } from "../../../domain/payoff-plan/payoffPlan.types";
import { CreditCardAccount } from "../../../domain/accounts/account.types";
import { formatCurrency } from "../../../utils/currency";

type PaymentPlanControlsPanelProps = {
  plan: PayoffPlan;
  orderedAccounts: CreditCardAccount[];
  currencyCode: string;
  onEditPlan: () => void;
};

function renderBudgetLabel(value: number | null, currencyCode: string) {
  if (value === null) {
    return "Not set";
  }

  return formatCurrency(value, currencyCode);
}

function renderCustomPriority(plan: PayoffPlan, orderedAccounts: CreditCardAccount[]): ReactNode {
  if (plan.strategy !== "custom") {
    return <span className="payment-plan-field__value">Strategy-driven order</span>;
  }

  if (orderedAccounts.length === 0) {
    return <span className="payment-plan-field__value">No open accounts assigned yet</span>;
  }

  return (
    <ol className="payment-plan-priority-list">
      {orderedAccounts.map((account) => (
        <li key={account.id}>
          <strong>{account.name || "Untitled card"}</strong>
          <span>{account.issuer || "Issuer not set"}</span>
        </li>
      ))}
    </ol>
  );
}

export function PaymentPlanControlsPanel({
  plan,
  orderedAccounts,
  currencyCode,
  onEditPlan,
}: PaymentPlanControlsPanelProps) {
  return (
    <Panel
      title="Active payoff plan"
      description="The strategy inputs stay controlled. Update the plan through the existing edit flow, then review how the ranking and payoff timing change here."
      actions={<Button variant="primary" onClick={onEditPlan}>Edit plan</Button>}
    >
      <div className="payment-plan-fields-grid">
        <div className="payment-plan-field">
          <span className="payment-plan-field__label">Strategy</span>
          <span className="payment-plan-field__value">{plan.strategy}</span>
        </div>
        <div className="payment-plan-field">
          <span className="payment-plan-field__label">Extra payment amount</span>
          <span className="payment-plan-field__value">{formatCurrency(plan.extraPaymentAmount, currencyCode)}</span>
        </div>
        <div className="payment-plan-field">
          <span className="payment-plan-field__label">Monthly debt budget</span>
          <span className="payment-plan-field__value">{renderBudgetLabel(plan.monthlyDebtBudget, currencyCode)}</span>
        </div>
        <div className="payment-plan-field">
          <span className="payment-plan-field__label">Use minimums first</span>
          <span className="payment-plan-field__value">{plan.useMinimumsFirst ? "Yes" : "No"}</span>
        </div>
      </div>

      <Stack gap="sm">
        <div className="payment-plan-field payment-plan-field--block">
          <span className="payment-plan-field__label">Priority order</span>
          {renderCustomPriority(plan, orderedAccounts)}
        </div>
      </Stack>
    </Panel>
  );
}
