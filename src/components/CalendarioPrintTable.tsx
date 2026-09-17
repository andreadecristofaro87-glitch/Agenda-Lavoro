import React from 'react';
import { DayRecord } from '../types';
import { calculateMonthSummary, formatHours, formatSiOrEmpty } from '../utils/calculations';
import {
  ITALIAN_MONTHS,
  formatItalianDate,
  formatShortDate,
  getDaysInMonth,
  getHolidayInfo,
  getItalianWeekday,
  isSunday,
  padZero,
} from '../utils/holidays';

interface CalendarioPrintTableProps {
  currentYear: number;
  currentMonth: number;
  records: Record<string, DayRecord>;
}

export const CalendarioPrintTable: React.FC<CalendarioPrintTableProps> = ({
  currentYear,
  currentMonth,
  records,
}) => {
  const monthName = ITALIAN_MONTHS[currentMonth - 1];
  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const summary = calculateMonthSummary(currentYear, currentMonth, records);

  return (
    <div className="hidden print:block a4-page-container font-sans text-gray-900 bg-white">
      {/* Header Banner - strictly sized for A4 */}
      <div className="border-b-2 border-emerald-600 pb-2 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Logo Tree icon */}
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
            IA
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-gray-900 leading-none">
              IRPINIAMBIENTE S.p.A.
            </h1>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">
              Prospetto Mensile Presenze, Straordinari e Assenze
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-black text-emerald-800 leading-none">
            {monthName.toUpperCase()} {currentYear}
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">
            Stampa: {new Date().toLocaleDateString('it-IT')}
          </div>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-6 gap-1.5 mb-2 text-center text-[9.5px]">
        <div className="bg-emerald-50 border border-emerald-300 rounded p-1">
          <span className="block text-[8px] font-bold text-emerald-900 uppercase">Straordinari</span>
          <span className="font-black text-emerald-800 text-xs">
            {formatHours(summary.overtimeHours) || '0'} h
          </span>
        </div>
        <div className="bg-amber-50 border border-amber-300 rounded p-1">
          <span className="block text-[8px] font-bold text-amber-900 uppercase">Festivi Lav.</span>
          <span className="font-black text-amber-800 text-xs">{summary.festiviLavorati || '0'} gg</span>
        </div>
        <div className="bg-teal-50 border border-teal-300 rounded p-1">
          <span className="block text-[8px] font-bold text-teal-900 uppercase">Ferie</span>
          <span className="font-black text-teal-800 text-xs">{summary.ferieDays || '0'} gg</span>
        </div>
        <div className="bg-indigo-50 border border-indigo-300 rounded p-1">
          <span className="block text-[8px] font-bold text-indigo-900 uppercase">Ore Permesso</span>
          <span className="font-black text-indigo-800 text-xs">
            {formatHours(summary.permitHours) || '0'} h
          </span>
        </div>
        <div className="bg-rose-50 border border-rose-300 rounded p-1">
          <span className="block text-[8px] font-bold text-rose-900 uppercase">Malattia</span>
          <span className="font-black text-rose-800 text-xs">{summary.malattiaDays || '0'} gg</span>
        </div>
        <div className="bg-purple-50 border border-purple-300 rounded p-1">
          <span className="block text-[8px] font-bold text-purple-900 uppercase">Altri Perm.</span>
          <span className="font-black text-purple-800 text-xs">{summary.altriPermessiDays || '0'} gg</span>
        </div>
      </div>

      {/* 31-Day Compact A4 Table */}
      <table className="w-full border-collapse border border-gray-300 text-[8.5px] leading-tight">
        <thead>
          <tr className="bg-emerald-700 text-white font-black text-center text-[8.5px]">
            <th className="border border-gray-300 py-1 px-1 w-12">Data</th>
            <th className="border border-gray-300 py-1 px-1.5 w-16 text-left">Giorno</th>
            <th className="border border-gray-300 py-1 px-1 w-14">Straord.</th>
            <th className="border border-gray-300 py-1 px-1 w-14">Fest. Lav.</th>
            <th className="border border-gray-300 py-1 px-1 w-12">Ferie</th>
            <th className="border border-gray-300 py-1 px-1 w-14">Ore Perm.</th>
            <th className="border border-gray-300 py-1 px-1 w-12">Malattia</th>
            <th className="border border-gray-300 py-1 px-1 w-14">Altri Perm.</th>
            <th className="border border-gray-300 py-1 px-1.5 text-left">Note / Festività</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: daysCount }, (_, i) => {
            const d = i + 1;
            const dateStr = `${currentYear}-${padZero(currentMonth)}-${padZero(d)}`;
            const rec = records[dateStr];
            const weekday = getItalianWeekday(dateStr);
            const holiday = getHolidayInfo(dateStr);
            const sunday = isSunday(dateStr);

            const isRedDay = sunday || !!holiday;
            const hasOvertime = typeof rec?.overtimeHours === 'number' && rec.overtimeHours > 0;
            const hasPermit = typeof rec?.permitHours === 'number' && rec.permitHours > 0;
            const isFerie = rec?.ferie === true;
            const isMalattia = rec?.malattia === true;
            const isAltriPermessi = rec?.altriPermessi === true;
            const isFestivoLavorato = rec?.festivoLavorato === true;

            let rowBg = 'bg-white';
            if (isRedDay) rowBg = 'bg-red-50/50';
            else if (isFerie) rowBg = 'bg-teal-50/40';
            else if (isFestivoLavorato) rowBg = 'bg-amber-50/40';

            return (
              <tr key={dateStr} className={`${rowBg} border-b border-gray-200`}>
                <td
                  className={`border-r border-gray-200 py-[2px] px-1 text-center font-bold ${
                    isRedDay ? 'text-red-700' : 'text-gray-800'
                  }`}
                >
                  {formatShortDate(dateStr)}
                </td>
                <td
                  className={`border-r border-gray-200 py-[2px] px-1.5 capitalize font-medium ${
                    isRedDay ? 'text-red-700 font-bold' : 'text-gray-800'
                  }`}
                >
                  {weekday}
                </td>
                <td className="border-r border-gray-200 py-[2px] px-1 text-center font-bold text-emerald-800">
                  {hasOvertime ? `${formatHours(rec.overtimeHours)}h` : ''}
                </td>
                <td className="border-r border-gray-200 py-[2px] px-1 text-center font-bold text-amber-800">
                  {formatSiOrEmpty(isFestivoLavorato)}
                </td>
                <td className="border-r border-gray-200 py-[2px] px-1 text-center font-bold text-teal-800">
                  {formatSiOrEmpty(isFerie)}
                </td>
                <td className="border-r border-gray-200 py-[2px] px-1 text-center font-bold text-indigo-800">
                  {hasPermit ? `${formatHours(rec.permitHours)}h` : ''}
                </td>
                <td className="border-r border-gray-200 py-[2px] px-1 text-center font-bold text-rose-800">
                  {formatSiOrEmpty(isMalattia)}
                </td>
                <td className="border-r border-gray-200 py-[2px] px-1 text-center font-bold text-purple-800">
                  {formatSiOrEmpty(isAltriPermessi)}
                </td>
                <td className="py-[2px] px-1.5 text-left text-gray-700 truncate max-w-[160px]">
                  {holiday ? (
                    <span className="font-bold text-red-700">{holiday.name}</span>
                  ) : sunday ? (
                    <span className="text-red-600">Domenica</span>
                  ) : (
                    rec?.notes || ''
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-emerald-50 border-t-2 border-emerald-700 font-black text-[9px] text-gray-900">
            <td colSpan={2} className="border-r border-gray-300 py-1.5 px-2 text-emerald-950 uppercase">
              TOTALE MENSILE
            </td>
            <td className="border-r border-gray-300 py-1.5 px-1 text-center font-black text-emerald-800">
              {summary.overtimeHours > 0 ? `${formatHours(summary.overtimeHours, true)}h` : '0h'}
            </td>
            <td className="border-r border-gray-300 py-1.5 px-1 text-center font-bold text-amber-900">
              {summary.festiviLavorati > 0 ? summary.festiviLavorati : '-'}
            </td>
            <td className="border-r border-gray-300 py-1.5 px-1 text-center font-bold text-teal-900">
              {summary.ferieDays > 0 ? summary.ferieDays : '-'}
            </td>
            <td className="border-r border-gray-300 py-1.5 px-1 text-center font-bold text-indigo-900">
              {summary.permitHours > 0 ? `${formatHours(summary.permitHours, true)}h` : '-'}
            </td>
            <td className="border-r border-gray-300 py-1.5 px-1 text-center font-bold text-rose-900">
              {summary.malattiaDays > 0 ? summary.malattiaDays : '-'}
            </td>
            <td className="border-r border-gray-300 py-1.5 px-1 text-center font-bold text-purple-900">
              {summary.altriPermessiDays > 0 ? summary.altriPermessiDays : '-'}
            </td>
            <td className="py-1.5 px-1.5 text-left text-[8px] text-gray-500">
              {daysCount} giorni nel mese
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Signatures & Conformity Footer - strictly positioned inside A4 */}
      <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-[8.5px] text-gray-700">
        <div>
          <span className="block font-bold">Firma del Lavoratore:</span>
          <span className="block mt-4 w-44 border-b border-gray-400"></span>
        </div>
        <div className="text-center text-[7.5px] text-gray-400">
          Irpiniambiente S.p.A. • Pagina 1 di 1
        </div>
        <div className="text-right">
          <span className="block font-bold">Visto Responsabile / Personale:</span>
          <span className="block mt-4 w-48 border-b border-gray-400"></span>
        </div>
      </div>
    </div>
  );
};
