import { useMemo } from "react";
import { EmptyState } from "../../../components/primitives/EmptyState";
import { Panel } from "../../../components/primitives/Panel";
import { CreditCardAccount } from "../../../domain/accounts/account.types";
import { formatCurrency } from "../../../utils/currency";

type DashboardDebtCompositionPanelProps = {
  accounts: CreditCardAccount[];
  totalDebt: number;
  currencyCode: string;
};

type CompositionSlice = {
  key: string;
  label: string;
  value: number;
  ratio: number;
};

const DONUT_COLORS = [
  "var(--chart-donut-1)",
  "var(--chart-donut-2)",
  "var(--chart-donut-3)",
  "var(--chart-donut-4)",
  "var(--chart-donut-5)",
  "var(--chart-donut-6)",
] as const;

const CHART_SIZE = 220;
const CENTER = CHART_SIZE / 2;
const RADIUS = 78;
const STROKE_WIDTH = 22;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_VISIBLE_SLICES = 6;
const OTHER_THRESHOLD_RATIO = 0.04;

function buildCompositionSlices(accounts: CreditCardAccount[], totalDebt: number): CompositionSlice[] {
  const ranked = accounts
    .filter((account) => account.currentBalance > 0)
    .sort((left, right) => right.currentBalance - left.currentBalance)
    .map((account) => ({
      key: account.id,
      label: account.name,
      value: account.currentBalance,
      ratio: totalDebt > 0 ? account.currentBalance / totalDebt : 0,
    }));

  if (ranked.length <= MAX_VISIBLE_SLICES) {
    return ranked;
  }

  const visible: CompositionSlice[] = [];
  const other: CompositionSlice[] = [];

  ranked.forEach((slice, index) => {
    const shouldGroup = index >= MAX_VISIBLE_SLICES - 1 || slice.ratio < OTHER_THRESHOLD_RATIO;

    if (shouldGroup) {
      other.push(slice);
      return;
    }

    visible.push(slice);
  });

  if (other.length === 0) {
    return ranked.slice(0, MAX_VISIBLE_SLICES);
  }

  const otherValue = other.reduce((sum, slice) => sum + slice.value, 0);

  visible.push({
    key: "other",
    label: "Other",
    value: otherValue,
    ratio: totalDebt > 0 ? otherValue / totalDebt : 0,
  });

  return visible;
}

export function DashboardDebtCompositionPanel({
  accounts,
  totalDebt,
  currencyCode,
}: DashboardDebtCompositionPanelProps) {
  const slices = useMemo(() => buildCompositionSlices(accounts, totalDebt), [accounts, totalDebt]);

  if (totalDebt <= 0 || slices.length === 0) {
    return (
      <Panel
        className="dashboard-debt-composition"
        title="Balance by debt"
        description="How current open-account balances are distributed right now"
        padding="md"
      >
        <EmptyState
          title="No open debt to chart"
          description="Once at least one open account has a positive balance, the current debt composition will render here."
        />
      </Panel>
    );
  }

  let offset = 0;

  return (
    <Panel
      className="dashboard-debt-composition"
      title="Balance by debt"
      description="How current open-account balances are distributed across tracked open cards"
      padding="md"
    >
      <div className="dashboard-debt-composition__layout">
        <div className="dashboard-debt-composition__chart-wrap">
          <svg
            className="dashboard-debt-composition__chart"
            viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
            role="img"
            aria-label="Donut chart showing how current total debt is distributed across open accounts"
          >
            <circle
              className="dashboard-debt-composition__track"
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE_WIDTH}
            />
            {slices.map((slice, index) => {
              const dashLength = Math.max(slice.ratio * CIRCUMFERENCE, 0);
              const dashArray = `${dashLength} ${CIRCUMFERENCE - dashLength}`;
              const strokeDashoffset = -offset;
              offset += dashLength;

              return (
                <circle
                  key={slice.key}
                  className="dashboard-debt-composition__slice"
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={dashArray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                />
              );
            })}
          </svg>

          <div className="dashboard-debt-composition__center">
            <span className="dashboard-debt-composition__eyebrow">Current total debt</span>
            <strong>{formatCurrency(totalDebt, currencyCode)}</strong>
            <span className="dashboard-debt-composition__count">{accounts.length} open account{accounts.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <ul className="dashboard-debt-composition__legend" aria-label="Debt composition legend">
          {slices.map((slice, index) => (
            <li key={slice.key} className="dashboard-debt-composition__legend-item">
              <span
                className="dashboard-debt-composition__legend-dot"
                style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
                aria-hidden="true"
              />
              <span className="dashboard-debt-composition__legend-copy">
                <span className="dashboard-debt-composition__legend-label">{slice.label}</span>
                <span className="dashboard-debt-composition__legend-value">
                  {formatCurrency(slice.value, currencyCode)} · {(slice.ratio * 100).toFixed(0)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
