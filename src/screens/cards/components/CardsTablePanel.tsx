import { Button } from "../../../components/primitives/Button";
import { Badge } from "../../../components/primitives/Badge";
import { EmptyState } from "../../../components/primitives/EmptyState";
import { Panel } from "../../../components/primitives/Panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../../components/primitives/Table";
import { CardsViewRow } from "../../../state/selectors/cards.selectors";
import { formatCurrency } from "../../../utils/currency";
import { formatPercent } from "../../../utils/formatters";
import { formatCardsDate, formatCardsStatus } from "../cards.formatters";

type CardsTablePanelProps = {
  rows: CardsViewRow[];
  selectedAccountId: string | null;
  onInspectAccount: (accountId: string) => void;
  onEditAccount: (accountId: string) => void;
  onAddPayment: (accountId: string) => void;
};

function getDeferredTone(status: string) {
  switch (status) {
    case "safe":
      return "success" as const;
    case "warning":
    case "watch":
      return "warning" as const;
    case "critical":
    case "expired":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function StatusBadges({ row }: { row: CardsViewRow }) {
  return (
    <div className="cards-status-badges">
      {row.isClosed ? <Badge tone="neutral">Closed</Badge> : null}
      {row.isOverdue ? <Badge tone="danger">Overdue</Badge> : null}
      {!row.isClosed && !row.isOverdue && row.daysUntilDue <= 7 ? (
        <Badge tone={row.daysUntilDue <= 2 ? "danger" : "warning"}>Due soon</Badge>
      ) : null}
      {row.hasSplitBalances ? <Badge tone="accent">Split balance</Badge> : null}
      {row.hasSplitBalances && row.cardHasMixedAprs ? <Badge tone="neutral">Mixed APRs</Badge> : null}
      {row.promoStatus === "ending_soon" ? <Badge tone="warning">Promo ending soon</Badge> : null}
      {row.promoStatus === "expired" ? <Badge tone="danger">Promo expired</Badge> : null}
      {row.isDeferredInterest ? <Badge tone={getDeferredTone(row.deferredInterestRiskStatus)}>Deferred interest</Badge> : null}
      {row.isDeferredInterest && row.deferredInterestSafeByDeadline ? (
        <Badge tone="success">On track</Badge>
      ) : null}
      {row.isDeferredInterest && !row.deferredInterestSafeByDeadline && (row.deferredInterestRiskStatus === "warning" || row.deferredInterestRiskStatus === "critical" || row.deferredInterestRiskStatus === "watch") ? (
        <Badge tone={getDeferredTone(row.deferredInterestRiskStatus)}>Avoid by deadline</Badge>
      ) : null}
      {row.isDeferredInterest && row.deferredInterestRiskStatus === "expired" ? (
        <Badge tone="danger">Penalty risk</Badge>
      ) : null}
      {row.payoffRank === 1 ? <Badge tone="accent">Current target</Badge> : null}
    </div>
  );
}

export function CardsTablePanel({
  rows,
  selectedAccountId,
  onInspectAccount,
  onEditAccount,
  onAddPayment,
}: CardsTablePanelProps) {
  return (
    <Panel
      title="Tracked accounts"
      description="One row per physical card. Split-balance cards still roll up to one readable account row while bucket detail stays contextual in the inspector."
      padding="lg"
    >
      {rows.length === 0 ? (
        <EmptyState
          title="No cards match this filter"
          description="Adjust the current sort or filter to bring matching cards back into the list."
        />
      ) : (
        <Table caption="Credit card comparison table">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Card</TableHeaderCell>
              <TableHeaderCell>Balance</TableHeaderCell>
              <TableHeaderCell>Credit limit</TableHeaderCell>
              <TableHeaderCell>Utilization</TableHeaderCell>
              <TableHeaderCell>APR</TableHeaderCell>
              <TableHeaderCell>Minimum due</TableHeaderCell>
              <TableHeaderCell>Interest / month</TableHeaderCell>
              <TableHeaderCell>Next due</TableHeaderCell>
              <TableHeaderCell>Promo end</TableHeaderCell>
              <TableHeaderCell>Projected payoff</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = row.accountId === selectedAccountId;

              return (
                <TableRow
                  key={row.accountId}
                  className={isSelected ? "cards-table__row cards-table__row--selected" : "cards-table__row"}
                >
                  <TableCell>
                    <button
                      type="button"
                      className="cards-table__inspect-button"
                      onClick={() => onInspectAccount(row.accountId)}
                    >
                      <strong>{row.name || "Untitled card"}</strong>
                      <span>
                        {row.issuer || "Issuer not set"}
                        {row.hasSplitBalances ? ` · ${row.splitBalanceLabel}` : ""}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>{formatCurrency(row.currentBalance)}</TableCell>
                  <TableCell>{formatCurrency(row.creditLimit)}</TableCell>
                  <TableCell>
                    {row.utilizationPercent === null ? "—" : formatPercent(row.utilizationPercent)}
                  </TableCell>
                  <TableCell>
                    <div className="cards-table__due-cell">
                      <strong>{row.activeApr.toFixed(2)}%</strong>
                      <span>{row.activeAprSummary}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="cards-table__due-cell">
                      <strong>{formatCurrency(row.minimumPayment)}</strong>
                      <span>{formatCurrency(row.remainingDueThisMonth)} remaining</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(row.estimatedMonthlyInterest)}</TableCell>
                  <TableCell>
                    <div className="cards-table__due-cell">
                      <strong>{formatCardsDate(row.nextDueDate)}</strong>
                      <span>{formatCardsStatus(row.daysUntilDue, row.isOverdue)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="cards-table__due-cell">
                      <strong>{formatCardsDate(row.promoEndDate)}</strong>
                      <span>
                        {row.promoStatus === "none"
                          ? row.hasSplitBalances && row.cardHasMixedPromoRules
                            ? "Mixed promo rules"
                            : "No promo"
                          : row.isDeferredInterest && row.deferredInterestSafeByDeadline
                            ? "On track to avoid deferred interest"
                            : row.isDeferredInterest && row.payoffByPromoDeadlineMonthlyTarget !== null && row.deferredInterestPenaltyExposure !== null
                              ? `Pay ${formatCurrency(row.payoffByPromoDeadlineMonthlyTarget)}/mo to avoid ~${formatCurrency(row.deferredInterestPenaltyExposure)}`
                              : row.promoDaysRemaining === null
                                ? row.promoStatus
                                : `${row.promoDaysRemaining} day${row.promoDaysRemaining === 1 ? "" : "s"}`}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCardsDate(row.projectedPayoffDate)}</TableCell>
                  <TableCell>
                    <StatusBadges row={row} />
                  </TableCell>
                  <TableCell>
                    <div className="cards-table__actions">
                      <Button
                        size="sm"
                        variant={isSelected ? "secondary" : "ghost"}
                        onClick={() => onInspectAccount(row.accountId)}
                      >
                        {isSelected ? "Selected" : "Inspect"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onAddPayment(row.accountId)}>
                        Extra payment
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onEditAccount(row.accountId)}>
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
