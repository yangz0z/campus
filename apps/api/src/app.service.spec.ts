// AppService 단위 테스트:
// - getHealth는 외부 의존 0이지만 nowISO()를 통해 현재 시각에 의존
// - vi.useFakeTimers로 시각 고정하여 결정적 검증
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = moduleRef.get<AppService>(AppService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('getHealth는 status="ok"와 현재 시각 timestamp를 반환', () => {
    // Arrange — 시각 고정
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T12:00:00.000Z'));

    // Act
    const result = service.getHealth();

    // Assert
    expect(result).toEqual({
      status: 'ok',
      timestamp: '2026-04-20T12:00:00.000Z',
    });
  });

  it('호출 시점이 다르면 timestamp도 다른 값 (시간 의존성 확인)', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-04-20T00:00:00.000Z'));
    const first = service.getHealth();

    vi.setSystemTime(new Date('2026-04-20T01:00:00.000Z'));
    const second = service.getHealth();

    expect(first.timestamp).not.toBe(second.timestamp);
    expect(first.status).toBe(second.status); // status는 항상 동일
  });
});
