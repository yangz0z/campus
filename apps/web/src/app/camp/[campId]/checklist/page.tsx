import { getCamp, getCampChecklist, getCampMembers } from '@/actions/camp';
import ChecklistClient from '@/components/camp/checklist/ChecklistClient';

export default async function ChecklistPage({ params }: { params: Promise<{ campId: string }> }) {
  const { campId } = await params;

  const [camp, checklist, membersData] = await Promise.all([
    getCamp(campId),
    getCampChecklist(campId),
    getCampMembers(campId),
  ]);

  return (
    <ChecklistClient
      campId={campId}
      camp={camp}
      initialGroups={checklist.groups}
      myMemberId={checklist.myMemberId}
      members={membersData.members}
    />
  );
}
