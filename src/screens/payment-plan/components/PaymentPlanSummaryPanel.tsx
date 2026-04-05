import { Button } from "../../../components/primitives/Button";
import { Panel } from "../../../components/primitives/Panel";
import { RankedAccount } from "../../../calculations/shared/calculation.types";
import { formatCurrency } from "../../../utils/currency";
import { formatPaymentPlanDate, formatMonthsRemaining } from "../paymentPlan.formatters";

type PaymentPlanSummaryPanelProps = {
  projectedDebtFreeDate: string | null;
  projectedMonthsRemaining: number | null;
  projectedInterestRemaining: number;
  recommendedTarget: RankedAccount | null;
  currencyCode: string;
  onInspectTarget: (accountId: string) => void;
};

export function PaymentPlanSummaryPanel({
  projectedDebtFreeDate,
  projectedMonthsRemaining,
  projectedInterestRemaining,
  recommendedTarget,
  currencyCode,
  onInspectTarget,
}: PaymentPlanSummaryPanelProps) {
  return (
    <Panel
      title="Plan summary"
      description="These outputs are driven by the active plan plus your stored account and payment data."
    >
      <div className="payment-plan-summary-grid">
        <div className="payment-plan-summary-card">
          <span className="payment-plan-summary-card__label">Projected debt-free date</span>
          <strong>{formatPaymentPlanDate(projectedDebtFreeDate)}</strong>
          <span>{formatMonthsRemaining(projectedMonthsRemaining)} remaining</span>
        </div>
        <div className="payment-plan-summary-card">
          <span className="payment-plan-summary-card__label">Projected interest remaining</span>
          <strong>{formatCurrency(projectedInterestRemaining, currencyCode)}</strong>
          <span>Based on the current payoff plan.</span>
        </div>
        <div className="payment-plan-summary-card payment-plan-summary-card--target">
          <span className="payment-plan-summary-card__label">Recommended target card</span>
          {recommendedTarget ? (
            <>
              <strong>{recommendedTarget.accountName}</strong>
              <span>Rank #{recommendedTarget.rank} · {recommendedTarget.reason}</span>
              <Button variant="ghost" size="sm" onClick={() => onInspectTarget(recommendedTarget.accountId)}>
                Inspect target
              </Button>
            </>
          ) : (
            <>
              <strong>—</strong>
              <span>Add an open balance and a usable plan to generate a target.</span>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
