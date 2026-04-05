import { Button } from "../../../components/primitives/Button";
import { EmptyState } from "../../../components/primitives/EmptyState";
import { Panel } from "../../../components/primitives/Panel";
import { Stack } from "../../../components/primitives/Stack";
import { ProjectionSeriesResult } from "../../../calculations/shared/calculation.types";
import { formatCurrency } from "../../../utils/currency";
import { formatDashboardDate, formatDashboardMonth, formatDurationMonths } from "../dashboard.formatters";

type DashboardProjectionPanelProps = {
  projection: ProjectionSeriesResult;
  currencyCode: string;
  onEditPlan: () => void;
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 220;
const CHART_PADDING_X = 18;
const CHART_PADDING_Y = 22;

export function DashboardProjectionPanel({
  projection,
  currencyCode,
  onEditPlan,
}: DashboardProjectionPanelProps) {
  const visibleSeries = projection.series.slice(0, 12);

  if (visibleSeries.length === 0 || projection.projectedMonthsRemaining === null) {
    return (
      <Panel
        className="dashboard-projection"
        title="Payoff timeline"
        description="Live payoff projection driven by your current plan"
        padding="lg"
      >
        <EmptyState
          title="Projection needs usable plan inputs"
          description="Add at least one open balance and a plan that can apply money each month. Then the debt-free timeline will render here."
          action={
            <Button variant="secondary" onClick={onEditPlan}>
              Edit plan
            </Button>
          }
        />
      </Panel>
    );
  }

  const maxBalance = Math.max(
    visibleSeries[0]?.totalBalanceStart ?? 0,
    ...visibleSeries.map((point) => point.totalBalanceEnd),
    1,
  );

  const toX = (index: number) => {
    if (visibleSeries.length <= 1) {
      return CHART_WIDTH / 2;
    }

    return CHART_PADDING_X + (index / (visibleSeries.length - 1)) * (CHART_WIDTH - CHART_PADDING_X * 2);
  };

  const toY = (value: number) => {
    const usableHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
    return CHART_HEIGHT - CHART_PADDING_Y - (value / maxBalance) * usableHeight;
  };

  const linePoints = visibleSeries
    .map((point, index) => `${toX(index)},${toY(point.totalBalanceEnd)}`)
    .join(" ");

  const areaPoints = [
    `${toX(0)},${CHART_HEIGHT - CHART_PADDING_Y}`,
    ...visibleSeries.map((point, index) => `${toX(index)},${toY(point.totalBalanceEnd)}`),
    `${toX(visibleSeries.length - 1)},${CHART_HEIGHT - CHART_PADDING_Y}`,
  ].join(" ");

  return (
    <Panel
      className="dashboard-projection"
      title="Payoff timeline"
      description="The chart tracks projected total balance reduction from your current payoff plan."
      padding="lg"
    >
      <Stack className="dashboard-projection__summary" direction="horizontal" gap="lg" wrap="wrap">
        <div>
          <span className="dashboard-projection__eyebrow">Debt-free target</span>
          <strong>{formatDashboardDate(projection.debtFreeDate)}</strong>
        </div>
        <div>
          <span className="dashboard-projection__eyebrow">Months remaining</span>
          <strong>{formatDurationMonths(projection.projectedMonthsRemaining)}</strong>
        </div>
        <div>
          <span className="dashboard-projection__eyebrow">Projected interest remaining</span>
          <strong>{formatCurrency(projection.projectedInterestRemaining, currencyCode)}</strong>
        </div>
      </Stack>

      <div className="dashboard-projection__chart-wrap">
        <svg
          className="dashboard-projection__chart"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label="Projected payoff timeline chart"
        >
          <line
            x1={CHART_PADDING_X}
            y1={CHART_HEIGHT - CHART_PADDING_Y}
            x2={CHART_WIDTH - CHART_PADDING_X}
            y2={CHART_HEIGHT - CHART_PADDING_Y}
            className="dashboard-projection__axis"
          />
          <line
            x1={CHART_PADDING_X}
            y1={CHART_PADDING_Y}
            x2={CHART_PADDING_X}
            y2={CHART_HEIGHT - CHART_PADDING_Y}
            className="dashboard-projection__axis"
          />
          <polygon points={areaPoints} className="dashboard-projection__area" />
          <polyline points={linePoints} className="dashboard-projection__line" />
          {visibleSeries.map((point, index) => (
            <circle
              key={point.monthStartDate}
              cx={toX(index)}
              cy={toY(point.totalBalanceEnd)}
              r="4"
              className="dashboard-projection__point"
            />
          ))}
        </svg>
      </div>

      <div className="dashboard-projection__labels" aria-hidden="true">
        <span>{formatDashboardMonth(visibleSeries[0].monthStartDate)}</span>
        <span>{formatDashboardMonth(visibleSeries[visibleSeries.length - 1].monthStartDate)}</span>
      </div>
    </Panel>
  );
}
