import { useMemo, useState } from "react";
import { Button } from "../../../components/primitives/Button";
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
import { ProjectionSeriesPoint, ProjectionSeriesResult } from "../../../calculations/shared/calculation.types";
import { formatCurrency } from "../../../utils/currency";
import { formatMonthsRemaining, formatPaymentPlanDate, formatPaymentPlanMonth } from "../paymentPlan.formatters";

type PaymentPlanAmortizationPanelProps = {
  projection: ProjectionSeriesResult;
  currencyCode: string;
};

type AmortizationViewMode = "table" | "chart";

const COLLAPSED_ROW_COUNT = 6;

function formatDragSummary(projection: ProjectionSeriesResult, currencyCode: string) {
  const months = formatMonthsRemaining(projection.projectedMonthsRemaining);
  const interest = formatCurrency(projection.projectedInterestRemaining, currencyCode);

  if (projection.projectedMonthsRemaining === null) {
    return `Projected interest remains unavailable until the active plan has enough data to model the payoff path.`;
  }

  return `${interest} of projected interest remains on the active path across ${months.toLowerCase()}.`;
}

function renderTippingPoint(point: ProjectionSeriesPoint | null) {
  if (!point) {
    return {
      title: "No repayment tipping point yet",
      detail: "Interest still dominates every projected month under the current plan.",
    };
  }

  return {
    title: `Tipping point: ${formatPaymentPlanMonth(point.monthEndDate)}`,
    detail: `Principal is projected to overtake interest by ${formatPaymentPlanDate(point.monthEndDate)} and stay ahead from there.`,
  };
}

function renderRemainingCopy(point: ProjectionSeriesPoint) {
  if (point.isTippingPoint) {
    return "Tipping point";
  }

  return `${formatMonthsRemaining(point.remainingMonthsAfter)} left after this month`;
}

function getPaymentRatio(value: number, total: number) {
  if (total <= 0 || value <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (value / total) * 100));
}

