'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { ChecklistGroup, CampMemberInfo, AssigneeInfo, CampSummary } from '@campus/shared';
import { formatDateShort, calcNights } from '@campus/shared';
import {
  getCamp,
  getCampChecklist,
  getCampMembers,
  setItemAssignees,
  toggleChecklistItem,
  updateChecklistItemMemo,
  createChecklistGroup,
  createChecklistItem,
} from '@/lib/api/camps';

function Avatar({ nickname, profileImage, size = 24 }: { nickname: string; profileImage: string | null; size?: number }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (profileImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profileImage} alt={nickname} style={style} className="avatar rounded-full object-cover ring-1 ring-white" />
    );
  }
  return (
    <span
      style={style}
      className="avatar avatar--initial flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 ring-1 ring-white"
    >
      {nickname[0]}
    </span>
  );
}

type CheckStatus = 'none' | 'partial' | 'complete';

function getCheckStatus(item: { assignees: AssigneeInfo[]; isCheckedByMe: boolean }): CheckStatus {
  if (item.assignees.length === 0) return item.isCheckedByMe ? 'complete' : 'none';
  const checkedCount = item.assignees.filter((a) => a.isChecked).length;
  if (checkedCount === 0) return 'none';
  if (checkedCount === item.assignees.length) return 'complete';
  return 'partial';
}

