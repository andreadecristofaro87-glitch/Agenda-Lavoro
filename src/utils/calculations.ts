import { DayRecord, MonthSummary, YearSummary } from '../types';
import { ITALIAN_MONTHS, getDaysInMonth, padZero } from './holidays';

export const OVERTIME_LIMIT = 150;

/**
 * Calculates month summary for a given year and month (1-12)
 */
export function calculateMonthSummary(
  year: number,
  month: number,
  records: Record<string, DayRecord>
): MonthSummary {
  let overtimeHours = 0;
  let festiviLavorati = 0;
  let ferieDays = 0;
  let permitHours = 0;
  let malattiaDays = 0;
  let altriPermessiDays = 0;

  const daysCount = getDaysInMonth(year, month);

  for (let d = 1; d <= daysCount; d++) {
    const key = `${year}-${padZero(month)}-${padZero(d)}`;
    const rec = records[key];
    if (rec) {
      if (typeof rec.overtimeHours === 'number' && !isNaN(rec.overtimeHours)) {
        overtimeHours += rec.overtimeHours;
      }
      if (typeof rec.permitHours === 'number' && !isNaN(rec.permitHours)) {
        permitHours += rec.permitHours;
      }
      if (rec.festivoLavorato === true) {
        festiviLavorati += 1;
      }
      if (rec.ferie === true) {
        ferieDays += 1;
      }
      if (rec.malattia === true) {
        malattiaDays += 1;
      }
      if (rec.altriPermessi === true) {
        altriPermessiDays += 1;
      }
    }
  }

  return {
    month,
    monthName: ITALIAN_MONTHS[month - 1],
    overtimeHours: round2(overtimeHours),
    festiviLavorati,
    ferieDays,
    permitHours: round2(permitHours),
    malattiaDays,
    altriPermessiDays,
  };
}

/**
 * Calculates complete annual summary for the specified year.
 * Years are completely independent (150-hour count restarts every Jan 1st).
 */
export function calculateYearSummary(
  year: number,
  records: Record<string, DayRecord>
): YearSummary {
  const monthlyBreakdown: MonthSummary[] = [];

  let totalOvertimeHours = 0;
  let totalFestiviLavorati = 0;
  let totalFerieDays = 0;
  let totalPermitHours = 0;
  let totalMalattiaDays = 0;
  let totalAltriPermessiDays = 0;

  for (let m = 1; m <= 12; m++) {
    const monthSum = calculateMonthSummary(year, m, records);
    monthlyBreakdown.push(monthSum);

    totalOvertimeHours += monthSum.overtimeHours;
    totalFestiviLavorati += monthSum.festiviLavorati;
    totalFerieDays += monthSum.ferieDays;
    totalPermitHours += monthSum.permitHours;
    totalMalattiaDays += monthSum.malattiaDays;
    totalAltriPermessiDays += monthSum.altriPermessiDays;
  }

  totalOvertimeHours = round2(totalOvertimeHours);
  totalPermitHours = round2(totalPermitHours);

  const hoursRemainingTo150 = Math.max(0, round2(OVERTIME_LIMIT - totalOvertimeHours));
  const hoursExceeded150 = Math.max(0, round2(totalOvertimeHours - OVERTIME_LIMIT));
  const limitReached = totalOvertimeHours >= OVERTIME_LIMIT;

  return {
    year,
    totalOvertimeHours,
    overtimeLimit: OVERTIME_LIMIT,
    hoursRemainingTo150,
    hoursExceeded150,
    limitReached,
    totalFestiviLavorati,
    totalFerieDays,
    totalPermitHours,
    totalMalattiaDays,
    totalAltriPermessiDays,
    monthlyBreakdown,
  };
}

/**
 * Helper to round to 2 decimal places cleanly (e.g. 1.5, 2)
 */
export function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Formats a number with comma decimal separator if present in Italian style (e.g. "163,5")
 * or returns empty string if value is null/undefined/0 (when requested to be empty)
 */
export function formatHours(val: number | null | undefined, allowZero = false): string {
  if (val === null || val === undefined || isNaN(val)) return '';
  if (val === 0 && !allowZero) return '';
  return val.toString().replace('.', ',');
}

/**
 * Formats count for days (returns empty string if 0, according to requirements 17 & 18)
 */
export function formatCount(count: number | null | undefined): string {
  if (count === null || count === undefined || count === 0) return '';
  return `${count}`;
}

/**
 * Helper to get calendar cell string for boolean fields: "SI" or ""
 */
export function formatSiOrEmpty(val: boolean | undefined | null): string {
  return val === true ? 'SI' : '';
}
