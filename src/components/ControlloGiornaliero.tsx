import React, { useState, useEffect } from 'react';
import { DayRecord } from '../types';
import {
  formatItalianDate,
  getHolidayInfo,
  getItalianWeekday,
  getTodayDateStr,
  isSunday,
} from '../utils/holidays';
import { getOrCreateDayRecord, validateHoursInput } from '../utils/storage';
import { IrpiniambienteLogo } from './IrpiniambienteLogo';
import { OvertimeProgressBar } from './OvertimeProgressBar';
import { calculateYearSummary } from '../utils/calculations';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Save } from 'lucide-react';

interface ControlloGiornalieroProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  records: Record<string, DayRecord>;
  onUpdateRecord: (record: DayRecord) => void;
  onSaveExplicit?: () => void;
}

export const ControlloGiornaliero: React.FC<ControlloGiornalieroProps> = ({
  selectedDate,
  onSelectDate,
  records,
  onUpdateRecord,
  onSaveExplicit,
}) => {
  const todayStr = getTodayDateStr();
  const isToday = selectedDate === todayStr;

  // Retrieve existing record or create draft
  const currentRecord = getOrCreateDayRecord(selectedDate, records);

  // Local state for numeric text inputs to handle commas, decimals, and empty states smoothly
  const [overtimeText, setOvertimeText] = useState<string>(
    currentRecord.overtimeHours !== null && currentRecord.overtimeHours !== undefined
      ? currentRecord.overtimeHours.toString().replace('.', ',')
      : ''
  );

  const [permitText, setPermitText] = useState<string>(
    currentRecord.permitHours !== null && currentRecord.permitHours !== undefined
      ? currentRecord.permitHours.toString().replace('.', ',')
      : ''
  );

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Synchronize local input state when selectedDate or record changes from external action
  useEffect(() => {
    const rec = getOrCreateDayRecord(selectedDate, records);
    setOvertimeText(
      rec.overtimeHours !== null && rec.overtimeHours !== undefined
        ? rec.overtimeHours.toString().replace('.', ',')
        : ''
    );
    setPermitText(
      rec.permitHours !== null && rec.permitHours !== undefined
        ? rec.permitHours.toString().replace('.', ',')
        : ''
    );
    setErrorMessage(null);
  }, [selectedDate, records]);

  const weekday = getItalianWeekday(selectedDate);
  const holiday = getHolidayInfo(selectedDate);
  const isSundayDay = isSunday(selectedDate);
  const selectedYear = parseInt(selectedDate.split('-')[0], 10);
  const yearSummary = calculateYearSummary(selectedYear, records);

  // Auto-save helper
  const triggerAutoSave = (updated: Partial<DayRecord>) => {
    const newRecord: DayRecord = {
      ...currentRecord,
      ...updated,
      date: selectedDate,
      year: parseInt(selectedDate.split('-')[0], 10),
      month: parseInt(selectedDate.split('-')[1], 10),
      day: parseInt(selectedDate.split('-')[2], 10),
      dayOfWeek: weekday,
      holidayName: holiday?.name,
      isHoliday: !!holiday,
      isSunday: isSundayDay,
      updatedAt: Date.now(),
    };

    onUpdateRecord(newRecord);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Handler for overtime input change
  const handleOvertimeChange = (val: string) => {
    setOvertimeText(val);
    const { valid, value, error } = validateHoursInput(val);
    if (!valid) {
      setErrorMessage(error || 'Valore non valido');
      return;
    }
    setErrorMessage(null);
    triggerAutoSave({ overtimeHours: value });
  };

  // Handler for permit hours input change
  const handlePermitChange = (val: string) => {
    setPermitText(val);
    const { valid, value, error } = validateHoursInput(val);
    if (!valid) {
      setErrorMessage(error || 'Valore non valido');
      return;
    }
    setErrorMessage(null);
    triggerAutoSave({ permitHours: value });
  };

  // Boolean toggles (SI / NO)
  const handleToggle = (field: 'ferie' | 'malattia' | 'altriPermessi' | 'festivoLavorato', value: boolean) => {
    triggerAutoSave({ [field]: value });
  };

  // Quick day navigation
  const navigateDay = (offset: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + offset);
    const newStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(
      dateObj.getDate()
    ).padStart(2, '0')}`;
    onSelectDate(newStr);
  };

  return (
    <div id="controllo-giornaliero-view" className="w-full pb-24 max-w-xl mx-auto px-3.5 sm:px-4 pt-3">
      {/* Irpiniambiente Logo - strictly white background, never deformed */}
      <div className="mb-4">
        <IrpiniambienteLogo className="w-full max-w-xs mx-auto" maxHeight={58} showSubtitle={true} />
      </div>

      {/* Date Card & Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 mb-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              CONTROLLO GIORNALIERO
            </span>
          </div>

          {/* Quick jump to Today */}
          {!isToday && (
            <button
              onClick={() => onSelectDate(todayStr)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
            >
              Vai a Oggi
            </button>
          )}
        </div>

        {/* Selected Date Presentation */}
        <div className="text-center py-1">
          {isToday && (
            <span className="inline-block px-3 py-0.5 mb-1.5 text-[11px] font-black tracking-widest text-emerald-800 bg-emerald-100/70 rounded-full uppercase">
              OGGI
            </span>
          )}
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 capitalize tracking-tight">
            {formatItalianDate(selectedDate)}
          </h2>
          <div className="text-base sm:text-lg font-bold text-gray-600 mt-0.5">
            <span className={isSundayDay || holiday ? 'text-red-600' : 'text-gray-700'}>{weekday}</span>
            {holiday && (
              <span className="block text-xs font-bold text-red-600 mt-1 bg-red-50 py-1 px-3 rounded-full border border-red-200 w-fit mx-auto">
                ★ {holiday.name}
              </span>
            )}
            {isSundayDay && !holiday && (
              <span className="block text-xs font-semibold text-red-500 mt-0.5">
                Domenica (Giorno festivo settimanale)
              </span>
            )}
          </div>
        </div>

        {/* Date Stepper & Native Date Picker */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => navigateDay(-1)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition min-h-[44px]"
            title="Giorno precedente"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prec.</span>
          </button>

          {/* Date Picker Input */}
          <div className="relative flex-1 max-w-[200px]">
            <input
              type="date"
              id="date-picker-input"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              className="w-full text-center font-bold text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl py-2 px-2 text-gray-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[44px]"
            />
          </div>

          <button
            onClick={() => navigateDay(1)}
            className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 active:scale-95 transition min-h-[44px]"
            title="Giorno successivo"
          >
            <span className="hidden sm:inline">Succ.</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overtime Mini Progress Status */}
      <div className="mb-4">
        <OvertimeProgressBar year={selectedYear} totalHours={yearSummary.totalOvertimeHours} compact={true} />
      </div>

      {/* Input Form Fields */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-5 space-y-4">
        {/* Error notification if invalid input */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* 1. ORE DI STRAORDINARIO */}
        <div id="field-ore-straordinario" className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-straordinario" className="text-xs sm:text-sm font-bold uppercase text-gray-800">
              ORE DI STRAORDINARIO
            </label>
            <span className="text-[11px] text-gray-500 font-medium">Es: 1,5 o 2</span>
          </div>
          <div className="relative">
            <input
              id="input-straordinario"
              type="text"
              inputMode="decimal"
              placeholder="Lascia vuoto se nessuna ora"
              value={overtimeText}
              onChange={(e) => handleOvertimeChange(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-lg font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none min-h-[48px]"
            />
          </div>
          {/* Quick hour shortcuts */}
          <div className="flex gap-2 mt-2">
            {[1, 1.5, 2, 3].map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => handleOvertimeChange(hrs.toString().replace('.', ','))}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition"
              >
                +{hrs.toString().replace('.', ',')}h
              </button>
            ))}
            {overtimeText && (
              <button
                type="button"
                onClick={() => handleOvertimeChange('')}
                className="ml-auto px-2 py-1 text-xs text-gray-500 hover:text-red-600 transition"
              >
                Cancella
              </button>
            )}
          </div>
        </div>

        {/* 2. FERIE (SI / NO) */}
        <div id="field-ferie" className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase text-gray-800">FERIE</span>
            {currentRecord.ferie && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                ✓ FERIE REGISTRATE
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleToggle('ferie', true)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] flex items-center justify-center gap-2 ${
                currentRecord.ferie === true
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {currentRecord.ferie === true && <CheckCircle2 className="w-4 h-4" />}
              SI
            </button>
            <button
              type="button"
              onClick={() => handleToggle('ferie', false)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] ${
                currentRecord.ferie !== true
                  ? 'bg-gray-200 text-gray-800 border border-gray-300'
                  : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-100'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {/* 3. ORE DI PERMESSO */}
        <div id="field-ore-permesso" className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="input-permesso" className="text-xs sm:text-sm font-bold uppercase text-gray-800">
              ORE DI PERMESSO
            </label>
            <span className="text-[11px] text-gray-500 font-medium">Es: 1 o 2,5</span>
          </div>
          <div className="relative">
            <input
              id="input-permesso"
              type="text"
              inputMode="decimal"
              placeholder="Lascia vuoto se nessuna ora"
              value={permitText}
              onChange={(e) => handlePermitChange(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base sm:text-lg font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none min-h-[48px]"
            />
          </div>
          {permitText && (
            <button
              type="button"
              onClick={() => handlePermitChange('')}
              className="mt-1 text-xs text-gray-500 hover:text-red-600 transition"
            >
              Cancella ore permesso
            </button>
          )}
        </div>

        {/* 4. GIORNI DI MALATTIA (SI / NO) */}
        <div id="field-malattia" className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase text-gray-800">GIORNI DI MALATTIA</span>
            {currentRecord.malattia && (
              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                ✓ MALATTIA
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleToggle('malattia', true)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] flex items-center justify-center gap-2 ${
                currentRecord.malattia === true
                  ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600 ring-offset-1'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {currentRecord.malattia === true && <CheckCircle2 className="w-4 h-4" />}
              SI
            </button>
            <button
              type="button"
              onClick={() => handleToggle('malattia', false)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] ${
                currentRecord.malattia !== true
                  ? 'bg-gray-200 text-gray-800 border border-gray-300'
                  : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-100'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {/* 5. ALTRI GIORNI DI PERMESSO (SI / NO) */}
        <div id="field-altri-permessi" className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-bold uppercase text-gray-800">ALTRI GIORNI DI PERMESSO</span>
            {currentRecord.altriPermessi && (
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                ✓ ALTRO PERMESSO
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleToggle('altriPermessi', true)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] flex items-center justify-center gap-2 ${
                currentRecord.altriPermessi === true
                  ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-600 ring-offset-1'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {currentRecord.altriPermessi === true && <CheckCircle2 className="w-4 h-4" />}
              SI
            </button>
            <button
              type="button"
              onClick={() => handleToggle('altriPermessi', false)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] ${
                currentRecord.altriPermessi !== true
                  ? 'bg-gray-200 text-gray-800 border border-gray-300'
                  : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-100'
              }`}
            >
              NO
            </button>
          </div>
        </div>

        {/* 6. FESTIVO LAVORATO (SI / NO) */}
        <div id="field-festivo-lavorato" className="p-3.5 bg-gray-50/70 rounded-xl border border-gray-200/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs sm:text-sm font-bold uppercase text-gray-800">FESTIVO LAVORATO</span>
              {(isSundayDay || holiday) && (
                <span className="block text-[11px] text-amber-700 font-medium">
                  {holiday ? `Giorno festivo: ${holiday.name}` : 'Giorno domenicale'}
                </span>
              )}
            </div>
            {currentRecord.festivoLavorato && (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                ✓ FESTIVO LAVORATO
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleToggle('festivoLavorato', true)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] flex items-center justify-center gap-2 ${
                currentRecord.festivoLavorato === true
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600 ring-offset-1'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {currentRecord.festivoLavorato === true && <CheckCircle2 className="w-4 h-4" />}
              SI
            </button>
            <button
              type="button"
              onClick={() => handleToggle('festivoLavorato', false)}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all min-h-[48px] ${
                currentRecord.festivoLavorato !== true
                  ? 'bg-gray-200 text-gray-800 border border-gray-300'
                  : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-100'
              }`}
            >
              NO
            </button>
          </div>
        </div>
      </div>

      {/* Action and Confirmation Bar */}
      <div className="mt-5 space-y-3">
        {/* Main large SALVA DATI button */}
        <button
          id="btn-salva-dati"
          type="button"
          onClick={() => {
            if (onSaveExplicit) onSaveExplicit();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2500);
          }}
          className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-base sm:text-lg shadow-md transition-all flex items-center justify-center gap-2 min-h-[56px]"
        >
          <Save className="w-5 h-5" />
          💾 SALVA DATI
        </button>

        {/* Status notification */}
        <div className="text-center">
          {saveStatus === 'saved' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dati salvati automaticamente sul dispositivo
            </span>
          ) : (
            <span className="text-[11px] text-gray-500">
              Tutte le modifiche vengono memorizzate istantaneamente nel database locale
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
