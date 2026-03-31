'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { detectSeason, getNextDay } from '@campus/shared';
import ChatBubble from '../shared/ChatBubble';
import TypewriterText from '../shared/TypewriterText';
import SeasonBadge from '../shared/SeasonBadge';
import { SEASONS } from '@/constants/home';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface StepDateProps {
  onNext: (startDate: string, endDate: string, season: string) => void;
}

export default function StepDate({ onNext }: StepDateProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [season, setSeason] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState('');

  const handleTypingDone = useCallback(() => setShowInput(true), []);

  useEffect(() => {
    if (startDate) {
      setSeason(detectSeason(startDate));
      setEndDate(getNextDay(startDate));
    }
  }, [startDate]);

  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setError('종료일은 시작일 이후여야 해요');
    } else {
      setError('');
    }
  }, [startDate, endDate]);

  const isValid = startDate && endDate && endDate >= startDate && season;

  const handleSubmit = () => {
    if (!isValid || !season) return;
    onNext(startDate, endDate, season);
  };

  return (
    <div>
      <ChatBubble variant="question">
        <TypewriterText
          text="언제부터 언제까지 가나요?"
          onComplete={handleTypingDone}
        />
      </ChatBubble>

      {showInput && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="mt-6 space-y-5 px-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                시작일
              </label>
              <input
                autoFocus
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                종료일
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-earth-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500"
            >
              {error}
            </motion.p>
          )}

          {season && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-gray-400">계절</p>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((s) => (
                  <SeasonBadge
                    key={s.id}
                    seasonId={s.id}
                    selected={season === s.id}
                    onClick={() => setSeason(s.id)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {isValid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pt-1"
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
