import { Button } from "../../../components/primitives/Button";
import { EmptyState } from "../../../components/primitives/EmptyState";
import { Panel } from "../../../components/primitives/Panel";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../components/primitives/Table";
import { RankedAccount } from "../../../calculations/shared/calculation.types";
import { formatCurrency } from "../../../utils/currency";
import { formatPaymentPlanDate, formatMonthsRemaining } from "../paymentPlan.formatters";

type PaymentPlanRankingPanelProps = {
  ranking: RankedAccount[];
  currencyCode: string;
  onInspectAccount: (accountId: string) => void;
};

export function PaymentPlanRankingPanel({
  ranking,
  currencyCode,
  onInspectAccount,
}: PaymentPlanRankingPanelProps) {
  return (
    <Panel
      title="Payoff ranking"
      description="This list answers where extra money should go under the active plan."
    >
      {ranking.length === 0 ? (
        <EmptyState
          title="No ranked accounts yet"
          description="Add an open card balance to generate the active payoff order."
        />
      ) : (
        <Table caption="Current payoff ranking">
          <TableHead>
            <TableRow>
              <TableHeaderCell scope="col">Rank</TableHeaderCell>
              <TableHeaderCell scope="col">Card</TableHeaderCell>
              <TableHeaderCell scope="col">Balance</TableHeaderCell>
              <TableHeaderCell scope="col">APR</TableHeaderCell>
              <TableHeaderCell scope="col">Projected payoff</TableHeaderCell>
              <TableHeaderCell scope="col">Why</TableHeaderCell>
              <TableHeaderCell scope="col">Action</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ranking.map((item) => (
              <TableRow key={item.accountId}>
                <TableCell>#{item.rank}</TableCell>
                <TableCell>
                  <div className="payment-plan-table__primary">{item.accountName}</div>
                  <div className="payment-plan-table__secondary">
                    {formatCurrency(item.estimatedMonthlyInterest, currencyCode)} / month interest
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(item.currentBalance, currencyCode)}</TableCell>
                <TableCell>{item.activeApr.toFixed(2)}%</TableCell>
                <TableCell>
                  <div className="payment-plan-table__primary">{formatPaymentPlanDate(item.projectedPayoffDate)}</div>
                  <div className="payment-plan-table__secondary">{formatMonthsRemaining(item.projectedMonthsRemaining)}</div>
                </TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => onInspectAccount(item.accountId)}>
                    Inspect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Panel>
  );
}
