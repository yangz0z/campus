import { Suspense } from 'react';
import Link from 'next/link';
import { getMyCamps } from '@/actions/camp';
import CampListClient from '@/components/camp/CampListClient';
import { ROUTES } from '@/constants/routes';

async function CampListContent() {
  const data = await getMyCamps();
  const camps = data.camps;

  if (camps.length === 0) {
    return (
      <div className="camp-empty rounded-2xl bg-white px-5 py-16 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <p className="camp-empty-icon text-[40px] leading-none">🏕️</p>
        <p className="camp-empty-title mt-5 text-[17px] font-bold text-gray-900">아직 캠프가 없어요</p>
        <p className="camp-empty-desc mt-1.5 text-[14px] text-gray-400">새 캠프를 만들어 캠핑 준비를 시작해 보세요.</p>
      </div>
    );
  }

  return <CampListClient camps={camps} />;
}

function CampListSkeleton() {
  return (
    <div className="camp-list-skeleton overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {[0, 1, 2].map((i) => (
        <div key={i} className="camp-skeleton-item">
          {i !== 0 && <div className="camp-skeleton-divider mx-5 h-px bg-gray-100" />}
          <div className="camp-skeleton-row flex items-center gap-4 px-5 py-4">
            <div className="camp-skeleton-text flex-1 space-y-2">
              <div className="camp-skeleton-name h-[17px] w-2/5 animate-shimmer rounded-md" />
              <div className="camp-skeleton-meta h-3 w-1/3 animate-shimmer rounded-md" />
            </div>
            <div className="camp-skeleton-badge h-7 w-14 animate-shimmer rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MypagePage() {
  return (
    <div className="mypage bg-[#F2F2F0]">
      <header className="mypage-header bg-[#F2F2F0] px-5 pb-3 pt-10">
        <div className="mypage-header-inner mx-auto flex max-w-sm items-center justify-between">
          <h1 className="mypage-title text-[22px] font-bold text-gray-900">내 캠프</h1>
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.TEMPLATE}
              prefetch={true}
              className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-primary-700 transition-colors duration-100 hover:bg-primary-50 active:bg-primary-100"
            >
              <span className="text-sm leading-none">📋</span>
              템플릿 관리
            </Link>
            <Link
              href={ROUTES.CAMP.NEW}
              className="new-camp-btn flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)] transition-colors duration-100 hover:bg-primary-700 active:bg-primary-800"
            >
              <span className="new-camp-btn-icon text-sm leading-none">🏕️</span>
              새 캠프 만들기
            </Link>
          </div>
        </div>
      </header>

      <main className="mypage-content mx-auto max-w-sm space-y-3 px-4 pt-3">
        <Suspense fallback={<CampListSkeleton />}>
          <CampListContent />
        </Suspense>
      </main>
    </div>
  );
}
