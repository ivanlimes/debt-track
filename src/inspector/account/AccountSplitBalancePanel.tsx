import { useAppState } from "../../app/providers/AppProviders";
import { Panel } from "../../components/primitives/Panel";
import { Stack } from "../../components/primitives/Stack";
import { getBucketAllocationPrioritySummary } from "../../calculations/split-balances/splitBalance.helpers";
import { selectComputedAccountMetrics } from "../../state/selectors/account.selectors";
import { formatCurrency } from "../../utils/currency";

export function AccountSplitBalancePanel({ accountId }: { accountId: string }) {
  const { state } = useAppState();
  const account = state.domain.accountsById[accountId];
  const metrics = selectComputedAccountMetrics(state, accountId);

  if (!account || !metrics || !account.hasSplitBalances) {
    return null;
  }

  const allocationSummary = getBucketAllocationPrioritySummary(account);

  return (
    <Panel
      title="Split balances"
      description="Bucket rows explain the mechanics inside this one physical card. They are supporting detail, not separate cards."
    >
      <Stack gap="sm">
        <p><strong>Mixed APRs:</strong> {metrics.cardHasMixedAprs ? "Yes" : "No"}</p>
        <p><strong>Mixed promo rules:</strong> {metrics.cardHasMixedPromoRules ? "Yes" : "No"}</p>
        <div className="split-bucket-list">
          {metrics.splitBalance.bucketMetrics.map((item) => (
            <div key={item.bucket.id} className="split-bucket-list__item">
              <div>
                <strong>{item.bucket.label}</strong>
                <span>{item.bucket.bucketType.replace(/_/g, " ")}</span>
              </div>
              <div>
                <strong>{formatCurrency(item.bucket.currentBalance)}</strong>
                <span>{item.activeApr.toFixed(2)}% active APR · {formatCurrency(item.estimatedMonthlyInterest)} / mo</span>
              </div>
            </div>
          ))}
        </div>
        <p><strong>Minimum-payment allocation order:</strong> {allocationSummary.minimumOrder.join(", ") || "—"}</p>
        <p><strong>Extra-payment allocation order:</strong> {allocationSummary.extraOrder.join(", ") || "—"}</p>
      </Stack>
    </Panel>
  );
}
