'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDateShort } from '@campus/shared';
import ChatBubble from './shared/ChatBubble';
import ConfettiEffect from './shared/ConfettiEffect';
import SeasonBadge from './shared/SeasonBadge';
import StepName from './steps/StepName';
import StepDate from './steps/StepDate';
import StepConfirm from './steps/StepConfirm';
import { SEASONS } from '@/constants/home';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface CampFormData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  season: string | null;
}

export default function CampWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CampFormData>({
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    season: null,
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(currentStep);
  const router = useRouter();

  useEffect(() => {
    if (prevStepRef.current === currentStep && !isCompleted) return;
    prevStepRef.current = currentStep;
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep, isCompleted]);

  const handleCancel = useCallback(() => {
    router.push('/mypage');
  }, [router]);

  const handleNameNext = (title: string, location: string) => {
    setFormData((prev) => ({ ...prev, title, location }));
    setCurrentStep(1);
  };

  const handleDateNext = (startDate: string, endDate: string, season: string) => {
    setFormData((prev) => ({ ...prev, startDate, endDate, season }));
    setCurrentStep(2);
  };

  const handleConfirm = () => {
    console.log('Camp created:', formData);
    setIsCompleted(true);
  };

  return (
    <section className="mx-auto max-w-screen-sm px-4 pb-20 pt-6">
      {!isCompleted && (
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            취소
          </button>
          <span className="text-xs text-gray-300">
            {currentStep + 1} / 3
          </span>
        </div>
      )}

      {/* Completed step 1 */}
      {currentStep > 0 && (
        <div className="mb-2">
          <ChatBubble variant="question" faded>
            어떤 캠프를 계획하고 있나요?
          </ChatBubble>
          <ChatBubble variant="answer" faded>
            <p className="font-medium">{formData.title}</p>
            {formData.location && (
              <p className="mt-0.5 text-sm opacity-70">📍 {formData.location}</p>
            )}
          </ChatBubble>
        </div>
      )}

      {/* Completed step 2 */}
      {currentStep > 1 && (
        <div className="mb-2">
          <ChatBubble variant="question" faded>
            언제부터 언제까지 가나요?
          </ChatBubble>
          <ChatBubble variant="answer" faded>
            <p className="font-medium">
              {formatDateShort(formData.startDate)} ~ {formatDateShort(formData.endDate)}
            </p>
            {formData.season && (
              <span className="mt-1 inline-block text-sm">
                {SEASONS.find((s) => s.id === formData.season)?.icon}{' '}
                {SEASONS.find((s) => s.id === formData.season)?.name}
              </span>
            )}
          </ChatBubble>
        </div>
      )}

      {/* Active step */}
      <div ref={activeRef}>
        <AnimatePresence mode="wait">
          {!isCompleted && currentStep === 0 && (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <StepName onNext={handleNameNext} />
            </motion.div>
          )}

          {!isCompleted && currentStep === 1 && (
            <motion.div
              key="step-date"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <StepDate onNext={handleDateNext} />
            </motion.div>
          )}

          {!isCompleted && currentStep === 2 && (
            <motion.div
              key="step-confirm"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <StepConfirm formData={formData} onConfirm={handleConfirm} />
            </motion.div>
          )}

          {isCompleted && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="flex flex-col items-center py-16 text-center"
            >
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
                className="text-6xl"
              >
                🎉
              </motion.p>
              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                캠프가 만들어졌어요!
              </h2>
              <p className="mt-2 text-gray-500">
                이제 체크리스트를 준비해 볼까요?
              </p>
              <div className="mt-3">
                {formData.season && <SeasonBadge seasonId={formData.season} />}
              </div>
              <Link
                href="/mypage"
                className="mt-8 inline-flex rounded-xl bg-primary-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
              >
                내 캠프로 돌아가기
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isCompleted && <ConfettiEffect />}
    </section>
  );
}
