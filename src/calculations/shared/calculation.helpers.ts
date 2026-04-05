import { CreditCardAccount } from "../../domain/accounts/account.types";

export function roundCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toDate(value: Date | string | undefined | null) {
  if (!value) {
    return new Date();
  }

  const date = value instanceof Date ? new Date(value) : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function toStartOfDay(value: Date | string | undefined | null) {
  const date = toDate(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function toIsoDate(value: Date | string) {
  return toStartOfDay(value).toISOString().slice(0, 10);
}

export function lastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function clampDayOfMonth(year: number, monthIndex: number, day: number) {
  return Math.min(Math.max(day, 1), lastDayOfMonth(year, monthIndex));
}

export function createDateForDay(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, clampDayOfMonth(year, monthIndex, day));
}

export function addMonths(value: Date | string, count: number) {
  const date = toStartOfDay(value);
  return createDateForDay(date.getFullYear(), date.getMonth() + count, date.getDate());
}

export function addDays(value: Date | string, count: number) {
  const date = toStartOfDay(value);
  date.setDate(date.getDate() + count);
  return date;
}

export function diffInCalendarDays(later: Date | string, earlier: Date | string) {
  const laterDate = toStartOfDay(later).getTime();
  const earlierDate = toStartOfDay(earlier).getTime();
  return Math.round((laterDate - earlierDate) / 86_400_000);
}

export function startOfMonth(value: Date | string) {
  const date = toStartOfDay(value);
  date.setDate(1);
  return date;
}

export function endOfMonth(value: Date | string) {
  const date = startOfMonth(value);
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return toStartOfDay(date);
}

export function isSameMonth(dateValue: Date | string, comparisonValue: Date | string) {
  const date = toStartOfDay(dateValue);
  const comparison = toStartOfDay(comparisonValue);
  return (
    date.getFullYear() === comparison.getFullYear()
    && date.getMonth() === comparison.getMonth()
  );
}

export function getOpenAccounts(accounts: CreditCardAccount[]) {
  return accounts.filter((account) => !account.isClosed && account.currentBalance > 0);
}

export function sortAccountsByStableName(accounts: CreditCardAccount[]) {
  return [...accounts].sort((left, right) => {
    if (left.name !== right.name) {
      return left.name.localeCompare(right.name);
    }

    return left.id.localeCompare(right.id);
  });
}
