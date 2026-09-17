import { AppBackup, DayRecord } from '../types';
import { getHolidayInfo, getItalianWeekday, isSunday, padZero } from './holidays';

const STORAGE_KEY = 'irpiniambiente_presenze_v1';

/**
 * Loads all records from LocalStorage
 */
export function loadAllRecords(): Record<string, DayRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, DayRecord>;
    }
    return {};
  } catch (err) {
    console.error('Errore nel caricamento dei dati da LocalStorage:', err);
    return {};
  }
}

/**
 * Persists all records to LocalStorage
 */
export function persistRecords(records: Record<string, DayRecord>): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch (err) {
    console.error('Errore nel salvataggio dei dati in LocalStorage:', err);
    return false;
  }
}

/**
 * Gets a single day's record or initializes a clean one
 */
export function getOrCreateDayRecord(dateStr: string, records: Record<string, DayRecord>): DayRecord {
  if (records[dateStr]) {
    return { ...records[dateStr] };
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const holiday = getHolidayInfo(dateStr);
  const sunday = isSunday(dateStr);

  return {
    date: dateStr,
    year,
    month,
    day,
    dayOfWeek: getItalianWeekday(dateStr),
    overtimeHours: null,
    ferie: false,
    malattia: false,
    altriPermessi: false,
    festivoLavorato: false,
    permitHours: null,
    holidayName: holiday?.name,
    isHoliday: !!holiday,
    isSunday: sunday,
    updatedAt: Date.now(),
  };
}

/**
 * Checks if a day record is essentially empty (no hours and no active statuses)
 */
export function isRecordEmpty(rec: DayRecord): boolean {
  const hasOvertime = typeof rec.overtimeHours === 'number' && rec.overtimeHours > 0;
  const hasPermit = typeof rec.permitHours === 'number' && rec.permitHours > 0;
  const hasStatuses = rec.ferie || rec.malattia || rec.altriPermessi || rec.festivoLavorato;
  return !hasOvertime && !hasPermit && !hasStatuses;
}

/**
 * Validates numeric hours input (must be non-negative, finite number or null/empty)
 */
export function validateHoursInput(input: string | number | null | undefined): {
  valid: boolean;
  value: number | null;
  error?: string;
} {
  if (input === '' || input === null || input === undefined) {
    return { valid: true, value: null };
  }

  const normalized = typeof input === 'string' ? input.trim().replace(',', '.') : String(input);
  if (normalized === '') {
    return { valid: true, value: null };
  }

  const num = parseFloat(normalized);
  if (isNaN(num)) {
    return { valid: false, value: null, error: 'Inserisci un valore numerico valido (es: 1,5 o 2)' };
  }

  if (num < 0) {
    return { valid: false, value: null, error: 'Le ore non possono essere negative' };
  }

  if (num > 24) {
    return { valid: false, value: null, error: 'Le ore giornaliere non possono superare 24' };
  }

  return { valid: true, value: Math.round(num * 100) / 100 };
}

/**
 * Generates and triggers download of JSON backup file (Most compatible format for this application)
 */
export function downloadBackupJSON(records: Record<string, DayRecord>): void {
  const backup: AppBackup = {
    version: '1.0.0',
    appName: 'Irpiniambiente - Straordinari e Presenze',
    exportDate: new Date().toISOString(),
    records,
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const timestamp = `${now.getFullYear()}${padZero(now.getMonth() + 1)}${padZero(now.getDate())}_${padZero(now.getHours())}${padZero(now.getMinutes())}`;
  a.href = url;
  a.download = `irpiniambiente_backup_dati_${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and triggers download of an Excel-compatible CSV file with all records
 */
export function downloadAllRecordsCSV(records: Record<string, DayRecord>): void {
  const headers = [
    'Data (AAAA-MM-GG)',
    'Anno',
    'Mese',
    'Giorno',
    'Giorno Settimana',
    'Ore Straordinario',
    'Ferie (SI/NO)',
    'Malattia (SI/NO)',
    'Altri Permessi (SI/NO)',
    'Festivo Lavorato (SI/NO)',
    'Ore Permesso',
    'Festivita',
    'Note',
  ];

  const sortedDates = Object.keys(records).sort();
  const rows: string[] = [headers.join(';')];

  for (const d of sortedDates) {
    const r = records[d];
    if (!r) continue;

    const escapeCSV = (val: string | number | boolean | null | undefined): string => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(';') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
    };

    const row = [
      escapeCSV(r.date),
      escapeCSV(r.year),
      escapeCSV(r.month),
      escapeCSV(r.day),
      escapeCSV(r.dayOfWeek),
      r.overtimeHours !== null && r.overtimeHours !== undefined ? String(r.overtimeHours).replace('.', ',') : '',
      r.ferie ? 'SI' : 'NO',
      r.malattia ? 'SI' : 'NO',
      r.altriPermessi ? 'SI' : 'NO',
      r.festivoLavorato ? 'SI' : 'NO',
      r.permitHours !== null && r.permitHours !== undefined ? String(r.permitHours).replace('.', ',') : '',
      escapeCSV(r.holidayName || ''),
      escapeCSV(r.notes || ''),
    ];

    rows.push(row.join(';'));
  }

  // Add UTF-8 BOM for direct compatibility with Microsoft Excel in Italian
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const timestamp = `${now.getFullYear()}${padZero(now.getMonth() + 1)}${padZero(now.getDate())}`;
  a.href = url;
  a.download = `irpiniambiente_dati_presenze_${timestamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  records: Record<string, DayRecord>;
  sourceType: 'json' | 'csv';
  summary: {
    totalDays: number;
    totalOvertimeHours: number;
    startDate: string;
    endDate: string;
  };
}

/**
 * Universal file parser: detects JSON or CSV, parses and returns normalized records with metadata
 */
export async function parseImportFile(file: File): Promise<ImportResult> {
  const text = await file.text();
  const trimmed = text.trim();

  // 1. Check if JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const candidateRecords = parsed.records || parsed;

      if (!candidateRecords || typeof candidateRecords !== 'object') {
        throw new Error('Nessun record trovato nel file JSON.');
      }

      const cleanRecords: Record<string, DayRecord> = {};
      let totalOvertime = 0;

      // Object format: { "2026-09-17": { ... } }
      if (!Array.isArray(candidateRecords)) {
        for (const [key, val] of Object.entries(candidateRecords)) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(key) && val && typeof val === 'object') {
            const r = val as DayRecord;
            cleanRecords[key] = {
              ...getOrCreateDayRecord(key, {}),
              ...r,
              date: key,
            };
            if (typeof r.overtimeHours === 'number' && !isNaN(r.overtimeHours)) {
              totalOvertime += r.overtimeHours;
            }
          }
        }
      } else {
        // Array format: [ { date: "2026-09-17", ... } ]
        for (const item of candidateRecords) {
          if (item && typeof item === 'object' && item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
            const key = item.date;
            cleanRecords[key] = {
              ...getOrCreateDayRecord(key, {}),
              ...item,
            };
            if (typeof item.overtimeHours === 'number' && !isNaN(item.overtimeHours)) {
              totalOvertime += item.overtimeHours;
            }
          }
        }
      }

      const dates = Object.keys(cleanRecords).sort();
      if (dates.length === 0) {
        throw new Error('Il file JSON non contiene date nel formato valido AAAA-MM-GG.');
      }

      return {
        records: cleanRecords,
        sourceType: 'json',
        summary: {
          totalDays: dates.length,
          totalOvertimeHours: Math.round(totalOvertime * 100) / 100,
          startDate: dates[0],
          endDate: dates[dates.length - 1],
        },
      };
    } catch (err) {
      if (err instanceof Error && !err.message.includes('JSON')) {
        throw err;
      }
      // If JSON parsing failed, try CSV fallback
    }
  }

  // 2. Parse as CSV
  try {
    const lines = trimmed.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (lines.length < 2) {
      throw new Error('Il file CSV è vuoto o non contiene righe di dati.');
    }

    // Determine separator: check first line for ; or ,
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';

    const cleanRecords: Record<string, DayRecord> = {};
    let totalOvertime = 0;

    // Helper to parse line handling quotes
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === separator && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const header = parseCSVLine(lines[0]).map((h) => h.toLowerCase());
    const dateColIdx = header.findIndex((h) => h.includes('data') || h.includes('date'));
    const overtimeColIdx = header.findIndex((h) => h.includes('straordinari') || h.includes('overtime'));
    const ferieColIdx = header.findIndex((h) => h.includes('ferie'));
    const malattiaColIdx = header.findIndex((h) => h.includes('malattia'));
    const permessiColIdx = header.findIndex((h) => h.includes('altri permessi') || h.includes('permessi'));
    const festivoColIdx = header.findIndex((h) => h.includes('festivo'));
    const orePermessoColIdx = header.findIndex((h) => h.includes('ore permesso') || h.includes('permit'));
    const noteColIdx = header.findIndex((h) => h.includes('note') || h.includes('notes'));

    const isTruthy = (val: string): boolean => {
      const v = val.trim().toLowerCase();
      return v === 'si' || v === 'sì' || v === 'true' || v === '1' || v === 'yes';
    };

    for (let i = 1; i < lines.length; i++) {
      const lineStr = lines[i].trim();
      if (!lineStr) continue;

      const cols = parseCSVLine(lineStr);
      let dateVal = dateColIdx >= 0 && cols[dateColIdx] ? cols[dateColIdx] : cols[0];
      if (!dateVal) continue;

      // Normalize date if written as DD/MM/YYYY
      if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(dateVal)) {
        const [d, m, y] = dateVal.split(/[/-]/);
        dateVal = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
        continue;
      }

      const rec = getOrCreateDayRecord(dateVal, {});

      // Parse overtime hours
      if (overtimeColIdx >= 0 && cols[overtimeColIdx]) {
        const parsedHours = validateHoursInput(cols[overtimeColIdx]);
        if (parsedHours.valid && parsedHours.value !== null) {
          rec.overtimeHours = parsedHours.value;
          totalOvertime += parsedHours.value;
        }
      }

      // Parse statuses
      if (ferieColIdx >= 0 && cols[ferieColIdx]) {
        rec.ferie = isTruthy(cols[ferieColIdx]);
      }
      if (malattiaColIdx >= 0 && cols[malattiaColIdx]) {
        rec.malattia = isTruthy(cols[malattiaColIdx]);
      }
      if (permessiColIdx >= 0 && cols[permessiColIdx]) {
        rec.altriPermessi = isTruthy(cols[permessiColIdx]);
      }
      if (festivoColIdx >= 0 && cols[festivoColIdx]) {
        rec.festivoLavorato = isTruthy(cols[festivoColIdx]);
      }
      if (orePermessoColIdx >= 0 && cols[orePermessoColIdx]) {
        const parsedPermit = validateHoursInput(cols[orePermessoColIdx]);
        if (parsedPermit.valid && parsedPermit.value !== null) {
          rec.permitHours = parsedPermit.value;
        }
      }
      if (noteColIdx >= 0 && cols[noteColIdx]) {
        rec.notes = cols[noteColIdx];
      }

      rec.updatedAt = Date.now();
      cleanRecords[dateVal] = rec;
    }

    const dates = Object.keys(cleanRecords).sort();
    if (dates.length === 0) {
      throw new Error('Nessuna data valida trovata nel file CSV.');
    }

    return {
      records: cleanRecords,
      sourceType: 'csv',
      summary: {
        totalDays: dates.length,
        totalOvertimeHours: Math.round(totalOvertime * 100) / 100,
        startDate: dates[0],
        endDate: dates[dates.length - 1],
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Impossibile leggere il file';
    throw new Error(`Errore durante l'importazione: ${msg}`);
  }
}

/**
 * Merges incoming records with current records, keeping existing data and updating only matching dates
 */
export function mergeRecords(
  current: Record<string, DayRecord>,
  incoming: Record<string, DayRecord>
): Record<string, DayRecord> {
  return {
    ...current,
    ...incoming,
  };
}

/**
 * Backward-compatible wrapper
 */
export async function readBackupFile(file: File): Promise<Record<string, DayRecord>> {
  const res = await parseImportFile(file);
  return res.records;
}

