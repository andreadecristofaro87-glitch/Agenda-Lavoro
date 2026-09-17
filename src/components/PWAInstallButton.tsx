import React, { useState, useEffect } from 'react';
import { usePWAInstall } from './usePWAInstall';
import {
  Download,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Share2,
  PlusSquare,
  MoreVertical,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [activeOS, setActiveOS] = useState<'ios' | 'android'>('android');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isIOS) {
      setActiveOS('ios');
    } else {
      setActiveOS('android');
    }
  }, [isIOS]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenFullscreen = () => {
    window.open(window.location.href, '_blank');
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        setShowModal(false);
        return;
      }
    }
    // If not directly installable via prompt (e.g. inside iframe or on iPhone), open the guide modal
    setShowModal(true);
  };

  // If app is already installed and opened as standalone
  if (isInstalled) {
    return (
      <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-800 shadow-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <div>Applicazione installata sulla schermata Home!</div>
          <div className="text-[11px] font-normal text-emerald-700">
            Stai già utilizzando l'app a schermo intero sul tuo dispositivo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* PULSANTE PRINCIPALE INSTALLAZIONE */}
      <button
        type="button"
        onClick={handleDirectInstall}
        className="w-full group relative overflow-hidden py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] text-white font-black text-sm shadow-md transition-all flex items-center justify-between min-h-[56px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="leading-tight flex items-center gap-1.5 text-base text-white">
              <span>INSTALLA SULLA HOME</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            </div>
            <div className="text-[11px] font-normal text-emerald-100">
              Procedura automatica per Android e iPhone
            </div>
          </div>
        </div>
        <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-lg shrink-0">
          Installa
        </span>
      </button>

      {/* MODALE PROCEDURA DI INSTALLAZIONE COMPLETA (Android & iPhone) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Header modale */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    Installazione su Cellulare
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Aggiungi l'icona alla schermata Home del tuo telefono
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selettore Dispositivo (Android vs iPhone) */}
            <div className="grid grid-cols-2 gap-2 my-4 bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveOS('android')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  activeOS === 'android'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🤖</span>
                <span>Android (Chrome)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveOS('ios')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                  activeOS === 'ios'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>🍏</span>
                <span>iPhone / iPad (Safari)</span>
              </button>
            </div>

            {/* GUIDA SPECIFICA ANDROID */}
            {activeOS === 'android' && (
              <div className="space-y-3.5">
                {isInstallable && (
                  <button
                    type="button"
                    onClick={async () => {
                      const res = await install();
                      if (res) setShowModal(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Tocca qui per Installare Subito
                  </button>
                )}

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs text-gray-700">
                      <strong className="text-gray-900 font-bold block mb-0.5">
                        Apri a schermo intero
                      </strong>
                      Tocca il pulsante in basso <strong>"Apri a Schermo Intero"</strong> per visualizzare l'app direttamente in Google Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs text-gray-700">
                      <strong className="text-gray-900 font-bold flex items-center gap-1 mb-0.5">
                        Menu di Chrome <MoreVertical className="w-3.5 h-3.5 text-gray-700 inline" />
                      </strong>
                      Tocca i <strong>3 puntini in alto a destra</strong> nella schermata del browser Chrome.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs text-gray-700">
                      <strong className="text-gray-900 font-bold block mb-0.5">
                        Aggiungi alla Home
                      </strong>
                      Seleziona <strong>"Installa app"</strong> (oppure <strong>"Aggiungi a schermata Home"</strong>) e premi <strong>"Installa"</strong>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GUIDA SPECIFICA IPHONE / IPAD */}
            {activeOS === 'ios' && (
              <div className="space-y-3.5">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium">
                  💡 <strong>Nota Apple:</strong> Su iPhone e iPad l'installazione va eseguita con il browser <strong>Safari</strong>.
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </div>
                    <div className="text-xs text-gray-700">
                      <strong className="text-gray-900 font-bold block mb-0.5">
                        Apri in Safari
                      </strong>
                      Apri il link in <strong>Safari</strong> (puoi usare il pulsante "Apri a Schermo Intero" o "Copia Link" qui sotto).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </div>
                    <div className="text-xs text-gray-700">
                      <strong className="text-gray-900 font-bold flex items-center gap-1 mb-0.5">
                        Tasto Condividi <Share2 className="w-3.5 h-3.5 text-emerald-700 inline" />
                      </strong>
                      In basso al centro in Safari, tocca il pulsante <strong>Condividi</strong> (il quadratino con la freccia verso l'alto 📤).
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </div>
                    <div className="text-xs text-gray-700">
                      <strong className="text-gray-900 font-bold flex items-center gap-1 mb-0.5">
                        Aggiungi alla Home <PlusSquare className="w-3.5 h-3.5 text-emerald-700 inline" />
                      </strong>
                      Scorri il menu e tocca <strong>"Aggiungi alla schermata Home"</strong>, poi premi <strong>"Aggiungi"</strong> in alto a destra.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AZIONI DI SUPPORTO: Apri a schermo intero & Copia Link */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
              <button
                type="button"
                onClick={handleOpenFullscreen}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Apri a Schermo Intero nel Browser
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 active:scale-[0.99] text-gray-700 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Link copiato negli appunti!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gray-500" />
                    <span>Copia Link dell'App</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer vantaggi PWA */}
            <div className="mt-3 text-center text-[11px] text-gray-500">
              ✓ Icona ufficiale Irpiniambiente • Funziona offline • Dati salvati al 100%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
