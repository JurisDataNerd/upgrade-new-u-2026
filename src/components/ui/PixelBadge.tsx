'use client';

import React from 'react';

interface PixelBadgeProps {
  variant?: 'emerald' | 'gold' | 'amber' | 'cyan' | 'red' | 'wood' | 'slate';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  pixelFont?: boolean;
}

export const PixelBadge: React.FC<PixelBadgeProps> = ({
  variant = 'emerald',
  size = 'md',
  children,
  icon,
  className = '',
  pixelFont = true,
}) => {
  const variantStyles = {
    emerald: 'bg-[#14230f]/90 text-[#7ec850] border-[#7ec850] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
    gold: 'bg-[#2a1c0d]/90 text-[#f0d060] border-[#f0d060] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
    amber: 'bg-[#2a1c0d]/90 text-[#f0d060] border-[#d4af37] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
    cyan: 'bg-[#0f1f2e]/90 text-[#60a8d8] border-[#60a8d8] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
    red: 'bg-[#2d1210]/90 text-[#ff8080] border-[#d44040] shadow-[0_2px_8px_rgba(0,0,0,0.4)]',
    wood: 'bg-[#281c12] text-[#c4956a] border-[#8b6f4e]',
    slate: 'bg-[#1e1713] text-[#a08060] border-[#5a3a18]',
  }[variant];

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[9px] rounded-full border',
    md: 'px-3 py-1 text-[10px] rounded-full border-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none uppercase font-bold tracking-wider ${
        pixelFont ? 'font-pixel' : 'font-sans'
      } ${variantStyles} ${sizeStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
