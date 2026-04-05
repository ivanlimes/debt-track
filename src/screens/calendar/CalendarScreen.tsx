import { useMemo } from 'react';
import { useAppState } from '../../app/providers/AppProviders';
import { useWorkspaceActions } from '../../app/hooks/useWorkspaceActions';
import { Button } from '../../components/primitives/Button';
import { EmptyState } from '../../components/primitives/EmptyState';
import { selectOpenAccounts, selectPayments } from '../../state/selectors/account.selectors';
import { selectCalendarEvents } from '../../state/selectors/calendar.selectors';
import { CalendarOverviewPanel } from './components/CalendarOverviewPanel';
import { CalendarTimelinePanel } from './components/CalendarTimelinePanel';

const DUE_SOON_THRESHOLD_DAYS = 14;
const PROMO_SOON_THRESHOLD_DAYS = 30;
const UPCOMING_WINDOW_DAYS = 60;

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function CalendarScreen() {
  const { state } = useAppState();
  const { addCard, addPayment, editPayment, editPlan, inspectAccount } = useWorkspaceActions();
  const openAccounts = useMemo(() => selectOpenAccounts(state), [state]);
  const payments = useMemo(() => selectPayments(state), [state]);
  const allEvents = useMemo(() => selectCalendarEvents(state), [state]);

  const today = new Date();
  const todayIso = toIsoDate(today);
  const upcomingWindowEnd = toIsoDate(addDays(today, UPCOMING_WINDOW_DAYS));
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthStartIso = toIsoDate(monthStart);
  const monthEndIso = toIsoDate(monthEnd);

  const upcomingEvents = useMemo(
    () => allEvents.filter((event) => event.date >= todayIso && event.date <= upcomingWindowEnd),
    [allEvents, todayIso, upcomingWindowEnd],
  );

  const currentMonthEvents = useMemo(
    () => allEvents.filter((event) => event.date >= monthStartIso && event.date <= monthEndIso),
    [allEvents, monthStartIso, monthEndIso],
  );

  const dueSoonCount = useMemo(
    () => upcomingEvents.filter((event) => event.type === 'due_date').slice(0).filter((event) => {
      const diff = Math.round((new Date(`${event.date}T00:00:00`).getTime() - new Date(`${todayIso}T00:00:00`).getTime()) / 86400000);
      return diff <= DUE_SOON_THRESHOLD_DAYS;
    }).length,
    [upcomingEvents, todayIso],
  );

  const promoEndingSoonCount = useMemo(
    () => upcomingEvents.filter((event) => event.type === 'promo_end').slice(0).filter((event) => {
      const diff = Math.round((new Date(`${event.date}T00:00:00`).getTime() - new Date(`${todayIso}T00:00:00`).getTime()) / 86400000);
      return diff <= PROMO_SOON_THRESHOLD_DAYS;
    }).length,
    [upcomingEvents, todayIso],
  );

  const paymentCountThisMonth = useMemo(
    () => currentMonthEvents.filter((event) => event.type === 'payment').length,
    [currentMonthEvents],
  );

  const nextDueDate = upcomingEvents.find((event) => event.type === 'due_date')?.date ?? null;
  const nextPromoDate = upcomingEvents.find((event) => event.type === 'promo_end')?.date ?? null;

  if (openAccounts.length === 0 && payments.length === 0) {
    return (
      <section className="calendar-screen">
        <header className="calendar-screen__hero">
          <div>
            <h1>Calendar</h1>
            <p>
              This timing surface becomes useful once due dates, promo deadlines, or payment events exist in the canonical model.
            </p>
          </div>
        </header>

        <EmptyState
          title="No timing data to show yet"
          description="Add your first card or payment so the app can surface due dates, promo expirations, and recorded payment events in one place."
          action={
            <div className="calendar-screen__empty-actions">
              <Button variant="secondary" onClick={() => addPayment()}>
                Add payment
              </Button>
              <Button variant="primary" onClick={() => addCard({ destination: 'cards' })}>
                Add first card
              </Button>
            </div>
          }
        />
      </section>
    );
  }

  return (
    <section className="calendar-screen">
      <header className="calendar-screen__hero">
        <div>
          <h1>Calendar</h1>
          <p>
            This is the timing-awareness surface: review upcoming due dates, promo expirations, and payment events without turning the app into a generic scheduling tool.
          </p>
        </div>
        <div className="calendar-screen__hero-actions">
          <Button variant="secondary" onClick={() => addPayment()}>
            Add payment
          </Button>
          <Button variant="primary" onClick={() => addCard({ destination: 'cards' })}>
            Add card
          </Button>
        </div>
      </header>

      <div className="calendar-screen__layout">
        <CalendarOverviewPanel
          dueSoonCount={dueSoonCount}
          promoEndingSoonCount={promoEndingSoonCount}
          paymentCountThisMonth={paymentCountThisMonth}
          nextDueDate={nextDueDate}
          nextPromoDate={nextPromoDate}
          onAddPayment={() => addPayment()}
          onEditPlan={() => editPlan({ destination: 'paymentPlan' })}
        />

        <div className="calendar-screen__detail-grid">
          <CalendarTimelinePanel
            title="Current month agenda"
            description="This month only, so you can confirm what has happened and what still lands before the month closes."
            events={currentMonthEvents}
            onInspectAccount={(accountId) => inspectAccount(accountId, { destination: 'cards' })}
            onEditPayment={(paymentId) => editPayment(paymentId)}
          />

          <CalendarTimelinePanel
            title="Upcoming 60 days"
            description="Forward-looking timing list for the next debt dates that need attention."
            events={upcomingEvents}
            onInspectAccount={(accountId) => inspectAccount(accountId, { destination: 'cards' })}
            onEditPayment={(paymentId) => editPayment(paymentId)}
          />
        </div>
      </div>
    </section>
  );
}
