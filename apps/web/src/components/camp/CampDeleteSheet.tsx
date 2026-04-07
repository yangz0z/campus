'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { CampSummary } from '@campus/shared';
import { formatDateShort, calcNights } from '@campus/shared';
import { deleteCamp } from '@/actions/camp';
import { useAction } from '@/hooks/useAction';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface CampDeleteSheetProps {
  camp: CampSummary;
  onClose: () => void;
  onDeleted: () => void;
}

export default function CampDeleteSheet({ camp, onClose, onDeleted }: CampDeleteSheetProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const action = useAction();

  async function handleDelete() {
    setIsDeleting(true);
    const result = await action(() => deleteCamp(camp.id), '캠프 삭제에 실패했어요.');
    if (result.ok) {
      onDeleted();
    } else {
      setIsDeleting(false);
    }
  }

  return (
    <div className="camp-delete-sheet fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isDeleting && onClose()}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="relative mx-auto w-full max-w-sm rounded-t-2xl bg-white shadow-xl"
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pb-8 pt-5">
          {/* 아이콘 */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none" className="text-red-500">
              <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* 타이틀 */}
          <p className="text-[17px] font-bold text-gray-900">캠프를 삭제할까요?</p>
          <p className="mt-1 text-[14px] text-gray-500">
            삭제하면 체크리스트도 모두 사라지며 복구할 수 없어요.
          </p>

          {/* 캠프 정보 카드 */}
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="truncate text-[15px] font-semibold text-gray-800">{camp.title}</p>
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-gray-500">
              {camp.location && (
                <>
                  <span className="truncate">{camp.location}</span>
                  <span className="shrink-0 text-gray-300">·</span>
                </>
              )}
              <span className="shrink-0">{formatDateShort(camp.startDate)} – {formatDateShort(camp.endDate)}</span>
              <span className="shrink-0 text-gray-300">·</span>
              <span className="shrink-0">{calcNights(camp.startDate, camp.endDate)}</span>
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 rounded-xl bg-gray-100 py-3.5 text-[15px] font-semibold text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 rounded-xl bg-red-500 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:opacity-60"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
