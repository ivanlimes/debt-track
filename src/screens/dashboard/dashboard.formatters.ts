export function formatDashboardDate(value: string | null) {
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

export function formatDashboardMonth(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function formatDurationMonths(months: number | null) {
  if (months === null) {
    return "—";
  }

  if (months === 0) {
    return "Paid off";
  }

  return `${months} month${months === 1 ? "" : "s"}`;
}
