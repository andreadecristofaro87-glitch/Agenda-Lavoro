import React, { useRef, useState } from 'react';
import { DayRecord } from '../types';
import {
  downloadBackupJSON,
  downloadAllRecordsCSV,
  parseImportFile,
  mergeRecords,
  persistRecords,
  ImportResult,
} from '../utils/storage';
import { exportMonthPDF, exportYearSummaryPDF } from '../utils/pdfExport';
import { IrpiniambienteLogo } from './IrpiniambienteLogo';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  FileText,
  Printer,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Info,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

interface ImpostazioniViewProps {
  records: Record<string, DayRecord>;
  onRestoreRecords: (records: Record<string, DayRecord>) => void;
  onRefreshApp: () => void;
  currentYear: number;
  currentMonth: number;
}

export const ImpostazioniView: React.FC<ImpostazioniViewProps> = ({
  records,
  onRestoreRecords,
  onRefreshApp,
  currentYear,
  currentMonth,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // 24. Formula protection state
  const [isFormulasUnlocked, setIsFormulasUnlocked] = useState(false);
  const [formulaPasswordInput, setFormulaPasswordInput] = useState('');
  const [formulaError, setFormulaError] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. SALVA DATI
  const handleSaveData = () => {
    const ok = persistRecords(records);
    if (ok) {
      showToast('success', '💾 Tutti i dati sono stati salvati correttamente nel database locale!');
    } else {
      showToast('error', 'Errore durante il salvataggio in memoria locale.');
    }
  };

  // 2. ESPORTA BACKUP COMPLETO JSON (Formato nativo più compatibile con il programma)
  const handleExportJSON = () => {
    try {
      downloadBackupJSON(records);
      showToast('success', '💾 Backup JSON (formato nativo programma) scaricato con successo!');
    } catch {
      showToast('error', 'Impossibile creare il file di backup JSON.');
    }
  };

  // 3. ESPORTA TABELLA CSV (Compatibile con Excel, Fogli Google, LibreOffice)
  const handleExportCSV = () => {
    try {
      downloadAllRecordsCSV(records);
      showToast('success', '📊 Tabella CSV (compatibile Excel) scaricata con successo!');
    } catch {
      showToast('error', 'Impossibile creare il file CSV.');
    }
  };

  // 4. SELEZIONA FILE PER IMPORTARE DATI (JSON o CSV)
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseImportFile(file);
      setImportResult(parsed);
      setShowConfirmRestore(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore nel file selezionato';
      showToast('error', msg);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Conferma ripristino con modalità "UNISCI" (consigliata)
  const handleConfirmMerge = () => {
    if (importResult) {
      const merged = mergeRecords(records, importResult.records);
      onRestoreRecords(merged);
      persistRecords(merged);
      setShowConfirmRestore(false);
      setImportResult(null);
      showToast('success', `♻️ Dati uniti con successo! (${importResult.summary.totalDays} giorni elaborati)`);
    }
  };

  // Conferma ripristino con modalità "SOSTITUISCI TUTTO"
  const handleConfirmReplace = () => {
    if (importResult) {
      onRestoreRecords(importResult.records);
      persistRecords(importResult.records);
      setShowConfirmRestore(false);
      setImportResult(null);
      showToast('success', `♻️ Database sostituito con successo! (${importResult.summary.totalDays} giorni caricati)`);
    }
  };

  // 4. AGGIORNA
  const handleRefresh = () => {
    onRefreshApp();
    showToast('success', '🔄 Data corrente, festività, calendari e conteggi aggiornati!');
  };

  // 5. ESPORTA PDF
  const handleExportPDF = () => {
    exportMonthPDF(currentYear, currentMonth, records);
    showToast('success', '📄 Download del PDF del mese avviato!');
  };

  const handleExportYearPDF = () => {
    exportYearSummaryPDF(currentYear, records);
    showToast('success', '📄 Download del PDF annuale avviato!');
  };

  // 6. STAMPA
  const handlePrint = () => {
    window.print();
  };

  // 24. Sblocco protezione formule
  const handleUnlockFormulas = (e: React.FormEvent) => {
    e.preventDefault();
    if (formulaPasswordInput === '19Leone87') {
      setIsFormulasUnlocked(true);
      setShowPasswordDialog(false);
      setFormulaPasswordInput('');
      setFormulaError('');
      showToast('success', '🔓 Formule sbloccate. Modalità amministratore attiva.');
    } else {
      setFormulaError('Password non corretta');
    }
  };

  const totalRegisteredDays = Object.keys(records).length;

  return (
    <div id="impostazioni-view" className="w-full pb-24 max-w-xl mx-auto px-3.5 sm:px-4 pt-3">
      {/* Irpiniambiente Logo - strictly white background */}
      <div className="mb-4">
        <IrpiniambienteLogo className="w-full max-w-xs mx-auto" maxHeight={56} showSubtitle={true} />
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              STRUMENTI & FUNZIONI
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1 tracking-tight">
              Pannello di Gestione
            </h2>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl">
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalRegisteredDays} giorni salvati</span>
          </div>
        </div>

        {/* PWA Install Button banner */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <PWAInstallButton />
        </div>
      </div>

      {/* Toast message alert */}
      {statusMessage && (
        <div
          className={`p-3.5 mb-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Hidden File Input for Universal Import (JSON or CSV) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".json,.csv,.txt,application/json,text/csv"
        className="hidden"
      />

      {/* SEZIONE SPECIALE: IMPORTA ED ESPORTA TUTTI I DATI */}
      <div className="bg-white rounded-2xl border-2 border-emerald-600/30 p-4 mb-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">
                IMPORTA ED ESPORTA TUTTI I DATI
              </h3>
              <p className="text-[11px] text-gray-500">
                Formati ad alta compatibilità per il salvataggio e il ripristino
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Completo
          </span>
        </div>

        <div className="space-y-2.5">
          {/* 1. ESPORTA JSON (Massima compatibilità per il programma) */}
          <button
            onClick={handleExportJSON}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-xs transition flex items-center justify-between min-h-[52px]"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-5 h-5 text-white shrink-0" />
              <div className="text-left">
                <div className="leading-tight text-white font-bold">
                  💾 Esporta Tutti i Dati (Backup JSON)
                </div>
                <div className="text-[11px] font-normal text-emerald-100">
                  Formato nativo 100% compatibile per ripristinare il programma
                </div>
              </div>
            </div>
            <span className="text-[11px] font-black bg-white/20 text-white px-2 py-0.5 rounded">
              .JSON
            </span>
          </button>

          {/* 2. ESPORTA CSV (Compatibilità Excel / Fogli Google) */}
          <button
            onClick={handleExportCSV}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-300 text-gray-900 font-bold text-sm shadow-xs transition flex items-center justify-between min-h-[50px]"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="text-left">
                <div className="leading-tight text-gray-900 font-bold">
                  📊 Esporta per Excel (Tabella CSV)
                </div>
                <div className="text-[11px] font-normal text-gray-500">
                  Compatibile con Excel, Fogli Google e LibreOffice (separatore ;)
                </div>
              </div>
            </div>
            <span className="text-[11px] font-black text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
              .CSV
            </span>
          </button>

          {/* 3. IMPORTA TUTTI I DATI (Supporta sia JSON che CSV) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold text-sm shadow-xs transition flex items-center justify-between min-h-[52px]"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-5 h-5 text-white shrink-0" />
              <div className="text-left">
                <div className="leading-tight text-white font-bold">
                  ♻️ Importa Tutti i Dati (da JSON o CSV)
                </div>
                <div className="text-[11px] font-normal text-amber-100">
                  Riconosce automaticamente il file e ti permette di unire i dati
                </div>
              </div>
            </div>
            <span className="text-[11px] font-black bg-white/20 text-white px-2 py-0.5 rounded">
              Importa
            </span>
          </button>
        </div>

        {/* Info box su compatibilità */}
        <div className="mt-3 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Consiglio per la massima compatibilità:</strong> Per salvare o trasferire tutto il tuo archivio su un altro telefono, usa <strong>Backup JSON</strong>. Per aprire i tuoi orari al computer con Microsoft Excel o Fogli Google, scarica la <strong>Tabella CSV</strong>.
          </span>
        </div>
      </div>

      {/* ALTRE FUNZIONI E STRUMENTI */}
      <div className="space-y-3 mb-6">
        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider px-1">
          OPERAZIONI E STAMPA
        </h3>

        {/* SALVA DATI IN LOCALE */}
        <button
          onClick={handleSaveData}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-300 text-gray-900 font-bold text-sm shadow-xs transition flex items-center justify-between min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Save className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight text-gray-900 font-bold">💾 SALVA NEL DATABASE LOCALE</div>
              <div className="text-[11px] font-normal text-gray-500">Salvataggio manuale immediato nella memoria del telefono</div>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Memoria</span>
        </button>

        {/* AGGIORNA */}
        <button
          onClick={handleRefresh}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-300 text-gray-900 font-bold text-sm shadow-xs transition flex items-center justify-between min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight text-gray-900 font-bold">🔄 AGGIORNA CALCOLI E DATE</div>
              <div className="text-[11px] font-normal text-gray-500">Ricalcola limite 150h, festività e data corrente</div>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Sincronizza</span>
        </button>

        {/* ESPORTA PDF (Mese e Anno) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleExportPDF}
            className="py-3 px-4 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-300 text-gray-900 font-bold text-xs shadow-xs transition flex items-center gap-2.5 min-h-[48px]"
          >
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold">📄 PDF MESE ATTUALE</div>
              <div className="text-[10px] text-gray-500">Stampa mese selezionato</div>
            </div>
          </button>

          <button
            onClick={handleExportYearPDF}
            className="py-3 px-4 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-300 text-gray-900 font-bold text-xs shadow-xs transition flex items-center gap-2.5 min-h-[48px]"
          >
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="font-bold">📄 PDF RIEPILOGO ANNO</div>
              <div className="text-[10px] text-gray-500">Stampa 150h e assenze</div>
            </div>
          </button>
        </div>

        {/* STAMPA */}
        <button
          onClick={handlePrint}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-300 text-gray-900 font-bold text-sm shadow-xs transition flex items-center justify-between min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
              <Printer className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="leading-tight text-gray-900 font-bold">🖨️ STAMPA SCHERMATA</div>
              <div className="text-[11px] font-normal text-gray-500">Stampa diretta senza barre o pulsanti</div>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">Stampa</span>
        </button>
      </div>

      {/* 24. PROTEZIONE DELLE FORMULE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase text-gray-800 tracking-wider">
              PROTEZIONE FORMULE E CALCOLI
            </h3>
          </div>
          {isFormulasUnlocked ? (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Sbloccate
            </span>
          ) : (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Protette
            </span>
          )}
        </div>

        <p className="text-xs text-gray-600 mb-3">
          Tutte le formule contrattuali, il calcolo delle festività (incluso il Santo Patrono di Avellino) e il contatore annuale delle 150 ore sono protette per prevenire alterazioni accidentali.
        </p>

        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 space-y-2 text-xs">
          <div className="flex justify-between font-medium text-gray-700">
            <span>Limite Straordinario Annuo:</span>
            <strong className="font-bold text-gray-900">150 ore</strong>
          </div>
          <div className="flex justify-between font-medium text-gray-700">
            <span>Formula Rimanenza:</span>
            <code className="text-emerald-700 font-mono text-[11px]">150 - Ore Effettuate</code>
          </div>
          <div className="flex justify-between font-medium text-gray-700">
            <span>Riconoscimento Festività:</span>
            <strong className="font-bold text-gray-900">Nazionali + San Modestino (14 Febbraio)</strong>
          </div>
          <div className="flex justify-between font-medium text-gray-700">
            <span>Ripristino Annuale:</span>
            <strong className="font-bold text-gray-900">Automatico al 1° Gennaio</strong>
          </div>
        </div>

        {!isFormulasUnlocked ? (
          <button
            onClick={() => setShowPasswordDialog(true)}
            className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Lock className="w-3.5 h-3.5" /> Sblocca parametri formule con password
          </button>
        ) : (
          <div className="mt-3 text-xs text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            ✓ Modalità configurazione formule sbloccata. I parametri sono conformi ai contratti Irpiniambiente S.p.A.
          </div>
        )}
      </div>

      {/* Modal / Dialog for Formula Password */}
      {showPasswordDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-gray-900">
              <Lock className="w-5 h-5 text-emerald-600" />
              <h4 className="text-base font-bold">Protezione Formule</h4>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Inserisci la password di amministrazione per verificare o sbloccare la protezione delle formule:
            </p>

            <form onSubmit={handleUnlockFormulas} className="space-y-3">
              <input
                type="password"
                placeholder="Inserisci password"
                value={formulaPasswordInput}
                onChange={(e) => {
                  setFormulaPasswordInput(e.target.value);
                  setFormulaError('');
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                autoFocus
              />

              {formulaError && (
                <div className="text-xs font-bold text-red-600">{formulaError}</div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordDialog(false);
                    setFormulaError('');
                    setFormulaPasswordInput('');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold text-xs hover:bg-gray-100"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  Verifica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Universal Import (JSON or CSV) */}
      {showConfirmRestore && importResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="text-base font-bold">File Riconosciuto con Successo</h4>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-gray-700 space-y-1.5 my-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Formato Rilevato:</span>
                <strong className="font-bold text-emerald-800 uppercase">
                  {importResult.sourceType === 'json' ? 'Backup Programma (JSON)' : 'Tabella Excel (CSV)'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Giorni Trovati:</span>
                <strong className="font-bold text-gray-900">{importResult.summary.totalDays} giorni</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ore Straordinario:</span>
                <strong className="font-bold text-gray-900">{importResult.summary.totalOvertimeHours} ore</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Periodo:</span>
                <strong className="font-bold text-gray-900">
                  {importResult.summary.startDate} ➔ {importResult.summary.endDate}
                </strong>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Come desideri procedere con l'importazione dei dati?
            </p>

            <div className="space-y-2">
              {/* Opzione 1: UNISCI (Consigliato) */}
              <button
                onClick={handleConfirmMerge}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Layers className="w-4 h-4" />
                Unisci ai dati già presenti (Consigliato)
              </button>

              {/* Opzione 2: SOSTITUISCI TUTTO */}
              <button
                onClick={handleConfirmReplace}
                className="w-full py-2.5 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Sostituisci completamente il database
              </button>

              {/* Annulla */}
              <button
                onClick={() => {
                  setShowConfirmRestore(false);
                  setImportResult(null);
                }}
                className="w-full py-2 text-center text-xs font-bold text-gray-500 hover:text-gray-700"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
