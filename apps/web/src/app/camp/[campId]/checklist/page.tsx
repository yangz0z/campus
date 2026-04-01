'use client';

import { useEffect, useRef, useState } from 'react';
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
  updateChecklistItemMemo,
  createChecklistGroup,
  createChecklistItem,
} from '@/lib/api/camps';

function Avatar({ nickname, profileImage, size = 24 }: { nickname: string; profileImage: string | null; size?: number }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (profileImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profileImage} alt={nickname} style={style} className="rounded-full object-cover ring-1 ring-white" />
    );
  }
  return (
    <span
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 ring-1 ring-white"
    >
      {nickname[0]}
    </span>
  );
}

export default function ChecklistPage() {
  const { campId } = useParams<{ campId: string }>();
  const { getToken } = useAuth();
  const [camp, setCamp] = useState<CampSummary | null>(null);
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [members, setMembers] = useState<CampMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);

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

  // 아이템 추가 입력창 열기
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
      // 같은 그룹에서 계속 추가할 수 있도록 입력창 유지 후 포커스
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

  // 메모 인라인 편집
  useEffect(() => {
    if (editingMemoItemId) {
      // 모바일에서 long press 후 synthetic 이벤트(~300ms)가 포커스를 빼앗으므로
      // 충분히 늦은 타이밍에 재포커스
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
      e?.preventDefault(); // synthetic click 방지 → 포커스 유지
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
                    return { memberId: mid, nickname: m.nickname, profileImage: m.profileImage };
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

  const Header = () => (
    <header className="bg-[#F2F2F0] px-5 pb-5 pt-5">
      <div className="mx-auto max-w-sm">
        {/* 뒤로가기 */}
        <Link
          href="/mypage"
          className="inline-flex items-center gap-1 text-[13px] text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none">
            <path d="M5.5 1L1 5.5L5.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          내 캠프
        </Link>

        {/* 캠프 정보 */}
        {camp ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowMeta((v) => !v)}
              className="group flex items-center gap-2 text-left"
            >
              <h1 className="text-[24px] font-bold leading-tight text-gray-900 group-hover:text-gray-700">
                {camp.title}
              </h1>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                className={`mt-1 shrink-0 text-gray-300 transition-transform duration-200 group-hover:text-gray-400 ${showMeta ? 'rotate-180' : ''}`}
              >
                <path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className={`overflow-hidden transition-all duration-200 ease-in-out ${showMeta ? 'mt-2 max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-1">
                {camp.location && (
                  <p className="flex items-center gap-1.5 text-[13px] text-gray-500">
                    <svg width="11" height="13" viewBox="0 0 11 13" fill="none" className="shrink-0 text-gray-400" aria-hidden>
                      <path d="M5.5 0C3.015 0 1 2.015 1 4.5c0 3.375 4.5 8.5 4.5 8.5s4.5-5.125 4.5-8.5C10 2.015 7.985 0 5.5 0zm0 6.5a2 2 0 110-4 2 2 0 010 4z" fill="currentColor" />
                    </svg>
                    {camp.location}
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-[13px] text-gray-400">
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
          <div className="mt-3">
            <div className="h-7 w-2/5 animate-shimmer rounded-lg" />
          </div>
        )}
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0]">
        <Header />
        <main className="mx-auto max-w-sm space-y-3 px-4 pt-3">
          {[0, 1].map((g) => (
            <div key={g} className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-3.5">
                <div className="h-3 w-1/4 animate-shimmer rounded-md" />
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="mx-5 h-px bg-gray-100" />
                  <div className="flex items-center gap-3 px-5 py-3.5">
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F2F0]">
        <Header />
        <main className="mx-auto max-w-sm px-4 pt-16 text-center">
          <p className="text-[15px] text-red-500">{error}</p>
          <Link href="/mypage" className="mt-4 inline-flex text-[13px] font-semibold text-primary-600 hover:text-primary-700">
            내 캠프로 돌아가기
          </Link>
        </main>
      </div>
    );
  }

  const assigningItem = groups.flatMap((g) => g.items).find((i) => i.id === assigningItemId);

  return (
    <div className="min-h-screen bg-[#F2F2F0]">
      <Header />
      <main className="mx-auto max-w-sm space-y-3 px-4 pb-24 pt-3">

        {groups.map((group) => (
          <section key={group.id}>
            <p className="mb-2 px-1 text-[12px] font-semibold text-gray-400">{group.title}</p>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

              {/* 아이템 목록 */}
              {group.items.map((item, i) => (
                <div key={item.id} className="group">
                  {i !== 0 && <div className="mx-5 h-px bg-gray-100" />}
                  <div className="flex items-center gap-2 px-5 py-3.5">
                    <span className="h-4 w-4 shrink-0 rounded border border-gray-300" />

                    {/* 텍스트 영역: 모바일 꾹 누르기 감지 */}
                    <div
                      className="min-w-0 flex-1 select-none"
                      onTouchStart={() => startLongPress(item.id, item.memo)}
                      onTouchEnd={(e) => cancelLongPress(e)}
                      onTouchMove={() => cancelLongPress()}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <p className="text-[15px] text-gray-900">
                        {item.title}
                        {item.isRequired && (
                          <span className="ml-1.5 text-[11px] font-bold text-red-500">필수</span>
                        )}
                      </p>
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
                          className="mt-1 w-full border-b border-gray-200 bg-transparent pb-0.5 text-[12px] text-gray-500 outline-none placeholder:text-gray-300"
                        />
                      ) : (
                        item.memo && (
                          <p className="mt-0.5 truncate text-[12px] text-gray-400">{item.memo}</p>
                        )
                      )}
                    </div>

                    {/* 메모 버튼 — 웹 hover 시만 표시 */}
                    <button
                      type="button"
                      onClick={() => openMemoEditor(item.id, item.memo)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 active:bg-gray-200"
                    >
                      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={item.memo ? 'text-primary-400' : 'text-gray-400'}>
                        <path d="M2 9.5V12h2.5l6.5-6.5-2.5-2.5L2 9.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                        <path d="M9.5 3L11 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </button>

                    {/* 담당자 버튼 — 멤버가 2명 이상일 때만 표시 */}
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => openPicker(item.id, item.assignees)}
                        className="flex shrink-0 items-center rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
                      >
                        {item.assignees.length === 0 ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </span>
                        ) : (
                          <span className="flex items-center">
                            {item.assignees.slice(0, 3).map((a, idx) => (
                              <span key={a.memberId} style={{ marginLeft: idx === 0 ? 0 : -6 }}>
                                <Avatar nickname={a.nickname} profileImage={a.profileImage} size={24} />
                              </span>
                            ))}
                            {item.assignees.length > 3 && (
                              <span
                                className="flex items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 ring-1 ring-white"
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

              {/* 아이템 인라인 입력 */}
              {addingItemGroupId === group.id ? (
                <div>
                  <div className="mx-5 h-px bg-gray-100" />
                  <div className="flex items-center gap-3 px-5 py-2.5">
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
                      className="flex-1 bg-transparent text-[15px] text-gray-900 placeholder-gray-300 outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddItem(group.id)}
                      disabled={addingItem || !newItemTitle.trim()}
                      className="text-[13px] font-semibold text-primary-600 disabled:text-gray-300"
                    >
                      추가
                    </button>
                    <button
                      type="button"
                      onClick={cancelAddItem}
                      className="text-[13px] text-gray-400"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div>
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
        ))}

        {/* 그룹 추가 */}
        {addingGroup ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 px-5 py-3.5">
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
                className="flex-1 bg-transparent text-[15px] font-semibold text-gray-900 placeholder-gray-300 outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddGroup}
                disabled={addingGroupLoading || !newGroupTitle.trim()}
                className="text-[13px] font-semibold text-primary-600 disabled:text-gray-300"
              >
                추가
              </button>
              <button
                type="button"
                onClick={cancelAddGroup}
                className="text-[13px] text-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openAddGroup}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3.5 text-[13px] font-medium text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            그룹 추가
          </button>
        )}

      </main>

      {/* 담당자 지정 바텀시트 */}
      {assigningItemId && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && setAssigningItemId(null)}
          />
          <div className="relative mx-auto w-full max-w-sm rounded-t-2xl bg-white px-5 pb-8 pt-5 shadow-xl">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">담당자 지정</p>
            <p className="mb-4 truncate text-[16px] font-semibold text-gray-900">{assigningItem?.title}</p>
            <ul className="space-y-1">
              {members.map((m) => {
                const selected = pendingMemberIds.includes(m.memberId);
                return (
                  <li key={m.memberId}>
                    <button
                      type="button"
                      onClick={() => toggleMember(m.memberId)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${selected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                    >
                      <Avatar nickname={m.nickname} profileImage={m.profileImage} size={36} />
                      <span className={`flex-1 text-left text-[15px] font-medium ${selected ? 'text-primary-700' : 'text-gray-800'}`}>
                        {m.nickname}
                        {m.role === 'owner' && (
                          <span className="ml-1.5 text-[11px] font-normal text-gray-400">방장</span>
                        )}
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
              className="mt-5 w-full rounded-xl bg-primary-600 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60"
            >
              {saving ? '저장 중...' : '확인'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
