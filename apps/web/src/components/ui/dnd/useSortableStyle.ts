'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * useSortable + CSS transform style 계산을 한번에.
 * 반환값: sortable 기본 값 + style 객체
 */
export function useSortableStyle(
  options: Parameters<typeof useSortable>[0],
  opts?: { dragOpacity?: number },
) {
  const sortable = useSortable(options);
  const { transform, transition, isDragging } = sortable;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? (opts?.dragOpacity ?? 0.4) : 1,
  };

  return { ...sortable, style };
}
