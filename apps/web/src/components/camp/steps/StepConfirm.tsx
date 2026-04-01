'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDateWithDay, calcNights } from '@campus/shared';
import ChatBubble from '../shared/ChatBubble';
import TypewriterText from '../shared/TypewriterText';
import SeasonBadge from '../shared/SeasonBadge';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface CampFormData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  season: string | null;
}

interface StepConfirmProps {
  formData: CampFormData;
  onConfirm: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}


export default function StepConfirm({ formData, onConfirm, isSubmitting, error }: StepConfirmProps) {
  const [showCard, setShowCard] = useState(false);

  const handleTypingDone = useCallback(() => setShowCard(true), []);

  return (
    <div>
      <ChatBubble variant="question">
        <TypewriterText
          text="준비된 캠프를 확인해 주세요!"
          onComplete={handleTypingDone}
        />
      </ChatBubble>

      {showCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="mt-6 space-y-5 px-2"
        >
          <div className="rounded-2xl border border-earth-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900">{formData.title}</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📍</span>
                <span>{formData.location || '장소 미정'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📅</span>
                <span>
                  {formatDateWithDay(formData.startDate)} ~ {formatDateWithDay(formData.endDate)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>🌙</span>
                <span>{calcNights(formData.startDate, formData.endDate)}</span>
              </div>

              {formData.season && (
                <div className="pt-1">
                  <SeasonBadge seasonId={formData.season} />
                </div>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.2 }}
          >
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-primary-600 py-4 text-lg font-bold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? '만드는 중...' : '캠프 만들기'}
            </button>
            {error && (
              <p className="mt-3 text-center text-sm text-red-500">{error}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
