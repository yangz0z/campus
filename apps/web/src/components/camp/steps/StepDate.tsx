'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dayjs, detectSeason, calcNights, formatDateWithDay } from '@campus/shared';
import ChatBubble from '../shared/ChatBubble';
import TypewriterText from '../shared/TypewriterText';
import SeasonBadge from '../shared/SeasonBadge';
import DateRangeCalendar from '../shared/DateRangeCalendar';
import { SEASONS } from '@/constants/home';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface StepDateProps {
  onNext: (startDate: string, endDate: string, season: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  initialSeason?: string;
}

export default function StepDate({ onNext, initialStartDate, initialEndDate, initialSeason }: StepDateProps) {
  const [startDate, setStartDate] = useState(initialStartDate ?? '');
  const [endDate, setEndDate] = useState(initialEndDate ?? '');
  const [season, setSeason] = useState<string | null>(initialSeason ?? null);
  const [showInput, setShowInput] = useState(!!initialStartDate);

  const handleTypingDone = useCallback(() => setShowInput(true), []);

  useEffect(() => {
    if (startDate) {
      setSeason(detectSeason(startDate));
    }
  }, [startDate]);

  const isValid = startDate && endDate && endDate >= startDate && season;

  const handleSubmit = () => {
    if (!isValid || !season) return;
    onNext(startDate, endDate, season);
  };

  function handleDateChange(start: string, end: string) {
    setStartDate(start);
    setEndDate(end);
  }

  return (
    <div className="step-date">
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
          className="step-date-body mt-6 space-y-4 px-2"
        >
          {/* 날짜 범위 달력 */}
          <DateRangeCalendar
            startDate={startDate}
            endDate={endDate}
            onChange={handleDateChange}
          />

          {/* 선택된 날짜 요약 */}
          {startDate && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="step-date-summary rounded-xl bg-primary-50 px-4 py-3 text-center"
            >
              <p className="step-date-range text-[14px] font-medium text-primary-700">
                {formatDateWithDay(startDate)}
                {endDate && (
                  <>
                    <span className="mx-2 text-primary-300">→</span>
                    {formatDateWithDay(endDate)}
                  </>
                )}
              </p>
              {endDate && (
                <p className="step-date-nights mt-0.5 text-[12px] text-primary-500">
                  {calcNights(startDate, endDate)}
                </p>
              )}
            </motion.div>
          )}

          {/* 계절 선택 */}
          {season && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="step-date-season space-y-2"
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

          {/* 다음 버튼 */}
          {isValid && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pt-1"
            >
              <button
                onClick={handleSubmit}
                className="step-date-submit w-full rounded-xl bg-primary-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
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
