import { useAppState } from "../../app/providers/AppProviders";
import { Badge } from "../../components/primitives/Badge";
import { Panel } from "../../components/primitives/Panel";
import { Stack } from "../../components/primitives/Stack";
import { selectComputedAccountMetrics } from "../../state/selectors/account.selectors";
import { formatCurrency } from "../../utils/currency";

function getDeferredTone(status: string) {
  switch (status) {
    case "safe":
      return "success" as const;
    case "warning":
      return "warning" as const;
    case "critical":
    case "expired":
      return "danger" as const;
    case "watch":
      return "warning" as const;
    default:
      return "neutral" as const;
  }
}

export function AccountPromoPanel({ accountId }: { accountId: string }) {
  const { state } = useAppState();
  const account = state.domain.accountsById[accountId];
  const metrics = selectComputedAccountMetrics(state, accountId);
  const currencyCode = state.domain.preferences.currencyCode;

  if (!account || !metrics) return null;

  const deferred = metrics.deferredInterest;
  const badgeTone = account.isDeferredInterest
    ? getDeferredTone(deferred.deferredInterestRiskStatus)
    : metrics.promoStatus !== "none"
      ? "warning"
      : "neutral";
  const badgeLabel = account.isDeferredInterest
    ? deferred.deferredInterestRiskStatus === "safe"
      ? "Deferred safe"
      : deferred.deferredInterestRiskStatus === "expired"
        ? "Deferred expired"
        : "Deferred risk"
    : metrics.promoStatus !== "none"
      ? metrics.promoStatus
      : "No promo";

  return (
    <Panel
      title="Promo"
      description="Structured promo fields remain first-class risk data. Deferred-interest exposure stays separate from current balance."
      actions={<Badge tone={badgeTone}>{badgeLabel}</Badge>}
    >
      <Stack gap="xs">
        <p><strong>Promo active:</strong> {metrics.promoStatus === "none" ? "No" : "Yes"}</p>
        <p><strong>Promo end:</strong> {metrics.splitBalance.earliestPromoEndDate ?? "Not set"}</p>
        <p><strong>Promo days remaining:</strong> {metrics.promoDaysRemaining ?? "Unavailable"}</p>
        {account.isDeferredInterest ? (
          <>
            <p><strong>Deferred-interest APR basis:</strong> {deferred.deferredInterestAprBasis === null ? "Uses post-promo / bucket APRs" : `${deferred.deferredInterestAprBasis.toFixed(2)}%`}</p>
            <p><strong>Deferred-interest start date:</strong> {account.deferredInterestStartDate ?? "Not set"}</p>
            <p><strong>Hidden accrued exposure (estimate):</strong> {deferred.deferredInterestShadowAccrued === null ? "Unavailable" : formatCurrency(deferred.deferredInterestShadowAccrued, currencyCode)}</p>
            <p><strong>Retroactive penalty exposure (estimate):</strong> {deferred.deferredInterestPenaltyExposure === null ? "Unavailable" : formatCurrency(deferred.deferredInterestPenaltyExposure, currencyCode)}</p>
            <p><strong>Pay by deadline target:</strong> {deferred.payoffByPromoDeadlineMonthlyTarget === null ? "Unavailable" : formatCurrency(deferred.payoffByPromoDeadlineMonthlyTarget, currencyCode)}</p>
            <p><strong>Risk state:</strong> {deferred.deferredInterestRiskStatus}</p>
            {deferred.deferredInterestWarningMessage ? (
              <p><strong>Warning:</strong> {deferred.deferredInterestWarningMessage}</p>
            ) : null}
          </>
        ) : metrics.splitBalance.mixedPromoRules ? (
          <p><strong>Promo mix:</strong> This split-balance card contains multiple promo behaviors across its internal buckets.</p>
        ) : null}
      </Stack>
    </Panel>
  );
}
