const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
});

const DATE_WITH_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
});

const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

export function formatCalendarDate(date: string) {
  return DATE_FORMATTER.format(new Date(`${date}T00:00:00`));
}

export function formatCalendarDateWithWeekday(date: string) {
  return DATE_WITH_WEEKDAY_FORMATTER.format(new Date(`${date}T00:00:00`));
}

export function formatCalendarMonthLabel(date: string) {
  return MONTH_FORMATTER.format(new Date(`${date}T00:00:00`));
}

export function formatRelativeDaysFrom(date: string, asOfDate?: string | Date) {
  const base = asOfDate ? new Date(asOfDate) : new Date();
  const target = new Date(`${date}T00:00:00`);
  const baseDay = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diffMs = targetDay.getTime() - baseDay.getTime();
  const diffDays = Math.round(diffMs / 86400000);

  if (diffDays === 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return 'Tomorrow';
  }

  if (diffDays === -1) {
    return 'Yesterday';
  }

  if (diffDays > 1) {
    return `In ${diffDays} days`;
  }

  return `${Math.abs(diffDays)} days ago`;
}

export function formatEventTypeLabel(type: 'due_date' | 'promo_end' | 'payment') {
  switch (type) {
    case 'due_date':
      return 'Due date';
    case 'promo_end':
      return 'Promo ending';
    case 'payment':
      return 'Payment';
    default:
      return 'Event';
  }
}
