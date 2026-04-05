'use client';

import { useCallback, useRef, useState } from 'react';
import type { ChecklistGroup } from '@campus/shared';
import {
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { reorderChecklistItems, reorderChecklistGroups } from '@/actions/camp';

const GROUP_DROPPABLE_PREFIX = 'group-drop-';

export function getGroupDroppableId(groupId: string) {
  return `${GROUP_DROPPABLE_PREFIX}${groupId}`;
}

function parseGroupDroppableId(id: string): string | null {
  return id.startsWith(GROUP_DROPPABLE_PREFIX) ? id.slice(GROUP_DROPPABLE_PREFIX.length) : null;
}

interface UseChecklistDndParams {
  campId: string;
  groups: ChecklistGroup[];
  setGroups: React.Dispatch<React.SetStateAction<ChecklistGroup[]>>;
}

export function useChecklistDnd({ campId, groups, setGroups }: UseChecklistDndParams) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'group' | 'item' | null>(null);

  // 드래그 시작 시 원래 그룹 기억 (API 호출용)
  const dragSourceGroupRef = useRef<string | null>(null);

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  const collisionDetection: CollisionDetection = useCallback((args) => {
    const type = args.active.data.current?.type;
    if (type === 'group') {
      // 그룹 드래그: 그룹끼리만
      const filtered = args.droppableContainers.filter(
        (c) => c.data.current?.type === 'group',
      );
      return closestCenter({ ...args, droppableContainers: filtered });
    }
    // 아이템 드래그: 아이템 + 그룹 droppable 컨테이너
    const filtered = args.droppableContainers.filter(
      (c) => c.data.current?.type === 'item' || c.data.current?.type === 'group-container',
    );
    return closestCenter({ ...args, droppableContainers: filtered });
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    const type = event.active.data.current?.type as 'group' | 'item' | undefined;
    setActiveId(id);
    setActiveType(type ?? null);
    if (type === 'item') {
      dragSourceGroupRef.current = event.active.data.current?.groupId as string;
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'item') return;

    const activeItemId = String(active.id);
    const overId = String(over.id);

    // over 대상이 그룹 droppable 컨테이너인 경우
    const overGroupDropId = parseGroupDroppableId(overId);
    // over 대상이 아이템인 경우 해당 아이템의 그룹
    const overGroupId = overGroupDropId ?? (over.data.current?.groupId as string | undefined);

    if (!overGroupId) return;

    // 현재 active 아이템이 속한 그룹 찾기
    const activeGroup = groups.find((g) => g.items.some((i) => i.id === activeItemId));
    if (!activeGroup || activeGroup.id === overGroupId) return;

    // 그룹 간 이동: 소스 그룹에서 제거 → 타겟 그룹에 추가
    setGroups((prev) => {
      const item = prev.flatMap((g) => g.items).find((i) => i.id === activeItemId);
      if (!item) return prev;

      return prev.map((g) => {
        if (g.id === activeGroup.id) {
          return { ...g, items: g.items.filter((i) => i.id !== activeItemId) };
        }
        if (g.id === overGroupId) {
          if (overGroupDropId) {
            // 빈 그룹 컨테이너에 드롭 → 맨 끝에 추가
            return { ...g, items: [...g.items, item] };
          }
          // 특정 아이템 위에 드롭 → 해당 위치에 삽입
          const overIndex = g.items.findIndex((i) => i.id === overId);
          const newItems = [...g.items];
          newItems.splice(overIndex, 0, item);
          return { ...g, items: newItems };
        }
        return g;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over || active.id === over.id) {
      dragSourceGroupRef.current = null;
      return;
    }

    const type = active.data.current?.type as 'group' | 'item';

    if (type === 'group') {
      const oldIndex = groups.findIndex((g) => g.id === active.id);
      const newIndex = groups.findIndex((g) => g.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(groups, oldIndex, newIndex);
      setGroups(reordered);
      reorderChecklistGroups(campId, { groupIds: reordered.map((g) => g.id) });
    } else if (type === 'item') {
      const activeItemId = String(active.id);
      const overId = String(over.id);

      // 아이템이 현재 속한 그룹 찾기
      const currentGroup = groups.find((g) => g.items.some((i) => i.id === activeItemId));
      if (!currentGroup) { dragSourceGroupRef.current = null; return; }

      // 같은 그룹 내 정렬
      const overGroupDropId = parseGroupDroppableId(overId);
      if (!overGroupDropId && over.data.current?.groupId === currentGroup.id) {
        const oldIndex = currentGroup.items.findIndex((i) => i.id === activeItemId);
        const newIndex = currentGroup.items.findIndex((i) => i.id === overId);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reorderedItems = arrayMove(currentGroup.items, oldIndex, newIndex);
          setGroups((prev) =>
            prev.map((g) => (g.id === currentGroup.id ? { ...g, items: reorderedItems } : g)),
          );
        }
      }

      // API 호출: 현재 그룹의 아이템 순서 저장
      const finalGroup = groups.find((g) => g.items.some((i) => i.id === activeItemId))
        ?? currentGroup;
      reorderChecklistItems(campId, finalGroup.id, {
        itemIds: finalGroup.items.map((i) => i.id),
      });

      dragSourceGroupRef.current = null;
    }
  }

  // DragOverlay에서 사용할 활성 아이템/그룹 데이터
  const activeItem = activeId && activeType === 'item'
    ? groups.flatMap((g) => g.items).find((i) => i.id === activeId) ?? null
    : null;
  const activeGroup = activeId && activeType === 'group'
    ? groups.find((g) => g.id === activeId) ?? null
    : null;

  return {
    sensors,
    collisionDetection,
    activeId,
    activeType,
    activeItem,
    activeGroup,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
