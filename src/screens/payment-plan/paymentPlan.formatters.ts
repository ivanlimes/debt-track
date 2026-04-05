export function formatPaymentPlanDate(value: string | null) {
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

export function formatPaymentPlanMonth(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(date);
}

export function formatMonthsRemaining(value: number | null) {
  if (value === null) {
    return "—";
  }

  if (value === 0) {
    return "Paid off";
  }

  return `${value} month${value === 1 ? "" : "s"}`;
}
