'use client';

import { useState } from 'react';
import type { AssigneeInfo, CampMemberInfo } from '@campus/shared';
import Avatar from '../shared/Avatar';

interface AssigneeSheetProps {
  itemTitle: string;
  members: CampMemberInfo[];
  initialMemberIds: string[];
  assignees: AssigneeInfo[];
  onSave: (memberIds: string[]) => Promise<void>;
  onClose: () => void;
}

export default function AssigneeSheet({ itemTitle, members, initialMemberIds, assignees, onSave, onClose }: AssigneeSheetProps) {
  const [pendingMemberIds, setPendingMemberIds] = useState<string[]>(initialMemberIds);
  const assigneeMap = new Map(assignees.map((a) => [a.memberId, a.isChecked]));

  function toggleMember(memberId: string) {
    setPendingMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  }

  function handleSave() {
    onSave(pendingMemberIds);
  }

  return (
    <div className="checklist-assignee-sheet fixed inset-0 z-50 flex flex-col justify-end">
      <div className="checklist-assignee-backdrop absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="checklist-assignee-panel relative mx-auto w-full max-w-sm rounded-t-2xl bg-white px-5 pb-8 pt-5 shadow-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />
        <p className="checklist-assignee-label mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">담당자 지정</p>
        <p className="checklist-assignee-title mb-4 truncate text-[16px] font-semibold text-gray-900">{itemTitle}</p>
        <ul className="checklist-assignee-list space-y-1">
          {members.map((m) => {
            const selected = pendingMemberIds.includes(m.memberId);
            const isChecked = assigneeMap.get(m.memberId);
            const isAssigned = assigneeMap.has(m.memberId);
            return (
              <li key={m.memberId} className="checklist-assignee-option">
                <button
                  type="button"
                  onClick={() => toggleMember(m.memberId)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${selected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                >
                  <span className="relative shrink-0">
                    <Avatar nickname={m.nickname} profileImage={m.profileImage} size={36} />
                    {isAssigned && (
                      <span className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white ${isChecked ? 'bg-primary-500' : 'bg-gray-300'}`}>
                        {isChecked ? (
                          <svg width="8" height="7" viewBox="0 0 9 8" fill="none">
                            <path d="M1 4L3.5 6.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="7" height="2" viewBox="0 0 7 2" fill="none">
                            <path d="M1 1h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </span>
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col items-start">
                    <span className={`text-[15px] font-medium ${selected ? 'text-primary-700' : 'text-gray-800'}`}>
                      {m.nickname}
                      {m.role === 'owner' && <span className="ml-1.5 text-[11px] font-normal text-gray-400">방장</span>}
                    </span>
                    {isAssigned && (
                      <span className={`text-[11px] font-medium ${isChecked ? 'text-primary-500' : 'text-gray-400'}`}>
                        {isChecked ? '✓ 완료' : '— 미완료'}
                      </span>
                    )}
                  </span>
                  {selected && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-primary-600">
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
          onClick={handleSave}
          className="checklist-assignee-submit mt-5 w-full rounded-xl bg-primary-600 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
        >
          확인
        </button>
      </div>
    </div>
  );
}
