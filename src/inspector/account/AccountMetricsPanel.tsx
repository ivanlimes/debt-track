import { useAppState } from "../../app/providers/AppProviders";
import { Panel } from "../../components/primitives/Panel";
import { Stack } from "../../components/primitives/Stack";
import { selectComputedAccountMetrics } from "../../state/selectors/account.selectors";
import { formatCurrency } from "../../utils/currency";

export function AccountMetricsPanel({ accountId }: { accountId: string }) {
  const { state } = useAppState();
  const metrics = selectComputedAccountMetrics(state, accountId);

  if (!metrics) {
    return null;
  }

  return (
    <Panel title="Metrics" description="Derived values update after valid edits are saved.">
      <Stack gap="xs">
        <p><strong>Utilization:</strong> {metrics.utilizationPercent === null ? 'Unavailable' : `${metrics.utilizationPercent.toFixed(1)}%`}</p>
        <p><strong>Estimated monthly interest:</strong> {formatCurrency(metrics.estimatedMonthlyInterest)}</p>
        <p><strong>Active APR summary:</strong> {metrics.splitBalance.activeAprSummary}</p>
        <p><strong>Next due date:</strong> {metrics.nextDueDate}</p>
        <p><strong>Projected payoff date:</strong> {metrics.projectedPayoffDate ?? "Unavailable"}</p>
      </Stack>
    </Panel>
  );
}
