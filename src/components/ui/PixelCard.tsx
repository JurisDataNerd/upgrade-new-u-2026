'use client';

import React from 'react';

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'elevated' | 'emerald' | 'wood';
  borderSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PixelCard: React.FC<PixelCardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantClass = {
    default: 'sdv-card text-[#f0e0c0]',
    gold: 'sdv-card-gold text-[#f0e0c0]',
    elevated: 'sdv-card-elevated text-[#f0e0c0]',
    emerald:
      'bg-[#1e3321] border-2 border-[#7ec850] rounded-xl shadow-[inset_0_0_0_1px_#355e3b,0_8px_24px_rgba(0,0,0,0.6)] text-[#e2f5e5]',
    wood: 'bg-[#2d1b0e] border-3 border-[#8b5a2b] rounded-lg shadow-[inset_0_0_0_2px_#c4956a,0_8px_20px_rgba(0,0,0,0.5)] text-[#f0e0c0]',
  }[variant];

  return (
    <div className={`relative ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};