export default function ChecklistPage() {
  const { campId } = useParams<{ campId: string }>();
  const { getToken } = useAuth();
  const [camp, setCamp] = useState<CampSummary | null>(null);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [members, setMembers] = useState<CampMemberInfo[]>([]);
  const [myMemberId, setMyMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [recentlyCheckedIds, setRecentlyCheckedIds] = useState<Set<string>>(new Set());
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());

  // 담당자 지정 바텀시트
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);
  const [pendingMemberIds, setPendingMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // 메모 인라인 편집
  const [editingMemoItemId, setEditingMemoItemId] = useState<string | null>(null);
  const [pendingMemo, setPendingMemo] = useState('');
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);
  const memoInputRef = useRef<HTMLInputElement>(null);

  // 아이템 추가 인라인 입력
  const [addingItemGroupId, setAddingItemGroupId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const itemInputRef = useRef<HTMLInputElement>(null);

  // 그룹 추가 인라인 입력
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [addingGroupLoading, setAddingGroupLoading] = useState(false);
  const groupInputRef = useRef<HTMLInputElement>(null);

  // 그룹 네비게이션
  const groupRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);

  const setGroupRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) groupRefs.current.set(id, el);
    else groupRefs.current.delete(id);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const entries = groups.map((g, i) => {
        const el = groupRefs.current.get(g.id);
        return { i, top: el?.getBoundingClientRect().top ?? Infinity };
      });
      const current = entries.filter((e) => e.top <= 120);
      setCurrentGroupIdx(current.length > 0 ? current[current.length - 1].i : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [groups]);

  function scrollToGroup(direction: 'up' | 'down') {
    if (direction === 'up') {
      if (currentGroupIdx === 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = groupRefs.current.get(groups[currentGroupIdx - 1].id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const nextIdx = Math.min(currentGroupIdx + 1, groups.length - 1);
      const el = groupRefs.current.get(groups[nextIdx].id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken();
        if (!token) return;
        const [campData, checklistData, membersData] = await Promise.all([
          getCamp(token, campId),
          getCampChecklist(token, campId),
          getCampMembers(token, campId),
        ]);
        setCamp(campData);
        setMyMemberId(checklistData.myMemberId);
        setGroups(checklistData.groups);
        setMembers(membersData.members);
      } catch {
        setError('데이터를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [campId, getToken]);

  // 아이템 추가
  function openAddItem(groupId: string) {
    setAddingItemGroupId(groupId);
    setNewItemTitle('');
    setTimeout(() => itemInputRef.current?.focus(), 50);
  }

  function cancelAddItem() {
    setAddingItemGroupId(null);
    setNewItemTitle('');
  }

  async function handleAddItem(groupId: string) {
    const title = newItemTitle.trim();
    if (!title) { cancelAddItem(); return; }
    setAddingItem(true);
    try {
      const token = await getToken();
      if (!token) return;
      const newItem = await createChecklistItem(token, campId, groupId, { title });
      setGroups((prev) =>
        prev.map((g) => g.id === groupId ? { ...g, items: [...g.items, newItem] } : g),
      );
      setNewItemTitle('');
      setTimeout(() => itemInputRef.current?.focus(), 50);
    } finally {
      setAddingItem(false);
    }
  }

  // 그룹 추가
  function openAddGroup() {
    setAddingGroup(true);
    setNewGroupTitle('');
    setTimeout(() => groupInputRef.current?.focus(), 50);
  }

  function cancelAddGroup() {
    setAddingGroup(false);
    setNewGroupTitle('');
  }

  async function handleAddGroup() {
    const title = newGroupTitle.trim();
    if (!title) { cancelAddGroup(); return; }
    setAddingGroupLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const newGroup = await createChecklistGroup(token, campId, { title });
      setGroups((prev) => [...prev, { ...newGroup, items: [] }]);
      cancelAddGroup();
    } finally {
      setAddingGroupLoading(false);
    }
  }

  // 체크 토글
  async function handleToggleCheck(itemId: string, currentValue: boolean) {
    const newValue = !currentValue;
    // 낙관적 업데이트: isCheckedByMe + assignees 내 본인 isChecked 동시 갱신
    let willBeComplete = false;
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => {
          if (i.id !== itemId) return i;
          const updatedAssignees = i.assignees.map((a) =>
            a.memberId === myMemberId ? { ...a, isChecked: newValue } : a,
          );
          const updated = { ...i, isCheckedByMe: newValue, assignees: updatedAssignees };
          willBeComplete = getCheckStatus(updated) === 'complete';
          return updated;
        }),
      })),
    );
    // 전원 완료 시에만 fade-out
    if (willBeComplete && !showCompleted) {
      setRecentlyCheckedIds((prev) => new Set(prev).add(itemId));
      setTimeout(() => {
        setRecentlyCheckedIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 500);
    }
    const token = await getToken();
    if (token) await toggleChecklistItem(token, campId, itemId, { isChecked: newValue });
  }

  // 메모 인라인 편집
  useEffect(() => {
    if (editingMemoItemId) {
      const timer = setTimeout(() => memoInputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [editingMemoItemId]);

  function openMemoEditor(itemId: string, currentMemo: string | null) {
    setEditingMemoItemId(itemId);
    setPendingMemo(currentMemo ?? '');
  }

  async function handleSaveMemo() {
    if (!editingMemoItemId) return;
    const itemId = editingMemoItemId;
    const memo = pendingMemo.trim() || null;
    setEditingMemoItemId(null);
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => (i.id === itemId ? { ...i, memo } : i)),
      })),
    );
    const token = await getToken();
    if (token) await updateChecklistItemMemo(token, campId, itemId, { memo });
  }

  function startLongPress(itemId: string, memo: string | null) {
    if (editingMemoItemId) return;
    longPressFiredRef.current = false;
    longPressRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      openMemoEditor(itemId, memo);
      navigator?.vibrate?.(30);
    }, 500);
  }

  function cancelLongPress(e?: React.TouchEvent) {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    if (longPressFiredRef.current) {
      e?.preventDefault();
      longPressFiredRef.current = false;
    }
  }

  // 담당자 지정
  function openPicker(itemId: string, currentAssignees: AssigneeInfo[]) {
    setAssigningItemId(itemId);
    setPendingMemberIds(currentAssignees.map((a) => a.memberId));
  }

  function toggleMember(memberId: string) {
    setPendingMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  }

  async function handleSaveAssignees() {
    if (!assigningItemId) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      await setItemAssignees(token, campId, assigningItemId, { memberIds: pendingMemberIds });
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) =>
            i.id === assigningItemId
              ? {
                  ...i,
                  assignees: pendingMemberIds.map((mid) => {
                    const m = members.find((m) => m.memberId === mid)!;
                    return { memberId: mid, nickname: m.nickname, profileImage: m.profileImage, isChecked: false };
                  }),
                }
              : i,
          ),
        })),
      );
      setAssigningItemId(null);
    } finally {
      setSaving(false);
    }
  }

  /* ───────── Header ───────── */
  const Header = () => (
    <header className="checklist-header bg-[#F2F2F0] px-5 pb-5 pt-5">
      <div className="checklist-header-inner mx-auto max-w-sm">
        <Link
          href="/mypage"
          className="checklist-back inline-flex items-center gap-1 text-[13px] text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none">
            <path d="M5.5 1L1 5.5L5.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          내 캠프
        </Link>

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

              <button
                type="button"
                onClick={() => setShowCompleted((v) => !v)}
                className={`checklist-completed-toggle mt-1.5 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
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

  /* ───────── Loading ───────── */
  if (loading) {
    return (
      <div className="checklist-page checklist-page--loading min-h-screen bg-[#F2F2F0]">
        <Header />
        <main className="checklist-content mx-auto max-w-sm space-y-3 px-4 pt-3">
          {[0, 1].map((g) => (
            <div key={g} className="checklist-group-skeleton overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-3.5">
                <div className="h-3 w-1/4 animate-shimmer rounded-md" />
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="mx-5 h-px bg-gray-100" />
                  <div className="flex items-center gap-3 px-5 py-2.5">
                    <div className="h-4 w-4 animate-shimmer rounded" />
                    <div className="h-[15px] w-2/5 animate-shimmer rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </main>
      </div>
    );
  }

  /* ───────── Error ───────── */
  if (error) {
    return (
      <div className="checklist-page checklist-page--error min-h-screen bg-[#F2F2F0]">
        <Header />
        <main className="checklist-content mx-auto max-w-sm px-4 pt-16 text-center">
          <p className="checklist-error text-[15px] text-red-500">{error}</p>
          <Link href="/mypage" className="mt-4 inline-flex text-[13px] font-semibold text-primary-600 hover:text-primary-700">
            내 캠프로 돌아가기
          </Link>
        </main>
      </div>
    );
  }

  const assigningItem = groups.flatMap((g) => g.items).find((i) => i.id === assigningItemId);

  /* ───────── Main Render ───────── */
  return (
    <div className="checklist-page min-h-screen bg-[#F2F2F0]">
      <Header />
      <main className="checklist-content mx-auto max-w-sm space-y-2.5 px-4 pb-24 pt-3">

        {groups.map((group) => {
          const visibleItems = showCompleted
            ? group.items
            : group.items.filter((item) => getCheckStatus(item) !== 'complete' || recentlyCheckedIds.has(item.id));
          const completedCount = group.items.filter((item) => getCheckStatus(item) === 'complete').length;

          return (
          <section key={group.id} ref={(el) => setGroupRef(group.id, el)} className="checklist-group">
            <div className="checklist-group-header mb-2 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setCollapsedGroupIds((prev) => {
                  const next = new Set(prev);
                  next.has(group.id) ? next.delete(group.id) : next.add(group.id);
                  return next;
                })}
                className="checklist-group-collapse-btn flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 transition-colors hover:text-gray-500"
              >
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  className={`shrink-0 transition-transform duration-200 ${collapsedGroupIds.has(group.id) ? '-rotate-90' : ''}`}
                >
                  <path d="M2 3L5 6L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {group.title}
              </button>
              <div className="checklist-group-meta flex items-center gap-2">
                {!showCompleted && completedCount > 0 && (
                  <p className="checklist-completed-count text-[11px] text-gray-300">{completedCount}개 완료</p>
                )}
                {collapsedGroupIds.has(group.id) && (
                  <p className="checklist-item-count text-[11px] text-gray-300">{visibleItems.length}개 항목</p>
                )}
              </div>
            </div>
            <div className={`checklist-group-card overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ease-in-out ${
              collapsedGroupIds.has(group.id) ? 'max-h-0 opacity-0 shadow-none' : 'max-h-[2000px] opacity-100'
            }`}>

              {/* 아이템 목록 */}
              {visibleItems.map((item, i) => (
                <div
                  key={item.id}
                  className={`checklist-item group overflow-hidden transition-all duration-400 ease-in-out ${
                    recentlyCheckedIds.has(item.id) ? 'max-h-0 scale-95 opacity-0' : 'max-h-40 opacity-100'
                  }`}
                >
                  {i !== 0 && <div className="checklist-item-divider mx-5 h-px bg-gray-100" />}
                  <div className="checklist-item-row flex items-center gap-2 px-5 py-2.5">

                    {/* 체크박스 (3단계: none / partial / complete) */}
                    {(() => {
                      const status = getCheckStatus(item);
                      return (
                        <button
                          type="button"
                          onClick={() => handleToggleCheck(item.id, item.isCheckedByMe)}
                          className={`checklist-checkbox flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded transition-colors ${
                            status === 'complete'
                              ? 'bg-primary-600 text-white'
                              : status === 'partial'
                                ? 'bg-amber-400 text-white'
                                : 'border border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {status === 'complete' && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 3.5L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                          {status === 'partial' && (
                            <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
                              <path d="M1 1h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                          )}
                        </button>
                      );
                    })()}

                    {/* 텍스트 영역 */}
                    <div
                      className="checklist-item-body min-w-0 flex-1 cursor-pointer select-none"
                      onClick={() => { if (!editingMemoItemId) handleToggleCheck(item.id, item.isCheckedByMe); }}
                      onTouchStart={() => startLongPress(item.id, item.memo)}
                      onTouchEnd={(e) => cancelLongPress(e)}
                      onTouchMove={() => cancelLongPress()}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {(() => {
                        const status = getCheckStatus(item);
                        return (
                          <p className={`checklist-item-title text-[15px] transition-colors ${
                            status === 'complete' ? 'text-gray-400 line-through' : 'text-gray-900'
                          }`}>
                            {item.title}
                            {item.isRequired && status !== 'complete' && (
                              <span className="checklist-item-required ml-1.5 text-[11px] font-bold text-red-500">필수</span>
                            )}
                          </p>
                        );
                      })()}
                      {editingMemoItemId === item.id ? (
                        <input
                          ref={memoInputRef}
                          autoFocus
                          value={pendingMemo}
                          onChange={(e) => setPendingMemo(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); handleSaveMemo(); }
                            if (e.key === 'Escape') { setEditingMemoItemId(null); }
                          }}
                          placeholder="메모 추가"
                          className="checklist-memo-input mt-1 w-full border-b border-gray-200 bg-transparent pb-0.5 text-[12px] text-gray-500 outline-none placeholder:text-gray-300"
                        />
                      ) : (
                        item.memo && (
                          <p className="checklist-item-memo mt-0.5 truncate text-[12px] text-gray-400">{item.memo}</p>
                        )
                      )}
                    </div>

                    {/* 메모 버튼 — 웹 hover 시만 */}
                    <button
                      type="button"
                      onClick={() => openMemoEditor(item.id, item.memo)}
                      className="checklist-memo-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 active:bg-gray-200"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={item.memo ? 'text-primary-400' : 'text-gray-400'}>
                        <path d="M2 9.5V12h2.5l6.5-6.5-2.5-2.5L2 9.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        <path d="M9.5 3L11 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </button>

                    {/* 담당자 버튼 — 2명 이상 */}
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => openPicker(item.id, item.assignees)}
                        className="checklist-assignee-btn flex shrink-0 items-center rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
                      >
                        {item.assignees.length === 0 ? (
                          <span className="checklist-assignee-add flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </span>
                        ) : (
                          <span className="checklist-assignee-avatars flex items-center">
                            {item.assignees.slice(0, 3).map((a, idx) => (
                              <span key={a.memberId} style={{ marginLeft: idx === 0 ? 0 : -6 }}>
                                <Avatar nickname={a.nickname} profileImage={a.profileImage} size={24} />
                              </span>
                            ))}
                            {item.assignees.length > 3 && (
                              <span
                                className="checklist-assignee-overflow flex items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 ring-1 ring-white"
                                style={{ width: 24, height: 24, marginLeft: -6 }}
                              >
                                +{item.assignees.length - 3}
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* 아이템 추가 인라인 입력 */}
              {addingItemGroupId === group.id ? (
                <div className="checklist-add-item">
                  <div className="mx-5 h-px bg-gray-100" />
                  <div className="checklist-add-item-row flex items-center gap-3 px-5 py-2.5">
                    <span className="h-4 w-4 shrink-0 rounded border border-gray-200" />
                    <input
                      ref={itemInputRef}
                      value={newItemTitle}
                      onChange={(e) => setNewItemTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddItem(group.id);
                        if (e.key === 'Escape') cancelAddItem();
                      }}
                      placeholder="항목 이름"
                      disabled={addingItem}
                      className="checklist-add-item-input flex-1 bg-transparent text-[15px] text-gray-900 placeholder-gray-300 outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem(group.id)}
                      disabled={addingItem || !newItemTitle.trim()}
                      className="checklist-add-item-submit text-[13px] font-semibold text-primary-600 disabled:text-gray-300"
                    >
                      추가
                    </button>
                    <button type="button" onClick={cancelAddItem} className="checklist-add-item-cancel text-[13px] text-gray-400">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="checklist-add-item-trigger">
                  {group.items.length > 0 && <div className="mx-5 h-px bg-gray-100" />}
                  <button
                    type="button"
                    onClick={() => openAddItem(group.id)}
                    className="flex w-full items-center gap-2 px-5 py-3 text-[13px] text-gray-400 transition-colors hover:text-gray-600"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    항목 추가
                  </button>
                </div>
              )}
            </div>

          </section>
          );
        })}

        {/* 그룹 추가 */}
        {addingGroup ? (
          <div className="checklist-add-group overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="checklist-add-group-row flex items-center gap-3 px-5 py-3.5">
              <input
                ref={groupInputRef}
                value={newGroupTitle}
                onChange={(e) => setNewGroupTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddGroup();
                  if (e.key === 'Escape') cancelAddGroup();
                }}
                placeholder="그룹 이름"
                disabled={addingGroupLoading}
                className="checklist-add-group-input flex-1 bg-transparent text-[15px] font-semibold text-gray-900 placeholder-gray-300 outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddGroup}
                disabled={addingGroupLoading || !newGroupTitle.trim()}
                className="checklist-add-group-submit text-[13px] font-semibold text-primary-600 disabled:text-gray-300"
              >
                추가
              </button>
              <button type="button" onClick={cancelAddGroup} className="checklist-add-group-cancel text-[13px] text-gray-400">
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openAddGroup}
            className="checklist-add-group-trigger flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3.5 text-[13px] font-medium text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            그룹 추가
          </button>
        )}

      </main>

      {/* 그룹 네비게이션 FAB */}
      {groups.length > 1 && (
        <nav className="checklist-group-nav fixed bottom-6 right-4 z-40 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => scrollToGroup('up')}
            className="checklist-group-nav-up flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 7L6 2L11 7" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollToGroup('down')}
            disabled={currentGroupIdx === groups.length - 1}
            className="checklist-group-nav-down flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30"
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1L6 6L11 1" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </nav>
      )}

      {/* 담당자 지정 바텀시트 */}
      {assigningItemId && (
        <div className="checklist-assignee-sheet fixed inset-0 z-50 flex flex-col justify-end">
          <div className="checklist-assignee-backdrop absolute inset-0 bg-black/40" onClick={() => !saving && setAssigningItemId(null)} />
          <div className="checklist-assignee-panel relative mx-auto w-full max-w-sm rounded-t-2xl bg-white px-5 pb-8 pt-5 shadow-xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
            <p className="checklist-assignee-label mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">담당자 지정</p>
            <p className="checklist-assignee-title mb-4 truncate text-[16px] font-semibold text-gray-900">{assigningItem?.title}</p>
            <ul className="checklist-assignee-list space-y-1">
              {members.map((m) => {
                const selected = pendingMemberIds.includes(m.memberId);
                return (
                  <li key={m.memberId} className="checklist-assignee-option">
                    <button
                      type="button"
                      onClick={() => toggleMember(m.memberId)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${selected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                    >
                      <Avatar nickname={m.nickname} profileImage={m.profileImage} size={36} />
                      <span className={`flex-1 text-left text-[15px] font-medium ${selected ? 'text-primary-700' : 'text-gray-800'}`}>
                        {m.nickname}
                        {m.role === 'owner' && <span className="ml-1.5 text-[11px] font-normal text-gray-400">방장</span>}
                      </span>
                      {selected && (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary-600">
                          <path d="M3.75 9L7.5 12.75L14.25 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={handleSaveAssignees}
              disabled={saving}
              className="checklist-assignee-submit mt-5 w-full rounded-xl bg-primary-600 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60"
            >
              {saving ? '저장 중...' : '확인'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
