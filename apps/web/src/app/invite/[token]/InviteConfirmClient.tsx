'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import type { CampSummary } from '@campus/shared';
import { formatDateShort, calcNights } from '@campus/shared';
import { acceptCampInvite } from '@/actions/camp';
import Avatar from '@/components/camp/shared/Avatar';

interface InviteConfirmClientProps {
  token: string;
  camp: CampSummary;
  user: { nickname: string; profileImage: string | null };
}

export default function InviteConfirmClient({ token, camp, user }: InviteConfirmClientProps) {
  const router = useRouter();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);
    try {
      const { campId } = await acceptCampInvite(token);
      router.push(`/camp/${campId}/checklist`);
    } catch {
      setError('참가에 실패했습니다. 다시 시도해 주세요.');
      setLoading(false);
    }
  }

  async function handleSwitchAccount() {
    await signOut({ redirectUrl: `/sign-in?redirect_url=/invite/${token}` });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F2F2F0] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-[36px] leading-none">🏕️</p>
          <h1 className="mt-4 text-[22px] font-bold text-gray-900">캠프 초대</h1>
          <p className="mt-1.5 text-[14px] text-gray-500">아래 캠프에 참가하시겠어요?</p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="px-5 py-5">
            <p className="text-[20px] font-bold text-gray-900">{camp.title}</p>
            {camp.location && (
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-gray-500">
                <svg width="11" height="13" viewBox="0 0 11 13" fill="none" className="shrink-0 text-gray-400" aria-hidden>
                  <path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 8.5 4.5 8.5s4.5-5.125 4.5-8.5C10 2.015 7.985 0 5.5 0zm0 6.5a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" />
                </svg>
                {camp.location}
              </p>
            )}
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-gray-400">
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

        <div className="mt-3 overflow-hidden rounded-2xl bg-white px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <p className="mb-2.5 text-[11px] font-medium text-gray-400">참가할 계정</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar nickname={user.nickname} profileImage={user.profileImage} size={32} />
              <span className="text-[14px] font-medium text-gray-800">{user.nickname}</span>
            </div>
            <button
              type="button"
              onClick={handleSwitchAccount}
              className="text-[12px] text-gray-400 transition-colors hover:text-gray-600"
            >
              다른 계정으로 →
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-center text-[13px] text-red-500">{error}</p>
        )}

        <button
          type="button"
          onClick={handleAccept}
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-primary-600 py-4 text-[16px] font-bold text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)] transition-colors disabled:opacity-60 hover:bg-primary-700 active:bg-primary-800"
        >
          {loading ? '참가 중...' : '참가하기'}
        </button>
      </div>
    </div>
  );
}
