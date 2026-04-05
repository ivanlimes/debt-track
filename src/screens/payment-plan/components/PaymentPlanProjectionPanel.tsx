import { EmptyState } from "../../../components/primitives/EmptyState";
import { Panel } from "../../../components/primitives/Panel";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../components/primitives/Table";
import { ProjectionSeriesResult } from "../../../calculations/shared/calculation.types";
import { formatCurrency } from "../../../utils/currency";
import { formatPaymentPlanMonth } from "../paymentPlan.formatters";

type PaymentPlanProjectionPanelProps = {
  projection: ProjectionSeriesResult;
  currencyCode: string;
  targetNamesById: Map<string, string>;
};

export function PaymentPlanProjectionPanel({
  projection,
  currencyCode,
  targetNamesById,
}: PaymentPlanProjectionPanelProps) {
  const preview = projection.series.slice(0, 6);

  return (
    <Panel
      title="Projection support"
      description="The projection shows how the current plan is expected to move balances over the next months."
    >
      {preview.length === 0 ? (
        <EmptyState
          title="No projection yet"
          description="Set a usable plan and keep at least one open balance to generate a payoff timeline."
        />
      ) : (
        <Table caption="Six-month payoff projection preview">
          <TableHead>
            <TableRow>
              <TableHeaderCell scope="col">Month</TableHeaderCell>
              <TableHeaderCell scope="col">Starting debt</TableHeaderCell>
              <TableHeaderCell scope="col">Interest</TableHeaderCell>
              <TableHeaderCell scope="col">Payments</TableHeaderCell>
              <TableHeaderCell scope="col">Ending debt</TableHeaderCell>
              <TableHeaderCell scope="col">Target</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {preview.map((point) => (
              <TableRow key={point.monthIndex}>
                <TableCell>{formatPaymentPlanMonth(point.monthEndDate)}</TableCell>
                <TableCell>{formatCurrency(point.totalBalanceStart, currencyCode)}</TableCell>
                <TableCell>{formatCurrency(point.totalInterestAdded, currencyCode)}</TableCell>
                <TableCell>{formatCurrency(point.totalPaymentApplied, currencyCode)}</TableCell>
                <TableCell>{formatCurrency(point.totalBalanceEnd, currencyCode)}</TableCell>
                <TableCell>{point.targetCardId ? targetNamesById.get(point.targetCardId) ?? "Selected card" : "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
