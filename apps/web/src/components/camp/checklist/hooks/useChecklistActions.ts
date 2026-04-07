import { useRef, useState } from 'react';
import type { AssigneeInfo, CampMemberInfo, ChecklistGroup } from '@campus/shared';
import {
  toggleChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  updateChecklistGroup,
  deleteChecklistGroup,
  setItemAssignees,
  createChecklistGroup,
  createChecklistItem,
} from '@/actions/camp';
import { useAction } from '@/hooks/useAction';

type CheckStatus = 'none' | 'partial' | 'complete';

function getCheckStatus(item: { assignees: AssigneeInfo[]; isCheckedByMe: boolean }): CheckStatus {
  if (item.assignees.length === 0) return item.isCheckedByMe ? 'complete' : 'none';
  const checkedCount = item.assignees.filter((a) => a.isChecked).length;
  if (checkedCount === 0) return 'none';
  if (checkedCount === item.assignees.length) return 'complete';
  return 'partial';
}

interface UseChecklistActionsParams {
  campId: string;
  myMemberId: string;
  members: CampMemberInfo[];
  initialGroups: ChecklistGroup[];
  socketId: string | null;
}

export function useChecklistActions({ campId, myMemberId, members, initialGroups, socketId }: UseChecklistActionsParams) {
  const [groups, setGroups] = useState<ChecklistGroup[]>(initialGroups);
  const [showCompleted, setShowCompleted] = useState(false);
  const [delayedRemoveIds, setDelayedRemoveIds] = useState<Set<string>>(new Set());
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(new Set());

  // 담당자 지정 시트
  const [assigningItem, setAssigningItem] = useState<{ id: string; title: string; assignees: AssigneeInfo[] } | null>(null);

  // 그룹 추가
  const [addingGroup, setAddingGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [addingGroupLoading, setAddingGroupLoading] = useState(false);
  const groupInputRef = useRef<HTMLInputElement>(null);

  const action = useAction();

  async function handleToggleCheck(itemId: string, currentValue: boolean) {
    const targetItem = groups.flatMap((g) => g.items).find((i) => i.id === itemId);
    if (targetItem && targetItem.assignees.length > 0 && !targetItem.assignees.some((a) => a.memberId === myMemberId)) {
      action(() => Promise.reject(), '담당자만 체크할 수 있어요. 담당자를 수정해주세요.');
      return;
    }

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
      setDelayedRemoveIds((prev) => new Set(prev).add(itemId));
      setTimeout(() => {
        setDelayedRemoveIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }, 200);
    }
    await action(
      () => toggleChecklistItem(campId, itemId, { isChecked: newValue }, socketId ?? undefined),
      '체크 상태 변경에 실패했어요.',
    );
  }

  async function handleDeleteItem(itemId: string) {
    setGroups((prev) =>
      prev.map((g) => ({ ...g, items: g.items.filter((i) => i.id !== itemId) })),
    );
    await action(
      () => deleteChecklistItem(campId, itemId, socketId ?? undefined),
      '아이템 삭제에 실패했어요.',
    );
  }

  async function handleUpdateItem(itemId: string, title: string, memo: string | null) {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        items: g.items.map((i) => (i.id === itemId ? { ...i, title, memo } : i)),
      })),
    );
    await action(
      () => updateChecklistItem(campId, itemId, { title, memo }, socketId ?? undefined),
      '아이템 수정에 실패했어요.',
    );
  }

  async function handleSaveAssignees(memberIds: string[]) {
    if (!assigningItem) return;
    const itemId = assigningItem.id;
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
    await action(
      () => setItemAssignees(campId, itemId, { memberIds }, socketId ?? undefined),
      '담당자 지정에 실패했어요.',
    );
  }

  async function handleAddItem(groupId: string, title: string) {
    const result = await action(
      () => createChecklistItem(campId, groupId, { title }, socketId ?? undefined),
      '아이템 추가에 실패했어요.',
    );
    if (result.ok) {
      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, result.data] } : g)),
      );
    }
  }

  async function handleUpdateGroup(groupId: string, title: string) {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, title } : g)),
    );
    await action(
      () => updateChecklistGroup(campId, groupId, title, socketId ?? undefined),
      '그룹 수정에 실패했어요.',
    );
  }

  async function handleDeleteGroup(groupId: string) {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    await action(
      () => deleteChecklistGroup(campId, groupId, socketId ?? undefined),
      '그룹 삭제에 실패했어요.',
    );
  }

  async function handleAddGroup() {
    const title = newGroupTitle.trim();
    if (!title) { setAddingGroup(false); return; }
    setAddingGroupLoading(true);
    const result = await action(
      () => createChecklistGroup(campId, { title }, socketId ?? undefined),
      '그룹 추가에 실패했어요.',
    );
    setAddingGroupLoading(false);
    if (result.ok) {
      setGroups((prev) => [...prev, { ...result.data, items: [] }]);
      setAddingGroup(false);
      setNewGroupTitle('');
    }
  }

  function toggleCollapse(groupId: string) {
    setCollapsedGroupIds((prev) => {
      const next = new Set(prev);
      next.has(groupId) ? next.delete(groupId) : next.add(groupId);
      return next;
    });
  }

  function openAssigneePicker(itemId: string, assignees: AssigneeInfo[]) {
    const item = groups.flatMap((g) => g.items).find((i) => i.id === itemId);
    if (item) setAssigningItem({ id: itemId, title: item.title, assignees });
  }

  function startAddGroup() {
    setAddingGroup(true);
    setNewGroupTitle('');
    setTimeout(() => groupInputRef.current?.focus(), 50);
  }

  function cancelAddGroup() {
    setAddingGroup(false);
    setNewGroupTitle('');
  }

  return {
    groups,
    setGroups,
    showCompleted,
    setShowCompleted,
    delayedRemoveIds,
    collapsedGroupIds,
    toggleCollapse,
    assigningItem,
    setAssigningItem,
    addingGroup,
    newGroupTitle,
    setNewGroupTitle,
    addingGroupLoading,
    groupInputRef,
    handleToggleCheck,
    handleDeleteItem,
    handleUpdateItem,
    handleSaveAssignees,
    handleAddItem,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddGroup,
    openAssigneePicker,
    startAddGroup,
    cancelAddGroup,
  };
}
