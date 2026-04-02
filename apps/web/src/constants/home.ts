export const SEASONS = [
  {
    id: 'spring',
    name: '봄',
    icon: '🌸',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    months: '3 - 5월',
    items: ['텐트', '침낭', '돗자리', '선크림'],
  },
  {
    id: 'summer',
    name: '여름',
    icon: '☀️',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    months: '6 - 8월',
    items: ['타프', '선풍기', '아이스박스', '물통'],
  },
  {
    id: 'fall',
    name: '가을',
    icon: '🍂',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    months: '9 - 11월',
    items: ['핫팩', '난로', '전기장판', '두꺼운 침낭'],
  },
  {
    id: 'winter',
    name: '겨울',
    icon: '❄️',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    months: '12 - 2월',
    items: ['난로', '등유', '일산화탄소 감지기', '수면양말'],
  },
] as const;

export const FEATURES = [
  {
    title: '스마트 체크리스트',
    description: '캠핑에 필요한 모든 준비물을 카테고리별로 정리하고, 하나씩 체크하며 빠짐없이 챙기세요.',
    icon: '✅',
  },
  {
    title: '계절별 맞춤 추천',
    description: '봄, 여름, 가을, 겨울 — 계절에 따라 꼭 필요한 준비물을 자동으로 추천해드려요.',
    icon: '🗓️',
  },
  {
    title: '함께 준비하기',
    description: '캠핑 멤버를 초대하고, 준비물을 나눠서 담당하면 준비가 훨씬 수월해져요.',
    icon: '👥',
  },
] as const;
