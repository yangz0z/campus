'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { ChecklistGroup } from '@campus/shared';
import { getCampChecklist } from '@/lib/api/camps';

export default function ChecklistPage() {
  const { campId } = useParams<{ campId: string }>();
  const { getToken } = useAuth();
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChecklist() {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getCampChecklist(token, campId);
        setGroups(data.groups);
      } catch {
        setError('체크리스트를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    }
    fetchChecklist();
  }, [campId, getToken]);

  if (loading) {
    return (
      <section className="mx-auto max-w-screen-sm px-4 py-16 text-center">
        <p className="text-gray-400">불러오는 중...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-screen-sm px-4 py-16 text-center">
        <p className="text-red-500">{error}</p>
        <Link
          href="/mypage"
          className="mt-4 inline-flex text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          내 캠프로 돌아가기
        </Link>
      </section>
    );
  }

  if (groups.length === 0) {
    return (
      <section className="mx-auto max-w-screen-sm px-4 py-16 text-center">
        <p className="text-5xl">📋</p>
        <p className="mt-4 text-lg font-medium text-gray-500">체크리스트가 아직 없어요</p>
        <Link
          href="/mypage"
          className="mt-4 inline-flex text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          내 캠프로 돌아가기
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-screen-sm px-4 pb-20 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          내 캠프
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">체크리스트</h1>

      <div className="mt-6 space-y-6">
        {groups.map((group) => (
          <div key={group.id}>
            <h2 className="text-lg font-semibold text-gray-800">{group.title}</h2>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-earth-200 bg-white px-4 py-3"
                >
                  <span className="mt-0.5 h-5 w-5 shrink-0 rounded border border-gray-300" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-800">
                      {item.title}
                      {item.isRequired && (
                        <span className="ml-1.5 text-xs font-semibold text-red-500">필수</span>
                      )}
                    </span>
                    {item.memo && (
                      <p className="mt-0.5 text-xs text-gray-400">{item.memo}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
