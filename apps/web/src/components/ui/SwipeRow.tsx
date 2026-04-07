'use client';

import { useRef, useState, type ReactNode } from 'react';

export interface SwipeAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  className: string;
}

interface SwipeChildProps {
  contentStyle: React.CSSProperties;
  isSwipeOpen: boolean;
  closeSwipe: () => void;
}

interface SwipeRowProps {
  actions: SwipeAction[];
  /** Width per action button (default: 64) */
  actionWidth?: number;
  className?: string;
  disabled?: boolean;
  children: (props: SwipeChildProps) => ReactNode;
}

export default function SwipeRow({
  actions,
  actionWidth = 64,
  className,
  disabled = false,
  children,
}: SwipeRowProps) {
  const openWidth = actionWidth * actions.length;
  const threshold = openWidth / 2;

  const [swipeX, setSwipeX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const swipeBaseRef = useRef(0);
  const directionRef = useRef<'h' | 'v' | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    if (disabled) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    swipeBaseRef.current = swipeX;
    directionRef.current = null;
    setIsSwiping(true);
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (disabled) return;
    const dx = touchStartXRef.current - e.touches[0].clientX;
    const dy = Math.abs(e.touches[0].clientY - touchStartYRef.current);

    if (directionRef.current === null) {
      if (Math.abs(dx) < 5 && dy < 5) return;
      directionRef.current = Math.abs(dx) > dy ? 'h' : 'v';
    }
    if (directionRef.current === 'v') { setIsSwiping(false); return; }

    const raw = swipeBaseRef.current + dx;
    setSwipeX(Math.max(0, Math.min(openWidth, raw)));
  }

  function handleTouchEnd() {
    setIsSwiping(false);
    if (directionRef.current !== 'h') return;
    setSwipeX(swipeX >= threshold ? openWidth : 0);
    directionRef.current = null;
  }

  function closeSwipe() { setSwipeX(0); }

  const isSwipeOpen = swipeX > 0;
  const contentStyle: React.CSSProperties = {
    transform: `translateX(${-swipeX}px)`,
    transition: isSwiping ? 'none' : 'transform 0.2s ease',
  };

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{ touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 스와이프 액션 버튼 영역 */}
      <div
        className="absolute bottom-0 right-0 top-0 flex"
        style={{ width: openWidth }}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={() => { closeSwipe(); action.onClick(); }}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${action.className}`}
          >
            {action.icon}
            <span className="text-[10px] font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {children({ contentStyle, isSwipeOpen, closeSwipe })}
    </div>
  );
}
