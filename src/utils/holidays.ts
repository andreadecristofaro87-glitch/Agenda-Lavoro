import { HolidayDefinition } from '../types';

export const ITALIAN_MONTHS = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
];

export const ITALIAN_WEEKDAYS = [
  'Domenica',
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
];

/**
 * Calculates Easter Sunday for any Gregorian year using Meeus/Jones/Butcher algorithm
 */
export function calculateEaster(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/**
 * Calculates Easter Monday (Pasquetta / Lunedì dell'Angelo)
 */
export function calculateEasterMonday(year: number): { month: number; day: number } {
  const easter = calculateEaster(year);
  // Add 1 day
  const easterDate = new Date(year, easter.month - 1, easter.day);
  easterDate.setDate(easterDate.getDate() + 1);
  return {
    month: easterDate.getMonth() + 1,
    day: easterDate.getDate(),
  };
}

/**
 * Formats a date component as 2 digits
 */
export function padZero(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Generates all Italian national holidays and Avellino patron saint (San Modestino, Feb 14) for a given year
 */
export function getHolidaysForYear(year: number): Map<string, HolidayDefinition> {
  const holidayMap = new Map<string, HolidayDefinition>();

  const addHoliday = (month: number, day: number, name: string, isPatron = false) => {
    const key = `${year}-${padZero(month)}-${padZero(day)}`;
    holidayMap.set(key, {
      date: key,
      name,
      isPatronSaint: isPatron,
    });
  };

  // Fixed Italian Holidays
  addHoliday(1, 1, 'Capodanno');
  addHoliday(1, 6, 'Epifania');
  
  // Festa Patronale di Avellino (San Modestino)
  addHoliday(2, 14, 'San Modestino - Patrono di Avellino', true);

  // Easter & Easter Monday
  const easter = calculateEaster(year);
  addHoliday(easter.month, easter.day, 'Pasqua');

  const pasquetta = calculateEasterMonday(year);
  addHoliday(pasquetta.month, pasquetta.day, "Lunedì dell'Angelo (Pasquetta)");

  addHoliday(4, 25, 'Festa della Liberazione');
  addHoliday(5, 1, 'Festa dei Lavoratori');
  addHoliday(6, 2, 'Festa della Repubblica');
  addHoliday(8, 15, 'Ferragosto (Assunzione di Maria)');
  addHoliday(11, 1, 'Ognissanti');
  addHoliday(12, 8, 'Immacolata Concezione');
  addHoliday(12, 25, 'Natale');
  addHoliday(12, 26, 'Santo Stefano');

  return holidayMap;
}

/**
 * Get weekday name in Italian without abbreviations (Lunedì, Martedì...)
 */
export function getItalianWeekday(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return ITALIAN_WEEKDAYS[dateObj.getDay()];
}

/**
 * Checks if a date string is Sunday
 */
export function isSunday(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getDay() === 0;
}

/**
 * Get Holiday info if the given date is a holiday
 */
export function getHolidayInfo(dateStr: string): HolidayDefinition | undefined {
  const [year] = dateStr.split('-').map(Number);
  const holidays = getHolidaysForYear(year);
  return holidays.get(dateStr);
}

/**
 * Formats date to standard display in Italian, e.g. "17 settembre 2026"
 */
export function formatItalianDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const monthName = ITALIAN_MONTHS[month - 1].toLowerCase();
  return `${day} ${monthName} ${year}`;
}

/**
 * Formats date to standard short format, e.g. "17/09/2026"
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${padZero(day)}/${padZero(month)}/${year}`;
}

/**
 * Get current system date in YYYY-MM-DD
 */
export function getTodayDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${padZero(now.getMonth() + 1)}-${padZero(now.getDate())}`;
}

/**
 * Returns number of days in a specific month of a year
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
