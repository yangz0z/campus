'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { CampSummary } from '@campus/shared';
import { dayjs, formatDateShort, calcNights } from '@campus/shared';
import { getIncompleteCount } from '@/actions/camp';
import SwipeRow from '@/components/ui/SwipeRow';
import CampEditSheet from './CampEditSheet';
import AvatarGroup from './shared/AvatarGroup';
import CampDeleteSheet from './CampDeleteSheet';
import CampLeaveSheet from './CampLeaveSheet';

interface CampRowClientProps {
  camp: CampSummary;
  index: number;
  isLast: boolean;
  incompleteCount: number | null; // null = 로딩 중, number = 완료
  onEdit: () => void;
  onDelete: () => void;
  onLeave: () => void;
}

function CampRowClient({ camp, index, isLast, incompleteCount, onEdit, onDelete, onLeave }: CampRowClientProps) {
  const diff = dayjs(camp.startDate).diff(dayjs().startOf('day'), 'day');
  const isToday = diff === 0;
  const isSoon = diff > 0 && diff <= 7;
  const isPast = diff < 0;

  const editAction = {
    key: 'edit',
    label: '수정',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M10.5 2.5l2 2-8 8H2.5v-2l8-8zM9 4l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    onClick: onEdit,
    className: 'bg-primary-50 text-primary-600',
  };

  // myRole이 아직 반영 안 된 경우 방어: 1인 캠프면 방장
  const isOwner = camp.myRole ? camp.myRole === 'owner' : camp.members.length <= 1;

  const removeAction = isOwner
    ? {
        key: 'delete',
        label: '삭제',
        icon: (
          <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
            <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        onClick: onDelete,
        className: 'bg-red-50 text-red-500',
      }
    : {
        key: 'leave',
        label: '나가기',
        icon: (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        onClick: onLeave,
        className: 'bg-orange-50 text-orange-500',
      };

  return (
    <div className="camp-list-item group relative">
      {index !== 0 && <div className="camp-list-divider mx-5 h-px bg-gray-100" />}

      <SwipeRow
        actions={[editAction, removeAction]}
        className={`${index === 0 ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : ''}`}
      >
        {({ contentStyle, isSwipeOpen, closeSwipe }) => (
          <div style={contentStyle} className="relative z-10 bg-white">
            <Link
              href={`/camp/${camp.id}/checklist`}
              onClick={(e) => { if (isSwipeOpen) { e.preventDefault(); closeSwipe(); } }}
              className="camp-list-link flex items-center gap-3 px-5 py-4 transition-colors duration-100 active:bg-gray-50"
            >
              <div className="camp-info min-w-0 flex-1">
                <p className={`camp-name truncate text-[16px] font-semibold ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>
                  {camp.title}
                </p>
                {camp.location && (
                  <p className="camp-meta-location mt-0.5 flex items-center gap-1 truncate text-[13px] text-gray-500">
                    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" className="shrink-0 text-gray-400" aria-hidden="true">
                      <path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 8.5 4.5 8.5s4.5-5.125 4.5-8.5C10 2.015 7.985 0 5.5 0zm0 6.5a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" />
                    </svg>
                    <span className="truncate">{camp.location}</span>
                  </p>
                )}
                <div className="camp-meta mt-1 flex items-center gap-2">
                  <p className="flex items-center gap-1 text-[13px] text-gray-400">
                    <span>{formatDateShort(camp.startDate)} – {formatDateShort(camp.endDate)}</span>
                    <span aria-hidden>·</span>
                    <span>{calcNights(camp.startDate, camp.endDate)}</span>
                  </p>
                  <AvatarGroup members={camp.members} />
                </div>
              </div>

              {isToday ? (
                <div className="shrink-0 flex flex-col items-center gap-1.5">
                  {/* 말풍선 */}
                  <div className="relative">
                    {incompleteCount === null ? (
                      /* 로딩 스켈레톤 */
                      <span className="block h-[22px] w-16 animate-pulse rounded-xl bg-gray-200" />
                    ) : (
                      <span className={`block whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-bold text-white shadow-sm ${incompleteCount === 0 ? 'bg-primary-500' : 'bg-orange-400'}`}>
                        {incompleteCount === 0 ? '모두 완료 🎉' : `미완료 ${incompleteCount}개`}
                      </span>
                    )}
                    {/* 말풍선 꼬리 */}
                    {incompleteCount !== null && (
                      <span
                        className={`absolute left-1/2 top-full -translate-x-1/2 border-x-[5px] border-t-[5px] border-x-transparent ${incompleteCount === 0 ? 'border-t-primary-500' : 'border-t-orange-400'}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <span className="rounded-full bg-primary-100 px-3 py-1 text-[12px] font-bold text-primary-700">D-Day</span>
                </div>
              ) : diff > 0 ? (
                <span className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-bold ${isSoon ? 'bg-warm-100 text-warm-500' : 'bg-primary-50 text-primary-600'}`}>
                  D-{diff}
                </span>
              ) : null}

              <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="shrink-0 text-gray-300">
                <path d="M1 1L6 6L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        )}
      </SwipeRow>

      {/* 웹 hover 버튼 — 카드 오른쪽 바깥 절대 위치 */}
      <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-[calc(100%+6px)] items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
        <button
          type="button"
          onClick={onEdit}
          className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-primary-50 active:bg-primary-100"
          title="수정"
        >
          <svg width="13" height="13" viewBox="0 0 15 15" fill="none" className="text-primary-500">
            <path d="M10.5 2.5l2 2-8 8H2.5v-2l8-8zM9 4l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isOwner ? (
          <button
            type="button"
            onClick={onDelete}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-red-50 active:bg-red-100"
            title="삭제"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-red-400">
              <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={onLeave}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-orange-50 active:bg-orange-100"
            title="나가기"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-orange-400">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface CampListClientProps {
  camps: CampSummary[];
}

export default function CampListClient({ camps: initialCamps }: CampListClientProps) {
  const router = useRouter();
  const [camps, setCamps] = useState<CampSummary[]>(initialCamps);
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [confirmDeleteCampId, setConfirmDeleteCampId] = useState<string | null>(null);
  const [confirmLeaveCampId, setConfirmLeaveCampId] = useState<string | null>(null);
  // D-Day 캠프 미완료 수: campId → number (null = 로딩 중)
  const [incompleteCounts, setIncompleteCounts] = useState<Record<string, number | null>>({});

  const upcomingCamps = camps.filter((c) => dayjs(c.startDate).diff(dayjs().startOf('day'), 'day') >= 0);
  const pastCamps = camps.filter((c) => dayjs(c.startDate).diff(dayjs().startOf('day'), 'day') < 0);

  // D-Day 캠프만 별도 fetch
  useEffect(() => {
    const todayCamps = upcomingCamps.filter(
      (c) => dayjs(c.startDate).diff(dayjs().startOf('day'), 'day') === 0,
    );
    if (todayCamps.length === 0) return;

    // 로딩 상태로 초기화
    setIncompleteCounts((prev) => {
      const next = { ...prev };
      for (const c of todayCamps) next[c.id] = null;
      return next;
    });

    for (const camp of todayCamps) {
      getIncompleteCount(camp.id).then(({ incompleteCount }) => {
        setIncompleteCounts((prev) => ({ ...prev, [camp.id]: incompleteCount }));
      });
    }
  // upcomingCamps는 렌더링마다 새 배열 → camps로 의존
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camps]);
  const editingCamp = camps.find((c) => c.id === editingCampId) ?? null;
  const confirmDeleteCamp = camps.find((c) => c.id === confirmDeleteCampId) ?? null;
  const confirmLeaveCamp = camps.find((c) => c.id === confirmLeaveCampId) ?? null;

  function handleUpdated(updated: CampSummary) {
    setCamps((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setEditingCampId(null);
    router.refresh();
  }

  function handleDeleted(campId: string) {
    setCamps((prev) => prev.filter((c) => c.id !== campId));
    setConfirmDeleteCampId(null);
    router.refresh();
  }

  function handleLeft(campId: string) {
    setCamps((prev) => prev.filter((c) => c.id !== campId));
    setConfirmLeaveCampId(null);
    router.refresh();
  }

  return (
    <>
      {upcomingCamps.length > 0 && (
        <section className="camp-section camp-section--upcoming">
          <p className="camp-section-label mb-2 px-1 text-[12px] font-semibold text-gray-400">예정된 캠프</p>
          <div className="camp-list camp-list--upcoming rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <AnimatePresence initial={false}>
              {upcomingCamps.map((camp, i) => (
                <motion.div
                  key={camp.id}
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <CampRowClient
                    camp={camp}
                    index={i}
                    isLast={i === upcomingCamps.length - 1}
                    incompleteCount={incompleteCounts[camp.id] ?? null}
                    onEdit={() => setEditingCampId(camp.id)}
                    onDelete={() => setConfirmDeleteCampId(camp.id)}
                    onLeave={() => setConfirmLeaveCampId(camp.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {pastCamps.length > 0 && (
        <section className="camp-section camp-section--past">
          <p className="camp-section-label mb-2 px-1 text-[12px] font-semibold text-gray-400">지나간 캠프</p>
          <div className="camp-list camp-list--past rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <AnimatePresence initial={false}>
              {pastCamps.map((camp, i) => (
                <motion.div
                  key={camp.id}
                  initial={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <CampRowClient
                    camp={camp}
                    index={i}
                    isLast={i === pastCamps.length - 1}
                    incompleteCount={null}
                    onEdit={() => setEditingCampId(camp.id)}
                    onDelete={() => setConfirmDeleteCampId(camp.id)}
                    onLeave={() => setConfirmLeaveCampId(camp.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* 수정 시트 */}
      <AnimatePresence>
        {editingCamp && (
          <CampEditSheet
            camp={editingCamp}
            onClose={() => setEditingCampId(null)}
            onUpdated={handleUpdated}
          />
        )}
      </AnimatePresence>

      {/* 삭제 확인 시트 */}
      <AnimatePresence>
        {confirmDeleteCamp && (
          <CampDeleteSheet
            camp={confirmDeleteCamp}
            onClose={() => setConfirmDeleteCampId(null)}
            onDeleted={() => handleDeleted(confirmDeleteCamp.id)}
          />
        )}
      </AnimatePresence>

      {/* 나가기 확인 시트 */}
      <AnimatePresence>
        {confirmLeaveCamp && (
          <CampLeaveSheet
            camp={confirmLeaveCamp}
            onClose={() => setConfirmLeaveCampId(null)}
            onLeft={() => handleLeft(confirmLeaveCamp.id)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
