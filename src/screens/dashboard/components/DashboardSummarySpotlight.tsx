import { ReactNode } from "react";
import { Button } from "../../../components/primitives/Button";
import { Panel } from "../../../components/primitives/Panel";

type DashboardSummarySpotlightProps = {
  title: string;
  eyebrow: string;
  primaryValue: string;
  supportingText: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function DashboardSummarySpotlight({
  title,
  eyebrow,
  primaryValue,
  supportingText,
  actionLabel,
  onAction,
}: DashboardSummarySpotlightProps) {
  return (
    <Panel className="dashboard-spotlight" title={title} description={eyebrow} padding="md">
      <div className="dashboard-spotlight__value">{primaryValue}</div>
      <p className="dashboard-spotlight__supporting">{supportingText}</p>
      {actionLabel && onAction ? (
        <div className="dashboard-spotlight__actions">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}
