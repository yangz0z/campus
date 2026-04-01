'use client';

import { motion } from 'framer-motion';

interface ChatBubbleProps {
  variant: 'question' | 'answer';
  faded?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function ChatBubble({ variant, faded = false, interactive = false, children }: ChatBubbleProps) {
  const isQuestion = variant === 'question';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: faded ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className={`mb-4 flex ${isQuestion ? 'justify-start' : 'justify-end'}`}
    >
      {isQuestion && (
        <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg">
          🏕️
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${
          isQuestion
            ? 'rounded-tl-md bg-white border border-earth-200 text-gray-800 shadow-sm'
            : 'rounded-tr-md bg-primary-50 text-primary-800'
        } ${interactive ? 'cursor-pointer transition-opacity hover:opacity-80 active:opacity-60' : ''}`}
      >
        {children}
        {interactive && (
          <span className="chat-bubble-edit-hint ml-2 text-xs text-primary-400">수정</span>
        )}
      </div>
    </motion.div>
  );
}
