'use client';

import { motion } from 'framer-motion';
import { SEASONS } from '@/constants/home';

interface SeasonBadgeProps {
  seasonId: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function SeasonBadge({ seasonId, selected = true, onClick }: SeasonBadgeProps) {
  const season = SEASONS.find((s) => s.id === seasonId);
  if (!season) return null;

  return (
    <motion.button
      type="button"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
        selected
          ? season.color
          : 'border-earth-200 bg-earth-50 text-gray-400'
      }`}
    >
      <span className="text-base">{season.icon}</span>
      {season.name}
    </motion.button>
  );
}
