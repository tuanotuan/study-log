export function parseStudyDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || formatDateInput(date) !== value) {
    return null;
  }

  const today = startOfUtcDay(new Date());

  if (date > today) {
    return null;
  }

  return date;
}

export function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addUtcDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function dateKey(date: Date) {
  return formatDateInput(startOfUtcDay(date));
}

export function formatHumanDate(date: Date, locale = "vi-VN") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}
