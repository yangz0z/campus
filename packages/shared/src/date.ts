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

/**
 * 현재 시각의 밀리초 타임스탬프 반환
 */
export function nowMs(): number {
  return dayjs().valueOf();
}

/**
 * 두 날짜 사이의 일수 (양 끝 포함): "4/13 ~ 4/15" → 3
 */
export function calcDaysBetween(start: string, end: string): number {
  return dayjs.tz(end).diff(dayjs.tz(start), 'day') + 1;
}

/**
 * 날짜가 시작~종료 범위에 포함되는지 (양 끝 포함)
 */
export function isDateInRange(date: string, start: string, end: string): boolean {
  const d = dayjs.tz(date);
  const s = dayjs.tz(start);
  const e = dayjs.tz(end);
  return (d.isSame(s, 'day') || d.isAfter(s, 'day'))
    && (d.isSame(e, 'day') || d.isBefore(e, 'day'));
}

/**
 * 날짜의 표시 정보 반환: { month, day, weekday, isWeekend }
 */
export function parseDateInfo(dateStr: string) {
  const d = dayjs.tz(dateStr);
  return {
    month: d.month() + 1,
    day: d.date(),
    weekday: d.format('dd'),         // 한국어: 월, 화, ...
    isWeekend: d.day() === 0 || d.day() === 6,
  };
}
