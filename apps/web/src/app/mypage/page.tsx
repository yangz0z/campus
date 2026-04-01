import Link from 'next/link';
import type { CampSummary } from '@campus/shared';
import { dayjs, formatDateShort, calcNights } from '@campus/shared';
import { getMyCamps } from '@/actions/camp';

function CampRow({ camp, index }: { camp: CampSummary; index: number }) {
  const diff = dayjs(camp.startDate).diff(dayjs().startOf('day'), 'day');
  const isToday = diff === 0;
  const isSoon = diff > 0 && diff <= 7;
  const isPast = diff < 0;

  return (
    <div
      className="camp-list-item animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {index !== 0 && <div className="camp-list-divider mx-5 h-px bg-gray-100" />}
      <Link
        href={`/camp/${camp.id}/checklist`}
        className="camp-list-link flex items-center gap-3 px-5 py-4 transition-colors duration-100 active:bg-gray-50"
      >
        <div className="camp-info min-w-0 flex-1">
          <p className={`camp-name truncate text-[16px] font-semibold ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>
            {camp.title}
          </p>
          {camp.location && (
            <p className="camp-meta-location mt-0.5 flex items-center gap-1 truncate text-[13px] text-gray-500">
              <svg width="11" height="13" viewBox="0 0 11 13" fill="none" className="camp-meta-location-icon shrink-0 text-gray-400" aria-hidden="true">
                <path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 8.5 4.5 8.5s4.5-5.125 4.5-8.5C10 2.015 7.985 0 5.5 0zm0 6.5a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" />
              </svg>
              <span className="truncate">{camp.location}</span>
            </p>
          )}
          <p className="camp-meta mt-0.5 flex items-center gap-1 text-[13px] text-gray-400">
            <span className="camp-meta-dates">{formatDateShort(camp.startDate)} – {formatDateShort(camp.endDate)}</span>
            <span aria-hidden>·</span>
            <span className="camp-meta-nights">{calcNights(camp.startDate, camp.endDate)}</span>
          </p>
        </div>

        {isToday ? (
          <span className="dday-badge dday-badge--today shrink-0 rounded-full bg-primary-100 px-3 py-1 text-[12px] font-bold text-primary-700">
            D-Day
          </span>
        ) : diff > 0 ? (
          <span className={`dday-badge shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${isSoon ? 'dday-badge--soon bg-warm-100 text-warm-500' : 'dday-badge--upcoming bg-primary-50 text-primary-600'}`}>
            D-{diff}
          </span>
        ) : (
          <span className="dday-badge dday-badge--past shrink-0 rounded-full bg-earth-200 px-3 py-1 text-[12px] font-medium text-earth-500">
            종료
          </span>
        )}

        <svg
          width="7" height="12" viewBox="0 0 7 12" fill="none"
          className="camp-list-chevron shrink-0 text-gray-300"
        >
          <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export default async function MypagePage() {
  const data = await getMyCamps();
  const camps = data.camps;

  const upcomingCamps = camps.filter((c) => dayjs(c.startDate).diff(dayjs().startOf('day'), 'day') >= 0);
  const pastCamps = camps.filter((c) => dayjs(c.startDate).diff(dayjs().startOf('day'), 'day') < 0);

  return (
    <div className="mypage bg-[#F2F2F0]">
      <header className="mypage-header bg-[#F2F2F0] px-5 pb-3 pt-10">
        <div className="mypage-header-inner mx-auto flex max-w-sm items-center justify-between">
          <h1 className="mypage-title text-[22px] font-bold text-gray-900">내 캠프</h1>
          <Link
            href="/camp/new"
            className="new-camp-btn flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(22,163,74,0.3)] transition-colors duration-100 hover:bg-primary-700 active:bg-primary-800"
          >
            <span className="new-camp-btn-icon text-sm leading-none">🏕️</span>
            새 캠프 만들기
          </Link>
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
          <>
            {upcomingCamps.length > 0 && (
              <section className="camp-section camp-section--upcoming">
                <p className="camp-section-label mb-2 px-1 text-[12px] font-semibold text-gray-400">예정된 캠프</p>
                <div className="camp-list camp-list--upcoming overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  {upcomingCamps.map((camp, i) => <CampRow key={camp.id} camp={camp} index={i} />)}
                </div>
              </section>
            )}
            {pastCamps.length > 0 && (
              <section className="camp-section camp-section--past">
                <p className="camp-section-label mb-2 px-1 text-[12px] font-semibold text-gray-400">지나간 캠프</p>
                <div className="camp-list camp-list--past overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                  {pastCamps.map((camp, i) => <CampRow key={camp.id} camp={camp} index={i} />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
