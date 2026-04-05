'use client';

import { useCallback, useState } from 'react';
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

// ── Group droppable ID helpers ──

const GROUP_DROP_PREFIX = 'group-drop-';

export function groupDroppableId(groupId: string) {
  return `${GROUP_DROP_PREFIX}${groupId}`;
}

export function parseGroupDroppableId(id: string): string | null {
  return id.startsWith(GROUP_DROP_PREFIX) ? id.slice(GROUP_DROP_PREFIX.length) : null;
}

// ── Generic config ──

interface SortableListConfig<G, I> {
  groups: G[];
  setGroups: React.Dispatch<React.SetStateAction<G[]>>;
  /** group → unique ID */
  getGroupId: (group: G) => string;
  /** group → its items array */
  getItems: (group: G) => I[];
  /** item → unique ID */
  getItemId: (item: I) => string;
  /** return a new group with items replaced */
  setItems: (group: G, items: I[]) => G;
  /** called after groups are reordered (e.g. for API call) */
  onGroupsReordered?: (groups: G[]) => void;
  /** called after items within a group are reordered (e.g. for API call) */
  onItemsReordered?: (group: G) => void;
}

export function useSortableList<G, I>(config: SortableListConfig<G, I>) {
  const {
    groups, setGroups,
    getGroupId, getItems, getItemId, setItems,
    onGroupsReordered, onItemsReordered,
  } = config;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'group' | 'item' | null>(null);

  // ── Sensors ──
  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } });
  const sensors = useSensors(pointerSensor, touchSensor);

  // ── Collision detection ──
  const collisionDetection: CollisionDetection = useCallback((args) => {
    const type = args.active.data.current?.type;
    if (type === 'group') {
      const filtered = args.droppableContainers.filter((c) => c.data.current?.type === 'group');
      return closestCenter({ ...args, droppableContainers: filtered });
    }
    const filtered = args.droppableContainers.filter(
      (c) => c.data.current?.type === 'item' || c.data.current?.type === 'group-container',
    );
    return closestCenter({ ...args, droppableContainers: filtered });
  }, []);

  // ── Drag Start ──
  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setActiveType(event.active.data.current?.type as 'group' | 'item');
  }

  // ── Drag Over (cross-group item movement) ──
  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type !== 'item') return;

    const activeItemId = String(active.id);
    const overId = String(over.id);

    const overGroupDropId = parseGroupDroppableId(overId);
    // groupId field name from data — accept both 'groupId' and 'groupLocalId'
    const overGroupId = overGroupDropId
      ?? (over.data.current?.groupId as string | undefined)
      ?? (over.data.current?.groupLocalId as string | undefined);
    if (!overGroupId) return;

    const activeGroup = groups.find((g) => getItems(g).some((i) => getItemId(i) === activeItemId));
    if (!activeGroup || getGroupId(activeGroup) === overGroupId) return;

    setGroups((prev) => {
      const item = prev.flatMap((g) => getItems(g)).find((i) => getItemId(i) === activeItemId);
      if (!item) return prev;

      return prev.map((g) => {
        const gId = getGroupId(g);
        if (gId === getGroupId(activeGroup)) {
          return setItems(g, getItems(g).filter((i) => getItemId(i) !== activeItemId));
        }
        if (gId === overGroupId) {
          if (overGroupDropId) {
            return setItems(g, [...getItems(g), item]);
          }
          const idx = getItems(g).findIndex((i) => getItemId(i) === overId);
          const newItems = [...getItems(g)];
          newItems.splice(idx, 0, item);
          return setItems(g, newItems);
        }
        return g;
      });
    });
  }

  // ── Drag End ──
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);
    if (!over || active.id === over.id) return;

    const type = active.data.current?.type as 'group' | 'item';

    if (type === 'group') {
      const oldIdx = groups.findIndex((g) => getGroupId(g) === String(active.id));
      const newIdx = groups.findIndex((g) => getGroupId(g) === String(over.id));
      if (oldIdx !== -1 && newIdx !== -1) {
        const reordered = arrayMove(groups, oldIdx, newIdx);
        setGroups(reordered);
        onGroupsReordered?.(reordered);
      }
    } else if (type === 'item') {
      const activeItemId = String(active.id);
      const overId = String(over.id);

      if (!parseGroupDroppableId(overId) && over.data.current?.type === 'item') {
        const currentGroup = groups.find((g) => getItems(g).some((i) => getItemId(i) === activeItemId));
        if (!currentGroup) return;

        const overGroupId = (over.data.current?.groupId as string | undefined)
          ?? (over.data.current?.groupLocalId as string | undefined);

        if (overGroupId === getGroupId(currentGroup)) {
          const items = getItems(currentGroup);
          const oldIdx = items.findIndex((i) => getItemId(i) === activeItemId);
          const newIdx = items.findIndex((i) => getItemId(i) === overId);
          if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
            const reorderedItems = arrayMove(items, oldIdx, newIdx);
            const updatedGroup = setItems(currentGroup, reorderedItems);
            setGroups((prev) =>
              prev.map((g) => (getGroupId(g) === getGroupId(currentGroup) ? updatedGroup : g)),
            );
            onItemsReordered?.(updatedGroup);
          }
        }
      }
    }
  }

  // ── Active data for DragOverlay ──
  const activeItem = activeId && activeType === 'item'
    ? groups.flatMap((g) => getItems(g)).find((i) => getItemId(i) === activeId) ?? null
    : null;
  const activeGroup = activeId && activeType === 'group'
    ? groups.find((g) => getGroupId(g) === activeId) ?? null
    : null;

  return {
    sensors,
    collisionDetection,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeId,
    activeType,
    activeItem,
    activeGroup,
  };
}
