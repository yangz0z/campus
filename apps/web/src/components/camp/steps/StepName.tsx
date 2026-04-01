'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatBubble from '../shared/ChatBubble';
import TypewriterText from '../shared/TypewriterText';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface StepNameProps {
  onNext: (title: string, location: string) => void;
  initialTitle?: string;
  initialLocation?: string;
}

export default function StepName({ onNext, initialTitle, initialLocation }: StepNameProps) {
  const [title, setTitle] = useState(initialTitle ?? '');
  const [location, setLocation] = useState(initialLocation ?? '');
  const [showInput, setShowInput] = useState(!!initialTitle);
  const locationRef = useRef<HTMLInputElement>(null);

  const handleTypingDone = useCallback(() => setShowInput(true), []);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onNext(title.trim(), location.trim());
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      locationRef.current?.focus();
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      <ChatBubble variant="question">
        <TypewriterText
          text="어떤 캠프를 계획하고 있나요?"
          onComplete={handleTypingDone}
        />
      </ChatBubble>

      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="mt-6 space-y-4 px-2"
        >
          <div>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              placeholder="캠프 이름을 입력하세요"
              className="w-full border-b-2 border-earth-200 bg-transparent pb-2 text-xl font-semibold text-gray-900 placeholder:text-gray-300 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📍</span>
            <input
              ref={locationRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleLocationKeyDown}
              placeholder="장소 (선택사항)"
              className="w-full border-b border-earth-200 bg-transparent pb-1.5 text-base text-gray-700 placeholder:text-gray-300 focus:border-primary-400 focus:outline-none"
            />
          </div>

          {title.trim() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pt-2"
            >
              <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
              >
                다음
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
