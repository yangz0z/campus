'use client';

import { useEffect, useRef, useState } from 'react';
import type { AssigneeInfo, CampMemberInfo } from '@campus/shared';
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
  isFirst: boolean;
  isFadingOut: boolean;
  members: CampMemberInfo[];
  checkStatus: CheckStatus;
  onToggleCheck: () => void;
  onSaveMemo: (memo: string | null) => void;
  onOpenPicker: () => void;
  showAssignees: boolean;
}

export default function ChecklistItem({
  item,
  isFirst,
  isFadingOut,
  members,
  checkStatus,
  onToggleCheck,
  onSaveMemo,
  onOpenPicker,
  showAssignees,
}: ChecklistItemProps) {
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [pendingMemo, setPendingMemo] = useState('');
  const memoInputRef = useRef<HTMLInputElement>(null);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFiredRef = useRef(false);

  useEffect(() => {
    if (isEditingMemo) {
      const timer = setTimeout(() => memoInputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [isEditingMemo]);

  function openMemoEditor() {
    setIsEditingMemo(true);
    setPendingMemo(item.memo ?? '');
  }

  function handleSaveMemo() {
    const memo = pendingMemo.trim() || null;
    setIsEditingMemo(false);
    onSaveMemo(memo);
  }

  function startLongPress() {
    if (isEditingMemo) return;
    longPressFiredRef.current = false;
    longPressRef.current = setTimeout(() => {
      longPressFiredRef.current = true;
      openMemoEditor();
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

  return (
    <div
      className={`checklist-item group overflow-hidden transition-all duration-500 ease-in-out ${
        isFadingOut ? 'max-h-0 scale-95 opacity-0' : 'max-h-40 opacity-100'
      }`}
    >
      {!isFirst && <div className="checklist-item-divider mx-5 h-px bg-gray-100" />}
      <div className="checklist-item-row flex items-center gap-2 px-5 py-2.5">

        {/* 체크박스 (3단계) */}
        <button
          type="button"
          onClick={onToggleCheck}
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
          className="checklist-item-body min-w-0 flex-1 cursor-pointer select-none"
          onClick={() => { if (!isEditingMemo) onToggleCheck(); }}
          onTouchStart={startLongPress}
          onTouchEnd={(e) => cancelLongPress(e)}
          onTouchMove={() => cancelLongPress()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <p className={`checklist-item-title text-[15px] transition-colors ${
            checkStatus === 'complete' ? 'text-gray-400 line-through' : 'text-gray-900'
          }`}>
            {item.title}
            {item.isRequired && checkStatus !== 'complete' && (
              <span className="checklist-item-required ml-1.5 text-[11px] font-bold text-red-500">필수</span>
            )}
          </p>
          {isEditingMemo ? (
            <input
              ref={memoInputRef}
              autoFocus
              value={pendingMemo}
              onChange={(e) => setPendingMemo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleSaveMemo(); }
                if (e.key === 'Escape') { setIsEditingMemo(false); }
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
          onClick={openMemoEditor}
          className="checklist-memo-btn flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 active:bg-gray-200"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={item.memo ? 'text-primary-400' : 'text-gray-400'}>
            <path d="M2 9.5V12h2.5l6.5-6.5-2.5-2.5L2 9.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M9.5 3L11 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>

        {/* 담당자 버튼 — 2명 이상 */}
        {showAssignees && (
          <button
            type="button"
            onClick={onOpenPicker}
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
  );
}
