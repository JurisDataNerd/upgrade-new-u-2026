'use client';

import React from 'react';
import {
  Sparkle,
  GraduationCap,
  Heartbeat,
  ShieldCheck,
  ShieldPlus,
  UsersThree,
  Compass,
  Handshake,
  Books,
  Flask,
  Plant,
  RocketLaunch,
  Cpu,
  Scales,
  Prohibit,
  FlagBanner,
  Crown,
  Trophy,
  Article,
} from '@phosphor-icons/react';

interface StampIconProps {
  name: string;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  className?: string;
}

export const StampIcon: React.FC<StampIconProps> = ({
  name,
  size = 24,
  weight = 'fill',
  className = '',
}) => {
  switch (name) {
    case 'Sparkle':
    case 'sparkle':
      return <Sparkle size={size} weight={weight} className={className} />;
    case 'GraduationCap':
    case 'graduation_cap':
      return <GraduationCap size={size} weight={weight} className={className} />;
    case 'Heartbeat':
    case 'stethoscope':
      return <Heartbeat size={size} weight={weight} className={className} />;
    case 'ShieldPlus':
    case 'shield_plus':
      return <ShieldPlus size={size} weight={weight} className={className} />;
    case 'UsersThree':
    case 'users_three':
      return <UsersThree size={size} weight={weight} className={className} />;
    case 'Compass':
    case 'compass':
      return <Compass size={size} weight={weight} className={className} />;
    case 'ShieldCheck':
    case 'shield_check':
      return <ShieldCheck size={size} weight={weight} className={className} />;
    case 'Handshake':
    case 'handshake':
      return <Handshake size={size} weight={weight} className={className} />;
    case 'Books':
    case 'books':
      return <Books size={size} weight={weight} className={className} />;
    case 'Article':
    case 'pen_nib':
    case 'PenNib':
      return <Article size={size} weight={weight} className={className} />;
    case 'Flask':
    case 'flask':
      return <Flask size={size} weight={weight} className={className} />;
    case 'Plant':
    case 'leaf':
    case 'Leaf':
      return <Plant size={size} weight={weight} className={className} />;
    case 'RocketLaunch':
    case 'rocket_launch':
      return <RocketLaunch size={size} weight={weight} className={className} />;
    case 'Cpu':
    case 'cpu':
      return <Cpu size={size} weight={weight} className={className} />;
    case 'Scales':
    case 'scales':
      return <Scales size={size} weight={weight} className={className} />;
    case 'Prohibit':
    case 'prohibit':
      return <Prohibit size={size} weight={weight} className={className} />;
    case 'FlagBanner':
    case 'flag_banner':
      return <FlagBanner size={size} weight={weight} className={className} />;
    case 'Crown':
    case 'CrownSimple':
    case 'crown':
      return <Crown size={size} weight={weight} className={className} />;
    case 'Trophy':
    case 'trophy':
      return <Trophy size={size} weight={weight} className={className} />;
    default:
      return <Sparkle size={size} weight={weight} className={className} />;
  }
};
