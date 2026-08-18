'use client';

import React from 'react';

interface PixelProgressProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'emerald' | 'gold' | 'amber' | 'cyan';
  height?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export const PixelProgress: React.FC<PixelProgressProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  color = 'emerald',
  height = 'md',
  showPercentage = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const barColor = {
    emerald: 'bg-gradient-to-r from-[#4a8030] to-[#7ec850]',
    gold: 'bg-gradient-to-r from-[#c4a030] to-[#f0d060]',
    amber: 'bg-gradient-to-r from-[#b45309] to-[#f59e0b]',
    cyan: 'bg-gradient-to-r from-[#164e63] to-[#06b6d4]',
  }[color];

  const heightClass = {
    sm: 'h-2.5',
    md: 'h-4',
    lg: 'h-6',
  }[height];

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs font-pixel">
          <span className="text-[#a08060] flex items-center gap-1.5 truncate text-[10px]">
            {label}
            {sublabel && <span className="text-[#c4956a] font-sans text-[11px] font-normal">({sublabel})</span>}
          </span>
          {showPercentage && (
            <span className="text-[#f0d060] font-bold shrink-0 text-[10px]">
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Outer RPG Wood Container */}
      <div className="w-full bg-[#170f07] p-1 border-2 border-[#5a3a18] rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
        <div className={`w-full bg-[#23160c] rounded overflow-hidden relative ${heightClass}`}>
          {/* Fill Bar */}
          <div
            className={`h-full transition-all duration-500 ease-out border-r border-[#f0d060] ${barColor} relative`}
            style={{ width: `${percentage}%` }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, transparent, transparent 6px, #000 6px, #000 12px)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
