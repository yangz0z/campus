'use client';

import { useId, type ReactNode } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { useSortableList } from './useSortableList';

type DndHookReturn = ReturnType<typeof useSortableList<any, any>>;

interface SortableContainerProps<G, I> {
  /** useSortableList 훅의 반환값 */
  dnd: DndHookReturn;
  /** 최상위 SortableContext에 들어갈 그룹 ID 배열 */
  groupIds: string[];
  /** 드래그 중인 그룹의 오버레이 */
  renderGroupOverlay?: (group: G) => ReactNode;
  /** 드래그 중인 아이템의 오버레이 */
  renderItemOverlay?: (item: I) => ReactNode;
  children: ReactNode;
}

export default function SortableContainer<G, I>({
  dnd,
  groupIds,
  renderGroupOverlay,
  renderItemOverlay,
  children,
}: SortableContainerProps<G, I>) {
  const {
    sensors, collisionDetection,
    handleDragStart, handleDragOver, handleDragEnd,
    activeGroup, activeItem,
  } = dnd;

  const dndId = useId();

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>

      <DragOverlay dropAnimation={null}>
        {activeGroup && renderGroupOverlay?.(activeGroup as G)}
        {activeItem && renderItemOverlay?.(activeItem as I)}
      </DragOverlay>
    </DndContext>
  );
}
