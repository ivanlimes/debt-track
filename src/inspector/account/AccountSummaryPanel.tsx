import { useAppState } from "../../app/providers/AppProviders";
import { Badge } from "../../components/primitives/Badge";
import { Panel } from "../../components/primitives/Panel";
import { Stack } from "../../components/primitives/Stack";
import { selectComputedAccountMetrics } from "../../state/selectors/account.selectors";
import { formatCurrency } from "../../utils/currency";

export function AccountSummaryPanel({ accountId }: { accountId: string }) {
  const { state } = useAppState();
  const account = state.domain.accountsById[accountId];
  const metrics = selectComputedAccountMetrics(state, accountId);

  if (!account || !metrics) return null;

  return (
    <Panel
      title={account.name || "Untitled card"}
      description={account.issuer || "Issuer not set"}
      actions={
        <div className="inspector-badges">
          <Badge tone={account.isClosed ? "warning" : "accent"}>{account.isClosed ? "Closed" : "Open"}</Badge>
          {account.hasSplitBalances ? <Badge tone="neutral">{metrics.splitBalanceLabel}</Badge> : null}
        </div>
      }
    >
      <Stack gap="xs">
        <p><strong>Balance:</strong> {formatCurrency(metrics.rolledUpCurrentBalance)}</p>
        <p><strong>Minimum payment:</strong> {formatCurrency(account.minimumPayment)}</p>
        {account.hasSplitBalances ? (
          <p><strong>Structure:</strong> One physical card with {metrics.splitBalance.bucketCount} internal balance bucket{metrics.splitBalance.bucketCount === 1 ? "" : "s"}.</p>
        ) : null}
      </Stack>
    </Panel>
  );
}
