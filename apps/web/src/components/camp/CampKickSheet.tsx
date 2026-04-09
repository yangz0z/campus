'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { kickMember } from '@/actions/camp';
import { useAction } from '@/hooks/useAction';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface CampKickSheetProps {
  campId: string;
  member: { memberId: string; nickname: string };
  onClose: () => void;
  onKicked: () => void;
}

export default function CampKickSheet({ campId, member, onClose, onKicked }: CampKickSheetProps) {
  const [isKicking, setIsKicking] = useState(false);
  const action = useAction();

  async function handleKick() {
    setIsKicking(true);
    const result = await action(() => kickMember(campId, member.memberId), '멤버 내보내기에 실패했어요.');
    if (result.ok) {
      onKicked();
    } else {
      setIsKicking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !isKicking && onClose()}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="relative mx-auto w-full max-w-sm rounded-t-2xl bg-white shadow-xl"
      >
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pb-8 pt-5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-red-500">
              <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-[17px] font-bold text-gray-900">{member.nickname}님을 내보낼까요?</p>
          <p className="mt-1 text-[14px] text-gray-500">
            내보내면 체크리스트와 담당 항목에서 제외돼요.
          </p>

          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[15px] font-semibold text-gray-800">{member.nickname}</p>
          </div>

          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isKicking}
              className="flex-1 rounded-xl bg-gray-100 py-3.5 text-[15px] font-semibold text-gray-700 transition-colors hover:bg-gray-200 active:bg-gray-300 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleKick}
              disabled={isKicking}
              className="flex-1 rounded-xl bg-red-500 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-red-600 active:bg-red-700 disabled:opacity-60"
            >
              {isKicking ? '내보내는 중...' : '내보내기'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
