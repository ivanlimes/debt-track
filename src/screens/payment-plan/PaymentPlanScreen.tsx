import { useMemo } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { useWorkspaceActions } from "../../app/hooks/useWorkspaceActions";
import { Button } from "../../components/primitives/Button";
import { EmptyState } from "../../components/primitives/EmptyState";
import { selectOpenAccounts } from "../../state/selectors/account.selectors";
import {
  selectActivePayoffPlan,
  selectPayoffRanking,
  selectProjectionSeries,
  selectRecommendedTargetCard,
} from "../../state/selectors/paymentPlan.selectors";
import { PaymentPlanControlsPanel } from "./components/PaymentPlanControlsPanel";
import { PaymentPlanProjectionPanel } from "./components/PaymentPlanProjectionPanel";
import { PaymentPlanAmortizationPanel } from "./components/PaymentPlanAmortizationPanel";
import { PaymentPlanRankingPanel } from "./components/PaymentPlanRankingPanel";
import { PaymentPlanSummaryPanel } from "./components/PaymentPlanSummaryPanel";
import { PaymentPlanScenarioComparisonPanel } from "./components/PaymentPlanScenarioComparisonPanel";

function orderAccountsByCustomPriority(openAccounts: ReturnType<typeof selectOpenAccounts>, order: string[]) {
  const byId = new Map(openAccounts.map((account) => [account.id, account]));
  const prioritized = order
    .map((accountId) => byId.get(accountId) ?? null)
    .filter((account): account is NonNullable<typeof account> => Boolean(account));
  const prioritizedIds = new Set(prioritized.map((account) => account.id));
  const remaining = openAccounts.filter((account) => !prioritizedIds.has(account.id));
  return [...prioritized, ...remaining];
}

export function PaymentPlanScreen() {
  const { state } = useAppState();
  const { addCard, addPayment, editPlan, inspectAccount } = useWorkspaceActions();
  const openAccounts = useMemo(() => selectOpenAccounts(state), [state]);
  const plan = useMemo(() => selectActivePayoffPlan(state), [state]);
  const ranking = useMemo(() => selectPayoffRanking(state), [state]);
  const projection = useMemo(() => selectProjectionSeries(state), [state]);
  const recommendedTarget = useMemo(() => selectRecommendedTargetCard(state), [state]);
  const orderedAccounts = useMemo(
    () => orderAccountsByCustomPriority(openAccounts, plan.customPriorityOrder),
    [openAccounts, plan.customPriorityOrder],
  );
  const currencyCode = state.domain.preferences.currencyCode;
  const targetNamesById = useMemo(
    () => new Map(openAccounts.map((account) => [account.id, account.name || "Untitled card"])),
    [openAccounts],
  );

  if (openAccounts.length === 0) {
    return (
      <section className="payment-plan-screen">
        <header className="payment-plan-screen__hero">
          <div>
            <h1>Payment Plan</h1>
            <p>
              The strategy surface becomes useful once at least one open card balance exists in the
              canonical model.
            </p>
          </div>
        </header>

        <EmptyState
          title="No open balances to plan around yet"
          description="Add your first tracked card to generate a live payoff order, debt-free projection, and target-card recommendation."
          action={
            <Button variant="primary" onClick={() => addCard({ destination: "cards" })}>
              Add first card
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="payment-plan-screen">
      <header className="payment-plan-screen__hero">
        <div>
          <h1>Payment Plan</h1>
          <p>
            This is the active strategy surface: review the current payoff plan, see which card gets
            priority next, and confirm how the plan changes the projected debt-free path.
          </p>
        </div>
        <div className="payment-plan-screen__hero-actions">
          <Button variant="secondary" onClick={() => addPayment()}>
            Add payment
          </Button>
          <Button variant="primary" onClick={() => editPlan()}>
            Edit plan
          </Button>
        </div>
      </header>

      <div className="payment-plan-screen__layout">
        <PaymentPlanControlsPanel
          plan={plan}
          orderedAccounts={orderedAccounts}
          currencyCode={currencyCode}
          onEditPlan={() => editPlan()}
        />

        <PaymentPlanSummaryPanel
          projectedDebtFreeDate={projection.debtFreeDate}
          projectedMonthsRemaining={projection.projectedMonthsRemaining}
          projectedInterestRemaining={projection.projectedInterestRemaining}
          recommendedTarget={recommendedTarget}
          currencyCode={currencyCode}
          onInspectTarget={(accountId) => inspectAccount(accountId, { destination: "cards" })}
        />

        <PaymentPlanScenarioComparisonPanel
          openAccounts={openAccounts}
          livePlan={plan}
          liveProjection={projection}
          liveRanking={ranking}
          liveRecommendedTarget={recommendedTarget}
          currencyCode={currencyCode}
          onInspectAccount={(accountId) => inspectAccount(accountId, { destination: "cards" })}
        />

        <PaymentPlanAmortizationPanel
          projection={projection}
          currencyCode={currencyCode}
        />

        <div className="payment-plan-screen__detail-grid">
          <PaymentPlanRankingPanel
            ranking={ranking}
            currencyCode={currencyCode}
            onInspectAccount={(accountId) => inspectAccount(accountId, { destination: "cards" })}
          />

          <PaymentPlanProjectionPanel
            projection={projection}
            currencyCode={currencyCode}
            targetNamesById={targetNamesById}
          />
        </div>
      </div>
    </section>
  );
}
