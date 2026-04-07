'use client';

import { useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import type { CampMemberInfo, ChecklistGroup } from '@campus/shared';
import {
  SocketEvents,
  type GroupCreatedPayload,
  type GroupUpdatedPayload,
  type GroupDeletedPayload,
  type GroupsReorderedPayload,
  type ItemCreatedPayload,
  type ItemUpdatedPayload,
  type ItemDeletedPayload,
  type ItemsReorderedPayload,
  type CheckToggledPayload,
  type AssigneesSetPayload,
  type MemberJoinedPayload,
  type MemberLeftPayload,
} from '@campus/shared';

interface UseChecklistSyncParams {
  socket: Socket | null;
  setGroups: React.Dispatch<React.SetStateAction<ChecklistGroup[]>>;
  setMembers: React.Dispatch<React.SetStateAction<CampMemberInfo[]>>;
}

export function useChecklistSync({ socket, setGroups, setMembers }: UseChecklistSyncParams) {
  useEffect(() => {
    if (!socket) return;

    function onGroupCreated(data: GroupCreatedPayload) {
      setGroups((prev) => [...prev, { ...data.group, items: [] }]);
    }

    function onGroupUpdated(data: GroupUpdatedPayload) {
      setGroups((prev) =>
        prev.map((g) => (g.id === data.groupId ? { ...g, title: data.title } : g)),
      );
    }

    function onGroupDeleted(data: GroupDeletedPayload) {
      setGroups((prev) => prev.filter((g) => g.id !== data.groupId));
    }

    function onGroupsReordered(data: GroupsReorderedPayload) {
      setGroups((prev) => {
        const map = new Map(prev.map((g) => [g.id, g]));
        return data.groupIds
          .map((id) => map.get(id))
          .filter((g): g is ChecklistGroup => !!g);
      });
    }

    function onItemCreated(data: ItemCreatedPayload) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === data.groupId ? { ...g, items: [...g.items, data.item] } : g,
        ),
      );
    }

    function onItemUpdated(data: ItemUpdatedPayload) {
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) =>
            i.id === data.itemId ? { ...i, title: data.title, memo: data.memo } : i,
          ),
        })),
      );
    }

    function onItemDeleted(data: ItemDeletedPayload) {
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.filter((i) => i.id !== data.itemId),
        })),
      );
    }

    function onItemsReordered(data: ItemsReorderedPayload) {
      setGroups((prev) => {
        // 모든 그룹에서 이동 대상 아이템 수집
        const allItems = new Map(
          prev.flatMap((g) => g.items).map((i) => [i.id, i]),
        );
        const movedItemIds = new Set(data.itemIds);

        return prev.map((g) => {
          if (g.id === data.targetGroupId) {
            // 대상 그룹: 지정된 순서대로 아이템 배치
            const items = data.itemIds
              .map((id) => allItems.get(id))
              .filter((i): i is ChecklistGroup['items'][number] => !!i);
            return { ...g, items };
          }
          // 다른 그룹: 이동된 아이템 제거
          return { ...g, items: g.items.filter((i) => !movedItemIds.has(i.id)) };
        });
      });
    }

    function onCheckToggled(data: CheckToggledPayload) {
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) => {
            if (i.id !== data.itemId) return i;
            const updatedAssignees = i.assignees.map((a) =>
              a.memberId === data.memberId ? { ...a, isChecked: data.isChecked } : a,
            );
            return { ...i, assignees: updatedAssignees };
          }),
        })),
      );
    }

    function onAssigneesSet(data: AssigneesSetPayload) {
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) =>
            i.id === data.itemId ? { ...i, assignees: data.assignees } : i,
          ),
        })),
      );
    }

    function onMemberJoined(data: MemberJoinedPayload) {
      setMembers((prev) => {
        if (prev.some((m) => m.memberId === data.member.memberId)) return prev;
        return [...prev, data.member];
      });
    }

    function onMemberLeft(data: MemberLeftPayload) {
      setMembers((prev) => prev.filter((m) => m.memberId !== data.memberId));
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) => ({
            ...i,
            assignees: i.assignees.filter((a) => a.memberId !== data.memberId),
          })),
        })),
      );
    }

    socket.on(SocketEvents.MEMBER_JOINED, onMemberJoined);
    socket.on(SocketEvents.MEMBER_LEFT, onMemberLeft);
    socket.on(SocketEvents.GROUP_CREATED, onGroupCreated);
    socket.on(SocketEvents.GROUP_UPDATED, onGroupUpdated);
    socket.on(SocketEvents.GROUP_DELETED, onGroupDeleted);
    socket.on(SocketEvents.GROUPS_REORDERED, onGroupsReordered);
    socket.on(SocketEvents.ITEM_CREATED, onItemCreated);
    socket.on(SocketEvents.ITEM_UPDATED, onItemUpdated);
    socket.on(SocketEvents.ITEM_DELETED, onItemDeleted);
    socket.on(SocketEvents.ITEMS_REORDERED, onItemsReordered);
    socket.on(SocketEvents.CHECK_TOGGLED, onCheckToggled);
    socket.on(SocketEvents.ASSIGNEES_SET, onAssigneesSet);

    return () => {
      socket.off(SocketEvents.MEMBER_JOINED, onMemberJoined);
      socket.off(SocketEvents.MEMBER_LEFT, onMemberLeft);
      socket.off(SocketEvents.GROUP_CREATED, onGroupCreated);
      socket.off(SocketEvents.GROUP_UPDATED, onGroupUpdated);
      socket.off(SocketEvents.GROUP_DELETED, onGroupDeleted);
      socket.off(SocketEvents.GROUPS_REORDERED, onGroupsReordered);
      socket.off(SocketEvents.ITEM_CREATED, onItemCreated);
      socket.off(SocketEvents.ITEM_UPDATED, onItemUpdated);
      socket.off(SocketEvents.ITEM_DELETED, onItemDeleted);
      socket.off(SocketEvents.ITEMS_REORDERED, onItemsReordered);
      socket.off(SocketEvents.CHECK_TOGGLED, onCheckToggled);
      socket.off(SocketEvents.ASSIGNEES_SET, onAssigneesSet);
    };
  }, [socket, setGroups, setMembers]);
}
