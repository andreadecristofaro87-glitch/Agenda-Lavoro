import React from 'react';
import { YearSummary } from '../types';
import { formatCount, formatHours } from '../utils/calculations';

interface RiepilogoPrintTableProps {
  currentYear: number;
  yearSummary: YearSummary;
}

export const RiepilogoPrintTable: React.FC<RiepilogoPrintTableProps> = ({
  currentYear,
  yearSummary,
}) => {
  const isLimitReached = yearSummary.limitReached;
  const progressPercent = Math.min(100, Math.round((yearSummary.totalOvertimeHours / 150) * 100));

  return (
    <div className="hidden print:block a4-page-container font-sans text-gray-900 bg-white">
      {/* Header Banner */}
      <div className="border-b-2 border-emerald-600 pb-2 mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm shrink-0">
            IA
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-gray-900 leading-none">
              IRPINIAMBIENTE S.p.A.
            </h1>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mt-0.5">
              Riepilogo Annuale Straordinari, Ferie, Permessi e Assenze
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-base font-black text-emerald-800 leading-none">
            ANNO {currentYear}
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">
            Stampa: {new Date().toLocaleDateString('it-IT')}
          </div>
        </div>
      </div>

      {/* 150-Hour Overtime Status Box */}
      <div className="border border-gray-300 rounded-md p-2 mb-2 bg-gray-50/70 flex items-center justify-between text-[9.5px]">
        <div>
          <div className="font-bold text-gray-900 uppercase text-[9px]">
            Limite Contrattuale Straordinari (150 Ore Annuali)
          </div>
          <div className="text-[11px] font-black text-emerald-800 mt-0.5">
            Ore Effettuate: {formatHours(yearSummary.totalOvertimeHours, true)} h / 150 h ({progressPercent}%)
          </div>
        </div>

        <div className="text-right">
          {isLimitReached ? (
            <span className="inline-block px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[9px] border border-red-300">
              LIMITE 150H RAGGIUNTO (+{formatHours(yearSummary.hoursExceeded150, true)}h oltre)
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] border border-emerald-300">
              Disponibili: {formatHours(yearSummary.hoursRemainingTo150, true)}h rimanenti alle 150h
            </span>
          )}
        </div>
      </div>

      {/* 6 Annual Totals KPI Cards */}
      <div className="grid grid-cols-6 gap-1.5 mb-2.5 text-center text-[9.5px]">
        <div className="bg-emerald-50 border border-emerald-300 rounded p-1.5">
          <span className="block text-[8px] font-bold text-emerald-900 uppercase">Tot. Straordinari</span>
          <span className="font-black text-emerald-800 text-xs">
            {formatHours(yearSummary.totalOvertimeHours, true)} h
          </span>
        </div>
        <div className="bg-amber-50 border border-amber-300 rounded p-1.5">
          <span className="block text-[8px] font-bold text-amber-900 uppercase">Festivi Lav.</span>
          <span className="font-black text-amber-800 text-xs">
            {formatCount(yearSummary.totalFestiviLavorati) || '0'} gg
          </span>
        </div>
        <div className="bg-teal-50 border border-teal-300 rounded p-1.5">
          <span className="block text-[8px] font-bold text-teal-900 uppercase">Ferie Utilizzate</span>
          <span className="font-black text-teal-800 text-xs">
            {formatCount(yearSummary.totalFerieDays) || '0'} gg
          </span>
        </div>
        <div className="bg-indigo-50 border border-indigo-300 rounded p-1.5">
          <span className="block text-[8px] font-bold text-indigo-900 uppercase">Ore Permesso</span>
          <span className="font-black text-indigo-800 text-xs">
            {formatHours(yearSummary.totalPermitHours, true)} h
          </span>
        </div>
        <div className="bg-rose-50 border border-rose-300 rounded p-1.5">
          <span className="block text-[8px] font-bold text-rose-900 uppercase">Malattia</span>
          <span className="font-black text-rose-800 text-xs">
            {formatCount(yearSummary.totalMalattiaDays) || '0'} gg
          </span>
        </div>
        <div className="bg-purple-50 border border-purple-300 rounded p-1.5">
          <span className="block text-[8px] font-bold text-purple-900 uppercase">Altri Permessi</span>
          <span className="font-black text-purple-800 text-xs">
            {formatCount(yearSummary.totalAltriPermessiDays) || '0'} gg
          </span>
        </div>
      </div>

      {/* Monthly Breakdown Table (12 months + Totale) */}
      <table className="w-full border-collapse border border-gray-300 text-[9px] leading-tight">
        <thead>
          <tr className="bg-emerald-700 text-white font-black text-center text-[9px]">
            <th className="border border-gray-300 py-1.5 px-2 text-left">Mese</th>
            <th className="border border-gray-300 py-1.5 px-1 w-24">Straordinari</th>
            <th className="border border-gray-300 py-1.5 px-1 w-20">Festivi Lav.</th>
            <th className="border border-gray-300 py-1.5 px-1 w-20">Ferie</th>
            <th className="border border-gray-300 py-1.5 px-1 w-24">Ore Permesso</th>
            <th className="border border-gray-300 py-1.5 px-1 w-20">Malattia</th>
            <th className="border border-gray-300 py-1.5 px-1 w-24">Altri Permessi</th>
          </tr>
        </thead>
        <tbody>
          {yearSummary.monthlyBreakdown.map((m) => {
            return (
              <tr key={m.month} className="border-b border-gray-200 even:bg-gray-50/50">
                <td className="border-r border-gray-200 py-1 px-2 font-bold text-gray-900">
                  {m.monthName}
                </td>
                <td className="border-r border-gray-200 py-1 px-1 text-center font-bold text-emerald-800">
                  {m.overtimeHours > 0 ? `${formatHours(m.overtimeHours)}h` : '-'}
                </td>
                <td className="border-r border-gray-200 py-1 px-1 text-center font-semibold text-amber-800">
                  {m.festiviLavorati > 0 ? `${m.festiviLavorati} gg` : '-'}
                </td>
                <td className="border-r border-gray-200 py-1 px-1 text-center font-semibold text-teal-800">
                  {m.ferieDays > 0 ? `${m.ferieDays} gg` : '-'}
                </td>
                <td className="border-r border-gray-200 py-1 px-1 text-center font-semibold text-indigo-800">
                  {m.permitHours > 0 ? `${formatHours(m.permitHours)}h` : '-'}
                </td>
                <td className="border-r border-gray-200 py-1 px-1 text-center font-semibold text-rose-800">
                  {m.malattiaDays > 0 ? `${m.malattiaDays} gg` : '-'}
                </td>
                <td className="border-r border-gray-200 py-1 px-1 text-center font-semibold text-purple-800">
                  {m.altriPermessiDays > 0 ? `${m.altriPermessiDays} gg` : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-emerald-50 border-t-2 border-emerald-700 font-black text-[9.5px] text-gray-900">
            <td className="border-r border-gray-300 py-2 px-2 uppercase text-emerald-950">
              TOTALE ANNUALE
            </td>
            <td className="border-r border-gray-300 py-2 px-1 text-center font-black text-emerald-800 text-[10px]">
              {yearSummary.totalOvertimeHours > 0 ? `${formatHours(yearSummary.totalOvertimeHours, true)}h` : '0h'}
            </td>
            <td className="border-r border-gray-300 py-2 px-1 text-center font-black text-amber-900">
              {yearSummary.totalFestiviLavorati > 0 ? `${yearSummary.totalFestiviLavorati} gg` : '-'}
            </td>
            <td className="border-r border-gray-300 py-2 px-1 text-center font-black text-teal-900">
              {yearSummary.totalFerieDays > 0 ? `${yearSummary.totalFerieDays} gg` : '-'}
            </td>
            <td className="border-r border-gray-300 py-2 px-1 text-center font-black text-indigo-900">
              {yearSummary.totalPermitHours > 0 ? `${formatHours(yearSummary.totalPermitHours, true)}h` : '-'}
            </td>
            <td className="border-r border-gray-300 py-2 px-1 text-center font-black text-rose-900">
              {yearSummary.totalMalattiaDays > 0 ? `${yearSummary.totalMalattiaDays} gg` : '-'}
            </td>
            <td className="border-r border-gray-300 py-2 px-1 text-center font-black text-purple-900">
              {yearSummary.totalAltriPermessiDays > 0 ? `${yearSummary.totalAltriPermessiDays} gg` : '-'}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Signatures & Conformity Footer */}
      <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[8.5px] text-gray-700">
        <div>
          <span className="block font-bold">Firma del Lavoratore:</span>
          <span className="block mt-5 w-48 border-b border-gray-400"></span>
        </div>
        <div className="text-center text-[7.5px] text-gray-400">
          Irpiniambiente S.p.A. - Gestione Presenze e Straordinari • Pagina 1 di 1
        </div>
        <div className="text-right">
          <span className="block font-bold">Visto Responsabile del Personale:</span>
          <span className="block mt-5 w-52 border-b border-gray-400"></span>
        </div>
      </div>
    </div>
  );
};
