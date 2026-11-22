export type HcmDate = { year: number; month: number; day: number };
export type CalendarDuration = { years: number; months: number; days: number; totalDays: number; future: boolean };

export function getHcmDate(now = new Date()): HcmDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: 'year' | 'month' | 'day') => Number(parts.find((part) => part.type === type)?.value);
  return { year: value('year'), month: value('month'), day: value('day') };
}

export function parseDateOnly(value: string): HcmDate {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) throw new Error(`Ngày không hợp lệ: ${value}`);
  return { year, month, day };
}

export function calendarDuration(startValue: string, end: HcmDate): CalendarDuration {
  const start = parseDateOnly(startValue);
  const totalDays = Math.floor((toUtcDay(end) - toUtcDay(start)) / 86_400_000);
  if (totalDays < 0) return { years: 0, months: 0, days: 0, totalDays: 0, future: true };

  let years = end.year - start.year;
  let months = end.month - start.month;
  let days = end.day - start.day;
  if (days < 0) {
    days += new Date(Date.UTC(end.year, end.month - 1, 0)).getUTCDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days, totalDays, future: false };
}

export function formatDateOnly(value: string): string {
  const date = parseDateOnly(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(date.year, date.month - 1, date.day)));
}

function toUtcDay(date: HcmDate) {
  return Date.UTC(date.year, date.month - 1, date.day);
}
