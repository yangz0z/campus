'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { ChecklistGroup, CampMemberInfo, AssigneeInfo } from '@campus/shared';
import { getCampChecklist, getCampMembers, setItemAssignees } from '@/lib/api/camps';

function Avatar({ nickname, profileImage, size = 24 }: { nickname: string; profileImage: string | null; size?: number }) {
  const style = { width: size, height: size, fontSize: size * 0.4 };
  if (profileImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profileImage}
        alt={nickname}
        style={style}
        className="rounded-full object-cover ring-1 ring-white"
      />
    );
  }
  return (
    <span
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 ring-1 ring-white"
    >
      {nickname[0]}
    </span>
  );
}

export default function ChecklistPage() {
  const { campId } = useParams<{ campId: string }>();
  const { getToken } = useAuth();
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [members, setMembers] = useState<CampMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 담당자 지정 모달 상태
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);
  const [pendingMemberIds, setPendingMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken();
        if (!token) return;
        const [checklistData, membersData] = await Promise.all([
          getCampChecklist(token, campId),
          getCampMembers(token, campId),
        ]);
        setGroups(checklistData.groups);
        setMembers(membersData.members);
      } catch {
        setError('데이터를 불러오지 못했어요.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [campId, getToken]);

  function openPicker(itemId: string, currentAssignees: AssigneeInfo[]) {
    setAssigningItemId(itemId);
    setPendingMemberIds(currentAssignees.map((a) => a.memberId));
  }

  function toggleMember(memberId: string) {
    setPendingMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  }

  async function handleSave() {
    if (!assigningItemId) return;
    setSaving(true);
    try {
      const token = await getToken();
      if (!token) return;
      await setItemAssignees(token, campId, assigningItemId, { memberIds: pendingMemberIds });
      // 로컬 상태 업데이트
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          items: g.items.map((i) =>
            i.id === assigningItemId
              ? {
                  ...i,
                  assignees: pendingMemberIds.map((mid) => {
                    const m = members.find((m) => m.memberId === mid)!;
                    return { memberId: mid, nickname: m.nickname, profileImage: m.profileImage };
                  }),
                }
              : i,
          ),
        })),
      );
      setAssigningItemId(null);
    } finally {
      setSaving(false);
    }
  }

  const Header = () => (
    <header className="bg-[#F2F2F0] px-5 pb-3 pt-10">
      <div className="mx-auto flex max-w-sm items-center gap-3">
        <Link
          href="/mypage"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <h1 className="text-[22px] font-bold text-gray-900">체크리스트</h1>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F0]">
        <Header />
        <main className="mx-auto max-w-sm space-y-3 px-4 pt-3">
          {[0, 1].map((g) => (
            <div key={g} className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-3.5">
                <div className="h-3 w-1/4 animate-shimmer rounded-md" />
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <div className="mx-5 h-px bg-gray-100" />
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <div className="h-4 w-4 animate-shimmer rounded" />
                    <div className="h-[15px] w-2/5 animate-shimmer rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F2F2F0]">
        <Header />
        <main className="mx-auto max-w-sm px-4 pt-16 text-center">
          <p className="text-[15px] text-red-500">{error}</p>
          <Link href="/mypage" className="mt-4 inline-flex text-[13px] font-semibold text-primary-600 hover:text-primary-700">
            내 캠프로 돌아가기
          </Link>
        </main>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="min-h-screen bg-[#F2F2F0]">
        <Header />
        <main className="mx-auto max-w-sm px-4 pt-16 text-center">
          <p className="text-[40px] leading-none">📋</p>
          <p className="mt-5 text-[17px] font-bold text-gray-900">체크리스트가 아직 없어요</p>
          <p className="mt-1.5 text-[14px] text-gray-400">캠프를 만들면 체크리스트가 생성돼요.</p>
        </main>
      </div>
    );
  }

  // 현재 모달에서 편집 중인 아이템 제목
  const assigningItem = groups.flatMap((g) => g.items).find((i) => i.id === assigningItemId);

  return (
    <div className="min-h-screen bg-[#F2F2F0]">
      <Header />
      <main className="mx-auto max-w-sm space-y-3 px-4 pb-20 pt-3">
        {groups.map((group) => (
          <section key={group.id}>
            <p className="mb-2 px-1 text-[12px] font-semibold text-gray-400">{group.title}</p>
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              {group.items.map((item, i) => (
                <div key={item.id}>
                  {i !== 0 && <div className="mx-5 h-px bg-gray-100" />}
                  <div className="flex items-center gap-3 px-5 py-3.5">
                    <span className="h-4 w-4 shrink-0 rounded border border-gray-300" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] text-gray-900">
                        {item.title}
                        {item.isRequired && (
                          <span className="ml-1.5 text-[11px] font-bold text-red-500">필수</span>
                        )}
                      </p>
                      {item.memo && (
                        <p className="mt-0.5 truncate text-[12px] text-gray-400">{item.memo}</p>
                      )}
                    </div>

                    {/* 담당자 영역 — 멤버가 2명 이상일 때만 표시 */}
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => openPicker(item.id, item.assignees)}
                        className="flex shrink-0 items-center gap-1 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
                      >
                        {item.assignees.length === 0 ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </span>
                        ) : (
                          <span className="flex items-center">
                            {item.assignees.slice(0, 3).map((a, idx) => (
                              <span key={a.memberId} style={{ marginLeft: idx === 0 ? 0 : -6 }}>
                                <Avatar nickname={a.nickname} profileImage={a.profileImage} size={24} />
                              </span>
                            ))}
                            {item.assignees.length > 3 && (
                              <span
                                className="flex items-center justify-center rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 ring-1 ring-white"
                                style={{ width: 24, height: 24, marginLeft: -6 }}
                              >
                                +{item.assignees.length - 3}
                              </span>
                            )}
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* 담당자 지정 바텀시트 */}
      {assigningItemId && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* 백드롭 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !saving && setAssigningItemId(null)}
          />
          {/* 시트 */}
          <div className="relative mx-auto w-full max-w-sm rounded-t-2xl bg-white px-5 pb-8 pt-5 shadow-xl">
            {/* 핸들 */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">담당자 지정</p>
            <p className="mb-4 truncate text-[16px] font-semibold text-gray-900">{assigningItem?.title}</p>

            <ul className="space-y-1">
              {members.map((m) => {
                const selected = pendingMemberIds.includes(m.memberId);
                return (
                  <li key={m.memberId}>
                    <button
                      type="button"
                      onClick={() => toggleMember(m.memberId)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                        selected ? 'bg-primary-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Avatar nickname={m.nickname} profileImage={m.profileImage} size={36} />
                      <span className={`flex-1 text-left text-[15px] font-medium ${selected ? 'text-primary-700' : 'text-gray-800'}`}>
                        {m.nickname}
                        {m.role === 'owner' && (
                          <span className="ml-1.5 text-[11px] font-normal text-gray-400">방장</span>
                        )}
                      </span>
                      {selected && (
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary-600">
                          <path d="M3.75 9L7.5 12.75L14.25 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mt-5 w-full rounded-xl bg-primary-600 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:opacity-60"
            >
              {saving ? '저장 중...' : '확인'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
