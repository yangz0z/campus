'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CampMemberInfo, CampSummary, ChecklistGroup, ChecklistItem } from '@campus/shared';
import { SortableContainer } from '@/components/ui/dnd';
import { useChecklistActions } from './hooks/useChecklistActions';
import { useChecklistDnd } from './hooks/useChecklistDnd';
import { useCampSocket } from './hooks/useCampSocket';
import { useChecklistSync } from './hooks/useChecklistSync';
import ChecklistHeader from './ChecklistHeader';
import ChecklistGroupSection from './ChecklistGroupSection';
import AssigneeSheet from './AssigneeSheet';
import GroupNavFAB from './GroupNavFAB';

interface ChecklistClientProps {
  campId: string;
  camp: CampSummary;
  initialGroups: import('@campus/shared').ChecklistGroup[];
  myMemberId: string;
  members: CampMemberInfo[];
}

export default function ChecklistClient({ campId, camp, initialGroups, myMemberId, members }: ChecklistClientProps) {
  const { socket, socketId } = useCampSocket(campId);
  const actions = useChecklistActions({ campId, myMemberId, members, initialGroups, socketId });
  const {
    groups, setGroups,
    showCompleted, setShowCompleted,
    delayedRemoveIds, collapsedGroupIds, toggleCollapse,
    assigningItem, setAssigningItem,
    addingGroup, newGroupTitle, setNewGroupTitle, addingGroupLoading, groupInputRef,
    handleToggleCheck, handleDeleteItem, handleUpdateItem,
    handleSaveAssignees, handleAddItem,
    handleUpdateGroup, handleDeleteGroup, handleAddGroup,
    openAssigneePicker, startAddGroup, cancelAddGroup,
  } = actions;

  const dnd = useChecklistDnd({ campId, groups, setGroups, socketId });
  useChecklistSync({ socket, setGroups });

  // 그룹 네비게이션
  const groupRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [currentGroupIdx, setCurrentGroupIdx] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);

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
      setIsAtBottom(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10);
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
      if (currentGroupIdx >= groups.length - 1) {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
      } else {
        groupRefs.current.get(groups[currentGroupIdx + 1].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  return (
    <div className="checklist-page min-h-screen bg-[#F2F2F0]">
      <ChecklistHeader
        campId={campId}
        camp={camp}
        showCompleted={showCompleted}
        onToggleCompleted={() => setShowCompleted((v) => !v)}
      />

      <SortableContainer<ChecklistGroup, ChecklistItem>
        dnd={dnd}
        groupIds={groups.map((g) => g.id)}
        renderItemOverlay={(item) => (
          <div className="rounded-xl bg-white px-5 py-2.5 shadow-lg ring-1 ring-black/5">
            <p className="text-[15px] text-gray-900">{item.title}</p>
            {item.memo && <p className="mt-0.5 truncate text-[12px] text-gray-400">{item.memo}</p>}
          </div>
        )}
        renderGroupOverlay={(group) => (
          <div className="rounded-xl bg-gray-50 px-4 py-2 shadow-lg ring-1 ring-black/5">
            <p className="text-[12px] font-semibold text-gray-600">{group.title}</p>
            <p className="text-[11px] text-gray-400">{group.items.length}개 항목</p>
          </div>
        )}
      >
        <main className="checklist-content mx-auto max-w-sm space-y-2.5 px-4 pb-24 pt-3">
          {groups.map((group) => (
            <ChecklistGroupSection
              key={group.id}
              group={group}
              isCollapsed={collapsedGroupIds.has(group.id)}
              onToggleCollapse={() => toggleCollapse(group.id)}
              showCompleted={showCompleted}
              delayedRemoveIds={delayedRemoveIds}
              members={members}
              isDragging={dnd.activeId === group.id}
              onUpdateGroup={(title) => handleUpdateGroup(group.id, title)}
              onDeleteGroup={() => handleDeleteGroup(group.id)}
              onToggleCheck={handleToggleCheck}
              onDeleteItem={handleDeleteItem}
              onUpdateItem={handleUpdateItem}
              onOpenPicker={(itemId, assignees) => openAssigneePicker(itemId, assignees)}
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
                <button
                  type="button"
                  onClick={cancelAddGroup}
                  className="checklist-add-group-cancel text-[13px] text-gray-400"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={startAddGroup}
              className="checklist-add-group-trigger flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3.5 text-[13px] font-medium text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              그룹 추가
            </button>
          )}
        </main>
      </SortableContainer>

      <GroupNavFAB
        groupCount={groups.length}
        currentGroupIdx={currentGroupIdx}
        isAtBottom={isAtBottom}
        onScrollUp={() => scrollToGroup('up')}
        onScrollDown={() => scrollToGroup('down')}
      />

      {assigningItem && (
        <AssigneeSheet
          itemTitle={assigningItem.title}
          members={members}
          initialMemberIds={assigningItem.assignees.map((a) => a.memberId)}
          assignees={assigningItem.assignees}
          onSave={handleSaveAssignees}
          onClose={() => setAssigningItem(null)}
        />
      )}
    </div>
  );
}
