import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/primitives/Button";
import { Input } from "../../../components/primitives/Input";
import { Panel } from "../../../components/primitives/Panel";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "../../../components/primitives/Table";
import { buildProjectionSeries, getRecommendedTargetCard, rankCardsByStrategy } from "../../../calculations";
import { roundCurrency } from "../../../calculations/shared/calculation.helpers";
import { ProjectionSeriesResult, RankedAccount } from "../../../calculations/shared/calculation.types";
import { CreditCardAccount } from "../../../domain/accounts/account.types";
import { PayoffPlan } from "../../../domain/payoff-plan/payoffPlan.types";
import { PayoffStrategy } from "../../../domain/shared/enums";
import { formatCurrency } from "../../../utils/currency";
import { formatMonthsRemaining, formatPaymentPlanDate } from "../paymentPlan.formatters";

type PaymentPlanScenarioComparisonPanelProps = {
  openAccounts: CreditCardAccount[];
  livePlan: PayoffPlan;
  liveProjection: ProjectionSeriesResult;
  liveRanking: RankedAccount[];
  liveRecommendedTarget: RankedAccount | null;
  currencyCode: string;
  onInspectAccount: (accountId: string) => void;
};

type ScenarioComparisonRow = {
  key: string;
  label: string;
  strategy: PayoffStrategy;
  projection: ProjectionSeriesResult;
  ranking: RankedAccount[];
  recommendedTarget: RankedAccount | null;
  monthsDelta: number | null;
  interestDelta: number;
};

const MAX_RANKING_LABELS = 4;

function parseCurrencyInput(value: string) {
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return 0;
  }

  return roundCurrency(numeric);
}

function buildScenarioPlan(
  livePlan: PayoffPlan,
  strategy: PayoffStrategy,
  scenarioExtraPaymentAmount: number,
): PayoffPlan {
  return {
    ...livePlan,
    strategy,
    extraPaymentAmount: scenarioExtraPaymentAmount,
  };
}

function applyScenarioLumpSum(
  accounts: CreditCardAccount[],
  ranking: RankedAccount[],
  lumpSumAmount: number,
) {
  if (lumpSumAmount <= 0) {
    return accounts;
  }

  const workingAccounts = accounts.map((account) => ({ ...account }));
  const orderedIds = ranking.map((item) => item.accountId);
  let remaining = roundCurrency(lumpSumAmount);

  orderedIds.forEach((accountId) => {
    if (remaining <= 0) {
      return;
    }

    const account = workingAccounts.find((item) => item.id === accountId);

    if (!account || account.currentBalance <= 0) {
      return;
    }

    const applied = Math.min(account.currentBalance, remaining);
    account.currentBalance = roundCurrency(Math.max(account.currentBalance - applied, 0));
    remaining = roundCurrency(remaining - applied);
  });

  return workingAccounts;
}

function buildScenarioRow(
  label: string,
  strategy: PayoffStrategy,
  livePlan: PayoffPlan,
  openAccounts: CreditCardAccount[],
  scenarioExtraPaymentAmount: number,
  scenarioLumpSumAmount: number,
  liveProjection: ProjectionSeriesResult,
): ScenarioComparisonRow {
  const scenarioPlan = buildScenarioPlan(livePlan, strategy, scenarioExtraPaymentAmount);
  const initialRanking = rankCardsByStrategy(openAccounts, scenarioPlan);
  const scenarioAccounts = applyScenarioLumpSum(openAccounts, initialRanking, scenarioLumpSumAmount);
  const ranking = rankCardsByStrategy(scenarioAccounts, scenarioPlan);
  const projection = buildProjectionSeries(scenarioAccounts, scenarioPlan);
  const recommendedTarget = getRecommendedTargetCard(scenarioAccounts, scenarioPlan);

  return {
    key: `${strategy}-${label}`,
    label,
    strategy,
    projection,
    ranking,
    recommendedTarget,
    monthsDelta:
      projection.projectedMonthsRemaining === null || liveProjection.projectedMonthsRemaining === null
        ? null
        : projection.projectedMonthsRemaining - liveProjection.projectedMonthsRemaining,
    interestDelta: roundCurrency(
      projection.projectedInterestRemaining - liveProjection.projectedInterestRemaining,
    ),
  };
}

