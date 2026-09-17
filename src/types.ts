/**
 * Types and interfaces for Gestione Straordinari e Presenze
 */

export interface DayRecord {
  /** Date formatted as YYYY-MM-DD */
  date: string;
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  dayOfWeek: string; // "Lunedì", "Martedì", ...
  
  /** Overtime hours (can be empty/undefined or positive number) */
  overtimeHours?: number | null;
  
  /** Vacation (true = SI, false/undefined = empty) */
  ferie?: boolean;
  
  /** Sick leave (true = SI, false/undefined = empty) */
  malattia?: boolean;
  
  /** Other leave (true = SI, false/undefined = empty) */
  altriPermessi?: boolean;
  
  /** Worked holiday (true = SI, false/undefined = empty) */
  festivoLavorato?: boolean;
  
  /** Permit hours (can be empty/undefined or positive number) */
  permitHours?: number | null;
  
  /** Holiday description if recognized Italian holiday */
  holidayName?: string;
  isHoliday?: boolean;
  isSunday?: boolean;
  
  /** Optional notes */
  notes?: string;
  
  /** Timestamp of last edit */
  updatedAt: number;
}

export interface MonthSummary {
  month: number; // 1-12
  monthName: string;
  overtimeHours: number;
  festiviLavorati: number;
  ferieDays: number;
  permitHours: number;
  malattiaDays: number;
  altriPermessiDays: number;
}

export interface YearSummary {
  year: number;
  totalOvertimeHours: number;
  overtimeLimit: number; // 150
  hoursRemainingTo150: number;
  hoursExceeded150: number;
  limitReached: boolean;
  totalFestiviLavorati: number;
  totalFerieDays: number;
  totalPermitHours: number;
  totalMalattiaDays: number;
  totalAltriPermessiDays: number;
  monthlyBreakdown: MonthSummary[];
}

export interface HolidayDefinition {
  date: string; // YYYY-MM-DD
  name: string;
  isPatronSaint?: boolean;
}

export interface AppBackup {
  version: string;
  appName: string;
  exportDate: string;
  records: Record<string, DayRecord>;
}

export type ActiveTab = 'controllo' | 'riepilogo' | 'calendario' | 'home' | 'impostazioni';
