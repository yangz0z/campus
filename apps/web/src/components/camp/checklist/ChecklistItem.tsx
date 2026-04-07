'use client';

import { useEffect, useRef, useState } from 'react';
import type { AssigneeInfo, CampMemberInfo } from '@campus/shared';
import { GripHandle, useSortableStyle } from '@/components/ui/dnd';
import SwipeRow from '@/components/ui/SwipeRow';
import Avatar from '../shared/Avatar';

type CheckStatus = 'none' | 'partial' | 'complete';

interface ChecklistItemData {
  id: string;
  title: string;
  isRequired: boolean;
  memo: string | null;
  assignees: AssigneeInfo[];
  isCheckedByMe: boolean;
}

interface ChecklistItemProps {
  item: ChecklistItemData;
  groupId: string;
  isFirst: boolean;
  members: CampMemberInfo[];
  checkStatus: CheckStatus;
  onToggleCheck: () => void;
  onDeleteItem: () => void;
  onUpdateItem: (title: string, memo: string | null) => void;
  onOpenPicker: () => void;
  showAssignees: boolean;
}

export default function ChecklistItem({
  item,
  groupId,
  isFirst,
  members,
  checkStatus,
  onToggleCheck,
  onDeleteItem,
  onUpdateItem,
  onOpenPicker,
  showAssignees,
}: ChecklistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    style: sortableStyle,
  } = useSortableStyle(
    { id: item.id, data: { type: 'item', groupId } },
    { dragOpacity: 0 },
  );

  const [isEditing, setIsEditing] = useState(false);
  const [pendingTitle, setPendingTitle] = useState('');
  const [pendingMemo, setPendingMemo] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => titleInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  function openEditor() {
    setPendingTitle(item.title);
    setPendingMemo(item.memo ?? '');
    setIsEditing(true);
  }

  function handleSave() {
    const title = pendingTitle.trim() || item.title;
    const memo = pendingMemo.trim() || null;
    setIsEditing(false);
    onUpdateItem(title, memo);
  }

  const deleteAction = {
    key: 'delete',
    label: '삭제',
    icon: (
      <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
        <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    onClick: onDeleteItem,
    className: 'bg-red-50 text-red-500',
  };

  return (
    <div ref={setNodeRef} style={sortableStyle} className="checklist-item group relative">
      {!isFirst && <div className="checklist-item-divider mx-5 h-px bg-gray-100" />}

      <SwipeRow
        actions={[deleteAction]}
        className={isFirst ? 'rounded-t-2xl' : ''}
        disabled={isEditing}
      >
        {({ contentStyle, isSwipeOpen, closeSwipe }) => (
          <div
            style={contentStyle}
            className="relative z-10 flex items-center gap-2 bg-white pl-2 pr-5 py-2.5"
            onClick={() => { if (isSwipeOpen) closeSwipe(); }}
          >
            <GripHandle listeners={listeners} attributes={attributes} className="text-gray-200" iconClassName="h-3.5 w-3.5" />
            {/* 체크박스 (3단계) */}
            <button
              type="button"
              onClick={(e) => {
                if (isSwipeOpen) { e.stopPropagation(); closeSwipe(); return; }
                onToggleCheck();
              }}
              className={`checklist-checkbox flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded transition-colors ${
                checkStatus === 'complete'
                  ? 'bg-primary-600 text-white'
                  : checkStatus === 'partial'
                    ? 'bg-amber-400 text-white'
                    : 'border border-gray-300 hover:border-gray-400'
              }`}
            >
              {checkStatus === 'complete' && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 3.5L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {checkStatus === 'partial' && (
                <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
                  <path d="M1 1h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* 텍스트 영역 */}
            <div
              className="checklist-item-body min-w-0 flex-1 select-none"
              onClick={(e) => {
                if (isSwipeOpen) { e.stopPropagation(); closeSwipe(); return; }
                if (!isEditing) openEditor();
              }}
              onBlur={(e) => { if (isEditing && !e.currentTarget.contains(e.relatedTarget)) handleSave(); }}
            >
              {isEditing ? (
                <input
                  ref={titleInputRef}
                  value={pendingTitle}
                  onChange={(e) => setPendingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                    if (e.key === 'Escape') { setIsEditing(false); }
                  }}
                  className="checklist-title-input w-full bg-transparent text-[15px] text-gray-900 outline-none"
                />
              ) : (
                <p className={`checklist-item-title text-[15px] transition-colors ${
                  checkStatus === 'complete' ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}>
                  {item.title}
                  {item.isRequired && checkStatus !== 'complete' && (
                    <span className="checklist-item-required ml-1.5 text-[11px] font-bold text-red-500">필수</span>
                  )}
                </p>
              )}
              {isEditing ? (
                <input
                  value={pendingMemo}
                  onChange={(e) => setPendingMemo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
                    if (e.key === 'Escape') { setIsEditing(false); }
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

            {/* 담당자 버튼 — 2명 이상 */}
            {showAssignees && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (isSwipeOpen) { closeSwipe(); return; } onOpenPicker(); }}
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
                    {(() => {
                      const baseSize = 24;
                      const hasOverflow = item.assignees.length > 2;
                      const tw = 2 * baseSize - Math.round(baseSize * 0.27);
                      const avatarSize = hasOverflow ? Math.floor(tw / (3 - 2 * 0.27)) : baseSize;
                      const ol = Math.round(avatarSize * 0.27);
                      return (
                        <>
                          {item.assignees.slice(0, 2).map((a, idx) => (
                            <span key={a.memberId} className="relative" style={{ marginLeft: idx === 0 ? 0 : -ol }}>
                              <span className={checkStatus === 'partial' && a.isChecked ? 'opacity-30 grayscale' : ''}>
                                <Avatar nickname={a.nickname} profileImage={a.profileImage} size={avatarSize} />
                              </span>
                              {checkStatus === 'partial' && a.isChecked && (
                                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary-500 ring-1 ring-white">
                                  <svg width="6" height="5" viewBox="0 0 7 6" fill="none">
                                    <path d="M1 3L2.8 5L6 1" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              )}
                            </span>
                          ))}
                          {hasOverflow && (
                            <span
                              className="checklist-assignee-overflow flex items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-500 ring-1 ring-white"
                              style={{ width: avatarSize, height: avatarSize, marginLeft: -ol, fontSize: Math.round(avatarSize * 0.4) }}
                            >
                              +{item.assignees.length - 2}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </span>
                )}
              </button>
            )}

          </div>
        )}
      </SwipeRow>

      {/* 삭제 버튼 — 웹 hover 시만, 카드 오른쪽 바깥 절대 위치 */}
      <button
        type="button"
        onClick={onDeleteItem}
        className="absolute right-0 top-1/2 hidden h-7 w-7 -translate-y-1/2 translate-x-[calc(100%+6px)] items-center justify-center rounded-full opacity-0 transition-all group-hover:bg-gray-100 group-hover:opacity-100 hover:bg-red-50 active:bg-red-100 md:flex"
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-red-400">
          <path d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.7 7.5h6.6L11 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
