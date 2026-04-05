export function formatCardsDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatCardsStatus(daysUntilDue: number, isOverdue: boolean) {
  if (isOverdue) {
    return "Overdue";
  }

  if (daysUntilDue <= 2) {
    return "Due very soon";
  }

  if (daysUntilDue <= 7) {
    return "Due soon";
  }

  return "Current";
}
