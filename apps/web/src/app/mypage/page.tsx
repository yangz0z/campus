import Link from 'next/link';
import { getMyCamps } from '@/actions/camp';
import CampListClient from '@/components/camp/CampListClient';

export default async function MypagePage() {
  const data = await getMyCamps();
  const camps = data.camps;

  return (
    <div className="mypage bg-[#F2F2F0]">
      <header className="mypage-header bg-[#F2F2F0] px-5 pb-3 pt-10">
        <div className="mypage-header-inner mx-auto flex max-w-sm items-center justify-between">
          <h1 className="mypage-title text-[22px] font-bold text-gray-900">내 캠프</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/template"
              className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-primary-700 transition-colors duration-100 hover:bg-primary-50 active:bg-primary-100"
            >
              <span className="text-sm leading-none">📋</span>
              템플릿 관리
            </Link>
            <Link
              href="/camp/new"
              className="new-camp-btn flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)] transition-colors duration-100 hover:bg-primary-700 active:bg-primary-800"
            >
              <span className="new-camp-btn-icon text-sm leading-none">🏕️</span>
              새 캠프 만들기
            </Link>
          </div>
        </div>
      </header>

      <main className="mypage-content mx-auto max-w-sm space-y-3 px-4 pt-3">
        {camps.length === 0 ? (
          <div className="camp-empty rounded-2xl bg-white px-5 py-16 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="camp-empty-icon text-[40px] leading-none">🏕️</p>
            <p className="camp-empty-title mt-5 text-[17px] font-bold text-gray-900">아직 캠프가 없어요</p>
            <p className="camp-empty-desc mt-1.5 text-[14px] text-gray-400">새 캠프를 만들어 캠핑 준비를 시작해 보세요.</p>
          </div>
        ) : (
          <CampListClient camps={camps} />
        )}
      </main>
    </div>
  );
}
