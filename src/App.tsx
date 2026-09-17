import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, DayRecord } from './types';
import { loadAllRecords, persistRecords } from './utils/storage';
import { getTodayDateStr } from './utils/holidays';
import { ControlloGiornaliero } from './components/ControlloGiornaliero';
import { RiepilogoView } from './components/RiepilogoView';
import { CalendarioView } from './components/CalendarioView';
import { HomeView } from './components/HomeView';
import { ImpostazioniView } from './components/ImpostazioniView';
import { Navbar } from './components/Navbar';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const todayStr = getTodayDateStr();
  const [todayYear, todayMonth] = todayStr.split('-').map(Number);

  // 1. App State
  // Order of tabs: 1. Controllo Giornaliero (first default), 2. Riepilogo, 3. Calendario, 4. Home, 5. Impostazioni
  const [activeTab, setActiveTab] = useState<ActiveTab>('controllo');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedYear, setSelectedYear] = useState<number>(todayYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(todayMonth);

  // 2. Records dictionary stored locally
  const [records, setRecords] = useState<Record<string, DayRecord>>(() => {
    return loadAllRecords();
  });

  // Keep selected year and month in sync when date is selected in Controllo Giornaliero
  useEffect(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    setSelectedYear(y);
    setSelectedMonth(m);
  }, [selectedDate]);

  // Update a single day record and auto-save
  const handleUpdateRecord = useCallback((updatedRecord: DayRecord) => {
    setRecords((prev) => {
      const next = {
        ...prev,
        [updatedRecord.date]: updatedRecord,
      };
      persistRecords(next);
      return next;
    });
  }, []);

  // Explicit save action
  const handleSaveExplicit = useCallback(() => {
    persistRecords(records);
  }, [records]);

  // Restore complete records from backup
  const handleRestoreRecords = useCallback((newRecords: Record<string, DayRecord>) => {
    setRecords(newRecords);
    persistRecords(newRecords);
  }, []);

  // Refresh app data (date, counters, etc.)
  const handleRefreshApp = useCallback(() => {
    const freshToday = getTodayDateStr();
    setSelectedDate(freshToday);
    const [y, m] = freshToday.split('-').map(Number);
    setSelectedYear(y);
    setSelectedMonth(m);
    // Reload storage to ensure absolute synchronization
    const currentStored = loadAllRecords();
    setRecords(currentStored);
  }, []);

  // Handler when clicking a day in Calendario -> open in Controllo Giornaliero
  const handleEditDayFromCalendar = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('controllo');
  }, []);

  // Handler when clicking a month in Riepilogo -> open in Calendario
  const handleSelectMonthFromSummary = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setActiveTab('calendario');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col selection:bg-emerald-200">
      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-2 sm:px-4 py-2">
        {activeTab === 'controllo' && (
          <ControlloGiornaliero
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onSaveExplicit={handleSaveExplicit}
          />
        )}

        {activeTab === 'riepilogo' && (
          <RiepilogoView
            currentYear={selectedYear}
            onSelectYear={setSelectedYear}
            records={records}
            onSelectMonth={handleSelectMonthFromSummary}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarioView
            currentYear={selectedYear}
            currentMonth={selectedMonth}
            onSelectYearMonth={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
            records={records}
            onEditDay={handleEditDayFromCalendar}
          />
        )}

        {activeTab === 'home' && (
          <HomeView
            records={records}
            onNavigateToTab={setActiveTab}
            onSelectToday={() => setSelectedDate(todayStr)}
          />
        )}

        {activeTab === 'impostazioni' && (
          <ImpostazioniView
            records={records}
            onRestoreRecords={handleRestoreRecords}
            onRefreshApp={handleRefreshApp}
            currentYear={selectedYear}
            currentMonth={selectedMonth}
          />
        )}
      </main>

      {/* Fixed Bottom Mobile Navigation Bar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
