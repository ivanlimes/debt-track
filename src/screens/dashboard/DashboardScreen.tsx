import { useMemo } from "react";
import { useAppState } from "../../app/providers/AppProviders";
import { useWorkspaceActions } from "../../app/hooks/useWorkspaceActions";
import { Button } from "../../components/primitives/Button";
import { EmptyState } from "../../components/primitives/EmptyState";
import { Panel } from "../../components/primitives/Panel";
import { selectOpenAccounts } from "../../state/selectors/account.selectors";
import { selectDashboardSummary } from "../../state/selectors/dashboard.selectors";
import { selectPayoffRanking, selectProjectionSeries } from "../../state/selectors/paymentPlan.selectors";
import { formatCurrency } from "../../utils/currency";
import { formatPercent } from "../../utils/formatters";
import { DashboardDebtCompositionPanel } from "./components/DashboardDebtCompositionPanel";
import { DashboardKpiCard } from "./components/DashboardKpiCard";
import { DashboardProjectionPanel } from "./components/DashboardProjectionPanel";
import { DashboardRankingStrip } from "./components/DashboardRankingStrip";
import { DashboardRiskList } from "./components/DashboardRiskList";
import { DashboardSummarySpotlight } from "./components/DashboardSummarySpotlight";
import { formatDashboardDate, formatDurationMonths } from "./dashboard.formatters";

export function DashboardScreen() {
  const { state } = useAppState();
  const { addCard, addPayment, editPlan, inspectAccount } = useWorkspaceActions();
  const summary = useMemo(() => selectDashboardSummary(state), [state]);
  const projection = useMemo(() => selectProjectionSeries(state), [state]);
  const ranking = useMemo(() => selectPayoffRanking(state), [state]);
  const openAccounts = useMemo(() => selectOpenAccounts(state), [state]);
  const currencyCode = state.domain.preferences.currencyCode;

  if (openAccounts.length === 0) {
    return (
      <section className="dashboard-screen">
        <header className="dashboard-screen__hero">
          <div>
            <h1>Dashboard</h1>
            <p>
              The dashboard becomes the decision overview surface once at least one credit card
              account exists in the canonical model.
            </p>
          </div>
        </header>

        <EmptyState
          title="No tracked credit cards yet"
          description="Add your first card to unlock live debt totals, projected payoff timing, promo deadline visibility, and risk summaries."
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
    <section className="dashboard-screen">
      <header className="dashboard-screen__hero">
        <div>
          <h1>Dashboard</h1>
          <p>
            This is the first real end-to-end destination: live debt status, timing risk, and payoff
            projection driven by your stored accounts, payments, and active plan.
          </p>
        </div>
        <div className="dashboard-screen__hero-actions">
          <Button variant="secondary" onClick={() => addPayment()}>
            Add extra payment
          </Button>
          <Button variant="ghost" onClick={() => editPlan({ destination: "paymentPlan" })}>
            Edit plan
          </Button>
        </div>
      </header>

      <div className="dashboard-kpi-grid">
        <DashboardKpiCard
          label="Total debt"
          value={formatCurrency(summary.totalDebt, currencyCode)}
          supportingText={`${openAccounts.length} open card${openAccounts.length === 1 ? "" : "s"} tracked`}
          tone="accent"
        />
        <DashboardKpiCard
          label="Total minimum due"
          value={formatCurrency(summary.totalMinimumDueThisMonth, currencyCode)}
          supportingText={`${formatCurrency(summary.totalPaidThisMonth, currencyCode)} paid this month`}
        />
        <DashboardKpiCard
          label="Estimated monthly interest"
          value={formatCurrency(summary.totalEstimatedMonthlyInterest, currencyCode)}
          supportingText={summary.highestInterestCard ? `${summary.highestInterestCard.account.name} is costing the most right now` : "No interest-driving account found"}
          tone={summary.totalEstimatedMonthlyInterest > 0 ? "warning" : "success"}
        />
        <DashboardKpiCard
          label="Projected debt-free date"
          value={formatDashboardDate(summary.projectedDebtFreeDate)}
          supportingText={`Overall utilization ${summary.overallUtilizationPercent === null ? "—" : formatPercent(summary.overallUtilizationPercent)}`}
          tone={summary.projectedMonthsRemaining !== null && summary.projectedMonthsRemaining <= 12 ? "success" : "neutral"}
        />
      </div>

      <div className="dashboard-main-grid">
        <DashboardProjectionPanel
          projection={projection}
          currencyCode={currencyCode}
          onEditPlan={() => editPlan({ destination: "paymentPlan" })}
        />

        <div className="dashboard-side-grid">
          {summary.highestInterestCard ? (
            <DashboardSummarySpotlight
              title="Highest monthly interest card"
              eyebrow="Current cost-impact leader"
              primaryValue={summary.highestInterestCard.account.name}
              supportingText={
                <>
                  {formatCurrency(summary.highestInterestCard.estimatedMonthlyInterest, currencyCode)} / month at current balance.
                </>
              }
              actionLabel="Inspect card"
              onAction={() => inspectAccount(summary.highestInterestCard!.account.id, { destination: "cards" })}
            />
          ) : (
            <Panel
              className="dashboard-spotlight"
              title="Highest monthly interest card"
              description="Current cost-impact leader"
              padding="md"
            >
              <EmptyState
                title="No interest-driving card found"
                description="This card summary appears once an open balance exists with a real APR impact."
              />
            </Panel>
          )}

          {summary.nextPromoExpiration ? (
            <DashboardSummarySpotlight
              title="Next promo expiration"
              eyebrow="Next rate-change risk"
              primaryValue={summary.nextPromoExpiration.account.name}
              supportingText={
                <>
                  Ends {formatDashboardDate(summary.nextPromoExpiration.promoEndDate)} · {summary.nextPromoExpiration.daysRemaining} day{summary.nextPromoExpiration.daysRemaining === 1 ? "" : "s"} remaining.
                </>
              }
              actionLabel="Inspect card"
              onAction={() => inspectAccount(summary.nextPromoExpiration!.account.id, { destination: "cards" })}
            />
          ) : (
            <Panel
              className="dashboard-spotlight"
              title="Next promo expiration"
              description="Next rate-change risk"
              padding="md"
            >
              <EmptyState
                title="No active promo deadline"
                description="Promo-expiration timing will surface here when an active promotional APR is tracked."
              />
            </Panel>
          )}

          <Panel
            className="dashboard-spotlight dashboard-spotlight--plan"
            title="Plan status"
            description="What the active payoff plan is currently doing"
            padding="md"
          >
            <div className="dashboard-spotlight__value">{state.domain.activePayoffPlan.strategy}</div>
            <p className="dashboard-spotlight__supporting">
              Extra payment {formatCurrency(state.domain.activePayoffPlan.extraPaymentAmount, currencyCode)} · {formatDurationMonths(summary.projectedMonthsRemaining)} remaining.
            </p>
          </Panel>

          <DashboardDebtCompositionPanel
            accounts={openAccounts}
            totalDebt={summary.totalDebt}
            currencyCode={currencyCode}
          />
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <DashboardRiskList
          risks={summary.upcomingRiskItems}
          onInspectAccount={(accountId) => inspectAccount(accountId, { destination: "cards" })}
        />
        <DashboardRankingStrip
          ranking={ranking}
          currencyCode={currencyCode}
          onInspectAccount={(accountId) => inspectAccount(accountId, { destination: "cards" })}
        />
      </div>
    </section>
  );
}
