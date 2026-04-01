'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { AssigneeInfo, CampMemberInfo, ChecklistGroup, CampSummary } from '@campus/shared';
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
import ChecklistHeader from '@/components/camp/checklist/ChecklistHeader';
import ChecklistGroupSection from '@/components/camp/checklist/ChecklistGroupSection';
import AssigneeSheet from '@/components/camp/checklist/AssigneeSheet';
import GroupNavFAB from '@/components/camp/checklist/GroupNavFAB';

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
  const [showCompleted, setShowCompleted] = useState(false);
  const [recentlyCheckedIds, setRecentlyCheckedIds] = useState<Set<string>>(new Set());
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());

  // 담당자 지정 시트
  const [assigningItem, setAssigningItem] = useState<{ id: string; title: string; assignees: AssigneeInfo[] } | null>(null);

  // 그룹 추가
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
        groupRefs.current.get(groups[currentGroupIdx - 1].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      const nextIdx = Math.min(currentGroupIdx + 1, groups.length - 1);
      groupRefs.current.get(groups[nextIdx].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  async function handleToggleCheck(itemId: string, currentValue: boolean) {
    const newValue = !currentValue;
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

  async function handleSaveMemo(itemId: string, memo: string | null) {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => (i.id === itemId ? { ...i, memo } : i)),
      })),
    );
    const token = await getToken();
    if (token) await updateChecklistItemMemo(token, campId, itemId, { memo });
  }

  async function handleSaveAssignees(memberIds: string[]) {
    if (!assigningItem) return;
    const itemId = assigningItem.id;
    const token = await getToken();
    if (!token) return;
    await setItemAssignees(token, campId, itemId, { memberIds });
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                assignees: memberIds.map((mid) => {
                  const m = members.find((m) => m.memberId === mid)!;
                  return { memberId: mid, nickname: m.nickname, profileImage: m.profileImage, isChecked: false };
                }),
              }
            : i,
        ),
      })),
    );
    setAssigningItem(null);
  }

  async function handleAddItem(groupId: string, title: string) {
    const token = await getToken();
    if (!token) return;
    const newItem = await createChecklistItem(token, campId, groupId, { title });
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, newItem] } : g)),
    );
  }

  async function handleAddGroup() {
    const title = newGroupTitle.trim();
    if (!title) { setAddingGroup(false); return; }
    setAddingGroupLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const newGroup = await createChecklistGroup(token, campId, { title });
      setGroups((prev) => [...prev, { ...newGroup, items: [] }]);
      setAddingGroup(false);
      setNewGroupTitle('');
    } finally {
      setAddingGroupLoading(false);
    }
  }

  function toggleCollapse(groupId: string) {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="checklist-page checklist-page--loading min-h-screen bg-[#F2F2F0]">
        <ChecklistHeader camp={null} showCompleted={false} onToggleCompleted={() => {}} />
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

  if (error) {
    return (
      <div className="checklist-page checklist-page--error min-h-screen bg-[#F2F2F0]">
        <ChecklistHeader camp={null} showCompleted={false} onToggleCompleted={() => {}} />
        <main className="checklist-content mx-auto max-w-sm px-4 pt-16 text-center">
          <p className="checklist-error text-[15px] text-red-500">{error}</p>
          <Link href="/mypage" className="mt-4 inline-flex text-[13px] font-semibold text-primary-600 hover:text-primary-700">
            내 캠프로 돌아가기
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="checklist-page min-h-screen bg-[#F2F2F0]">
      <ChecklistHeader
        camp={camp}
        showCompleted={showCompleted}
        onToggleCompleted={() => setShowCompleted((v) => !v)}
      />

      <main className="checklist-content mx-auto max-w-sm space-y-2.5 px-4 pb-24 pt-3">
        {groups.map((group) => (
          <ChecklistGroupSection
            key={group.id}
            group={group}
            isCollapsed={collapsedGroupIds.has(group.id)}
            onToggleCollapse={() => toggleCollapse(group.id)}
            showCompleted={showCompleted}
            recentlyCheckedIds={recentlyCheckedIds}
            members={members}
            onToggleCheck={handleToggleCheck}
            onSaveMemo={handleSaveMemo}
            onOpenPicker={(itemId, assignees) => {
              const item = groups.flatMap((g) => g.items).find((i) => i.id === itemId);
              if (item) setAssigningItem({ id: itemId, title: item.title, assignees });
            }}
            onAddItem={handleAddItem}
            setGroupRef={setGroupRef}
          />
        ))}

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
                  if (e.key === 'Escape') { setAddingGroup(false); setNewGroupTitle(''); }
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
              <button
                type="button"
                onClick={() => { setAddingGroup(false); setNewGroupTitle(''); }}
                className="checklist-add-group-cancel text-[13px] text-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAddingGroup(true);
              setNewGroupTitle('');
              setTimeout(() => groupInputRef.current?.focus(), 50);
            }}
            className="checklist-add-group-trigger flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3.5 text-[13px] font-medium text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            그룹 추가
          </button>
        )}
      </main>

      <GroupNavFAB
        groupCount={groups.length}
        currentGroupIdx={currentGroupIdx}
        onScrollUp={() => scrollToGroup('up')}
        onScrollDown={() => scrollToGroup('down')}
      />

      {assigningItem && (
        <AssigneeSheet
          itemTitle={assigningItem.title}
          members={members}
          initialMemberIds={assigningItem.assignees.map((a) => a.memberId)}
          onSave={handleSaveAssignees}
          onClose={() => setAssigningItem(null)}
        />
      )}
    </div>
  );
}
