'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Avatar from './Avatar';
import CampKickSheet from '../CampKickSheet';

interface MemberListSheetMember {
  memberId?: string;
  nickname: string;
  profileImage: string | null;
  role?: 'owner' | 'member';
}

interface MemberListSheetProps {
  title?: string;
  members: MemberListSheetMember[];
  onClose: () => void;
  isOwner?: boolean;
  campId?: string;
}

export default function MemberListSheet({ title = '참여자', members, onClose, isOwner, campId }: MemberListSheetProps) {
  const [kickingMember, setKickingMember] = useState<{ memberId: string; nickname: string } | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-white px-5 pb-6 pt-5 shadow-xl">
        <p className="mb-4 text-[16px] font-semibold text-gray-900">{title} <span className="text-gray-400">{members.length}</span></p>
        <ul className="space-y-1">
          {members.map((m, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
              <Avatar nickname={m.nickname} profileImage={m.profileImage} size={36} />
              <span className="text-[15px] font-medium text-gray-800">
                {m.nickname}
                {m.role === 'owner' && <span className="ml-1.5 text-[11px] font-normal text-gray-400">방장</span>}
              </span>
              {isOwner && m.memberId && m.role !== 'owner' && (
                <button
                  type="button"
                  onClick={() => setKickingMember({ memberId: m.memberId!, nickname: m.nickname })}
                  className="ml-auto text-[12px] text-gray-400 transition-colors hover:text-red-500"
                >
                  내보내기
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {kickingMember && campId && createPortal(
        <CampKickSheet
          campId={campId}
          member={kickingMember}
          onClose={() => setKickingMember(null)}
          onKicked={() => setKickingMember(null)}
        />,
        document.body,
      )}
    </div>
  );
}
