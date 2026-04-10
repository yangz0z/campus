'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Avatar from './Avatar';
import MemberListSheet from './MemberListSheet';

interface AvatarGroupMember {
  memberId?: string;
  nickname: string;
  profileImage: string | null;
  role?: 'owner' | 'member';
}

interface AvatarGroupProps {
  members: AvatarGroupMember[];
  size?: number;
  onClick?: () => void;
  isOwner?: boolean;
  campId?: string;
}

export default function AvatarGroup({ members, size = 18, onClick, isOwner, campId }: AvatarGroupProps) {
  const [showSheet, setShowSheet] = useState(false);

  if (members.length < 2) return null;

  const hasOverflow = members.length > 2;
  const totalWidth = 2 * size - Math.round(size * 0.27);
  const avatarSize = hasOverflow ? Math.floor(totalWidth / (3 - 2 * 0.27)) : size;
  const overlap = Math.round(avatarSize * 0.27);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      setShowSheet(true);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className="flex items-center">
        {members.slice(0, 2).map((m, i) => (
          <span key={i} style={{ marginLeft: i === 0 ? 0 : -overlap }}>
            <Avatar nickname={m.nickname} profileImage={m.profileImage} size={avatarSize} />
          </span>
        ))}
        {hasOverflow && (
          <span
            style={{ marginLeft: -overlap, fontSize: Math.round(avatarSize * 0.4), width: avatarSize, height: avatarSize }}
            className="flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-500 ring-1 ring-white"
          >
            +{members.length - 2}
          </span>
        )}
      </button>

      {showSheet && createPortal(
        <MemberListSheet members={members} onClose={() => setShowSheet(false)} isOwner={isOwner} campId={campId} />,
        document.body,
      )}
    </>
  );
}
