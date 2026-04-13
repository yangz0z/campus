import { Suspense } from 'react';
import { getCamp, getCampChecklist, getCampMembers } from '@/actions/camp';
import { getWeatherForecast } from '@/actions/weather';
import { calcDaysBetween } from '@campus/shared';
import ChecklistClient from '@/components/camp/checklist/ChecklistClient';
import ChecklistLoading from './loading';

async function ChecklistContent({ campId }: { campId: string }) {
  const [camp, checklist, membersData] = await Promise.all([
    getCamp(campId),
    getCampChecklist(campId),
    getCampMembers(campId),
  ]);

  const weatherForecast = camp.location
    ? await getWeatherForecast(camp.location, Math.min(calcDaysBetween(camp.startDate, camp.endDate), 14))
    : null;

  return (
    <ChecklistClient
      campId={campId}
      camp={camp}
      initialGroups={checklist.groups}
      myMemberId={checklist.myMemberId}
      members={membersData.members}
      weatherForecast={weatherForecast}
    />
  );
}

export default async function ChecklistPage({ params }: { params: Promise<{ campId: string }> }) {
  const { campId } = await params;

  return (
    <Suspense fallback={<ChecklistLoading />}>
      <ChecklistContent campId={campId} />
    </Suspense>
  );
}
