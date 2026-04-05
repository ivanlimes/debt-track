import { Panel } from '../../../components/primitives/Panel';
import { Button } from '../../../components/primitives/Button';
import { formatCalendarDate, formatRelativeDaysFrom } from '../calendar.formatters';

type CalendarOverviewPanelProps = {
  dueSoonCount: number;
  promoEndingSoonCount: number;
  paymentCountThisMonth: number;
  nextDueDate: string | null;
  nextPromoDate: string | null;
  onAddPayment: () => void;
  onEditPlan: () => void;
};

export function CalendarOverviewPanel({
  dueSoonCount,
  promoEndingSoonCount,
  paymentCountThisMonth,
  nextDueDate,
  nextPromoDate,
  onAddPayment,
  onEditPlan,
}: CalendarOverviewPanelProps) {
  return (
    <Panel
      className="calendar-overview-panel"
      title="Current timing overview"
      description="See what is approaching first so this screen stays debt-timing specific instead of becoming a generic planner."
      actions={
        <div className="calendar-overview-panel__actions">
          <Button variant="secondary" size="sm" onClick={onAddPayment}>
            Add payment
          </Button>
          <Button variant="ghost" size="sm" onClick={onEditPlan}>
            Edit plan
          </Button>
        </div>
      }
    >
      <div className="calendar-overview-grid">
        <div className="calendar-overview-card">
          <span className="calendar-overview-card__label">Due soon</span>
          <strong>{dueSoonCount}</strong>
          <p>{nextDueDate ? `${formatCalendarDate(nextDueDate)} · ${formatRelativeDaysFrom(nextDueDate)}` : 'No due date scheduled'}</p>
        </div>

        <div className="calendar-overview-card">
          <span className="calendar-overview-card__label">Promo endings soon</span>
          <strong>{promoEndingSoonCount}</strong>
          <p>{nextPromoDate ? `${formatCalendarDate(nextPromoDate)} · ${formatRelativeDaysFrom(nextPromoDate)}` : 'No promo deadline tracked'}</p>
        </div>

        <div className="calendar-overview-card">
          <span className="calendar-overview-card__label">Payments this month</span>
          <strong>{paymentCountThisMonth}</strong>
          <p>Recorded payment events inside the current month view.</p>
        </div>
      </div>
    </Panel>
  );
}
