import React from 'react';

interface IrpiniambienteLogoProps {
  className?: string;
  maxHeight?: number | string;
  showSubtitle?: boolean;
}

/**
 * Irpiniambiente official logo component.
 * - Always sits on a strictly pure white background.
 * - Retains original aspect ratio without distortion.
 * - Automatically adapts to the available container size.
 */
export const IrpiniambienteLogo: React.FC<IrpiniambienteLogoProps> = ({
  className = 'w-full max-w-[280px]',
  maxHeight = 64,
  showSubtitle = false,
}) => {
  return (
    <div
      id="irpiniambiente-logo-container"
      className={`bg-white rounded-xl p-2.5 flex flex-col items-center justify-center shadow-xs border border-gray-100 ${className}`}
      style={{ backgroundColor: '#ffffff' }}
    >
      <div
        className="w-full flex items-center justify-center overflow-hidden"
        style={{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }}
      >
        <svg
          viewBox="0 0 590 135"
          className="w-full h-auto object-contain select-none"
          style={{ maxHeight: '100%', maxWidth: '100%' }}
          role="img"
          aria-label="Logo Irpiniambiente S.p.A."
        >
          <g transform="translate(10, 10)">
            {/* "Irpini" Text */}
            <text
              x="5"
              y="84"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="78"
              fontWeight="400"
              fill="#2E3330"
              letterSpacing="-1.5px"
            >
              Irpini
            </text>

            {/* Tree symbol / 'a' character */}
            <g transform="translate(196, 6)">
              {/* Green Circle */}
              <circle cx="48" cy="48" r="46" fill="#2BA835" />

              {/* Stem / Trunk */}
              <path d="M 46 84 L 46 102 L 49 102 L 49 84 Z" fill="#2BA835" />

              {/* Slanted White Dashes (Canopy Foliage) */}
              <line x1="49" y1="21" x2="43" y2="31" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="43" y1="36" x2="37" y2="46" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="53" y1="36" x2="47" y2="46" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="38" y1="51" x2="32" y2="61" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="48" y1="51" x2="42" y2="61" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="58" y1="51" x2="52" y2="61" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="33" y1="66" x2="27" y2="76" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="43" y1="66" x2="37" y2="76" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="53" y1="66" x2="47" y2="76" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
              <line x1="63" y1="66" x2="57" y2="76" stroke="#ffffff" strokeWidth="4.8" strokeLinecap="round" />
            </g>

            {/* "mbiente" Text */}
            <text
              x="302"
              y="84"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="78"
              fontWeight="400"
              fill="#2E3330"
              letterSpacing="-1.5px"
            >
              mbiente
            </text>

            {/* "s.p.a." Text */}
            <text
              x="504"
              y="84"
              fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              fontSize="28"
              fontWeight="400"
              fill="#4B514D"
              letterSpacing="0.5px"
            >
              s.p.a.
            </text>
          </g>
        </svg>
      </div>
      {showSubtitle && (
        <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase mt-1">
          Gestione Presenze & Straordinari
        </span>
      )}
    </div>
  );
};