export function PaymentPlanAmortizationPanel({ projection, currencyCode }: PaymentPlanAmortizationPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<AmortizationViewMode>("table");

  const series = projection.monthByMonthProjectionSeries;
  const visibleRows = expanded ? series : series.slice(0, COLLAPSED_ROW_COUNT);
  const tippingPointRow = useMemo(() => series.find((point) => point.isTippingPoint) ?? null, [series]);
  const tippingPointSummary = useMemo(() => renderTippingPoint(tippingPointRow), [tippingPointRow]);

  const actions = (
    <div className="payment-plan-amortization__actions">
      <div className="payment-plan-amortization__view-toggle" role="group" aria-label="Amortization view mode">
        <Button
          variant={viewMode === "table" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("table")}
          aria-pressed={viewMode === "table"}
        >
          Table
        </Button>
        <Button
          variant={viewMode === "chart" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("chart")}
          aria-pressed={viewMode === "chart"}
        >
          Chart
        </Button>
      </div>
      {series.length > COLLAPSED_ROW_COUNT ? (
        <Button variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show less detail" : "Show full schedule"}
        </Button>
      ) : null}
    </div>
  );

  return (
    <Panel
      title="Amortization path"
      description="Month-by-month breakdown of how the active plan is projected to split each payment between interest drag and principal reduction."
      actions={actions}
    >
      {series.length === 0 ? (
        <EmptyState
          title="No amortization schedule yet"
          description="Keep at least one open balance and a usable active plan to generate a month-by-month repayment path."
        />
      ) : (
        <div className="payment-plan-amortization">
          <div className="payment-plan-amortization__summary-grid">
            <article className="payment-plan-amortization__summary-card">
              <span className="payment-plan-amortization__label">Cost of dragging balances</span>
              <strong>{formatCurrency(projection.projectedInterestRemaining, currencyCode)}</strong>
              <p>{formatDragSummary(projection, currencyCode)}</p>
            </article>
            <article className="payment-plan-amortization__summary-card payment-plan-amortization__summary-card--tipping-point">
              <span className="payment-plan-amortization__label">Repayment tipping point</span>
              <strong>{tippingPointSummary.title}</strong>
              <p>{tippingPointSummary.detail}</p>
            </article>
          </div>

          {viewMode === "table" ? (
            <Table caption="Active-plan amortization schedule">
              <TableHead>
                <TableRow>
                  <TableHeaderCell scope="col">Month</TableHeaderCell>
                  <TableHeaderCell scope="col">Payment</TableHeaderCell>
                  <TableHeaderCell scope="col">Interest</TableHeaderCell>
                  <TableHeaderCell scope="col">Principal</TableHeaderCell>
                  <TableHeaderCell scope="col">Ending balance</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((point) => (
                  <TableRow
                    key={point.monthIndex}
                    className={point.isTippingPoint ? "payment-plan-amortization__row payment-plan-amortization__row--tipping-point" : "payment-plan-amortization__row"}
                  >
                    <TableCell>
                      <div className="payment-plan-table__primary">{point.periodLabel || formatPaymentPlanMonth(point.monthEndDate)}</div>
                      <div className="payment-plan-table__secondary">{renderRemainingCopy(point)}</div>
                    </TableCell>
                    <TableCell>{formatCurrency(point.totalPaymentApplied, currencyCode)}</TableCell>
                    <TableCell>{formatCurrency(point.interestCharged, currencyCode)}</TableCell>
                    <TableCell>{formatCurrency(point.principalPaid, currencyCode)}</TableCell>
                    <TableCell>{formatCurrency(point.endingBalance, currencyCode)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="payment-plan-amortization__chart" role="img" aria-label="Stacked principal versus interest bars by projected month">
              <div className="payment-plan-amortization__chart-legend" aria-hidden="true">
                <span className="payment-plan-amortization__legend-item"><span className="payment-plan-amortization__legend-swatch payment-plan-amortization__legend-swatch--principal" />Principal</span>
                <span className="payment-plan-amortization__legend-item"><span className="payment-plan-amortization__legend-swatch payment-plan-amortization__legend-swatch--interest" />Interest</span>
              </div>
              <div className="payment-plan-amortization__chart-list">
                {visibleRows.map((point) => {
                  const total = point.totalPaymentApplied;
                  const principalRatio = getPaymentRatio(point.principalPaid, total);
                  const interestRatio = getPaymentRatio(point.interestCharged, total);

                  return (
                    <div
                      key={point.monthIndex}
                      className={point.isTippingPoint ? "payment-plan-amortization__chart-row payment-plan-amortization__chart-row--tipping-point" : "payment-plan-amortization__chart-row"}
                    >
                      <div className="payment-plan-amortization__chart-copy">
                        <div className="payment-plan-table__primary">{point.periodLabel || formatPaymentPlanMonth(point.monthEndDate)}</div>
                        <div className="payment-plan-table__secondary">{renderRemainingCopy(point)}</div>
                      </div>
                      <div className="payment-plan-amortization__chart-bar-wrap">
                        <div className="payment-plan-amortization__chart-bar" aria-hidden="true">
                          <span
                            className="payment-plan-amortization__chart-segment payment-plan-amortization__chart-segment--principal"
                            style={{ width: `${principalRatio}%` }}
                          />
                          <span
                            className="payment-plan-amortization__chart-segment payment-plan-amortization__chart-segment--interest"
                            style={{ width: `${interestRatio}%` }}
                          />
                        </div>
                      </div>
                      <div className="payment-plan-amortization__chart-values">
                        <span>P {formatCurrency(point.principalPaid, currencyCode)}</span>
                        <span>I {formatCurrency(point.interestCharged, currencyCode)}</span>
                        <strong>{formatCurrency(point.totalPaymentApplied, currencyCode)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!expanded && series.length > COLLAPSED_ROW_COUNT ? (
            <p className="payment-plan-amortization__footnote">
              Showing the first {COLLAPSED_ROW_COUNT} projected months. Expand the schedule to review the full payoff path.
            </p>
          ) : null}
        </div>
      )}
    </Panel>
  );
}
