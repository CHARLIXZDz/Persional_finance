import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Coins,
  Gift,
  HelpCircle,
  Coffee,
  Wallet
} from 'lucide-react';

const ICON_MAP = {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Coins,
  Gift,
  Coffee,
  Wallet,
};

export const CategoryIcon = ({ iconName, className = 'w-5 h-5' }) => {
  const IconComponent = ICON_MAP[iconName] || HelpCircle;
  return <IconComponent className={className} />;
};

export default CategoryIcon;
