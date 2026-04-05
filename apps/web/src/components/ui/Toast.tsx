'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ── Context ──

interface ToastContextValue {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ── Provider ──

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  const toast = useCallback((msg: string) => {
    setMessage(msg);
    setKey((k) => k + 1); // 같은 메시지도 재표시
  }, []);

  const handleClose = useCallback(() => setMessage(null), []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <AnimatePresence>
        {message && <ToastBubble key={key} message={message} onClose={handleClose} />}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

// ── Component ──

function ToastBubble({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      onAnimationComplete={(def) => {
        // exit 애니메이션이 아닌 enter 완료 후 타이머 시작
        if (typeof def === 'object' && 'opacity' in def && def.opacity === 1) {
          setTimeout(onClose, 2500);
        }
      }}
      className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-gray-900 px-5 py-3 text-[14px] font-medium text-white shadow-lg"
    >
      {message}
    </motion.div>
  );
}
