import React from 'react';
import { DayRecord } from '../types';
import { formatHours, formatCount, calculateYearSummary } from '../utils/calculations';
import {
  ITALIAN_MONTHS,
  formatItalianDate,
  getHolidayInfo,
  getItalianWeekday,
  getTodayDateStr,
  isSunday,
} from '../utils/holidays';
import { IrpiniambienteLogo } from './IrpiniambienteLogo';
import { OvertimeProgressBar } from './OvertimeProgressBar';
import { Edit3, Calendar, BarChart3, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

interface HomeViewProps {
  records: Record<string, DayRecord>;
  onNavigateToTab: (tab: 'controllo' | 'riepilogo' | 'calendario' | 'impostazioni') => void;
  onSelectToday: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  records,
  onNavigateToTab,
  onSelectToday,
}) => {
  const todayStr = getTodayDateStr();
  const [yearNum, monthNum, dayNum] = todayStr.split('-').map(Number);
  const weekday = getItalianWeekday(todayStr);
  const monthName = ITALIAN_MONTHS[monthNum - 1];
  const holiday = getHolidayInfo(todayStr);
  const isSundayToday = isSunday(todayStr);

  const yearSummary = calculateYearSummary(yearNum, records);
  const todayRecord = records[todayStr];

  return (
    <div id="home-view" className="w-full pb-24 max-w-xl mx-auto px-3.5 sm:px-4 pt-3">
      {/* 1. Irpiniambiente Logo - strictly white background */}
      <div className="mb-4">
        <IrpiniambienteLogo className="w-full max-w-sm mx-auto" maxHeight={68} showSubtitle={true} />
      </div>

      {/* 2. Today's Date Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 mb-4 text-center">
        <span className="inline-block px-3 py-0.5 mb-1.5 text-[11px] font-black tracking-widest text-emerald-800 bg-emerald-100/70 rounded-full uppercase">
          DATA ODIERNA (AGGIORNATA AUTOMATICAMENTE)
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
          {dayNum} {monthName} {yearNum}
        </h1>

        <div className="text-lg font-bold text-gray-700 mt-0.5">
          <span className={isSundayToday || holiday ? 'text-red-600' : 'text-gray-800'}>
            {weekday}
          </span>
        </div>

        {holiday && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
            ★ {holiday.name}
          </div>
        )}

        {/* Quick CTA to input today's data */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={() => {
              onSelectToday();
              onNavigateToTab('controllo');
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-sm sm:text-base shadow-sm transition flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Edit3 className="w-4 h-4" />
            COMPILA CONTROLLO GIORNALIERO DI OGGI
          </button>

          {todayRecord && (
            <div className="text-xs font-medium text-emerald-700 bg-emerald-50 py-1.5 px-2.5 rounded-lg border border-emerald-100 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dati inseriti per oggi:</span>
              <strong className="font-bold">
                {todayRecord.overtimeHours ? `+${todayRecord.overtimeHours}h straord.` : ''}{' '}
                {todayRecord.ferie ? '• Ferie' : ''}{' '}
                {todayRecord.permitHours ? `• ${todayRecord.permitHours}h perm.` : ''}{' '}
                {todayRecord.festivoLavorato ? '• Festivo lav.' : ''}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* 14 & 28. Riepilogo Rapido Anno Corrente: 150 Ore */}
      <div className="mb-4">
        <OvertimeProgressBar year={yearNum} totalHours={yearSummary.totalOvertimeHours} />
      </div>

      {/* Rapid Year Summary Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 mb-4">
        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-800">
            RIEPILOGO ANNO {yearNum}
          </h2>
          <button
            onClick={() => onNavigateToTab('riepilogo')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            Vedi tutti <BarChart3 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Straordinario */}
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-bold uppercase text-emerald-800">Straordinari</span>
            <div className="text-xl font-black text-emerald-700 mt-1">
              {formatHours(yearSummary.totalOvertimeHours, true)} h
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              {yearSummary.limitReached ? '✓ Limite raggiunto' : `Mancano ${formatHours(yearSummary.hoursRemainingTo150, true)}h`}
            </span>
          </div>

          {/* Festivi Lavorati */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
            <span className="text-[10px] font-bold uppercase text-amber-800">Festivi Lavorati</span>
            <div className="text-xl font-black text-amber-700 mt-1">
              {formatCount(yearSummary.totalFestiviLavorati) || '—'}
            </div>
            <span className="text-[10px] text-amber-600 font-medium">Giorni registrati "SI"</span>
          </div>

          {/* Ferie */}
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
            <span className="text-[10px] font-bold uppercase text-teal-800">Ferie Utilizzate</span>
            <div className="text-xl font-black text-teal-700 mt-1">
              {formatCount(yearSummary.totalFerieDays) || '—'}
            </div>
            <span className="text-[10px] text-teal-600 font-medium">Giorni registrati "SI"</span>
          </div>

          {/* Ore Permesso */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
            <span className="text-[10px] font-bold uppercase text-indigo-800">Ore Permesso</span>
            <div className="text-xl font-black text-indigo-700 mt-1">
              {formatHours(yearSummary.totalPermitHours) || '—'}
            </div>
            <span className="text-[10px] text-indigo-600 font-medium">Ore totali fruite</span>
          </div>

          {/* Malattia */}
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100">
            <span className="text-[10px] font-bold uppercase text-rose-800">Malattia</span>
            <div className="text-xl font-black text-rose-700 mt-1">
              {formatCount(yearSummary.totalMalattiaDays) || '—'}
            </div>
            <span className="text-[10px] text-rose-600 font-medium">Giorni registrati "SI"</span>
          </div>

          {/* Altri Permessi */}
          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
            <span className="text-[10px] font-bold uppercase text-purple-800">Altri Permessi</span>
            <div className="text-xl font-black text-purple-700 mt-1">
              {formatCount(yearSummary.totalAltriPermessiDays) || '—'}
            </div>
            <span className="text-[10px] text-purple-600 font-medium">Giorni registrati "SI"</span>
          </div>
        </div>
      </div>

      {/* Quick Access Navigation Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigateToTab('calendario')}
          className="p-3.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 active:scale-[0.99] text-left shadow-xs transition"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="font-black text-xs sm:text-sm text-gray-900">CALENDARIO</div>
          <div className="text-[11px] text-gray-500">Tutti i mesi e anni</div>
        </button>

        <button
          onClick={() => onNavigateToTab('riepilogo')}
          className="p-3.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 active:scale-[0.99] text-left shadow-xs transition"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-1.5">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="font-black text-xs sm:text-sm text-gray-900">RIEPILOGO</div>
          <div className="text-[11px] text-gray-500">Prospetto annuale</div>
        </button>
      </div>

      {/* Privacy & Formula Protection Badge */}
      <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-200 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Protezione formule e calcoli attiva (150h, Festività Avellino)
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">
          Tutti i dati personali rimangono memorizzati localmente sul tuo dispositivo.
        </p>
      </div>
    </div>
  );
};
