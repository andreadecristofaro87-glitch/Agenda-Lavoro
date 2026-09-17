import React from 'react';
import { formatHours } from '../utils/calculations';

interface OvertimeProgressBarProps {
  year: number;
  totalHours: number;
  limit?: number;
  compact?: boolean;
}

export const OvertimeProgressBar: React.FC<OvertimeProgressBarProps> = ({
  year,
  totalHours,
  limit = 150,
  compact = false,
}) => {
  const percentage = Math.min(100, Math.round((totalHours / limit) * 100));
  const isReached = totalHours >= limit;
  const isExceeded = totalHours > limit;
  const remaining = Math.max(0, Math.round((limit - totalHours) * 100) / 100);
  const exceeded = Math.max(0, Math.round((totalHours - limit) * 100) / 100);

  // Status color logic
  let barColor = 'bg-emerald-600';
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (percentage >= 80 && !isReached) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (isReached) {
    barColor = 'bg-red-500';
    badgeColor = 'bg-red-50 text-red-800 border-red-200';
  }

  return (
    <div
      id={`overtime-progress-${year}`}
      className={`rounded-2xl border transition-all ${
        isReached
          ? 'bg-gradient-to-br from-red-50/70 via-white to-amber-50/50 border-red-200/80 shadow-xs'
          : 'bg-white border-gray-200/80 shadow-xs'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700">
            STRAORDINARI {year}
          </h3>
        </div>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
          {isReached ? 'Limite Raggiunto' : `${percentage}% del limite`}
        </span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden my-2.5 p-0.5 border border-gray-200/60">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Numerical Stats */}
      <div className="flex items-baseline justify-between pt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {formatHours(totalHours, true)}
          </span>
          <span className="text-sm font-semibold text-gray-500">/ {limit} ore</span>
        </div>

        <div className="text-right">
          {!isReached ? (
            <div className="text-xs sm:text-sm font-medium text-gray-600">
              Mancano <strong className="text-gray-900 font-bold">{formatHours(remaining, true)} ore</strong>
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-red-700">
                <svg className="w-4 h-4 text-emerald-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                ✓ 150 ORE RAGGIUNTE
              </span>
              {isExceeded && (
                <span className="text-xs font-bold text-red-600 mt-0.5">
                  +{formatHours(exceeded, true)} ore oltre il limite
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
