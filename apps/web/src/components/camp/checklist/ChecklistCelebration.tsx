'use client';

import { motion } from 'framer-motion';
import ConfettiEffect from '../shared/ConfettiEffect';

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function ChecklistCelebration() {
  return (
    <>
      <ConfettiEffect />
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="flex flex-col items-center text-center"
        >
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            className="text-6xl"
          >
            🎉
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: easeOut }}
          >
            <p className="mt-4 text-[22px] font-bold text-gray-900">모두 완료했어요!</p>
            <p className="mt-1 text-[14px] text-gray-500">캠프 준비 완료! 🏕️</p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
