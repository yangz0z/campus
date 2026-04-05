'use client';

import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { groupDroppableId } from './useSortableList';

interface SortableGroupDropzoneProps {
  /** 이 그룹의 고유 ID */
  groupId: string;
  /** 그룹 내 아이템 ID 배열 (SortableContext용) */
  itemIds: string[];
  /** data에 추가로 넘길 값 (groupId / groupLocalId 등) */
  data?: Record<string, unknown>;
  className?: string;
  children: ReactNode;
}

/**
 * 그룹 내부의 드롭 영역 + 아이템 SortableContext를 한번에 제공.
 * useDroppable + SortableContext 보일러플레이트를 대체합니다.
 */
export default function SortableGroupDropzone({
  groupId,
  itemIds,
  data,
  className,
  children,
}: SortableGroupDropzoneProps) {
  const { setNodeRef } = useDroppable({
    id: groupDroppableId(groupId),
    data: { type: 'group-container', groupId, ...data },
  });

  return (
    <div ref={setNodeRef} className={className}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}
