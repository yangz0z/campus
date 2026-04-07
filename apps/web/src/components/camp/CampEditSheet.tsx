'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDateShort, type Season, type CampSummary } from '@campus/shared';
import ChatBubble from './shared/ChatBubble';
import StepName from './steps/StepName';
import StepDate from './steps/StepDate';
import StepConfirm from './steps/StepConfirm';
import { SEASONS } from '@/constants/home';
import { updateCamp } from '@/actions/camp';
import { useAction } from '@/hooks/useAction';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface CampFormData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  season: string | null;
}

interface CampEditSheetProps {
  camp: CampSummary;
  onClose: () => void;
  onUpdated: (updated: CampSummary) => void;
}

export default function CampEditSheet({ camp, onClose, onUpdated }: CampEditSheetProps) {
  const [currentStep, setCurrentStep] = useState(2); // 확인 단계부터 시작
  const [formData, setFormData] = useState<CampFormData>({
    title: camp.title,
    location: camp.location ?? '',
    startDate: camp.startDate,
    endDate: camp.endDate,
    season: camp.season,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const action = useAction();

  const activeRef = useRef<HTMLDivElement>(null);

  function goToStep(step: number) {
    setCurrentStep(step);
    setTimeout(() => activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleNameNext(title: string, location: string) {
    setFormData((prev) => ({ ...prev, title, location }));
    goToStep(2);
  }

  function handleDateNext(startDate: string, endDate: string, season: string) {
    setFormData((prev) => ({ ...prev, startDate, endDate, season }));
    goToStep(2);
  }

  async function handleConfirm() {
    if (!formData.season) return;
    setIsSubmitting(true);
    const result = await action(
      () => updateCamp(camp.id, {
        title: formData.title,
        location: formData.location || null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        season: formData.season as Season,
      }),
      '수정에 실패했어요. 다시 시도해 주세요.',
    );
    if (result.ok) {
      onUpdated({
        ...camp,
        title: formData.title,
        location: formData.location || null,
        startDate: formData.startDate,
        endDate: formData.endDate,
        season: formData.season as Season,
      });
    }
    setIsSubmitting(false);
  }

  return (
    <div className="camp-edit-sheet fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Sheet panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="camp-edit-sheet-panel relative mx-auto w-full max-w-sm rounded-t-2xl bg-[#F2F2F0] shadow-xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-[17px] font-bold text-gray-900">캠프 수정</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="camp-edit-sheet-content max-h-[78vh] overflow-y-auto px-4 pb-10 pt-2">
          {/* 완료된 단계 1 — 이름/장소 */}
          {currentStep > 0 && (
            <div className="mb-2">
              <ChatBubble variant="question" faded>
                어떤 캠프를 계획하고 있나요?
              </ChatBubble>
              <button type="button" onClick={() => goToStep(0)} className="w-full text-left">
                <ChatBubble variant="answer" faded interactive>
                  <p className="font-medium">{formData.title}</p>
                  {formData.location && (
                    <p className="mt-0.5 text-sm opacity-70">📍 {formData.location}</p>
                  )}
                </ChatBubble>
              </button>
            </div>
          )}

          {/* 완료된 단계 2 — 날짜/계절 */}
          {currentStep > 1 && (
            <div className="mb-2">
              <ChatBubble variant="question" faded>
                언제부터 언제까지 가나요?
              </ChatBubble>
              <button type="button" onClick={() => goToStep(1)} className="w-full text-left">
                <ChatBubble variant="answer" faded interactive>
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
              </button>
            </div>
          )}

          {/* 활성 단계 */}
          <div ref={activeRef}>
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step-name"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: easeOut }}
                >
                  <StepName
                    onNext={handleNameNext}
                    initialTitle={formData.title}
                    initialLocation={formData.location}
                  />
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step-date"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: easeOut }}
                >
                  <StepDate
                    onNext={handleDateNext}
                    initialStartDate={formData.startDate}
                    initialEndDate={formData.endDate}
                    initialSeason={formData.season ?? undefined}
                  />
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step-confirm"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: easeOut }}
                >
                  <StepConfirm
                    formData={formData}
                    onConfirm={handleConfirm}
                    isSubmitting={isSubmitting}
                    skipIntro
                    submitLabel="수정 완료"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
