'use client';

import { useRouter } from 'next/navigation';

export default function CloseButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      aria-label="닫기"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  );
}
