import { Badge } from "../../../components/primitives/Badge";
import { EmptyState } from "../../../components/primitives/EmptyState";
import { Panel } from "../../../components/primitives/Panel";
import { RiskItem } from "../../../calculations/shared/calculation.types";
import { formatDashboardDate } from "../dashboard.formatters";

type DashboardRiskListProps = {
  risks: RiskItem[];
  onInspectAccount: (accountId: string) => void;
};

const severityToneMap = {
  info: "neutral",
  warning: "warning",
  critical: "danger",
} as const;

export function DashboardRiskList({ risks, onInspectAccount }: DashboardRiskListProps) {
  return (
    <Panel
      className="dashboard-risk-panel"
      title="Upcoming due and promo risks"
      description="Each item is driven by due-date or promo-expiration calculations."
      padding="lg"
    >
      {risks.length === 0 ? (
        <EmptyState
          title="No urgent timing risks right now"
          description="Due-soon and promo-expiration warnings will surface here when timing thresholds are hit."
        />
      ) : (
        <div className="dashboard-risk-list">
          {risks.slice(0, 6).map((risk) => (
            <button
              key={`${risk.type}-${risk.accountId}-${risk.date}`}
              type="button"
              className="dashboard-risk-item"
              onClick={() => onInspectAccount(risk.accountId)}
            >
              <div className="dashboard-risk-item__copy">
                <span className="dashboard-risk-item__account">{risk.accountName}</span>
                <span className="dashboard-risk-item__label">{risk.label}</span>
                <span className="dashboard-risk-item__date">{formatDashboardDate(risk.date)}</span>
              </div>
              <Badge tone={severityToneMap[risk.severity]}>{risk.severity}</Badge>
            </button>
          ))}
        </div>
      )}
    </Panel>
  );
}
