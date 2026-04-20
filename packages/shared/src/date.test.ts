// date.ts의 결정적 유틸 함수 3종(detectSeason/calcNights/isDateInRange) 행동 검증
import { describe, it, expect } from 'vitest';
import { detectSeason, calcNights, isDateInRange } from './date';

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