function formatDifference(monthsDelta: number | null, interestDelta: number, currencyCode: string) {
  const monthCopy =
    monthsDelta === null
      ? "timeline unchanged"
      : monthsDelta === 0
        ? "same payoff timing"
        : monthsDelta < 0
          ? `${Math.abs(monthsDelta)} month${Math.abs(monthsDelta) === 1 ? "" : "s"} faster`
          : `${monthsDelta} month${monthsDelta === 1 ? "" : "s"} slower`;

  const interestCopy =
    interestDelta === 0
      ? "same interest"
      : interestDelta < 0
        ? `${formatCurrency(Math.abs(interestDelta), currencyCode)} less interest`
        : `${formatCurrency(interestDelta, currencyCode)} more interest`;

  return `${monthCopy} · ${interestCopy}`;
}

function formatRankingPreview(ranking: RankedAccount[]) {
  if (ranking.length === 0) {
    return "No ranked accounts";
  }

  const visible = ranking.slice(0, MAX_RANKING_LABELS).map((item, index) => `${index + 1}. ${item.accountName}`);
  return ranking.length > MAX_RANKING_LABELS ? `${visible.join(" → ")} → …` : visible.join(" → ");
}

export function PaymentPlanScenarioComparisonPanel({
  openAccounts,
  livePlan,
  liveProjection,
  liveRanking,
  liveRecommendedTarget,
  currencyCode,
  onInspectAccount,
}: PaymentPlanScenarioComparisonPanelProps) {
  const [scenarioExtraPaymentAmount, setScenarioExtraPaymentAmount] = useState(
    String(livePlan.extraPaymentAmount),
  );
  const [scenarioLumpSumAmount, setScenarioLumpSumAmount] = useState("0");

  useEffect(() => {
    setScenarioExtraPaymentAmount(String(livePlan.extraPaymentAmount));
    setScenarioLumpSumAmount("0");
  }, [
    livePlan.strategy,
    livePlan.extraPaymentAmount,
    livePlan.monthlyDebtBudget,
    livePlan.useMinimumsFirst,
    livePlan.customPriorityOrder,
  ]);

  const parsedExtraPaymentAmount = useMemo(
    () => parseCurrencyInput(scenarioExtraPaymentAmount),
    [scenarioExtraPaymentAmount],
  );
  const parsedLumpSumAmount = useMemo(
    () => parseCurrencyInput(scenarioLumpSumAmount),
    [scenarioLumpSumAmount],
  );

  const comparisonRows = useMemo(() => {
    const rows: ScenarioComparisonRow[] = [
      buildScenarioRow(
        "Current plan scenario",
        livePlan.strategy,
        livePlan,
        openAccounts,
        parsedExtraPaymentAmount,
        parsedLumpSumAmount,
        liveProjection,
      ),
      buildScenarioRow(
        "Avalanche scenario",
        "avalanche",
        livePlan,
        openAccounts,
        parsedExtraPaymentAmount,
        parsedLumpSumAmount,
        liveProjection,
      ),
      buildScenarioRow(
        "Snowball scenario",
        "snowball",
        livePlan,
        openAccounts,
        parsedExtraPaymentAmount,
        parsedLumpSumAmount,
        liveProjection,
      ),
    ];

    if (livePlan.customPriorityOrder.length > 0) {
      rows.push(
        buildScenarioRow(
          "Custom order scenario",
          "custom",
          livePlan,
          openAccounts,
          parsedExtraPaymentAmount,
          parsedLumpSumAmount,
          liveProjection,
        ),
      );
    }

    return rows;
  }, [
    livePlan,
    openAccounts,
    parsedExtraPaymentAmount,
    parsedLumpSumAmount,
    liveProjection,
  ]);

  const liveRankingPreview = useMemo(() => formatRankingPreview(liveRanking), [liveRanking]);

  return (
    <Panel
      title="What-if strategy comparison"
      description="Temporary scenario inputs stay inside this planning tool only. They do not overwrite your live saved plan or create payment records."
      padding="lg"
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setScenarioExtraPaymentAmount(String(livePlan.extraPaymentAmount));
            setScenarioLumpSumAmount("0");
          }}
        >
          Reset scenario
        </Button>
      }
    >
      <div className="payment-plan-sandbox">
        <div className="payment-plan-sandbox__intro-grid">
          <div className="payment-plan-sandbox__baseline-card">
            <span className="payment-plan-sandbox__label">Current live plan</span>
            <strong>{livePlan.strategy}</strong>
            <span>
              {formatPaymentPlanDate(liveProjection.debtFreeDate)} · {formatMonthsRemaining(liveProjection.projectedMonthsRemaining)}
            </span>
            <span>{formatCurrency(liveProjection.projectedInterestRemaining, currencyCode)} interest remaining</span>
            <span>{liveRecommendedTarget ? `Target: ${liveRecommendedTarget.accountName}` : "Target: —"}</span>
            <p>{liveRankingPreview}</p>
          </div>

          <div className="payment-plan-sandbox__scenario-card">
            <span className="payment-plan-sandbox__label">Scenario</span>
            <div className="payment-plan-sandbox__inputs">
              <Input
                label="Scenario extra payment amount"
                type="number"
                min="0"
                step="0.01"
                value={scenarioExtraPaymentAmount}
                onChange={(event) => setScenarioExtraPaymentAmount(event.target.value)}
                helperText={
                  livePlan.monthlyDebtBudget !== null
                    ? "The live plan currently uses a fixed monthly debt budget, so extra-payment changes may have limited effect."
                    : "Temporary only. This does not overwrite your saved plan."
                }
              />
              <Input
                label="One-time lump-sum payment"
                type="number"
                min="0"
                step="0.01"
                value={scenarioLumpSumAmount}
                onChange={(event) => setScenarioLumpSumAmount(event.target.value)}
                helperText="Applied once at the scenario start, sequentially using the compared strategy order."
              />
            </div>
          </div>
        </div>

        <Table caption="Side-by-side payoff strategy comparison">
          <TableHead>
            <TableRow>
              <TableHeaderCell scope="col">Compare</TableHeaderCell>
              <TableHeaderCell scope="col">Debt-free date</TableHeaderCell>
              <TableHeaderCell scope="col">Months remaining</TableHeaderCell>
              <TableHeaderCell scope="col">Interest remaining</TableHeaderCell>
              <TableHeaderCell scope="col">Difference vs current live plan</TableHeaderCell>
              <TableHeaderCell scope="col">Recommended target</TableHeaderCell>
              <TableHeaderCell scope="col">Ordered payoff ranking</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonRows.map((row) => (
              <TableRow key={row.key}>
                <TableCell>
                  <div className="payment-plan-table__primary">{row.label}</div>
                  <div className="payment-plan-table__secondary">{row.strategy}</div>
                </TableCell>
                <TableCell>{formatPaymentPlanDate(row.projection.debtFreeDate)}</TableCell>
                <TableCell>{formatMonthsRemaining(row.projection.projectedMonthsRemaining)}</TableCell>
                <TableCell>{formatCurrency(row.projection.projectedInterestRemaining, currencyCode)}</TableCell>
                <TableCell>{formatDifference(row.monthsDelta, row.interestDelta, currencyCode)}</TableCell>
                <TableCell>
                  {row.recommendedTarget ? (
                    <div className="payment-plan-sandbox__target-cell">
                      <div className="payment-plan-table__primary">{row.recommendedTarget.accountName}</div>
                      <Button variant="ghost" size="sm" onClick={() => onInspectAccount(row.recommendedTarget!.accountId)}>
                        Inspect
                      </Button>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{formatRankingPreview(row.ranking)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  );
}
