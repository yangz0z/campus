interface GroupNavFABProps {
  groupCount: number;
  currentGroupIdx: number;
  isAtBottom: boolean;
  onScrollUp: () => void;
  onScrollDown: () => void;
}

export default function GroupNavFAB({ groupCount, currentGroupIdx, isAtBottom, onScrollUp, onScrollDown }: GroupNavFABProps) {
  if (groupCount <= 1) return null;

  return (
    <nav className="checklist-group-nav fixed bottom-6 right-4 z-40 flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onScrollUp}
        className="checklist-group-nav-up flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors hover:bg-gray-50 active:bg-gray-100"
      >
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 7L6 2L11 7" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onScrollDown}
        disabled={currentGroupIdx === groupCount - 1 && isAtBottom}
        className="checklist-group-nav-down flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:opacity-30"
      >
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1L6 6L11 1" stroke="#666" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
