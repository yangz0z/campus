'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { formatDateShort, type Season } from '@campus/shared';
import ChatBubble from './shared/ChatBubble';
import ConfettiEffect from './shared/ConfettiEffect';
import StepName from './steps/StepName';
import StepDate from './steps/StepDate';
import StepConfirm from './steps/StepConfirm';
import { createCamp } from '@/lib/api/camps';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campId, setCampId] = useState<string | null>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(currentStep);
  const router = useRouter();
  const { getToken } = useAuth();

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

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('로그인이 필요합니다.');
      const result = await createCamp(token, {
        title: formData.title,
        location: formData.location || null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        season: formData.season as Season,
      });
      setCampId(result.campId);
      setIsCompleted(true);
      setTimeout(() => {
        router.push(`/camp/${result.campId}/checklist`);
      }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : '캠프 생성에 실패했어요. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
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
              <StepConfirm formData={formData} onConfirm={handleConfirm} isSubmitting={isSubmitting} error={error} />
            </motion.div>
          )}

          {isCompleted && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="flex flex-col items-center py-16 text-center"
            >
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                className="text-6xl"
              >
                🎉
              </motion.p>
              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                캠프가 만들어졌어요!
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                체크리스트로 이동할게요...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isCompleted && <ConfettiEffect />}
    </section>
  );
}
