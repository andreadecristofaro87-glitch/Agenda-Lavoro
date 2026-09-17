import React, { useState } from 'react';
import { DayRecord } from '../types';
import {
  ITALIAN_MONTHS,
  formatShortDate,
  getDaysInMonth,
  getHolidayInfo,
  getItalianWeekday,
  isSunday,
  padZero,
} from '../utils/holidays';
import { calculateMonthSummary, formatHours, formatSiOrEmpty } from '../utils/calculations';
import { exportMonthPDF } from '../utils/pdfExport';
import { IrpiniambienteLogo } from './IrpiniambienteLogo';
import { CalendarioPrintTable } from './CalendarioPrintTable';
import { ChevronLeft, ChevronRight, FileDown, Printer, Edit3, Calendar } from 'lucide-react';

interface CalendarioViewProps {
  currentYear: number;
  currentMonth: number; // 1-12
  onSelectYearMonth: (year: number, month: number) => void;
  records: Record<string, DayRecord>;
  onEditDay: (dateStr: string) => void;
}

export const CalendarioView: React.FC<CalendarioViewProps> = ({
  currentYear,
  currentMonth,
  onSelectYearMonth,
  records,
  onEditDay,
}) => {
  // Perpetual dynamic years range around current selected year
  const startYear = currentYear - 6;
  const endYear = currentYear + 6;
  const yearOptions: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    yearOptions.push(y);
  }

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const monthSummary = calculateMonthSummary(currentYear, currentMonth, records);
  const monthName = ITALIAN_MONTHS[currentMonth - 1];

  // Month navigation
  const navigateMonth = (offset: number) => {
    let newM = currentMonth + offset;
    let newY = currentYear;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    } else if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    onSelectYearMonth(newY, newM);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="calendario-view" className="w-full pb-24 print:pb-0 max-w-2xl mx-auto px-3.5 sm:px-4 pt-3 print:p-0 print:m-0 print:max-w-none">
      {/* Irpiniambiente Logo on pure white background (screen only) */}
      <div className="mb-4 print:hidden">
        <IrpiniambienteLogo className="w-full max-w-xs mx-auto" maxHeight={56} showSubtitle={true} />
      </div>

      {/* Printable A4 Table (strictly 1 single page) */}
      <CalendarioPrintTable
        currentYear={currentYear}
        currentMonth={currentMonth}
        records={records}
      />

      {/* 22. Header with Year and Month Dropdowns (ANNO ▼, MESE ▼) - screen only */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 mb-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              CALENDARIO MENSILE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1 tracking-tight">
              {monthName} {currentYear}
            </h2>
          </div>

          {/* Stepper & Dropdowns */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Mese precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* MESE Dropdown */}
            <div className="relative">
              <select
                id="select-mese"
                value={currentMonth}
                onChange={(e) => onSelectYearMonth(currentYear, parseInt(e.target.value, 10))}
                className="font-bold text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl py-2 px-3 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer min-h-[44px]"
              >
                {ITALIAN_MONTHS.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* ANNO Dropdown */}
            <div className="relative">
              <select
                id="select-anno"
                value={currentYear}
                onChange={(e) => onSelectYearMonth(parseInt(e.target.value, 10), currentMonth)}
                className="font-bold text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl py-2 px-3 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer min-h-[44px]"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Mese successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Month Summary Pill Bar */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
          <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
            <div className="text-[10px] uppercase font-bold text-emerald-800">Straordinari</div>
            <div className="text-sm font-black text-emerald-700">
              {formatHours(monthSummary.overtimeHours) || '0'}h
            </div>
          </div>
          <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
            <div className="text-[10px] uppercase font-bold text-amber-800">Festivi Lav.</div>
            <div className="text-sm font-black text-amber-700">{monthSummary.festiviLavorati || '0'}</div>
          </div>
          <div className="bg-teal-50/70 p-2 rounded-xl border border-teal-100">
            <div className="text-[10px] uppercase font-bold text-teal-800">Ferie</div>
            <div className="text-sm font-black text-teal-700">{monthSummary.ferieDays || '0'}</div>
          </div>
          <div className="bg-indigo-50/70 p-2 rounded-xl border border-indigo-100">
            <div className="text-[10px] uppercase font-bold text-indigo-800">Ore Perm.</div>
            <div className="text-sm font-black text-indigo-700">{formatHours(monthSummary.permitHours) || '0'}h</div>
          </div>
          <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-100">
            <div className="text-[10px] uppercase font-bold text-rose-800">Malattia</div>
            <div className="text-sm font-black text-rose-700">{monthSummary.malattiaDays || '0'}</div>
          </div>
          <div className="bg-purple-50/70 p-2 rounded-xl border border-purple-100">
            <div className="text-[10px] uppercase font-bold text-purple-800">Altri Perm.</div>
            <div className="text-sm font-black text-purple-700">{monthSummary.altriPermessiDays || '0'}</div>
          </div>
        </div>

        {/* Action Buttons: PDF & Print */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => exportMonthPDF(currentYear, currentMonth, records)}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <FileDown className="w-4 h-4" />
            📄 ESPORTA PDF MESE
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs sm:text-sm font-bold transition"
          >
            <Printer className="w-4 h-4 text-gray-600" />
            🖨️ STAMPA
          </button>
        </div>
      </div>

      {/* 26. NIENTE GRIGLIE VISIBILI: Card & List Mobile-first Layout (Screen only) */}
      <div className="space-y-2 print:hidden">
        <div className="flex items-center justify-between px-1 text-xs text-gray-500 font-medium">
          <span>{daysCount} giorni nel mese di {monthName}</span>
          <span>Tocca qualsiasi giorno per modificarlo</span>
        </div>

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

          // Day container styling
          let cardBg = 'bg-white border-gray-200/80';
          if (isFerie) cardBg = 'bg-teal-50/40 border-teal-200';
          if (isFestivoLavorato) cardBg = 'bg-amber-50/50 border-amber-200';
          if (isMalattia) cardBg = 'bg-rose-50/40 border-rose-200';
          if (isAltriPermessi) cardBg = 'bg-purple-50/40 border-purple-200';

          return (
            <div
              key={dateStr}
              onClick={() => onEditDay(dateStr)}
              className={`rounded-xl border p-3 shadow-xs hover:shadow-sm cursor-pointer transition-all active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${cardBg}`}
            >
              {/* Left Column: Date & Weekday & Holiday Badge */}
              <div className="flex items-start sm:items-center gap-3">
                {/* Date Badge */}
                <div
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 border ${
                    isRedDay
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  }`}
                >
                  <span className="text-base leading-none font-black">{padZero(d)}</span>
                  <span className="text-[9px] uppercase font-semibold leading-tight mt-0.5">
                    {weekday.substring(0, 3)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">{formatShortDate(dateStr)}</span>
                    <span
                      className={`text-sm font-bold capitalize ${
                        isRedDay ? 'text-red-600' : 'text-gray-800'
                      }`}
                    >
                      {weekday}
                    </span>
                  </div>

                  {holiday && (
                    <div className="text-xs font-bold text-red-600 mt-0.5 flex items-center gap-1">
                      <span>★</span> {holiday.name}
                    </div>
                  )}
                  {sunday && !holiday && (
                    <div className="text-[11px] text-red-500 font-medium">Domenica</div>
                  )}
                </div>
              </div>

              {/* Right Column: Values and Badges */}
              <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                {/* Straordinario */}
                {hasOvertime && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    +{formatHours(rec.overtimeHours)}h Straord.
                  </span>
                )}

                {/* Festivo Lavorato (strictly 'SI' or empty) */}
                {isFestivoLavorato && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    ★ FESTIVO LAV. (SI)
                  </span>
                )}

                {/* Ferie (strictly 'SI' or empty) */}
                {isFerie && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
                    🏖️ FERIE (SI)
                  </span>
                )}

                {/* Ore Permesso */}
                {hasPermit && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    🕒 {formatHours(rec.permitHours)}h Permesso
                  </span>
                )}

                {/* Malattia (strictly 'SI' or empty) */}
                {isMalattia && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    💊 MALATTIA (SI)
                  </span>
                )}

                {/* Altri Permessi (strictly 'SI' or empty) */}
                {isAltriPermessi && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                    📋 ALTRO PERM. (SI)
                  </span>
                )}

                {/* Quick Edit icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditDay(dateStr);
                  }}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 transition ml-1"
                  title="Modifica questo giorno"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
