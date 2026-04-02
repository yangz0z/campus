import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCampInviteInfo } from '@/actions/camp';
import InviteConfirmClient from './InviteConfirmClient';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/invite/${token}`);
  }

  let inviteInfo;
  try {
    inviteInfo = await getCampInviteInfo(token);
  } catch {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F2F2F0] px-4">
        <div className="w-full max-w-sm text-center">
          <p className="text-[36px] leading-none">🔗</p>
          <h1 className="mt-4 text-[20px] font-bold text-gray-900">유효하지 않은 초대 링크</h1>
          <p className="mt-1.5 text-[14px] text-gray-500">초대 링크가 만료되었거나 올바르지 않습니다.</p>
        </div>
      </div>
    );
  }

  return <InviteConfirmClient token={token} camp={inviteInfo.camp} />;
}
