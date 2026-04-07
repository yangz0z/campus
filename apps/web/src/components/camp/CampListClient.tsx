'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import type { CampSummary } from '@campus/shared';
import { dayjs, formatDateShort, calcNights } from '@campus/shared';
import SwipeRow from '@/components/ui/SwipeRow';
import CampEditSheet from './CampEditSheet';
import AvatarGroup from './shared/AvatarGroup';
import CampDeleteSheet from './CampDeleteSheet';

interface CampRowClientProps {
  camp: CampSummary;
  index: number;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function CampRowClient({ camp, index, isLast, onEdit, onDelete }: CampRowClientProps) {
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

  const deleteAction = {
    key: 'delete',
    label: '삭제',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    onClick: onDelete,
    className: 'bg-red-50 text-red-500',
  };

  return (
    <div className="camp-list-item group relative">
      {index !== 0 && <div className="camp-list-divider mx-5 h-px bg-gray-100" />}

      <SwipeRow
        actions={[editAction, deleteAction]}
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
                <span className="shrink-0 rounded-full bg-primary-100 px-3 py-1 text-[12px] font-bold text-primary-700">D-Day</span>
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

  const upcomingCamps = camps.filter((c) => dayjs(c.startDate).diff(dayjs().startOf('day'), 'day') >= 0);
  const pastCamps = camps.filter((c) => dayjs(c.startDate).diff(dayjs().startOf('day'), 'day') < 0);
  const editingCamp = camps.find((c) => c.id === editingCampId) ?? null;
  const confirmDeleteCamp = camps.find((c) => c.id === confirmDeleteCampId) ?? null;

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
                    onEdit={() => setEditingCampId(camp.id)}
                    onDelete={() => setConfirmDeleteCampId(camp.id)}
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
                    onEdit={() => setEditingCampId(camp.id)}
                    onDelete={() => setConfirmDeleteCampId(camp.id)}
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
    </>
  );
}
