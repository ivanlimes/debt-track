import { ReactNode } from "react";
import { Panel } from "../../../components/primitives/Panel";
import { Badge } from "../../../components/primitives/Badge";

type DashboardKpiCardProps = {
  label: string;
  value: string;
  supportingText?: ReactNode;
  tone?: "accent" | "neutral" | "warning" | "danger" | "success";
};

export function DashboardKpiCard({
  label,
  value,
  supportingText,
  tone = "neutral",
}: DashboardKpiCardProps) {
  return (
    <Panel className="dashboard-kpi-card" padding="md">
      <div className="dashboard-kpi-card__header">
        <span className="dashboard-kpi-card__label">{label}</span>
        <Badge tone={tone}>{tone === "neutral" ? "Live" : tone}</Badge>
      </div>
      <div className="dashboard-kpi-card__value">{value}</div>
      {supportingText ? (
        <p className="dashboard-kpi-card__supporting">{supportingText}</p>
      ) : null}
    </Panel>
  );
}
