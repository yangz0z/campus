'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface GripHandleProps {
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
  className?: string;
  iconClassName?: string;
}

export default function GripHandle({ listeners, attributes, className, iconClassName }: GripHandleProps) {
  return (
    <button
      className={`cursor-grab touch-none p-1 active:cursor-grabbing ${className ?? 'text-gray-300'}`}
      {...attributes}
      {...listeners}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={iconClassName}
      >
        <circle cx="9" cy="6" r="1" />
        <circle cx="15" cy="6" r="1" />
        <circle cx="9" cy="12" r="1" />
        <circle cx="15" cy="12" r="1" />
        <circle cx="9" cy="18" r="1" />
        <circle cx="15" cy="18" r="1" />
      </svg>
    </button>
  );
}
