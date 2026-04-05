import { Badge } from "../../../components/primitives/Badge";
import { EmptyState } from "../../../components/primitives/EmptyState";
import { Panel } from "../../../components/primitives/Panel";
import { RankedAccount } from "../../../calculations/shared/calculation.types";
import { formatCurrency } from "../../../utils/currency";
import { formatDashboardDate } from "../dashboard.formatters";

type DashboardRankingStripProps = {
  ranking: RankedAccount[];
  currencyCode: string;
  onInspectAccount: (accountId: string) => void;
};

export function DashboardRankingStrip({
  ranking,
  currencyCode,
  onInspectAccount,
}: DashboardRankingStripProps) {
  return (
    <Panel
      className="dashboard-ranking-panel"
      title="Payoff focus ranking"
      description="The ranking comes directly from the active payoff strategy."
      padding="lg"
    >
      {ranking.length === 0 ? (
        <EmptyState
          title="No ranked accounts yet"
          description="Once at least one open balance exists, the current payoff plan will rank accounts here."
        />
      ) : (
        <div className="dashboard-ranking-list">
          {ranking.slice(0, 4).map((item) => (
            <button
              key={item.accountId}
              type="button"
              className="dashboard-ranking-item"
              onClick={() => onInspectAccount(item.accountId)}
            >
              <div className="dashboard-ranking-item__index">#{item.rank}</div>
              <div className="dashboard-ranking-item__copy">
                <div className="dashboard-ranking-item__title-row">
                  <strong>{item.accountName}</strong>
                  <Badge tone={item.rank === 1 ? "accent" : "neutral"}>
                    {item.rank === 1 ? "Current target" : "Priority"}
                  </Badge>
                </div>
                <p>{item.reason}</p>
                <div className="dashboard-ranking-item__meta">
                  <span>{formatCurrency(item.currentBalance, currencyCode)} balance</span>
                  <span>{formatCurrency(item.estimatedMonthlyInterest, currencyCode)}/mo interest</span>
                  <span>{formatDashboardDate(item.projectedPayoffDate)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}
