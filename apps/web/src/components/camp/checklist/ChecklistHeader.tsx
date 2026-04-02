'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CampSummary } from '@campus/shared';
import { formatDateShort, calcNights } from '@campus/shared';
import { createCampInvite } from '@/actions/camp';

interface ChecklistHeaderProps {
  campId: string;
  camp: CampSummary | null;
  showCompleted: boolean;
  onToggleCompleted: () => void;
}

export default function ChecklistHeader({ campId, camp, showCompleted, onToggleCompleted }: ChecklistHeaderProps) {
  const [showMeta, setShowMeta] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copying' | 'copied'>('idle');

  async function handleCopyInviteLink() {
    if (copyState !== 'idle') return;
    setCopyState('copying');
    try {
      const { token } = await createCampInvite(campId);
      const url = `${window.location.origin}/invite/${token}`;
      await navigator.clipboard.writeText(url);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('idle');
    }
  }

  return (
    <header className="checklist-header bg-[#F2F2F0] px-5 pb-5 pt-5">
      <div className="checklist-header-inner mx-auto max-w-sm">
        <div className="flex items-center justify-between">
          <Link
            href="/mypage"
            className="checklist-back inline-flex items-center gap-1 text-[13px] text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg width="6" height="11" viewBox="0 0 6 11" fill="none">
              <path d="M5.5 1L1 5.5L5.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            내 캠프
          </Link>

          <button
            type="button"
            onClick={handleCopyInviteLink}
            disabled={copyState === 'copying'}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all disabled:opacity-50 ${
              copyState === 'copied'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-gray-900 text-white hover:bg-gray-700 active:bg-gray-800'
            }`}
          >
            {copyState === 'copied' ? (
              <>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <path d="M2 7.5L5.5 11L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                복사됨
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <path d="M8 1H2a1 1 0 00-1 1v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="4" y="4" width="9" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                초대 링크 복사
              </>
            )}
          </button>
        </div>

        {camp ? (
          <div className="checklist-camp-info mt-3">
            <div className="checklist-title-row flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowMeta((v) => !v)}
                className="checklist-title-toggle group flex min-w-0 items-center gap-2 text-left"
              >
                <h1 className="checklist-title text-[24px] font-bold leading-tight text-gray-900 group-hover:text-gray-700">
                  {camp.title}
                </h1>
                <svg
                  width="14" height="14" viewBox="0 0 14 14" fill="none"
                  className={`mt-2 shrink-0 text-gray-300 transition-transform duration-200 group-hover:text-gray-400 ${showMeta ? 'rotate-180' : ''}`}
                >
                  <path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="mt-1.5 flex shrink-0 items-center">
                <button
                  type="button"
                  onClick={onToggleCompleted}
                  className={`checklist-completed-toggle flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors  ${
                    showCompleted ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" className="shrink-0">
                    {showCompleted ? (
                      <path d="M2 7.5L5.5 11L12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <>
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M4.5 7L6.5 9L9.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </>
                    )}
                  </svg>
                  {showCompleted ? '숨기기' : '완료 보기'}
                </button>
              </div>
            </div>

            <div className={`checklist-meta overflow-hidden transition-all duration-200 ease-in-out ${showMeta ? 'mt-2 max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="checklist-meta-inner space-y-1">
                {camp.location && (
                  <p className="checklist-location flex items-center gap-1.5 text-[13px] text-gray-500">
                    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" className="shrink-0 text-gray-400" aria-hidden>
                      <path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 8.5 4.5 8.5s4.5-5.125 4.5-8.5C10 2.015 7.985 0 5.5 0zm0 6.5a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" />
                    </svg>
                    {camp.location}
                  </p>
                )}
                <p className="checklist-dates flex items-center gap-1.5 text-[13px] text-gray-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0" aria-hidden>
                    <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M1 5h10" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  {formatDateShort(camp.startDate)} – {formatDateShort(camp.endDate)}
                  <span aria-hidden className="text-gray-300">·</span>
                  {calcNights(camp.startDate, camp.endDate)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="checklist-camp-skeleton mt-3">
            <div className="h-7 w-2/5 animate-shimmer rounded-lg" />
          </div>
        )}
      </div>
    </header>
  );
}
