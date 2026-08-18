'use client';

import React from 'react';
import { soundEngine } from '@/lib/sound';
import { useGameStore } from '@/store/useGameStore';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'wood' | 'amber' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  pixelFont?: boolean;
}

export const PixelButton: React.FC<PixelButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  pixelFont = true,
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  const soundEnabled = useGameStore((state) => state.soundEnabled);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (soundEnabled) {
      soundEngine.playClick();
    }
    if (onClick) {
      onClick(e);
    }
  };

  const variantClass = {
    primary: 'rpg-btn-primary',
    wood: 'rpg-btn-wood',
    amber: 'rpg-btn-wood',
    secondary: 'rpg-btn-wood',
    danger: 'rpg-btn-danger',
    ghost:
      'bg-[#3d2b1e]/80 text-[#f0e0c0] border-2 border-[#5a3a18] hover:bg-[#4d3b2e] hover:border-[#f0d060] active:translate-y-0.5 rounded-lg',
  }[variant];

  const sizeClass = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-xs sm:text-sm',
    lg: 'px-6 py-3.5 text-xs sm:text-sm',
  }[size];

  const disabledClass = disabled
    ? 'opacity-40 cursor-not-allowed filter grayscale active:transform-none pointer-events-none'
    : 'cursor-pointer';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2.5 font-bold select-none text-center ${
        pixelFont ? 'font-pixel tracking-wide' : 'font-sans font-semibold'
      } ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
