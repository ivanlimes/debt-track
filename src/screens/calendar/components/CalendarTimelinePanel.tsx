import { Button } from '../../../components/primitives/Button';
import { Badge } from '../../../components/primitives/Badge';
import { EmptyState } from '../../../components/primitives/EmptyState';
import { Panel } from '../../../components/primitives/Panel';
import { CalendarEvent } from '../../../state/selectors/calendar.selectors';
import {
  formatCalendarDateWithWeekday,
  formatCalendarMonthLabel,
  formatEventTypeLabel,
  formatRelativeDaysFrom,
} from '../calendar.formatters';

type CalendarTimelinePanelProps = {
  title: string;
  description: string;
  events: CalendarEvent[];
  onInspectAccount: (accountId: string) => void;
  onEditPayment: (paymentId: string) => void;
};

function getEventTone(type: CalendarEvent['type']) {
  switch (type) {
    case 'due_date':
      return 'warning';
    case 'promo_end':
      return 'danger';
    case 'payment':
      return 'success';
    default:
      return 'neutral';
  }
}

export function CalendarTimelinePanel({
  title,
  description,
  events,
  onInspectAccount,
  onEditPayment,
}: CalendarTimelinePanelProps) {
  const groups = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const monthKey = event.date.slice(0, 7);
    const bucket = groups.get(monthKey) ?? [];
    bucket.push(event);
    groups.set(monthKey, bucket);
  }

  return (
    <Panel className="calendar-timeline-panel" title={title} description={description}>
      {events.length === 0 ? (
        <EmptyState
          title="No timing items in this window"
          description="This section fills in when due dates, promo deadlines, or payment records fall into the selected time range."
        />
      ) : (
        <div className="calendar-timeline-groups">
          {Array.from(groups.entries()).map(([monthKey, monthEvents]) => (
            <section key={monthKey} className="calendar-timeline-group">
              <header className="calendar-timeline-group__header">
                <h3>{formatCalendarMonthLabel(`${monthKey}-01`)}</h3>
                <span>{monthEvents.length} item{monthEvents.length === 1 ? '' : 's'}</span>
              </header>

              <div className="calendar-event-list">
                {monthEvents.map((event) => (
                  <article key={`${event.type}-${event.id}-${event.date}`} className="calendar-event-item">
                    <div className="calendar-event-item__date">
                      <strong>{formatCalendarDateWithWeekday(event.date)}</strong>
                      <span>{formatRelativeDaysFrom(event.date)}</span>
                    </div>

                    <div className="calendar-event-item__copy">
                      <div className="calendar-event-item__title-row">
                        <Badge tone={getEventTone(event.type)}>{formatEventTypeLabel(event.type)}</Badge>
                        <strong>{event.accountName}</strong>
                      </div>
                      <p>{event.label}</p>
                    </div>

                    <div className="calendar-event-item__actions">
                      {event.type === 'payment' ? (
                        <Button variant="ghost" size="sm" onClick={() => onEditPayment(event.id)}>
                          Edit payment
                        </Button>
                      ) : null}
                      <Button variant="secondary" size="sm" onClick={() => onInspectAccount(event.accountId)}>
                        Inspect card
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Panel>
  );
}
