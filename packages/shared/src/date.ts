import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/ko';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');
dayjs.tz.setDefault('Asia/Seoul');

export { dayjs };

/**
 * 시작일 기준 시즌 감지
 */
export function detectSeason(dateStr: string): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = dayjs.tz(dateStr).month() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

/**
 * 한국어 날짜 포맷: "3월 15일"
 */
export function formatDateShort(dateStr: string): string {
  return dayjs.tz(dateStr).format('M월 D일');
}

/**
 * 한국어 날짜 + 요일 포맷: "3월 15일 (토)"
 */
export function formatDateWithDay(dateStr: string): string {
  return dayjs.tz(dateStr).format('M월 D일 (dd)');
}

/**
 * 시작일 +1일 계산 (YYYY-MM-DD)
 */
export function getNextDay(dateStr: string): string {
  return dayjs.tz(dateStr).add(1, 'day').format('YYYY-MM-DD');
}

/**
 * 박/일 계산: "1박 2일" 또는 "당일치기"
 */
export function calcNights(start: string, end: string): string {
  const diff = dayjs.tz(end).diff(dayjs.tz(start), 'day');
  if (diff === 0) return '당일치기';
  return `${diff}박 ${diff + 1}일`;
}

/**
 * ISO 타임스탬프 반환
 */
export function nowISO(): string {
  return dayjs().toISOString();
}
