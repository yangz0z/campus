// date.ts의 결정적 유틸 함수 행동 검증
// - 결정적 함수: detectSeason, calcNights, isDateInRange, formatDateShort,
//   formatDateWithDay, getNextDay, calcDaysBetween, parseDateInfo
// - 시간 의존 함수: nowISO, nowMs (vi.useFakeTimers 사용)
import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  detectSeason,
  calcNights,
  isDateInRange,
  formatDateShort,
  formatDateWithDay,
  getNextDay,
  calcDaysBetween,
  parseDateInfo,
  nowISO,
  nowMs,
} from './date';

describe('detectSeason', () => {
  it.each([
    ['2026-03-15', 'spring'],
    ['2026-05-01', 'spring'],
    ['2026-06-01', 'summer'],
    ['2026-08-31', 'summer'],
    ['2026-09-15', 'fall'],
    ['2026-11-30', 'fall'],
    ['2026-12-25', 'winter'],
    ['2026-01-01', 'winter'],
    ['2026-02-14', 'winter'],
  ])('%s → %s 계절로 판정', (dateStr, expected) => {
    expect(detectSeason(dateStr)).toBe(expected);
  });

  it('3월 1일은 봄 경계 시작으로 판정', () => {
    expect(detectSeason('2026-03-01')).toBe('spring');
  });

  it('5월 31일은 봄 경계 끝으로 판정', () => {
    expect(detectSeason('2026-05-31')).toBe('spring');
  });
});

describe('calcNights', () => {
  it('시작일과 종료일이 같으면 "당일치기" 반환', () => {
    // Arrange
    const start = '2026-04-20';
    const end = '2026-04-20';

    // Act
    const result = calcNights(start, end);

    // Assert
    expect(result).toBe('당일치기');
  });

  it('1일 차이면 "1박 2일" 반환', () => {
    expect(calcNights('2026-04-20', '2026-04-21')).toBe('1박 2일');
  });

  it('3일 차이면 "3박 4일" 반환', () => {
    expect(calcNights('2026-04-20', '2026-04-23')).toBe('3박 4일');
  });
});

describe('isDateInRange', () => {
  const start = '2026-04-20';
  const end = '2026-04-25';

  it('범위 중간 날짜는 true 반환', () => {
    expect(isDateInRange('2026-04-22', start, end)).toBe(true);
  });

  it('시작일과 같은 날은 true 반환 (경계 포함)', () => {
    expect(isDateInRange('2026-04-20', start, end)).toBe(true);
  });

  it('종료일과 같은 날은 true 반환 (경계 포함)', () => {
    expect(isDateInRange('2026-04-25', start, end)).toBe(true);
  });

  it('시작일보다 하루 이른 날은 false 반환', () => {
    expect(isDateInRange('2026-04-19', start, end)).toBe(false);
  });

  it('종료일보다 하루 늦은 날은 false 반환', () => {
    expect(isDateInRange('2026-04-26', start, end)).toBe(false);
  });
});

describe('formatDateShort', () => {
  it('YYYY-MM-DD 입력을 "M월 D일" 한국어 포맷으로 변환', () => {
    expect(formatDateShort('2026-04-20')).toBe('4월 20일');
  });

  it('한 자리 월/일도 0 패딩 없이 그대로 표시', () => {
    expect(formatDateShort('2026-01-05')).toBe('1월 5일');
  });
});

describe('formatDateWithDay', () => {
  it('YYYY-MM-DD를 "M월 D일 (요일)" 한국어 포맷으로 변환', () => {
    // 2026-04-20은 월요일
    expect(formatDateWithDay('2026-04-20')).toBe('4월 20일 (월)');
  });

  it('일요일은 "일"로 표시', () => {
    // 2026-04-19는 일요일
    expect(formatDateWithDay('2026-04-19')).toBe('4월 19일 (일)');
  });
});

describe('getNextDay', () => {
  it('일반적인 날짜의 다음날을 YYYY-MM-DD로 반환', () => {
    expect(getNextDay('2026-04-20')).toBe('2026-04-21');
  });

  it('월 경계(4월 30일) 다음날은 5월 1일', () => {
    expect(getNextDay('2026-04-30')).toBe('2026-05-01');
  });

  it('연 경계(12월 31일) 다음날은 다음해 1월 1일', () => {
    expect(getNextDay('2026-12-31')).toBe('2027-01-01');
  });
});

describe('calcDaysBetween', () => {
  it('동일 날짜는 1일 (양 끝 포함)', () => {
    expect(calcDaysBetween('2026-04-20', '2026-04-20')).toBe(1);
  });

  it('"4/13 ~ 4/15"는 3일', () => {
    expect(calcDaysBetween('2026-04-13', '2026-04-15')).toBe(3);
  });

  it('한 달(4/1 ~ 4/30)은 30일', () => {
    expect(calcDaysBetween('2026-04-01', '2026-04-30')).toBe(30);
  });
});

describe('parseDateInfo', () => {
  it('평일(월요일)은 isWeekend=false, weekday="월"', () => {
    // 2026-04-20은 월요일
    expect(parseDateInfo('2026-04-20')).toEqual({
      month: 4,
      day: 20,
      weekday: '월',
      isWeekend: false,
    });
  });

  it('일요일은 isWeekend=true, weekday="일"', () => {
    // 2026-04-19는 일요일
    expect(parseDateInfo('2026-04-19')).toEqual({
      month: 4,
      day: 19,
      weekday: '일',
      isWeekend: true,
    });
  });

  it('토요일도 isWeekend=true', () => {
    // 2026-04-18은 토요일
    expect(parseDateInfo('2026-04-18').isWeekend).toBe(true);
  });
});

describe('시간 의존 함수 (nowISO / nowMs)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('nowISO는 시스템 시각의 ISO 8601 문자열을 반환', () => {
    // Arrange — 시각 고정 (vi.setSystemTime은 Date.now까지 stub)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T12:34:56.789Z'));

    // Act
    const result = nowISO();

    // Assert
    expect(result).toBe('2026-04-20T12:34:56.789Z');
  });

  it('nowMs는 시스템 시각의 epoch milliseconds 반환', () => {
    vi.useFakeTimers();
    const fixed = new Date('2026-04-20T00:00:00.000Z');
    vi.setSystemTime(fixed);

    expect(nowMs()).toBe(fixed.valueOf());
  });
});
