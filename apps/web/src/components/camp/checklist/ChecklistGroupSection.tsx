'use client';

import { useRef, useState } from 'react';
import type { AssigneeInfo, CampMemberInfo, ChecklistGroup } from '@campus/shared';
import ChecklistItem from './ChecklistItem';

type CheckStatus = 'none' | 'partial' | 'complete';

function getCheckStatus(item: { assignees: AssigneeInfo[]; isCheckedByMe: boolean }): CheckStatus {
  if (item.assignees.length === 0) return item.isCheckedByMe ? 'complete' : 'none';
  const checkedCount = item.assignees.filter((a) => a.isChecked).length;
  if (checkedCount === 0) return 'none';
  if (checkedCount === item.assignees.length) return 'complete';
  return 'partial';
}

interface ChecklistGroupSectionProps {
  group: ChecklistGroup;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  showCompleted: boolean;
  recentlyCheckedIds: Set<string>;
  members: CampMemberInfo[];
  onToggleCheck: (itemId: string, currentValue: boolean) => void;
  onUpdateItem: (itemId: string, title: string, memo: string | null) => void;
  onOpenPicker: (itemId: string, assignees: AssigneeInfo[]) => void;
  onAddItem: (groupId: string, title: string) => Promise<void>;
  setGroupRef: (id: string, el: HTMLElement | null) => void;
}

export default function ChecklistGroupSection({
  group,
  isCollapsed,
  onToggleCollapse,
  showCompleted,
  recentlyCheckedIds,
  members,
  onToggleCheck,
  onUpdateItem,
  onOpenPicker,
  onAddItem,
  setGroupRef,
}: ChecklistGroupSectionProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const itemInputRef = useRef<HTMLInputElement>(null);

  const visibleItems = showCompleted
    ? group.items
    : group.items.filter((item) => getCheckStatus(item) !== 'complete' || recentlyCheckedIds.has(item.id));
  const completedCount = group.items.filter((item) => getCheckStatus(item) === 'complete').length;

  function openAddItem() {
    setIsAddingItem(true);
    setNewItemTitle('');
    setTimeout(() => itemInputRef.current?.focus(), 50);
  }

  function cancelAddItem() {
    setIsAddingItem(false);
    setNewItemTitle('');
  }

  async function handleAddItem() {
    const title = newItemTitle.trim();
    if (!title) { cancelAddItem(); return; }
    setAddingItem(true);
    try {
      await onAddItem(group.id, title);
      setNewItemTitle('');
      setTimeout(() => itemInputRef.current?.focus(), 50);
    } finally {
      setAddingItem(false);
    }
  }

  return (
    <section
      ref={(el) => setGroupRef(group.id, el)}
      className="checklist-group"
    >
      <div className="checklist-group-header mb-2 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="checklist-group-collapse-btn flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 transition-colors hover:text-gray-500"
        >
          <svg
            width="10" height="10" viewBox="0 0 10 10" fill="none"
            className={`shrink-0 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
          >
            <path d="M2 3L5 6L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {group.title}
        </button>
        <div className="checklist-group-meta flex items-center gap-2">
          {!showCompleted && completedCount > 0 && (
            <p className="checklist-completed-count text-[11px] text-gray-300">{completedCount}개 완료</p>
          )}
          {isCollapsed && (
            <p className="checklist-item-count text-[11px] text-gray-300">{visibleItems.length}개 항목</p>
          )}
        </div>
      </div>

      <div className={`checklist-group-card overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ease-in-out ${
        isCollapsed ? 'max-h-0 opacity-0 shadow-none' : 'max-h-[2000px] opacity-100'
      }`}>
        {visibleItems.map((item, i) => (
          <ChecklistItem
            key={item.id}
            item={item}
            isFirst={i === 0}
            isFadingOut={recentlyCheckedIds.has(item.id)}
            members={members}
            checkStatus={getCheckStatus(item)}
            onToggleCheck={() => onToggleCheck(item.id, item.isCheckedByMe)}
            onUpdateItem={(title, memo) => onUpdateItem(item.id, title, memo)}
            onOpenPicker={() => onOpenPicker(item.id, item.assignees)}
            showAssignees={members.length > 1}
          />
        ))}

        {/* 아이템 추가 */}
        {isAddingItem ? (
          <div className="checklist-add-item">
            <div className="mx-5 h-px bg-gray-100" />
            <div className="checklist-add-item-row flex items-center gap-3 px-5 py-2.5">
              <span className="h-4 w-4 shrink-0 rounded border border-gray-200" />
              <input
                ref={itemInputRef}
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') cancelAddItem();
                }}
                placeholder="항목 이름"
                disabled={addingItem}
                className="checklist-add-item-input flex-1 bg-transparent text-[15px] text-gray-900 placeholder-gray-300 outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleAddItem}
                disabled={addingItem || !newItemTitle.trim()}
                className="checklist-add-item-submit shrink-0 text-[13px] font-semibold text-primary-600 disabled:text-gray-300"
              >
                추가
              </button>
              <button type="button" onClick={cancelAddItem} className="checklist-add-item-cancel shrink-0 text-[13px] text-gray-400">
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className="checklist-add-item-trigger">
            {group.items.length > 0 && <div className="mx-5 h-px bg-gray-100" />}
            <button
              type="button"
              onClick={openAddItem}
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
}
