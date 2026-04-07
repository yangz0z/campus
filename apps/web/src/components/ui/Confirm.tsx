'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ── Types ──

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// ── Context ──

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

// ── Provider ──

interface InternalState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InternalState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    state?.resolve(result);
    setState(null);
  }, [state]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state && <ConfirmModal state={state} onClose={handleClose} />}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

// ── Component ──

function ConfirmModal({
  state,
  onClose,
}: {
  state: InternalState;
  onClose: (result: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-6"
      onClick={() => onClose(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-[300px] overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pb-2 pt-6">
          <h3 className="text-[16px] font-bold text-gray-900">{state.title}</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-gray-500">{state.description}</p>
        </div>
        <div className="flex gap-2 px-5 pb-5 pt-4">
          <button
            onClick={() => onClose(false)}
            className="flex-1 rounded-xl bg-gray-100 py-2.5 text-[14px] font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            {state.cancelLabel ?? '취소'}
          </button>
          <button
            onClick={() => onClose(true)}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-red-600"
          >
            {state.confirmLabel ?? '삭제'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
