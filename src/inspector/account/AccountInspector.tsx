import { useAppState } from "../../app/providers/AppProviders";
import { AccountMetricsPanel } from "./AccountMetricsPanel";
import { AccountSplitBalancePanel } from "./AccountSplitBalancePanel";
import { AccountPaymentHistoryPanel } from "./AccountPaymentHistoryPanel";
import { AccountPromoPanel } from "./AccountPromoPanel";
import { AccountQuickActions } from "./AccountQuickActions";
import { AccountSummaryPanel } from "./AccountSummaryPanel";

export function AccountInspector({ accountId }: { accountId: string }) {
  const { state } = useAppState();
  const account = state.domain.accountsById[accountId];

  if (!account) return null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <AccountSummaryPanel accountId={accountId} />
      <AccountMetricsPanel accountId={accountId} />
      <AccountPromoPanel accountId={accountId} />
      <AccountSplitBalancePanel accountId={accountId} />
      <AccountPaymentHistoryPanel accountId={accountId} />
      <AccountQuickActions accountId={accountId} />
    </div>
  );
}
