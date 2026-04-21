// WeatherService 단위 테스트:
// - ConfigService는 @nestjs/testing의 useValue로 mock 주입
// - global.fetch는 vi.stubGlobal로 stub → 외부 HTTP 호출 차단
// - 캐시 TTL 검증은 vi.useFakeTimers + setSystemTime 으로 시간 조작
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherService } from './weather.service';

type ConfigServiceMock = {
  get: ReturnType<typeof vi.fn>;
};

// WeatherAPI 원시 응답 모양 (내부 transform의 입력)
function makeApiResponse(overrides: Record<string, unknown> = {}) {
  return {
    location: { name: '서울' },
    current: {
      temp_c: 12.5,
      condition: { text: '맑음', icon: '//cdn/icon.png' },
    },
    forecast: {
      forecastday: [
        {
          date: '2026-04-20',
          day: {
            maxtemp_c: 18,
            mintemp_c: 8,
            condition: { text: '맑음', icon: '//cdn/icon.png' },
            daily_chance_of_rain: 10,
          },
        },
      ],
    },
    ...overrides,
  };
}

function okResponse(body: unknown): Response {
  return { ok: true, json: async () => body } as Response;
}

async function buildService(configService: ConfigServiceMock): Promise<WeatherService> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    providers: [
      WeatherService,
      { provide: ConfigService, useValue: configService },
    ],
  }).compile();

  return moduleRef.get<WeatherService>(WeatherService);
}

describe('WeatherService', () => {
  let configService: ConfigServiceMock;

  // NestJS Logger가 실제 테스트에서 stdout으로 내는 error/warn 로그를 억제한다.
  // Logger.prototype의 메서드를 spy로 교체 → WeatherService 내부 `new Logger(...)`
  // 인스턴스가 공유하는 prototype 체인에 영향을 주기 때문에 모든 로그가 차단됨.
  // 실제 동작(에러 swallow + 로깅 호출)은 변하지 않음 — 단지 표준 출력만 억제.
  beforeAll(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    configService = { get: vi.fn() };
    // global fetch를 vi.fn으로 대체 → 외부 네트워크 호출 차단
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  describe('apiKey 누락', () => {
    it('WEATHER_API_KEY가 없으면 fetch 호출 없이 null 반환', async () => {
      // Arrange
      configService.get.mockReturnValue(undefined);
      const service = await buildService(configService);

      // Act
      const result = await service.getForecast('서울', 3);

      // Assert
      expect(result).toBeNull();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('정상 fetch 경로', () => {
    let service: WeatherService;

    beforeEach(async () => {
      configService.get.mockReturnValue('test-api-key');
      service = await buildService(configService);
    });

    it('첫 호출은 WeatherAPI를 호출하고 변환된 forecast를 반환', async () => {
      // Arrange
      vi.mocked(fetch).mockResolvedValue(okResponse(makeApiResponse()));

      // Act
      const result = await service.getForecast('서울', 3);

      // Assert — fetch URL에 핵심 파라미터가 들어갔는지
      expect(fetch).toHaveBeenCalledTimes(1);
      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('api.weatherapi.com/v1/forecast.json');
      expect(calledUrl).toContain('key=test-api-key');
      expect(calledUrl).toContain('days=3');
      expect(calledUrl).toContain(`q=${encodeURIComponent('서울')}`);

      // Assert — transform 결과가 내부 타입으로 정규화됐는지
      expect(result).toEqual({
        location: '서울',
        current: {
          tempC: 12.5,
          conditionText: '맑음',
          conditionIcon: '//cdn/icon.png',
        },
        forecast: [
          {
            date: '2026-04-20',
            maxTempC: 18,
            minTempC: 8,
            conditionText: '맑음',
            conditionIcon: '//cdn/icon.png',
            chanceOfRain: 10,
          },
        ],
      });
    });

    it('동일 입력(location, days)으로 재호출 시 캐시에서 반환 (fetch 1회)', async () => {
      vi.mocked(fetch).mockResolvedValue(okResponse(makeApiResponse()));

      await service.getForecast('서울', 3);
      await service.getForecast('서울', 3);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('location은 같고 days가 다르면 별개 캐시 엔트리로 처리', async () => {
      vi.mocked(fetch).mockResolvedValue(okResponse(makeApiResponse()));

      await service.getForecast('서울', 3);
      await service.getForecast('서울', 7);

      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('days가 14 초과면 URL 파라미터에서 14로 캡', async () => {
      vi.mocked(fetch).mockResolvedValue(okResponse(makeApiResponse()));

      await service.getForecast('서울', 30);

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('days=14');
    });

    it('TTL(60분) 경과 후에는 캐시가 무효화되어 다시 fetch', async () => {
      // Arrange — 시간을 고정하고 서비스를 사용하며 1시간 + 1초 앞으로 당김
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-20T00:00:00Z'));
      vi.mocked(fetch).mockResolvedValue(okResponse(makeApiResponse()));

      // Act 1 — 첫 호출 (캐시 저장, expiresAt = now + 60min)
      await service.getForecast('서울', 3);

      // TTL 직전 (59분 59초 경과): 여전히 캐시 hit
      vi.setSystemTime(new Date('2026-04-20T00:59:59Z'));
      await service.getForecast('서울', 3);
      expect(fetch).toHaveBeenCalledTimes(1);

      // TTL 경과 (1시간 1초 이후): 캐시 만료 → 재fetch
      vi.setSystemTime(new Date('2026-04-20T01:00:01Z'));
      await service.getForecast('서울', 3);

      // Assert
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('fetch 실패 경로 (null fallback)', () => {
    let service: WeatherService;

    beforeEach(async () => {
      configService.get.mockReturnValue('test-api-key');
      service = await buildService(configService);
    });

    it('응답이 non-2xx면 null 반환', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);

      const result = await service.getForecast('서울', 3);

      expect(result).toBeNull();
    });

    it('fetch가 throw해도 예외를 swallow하고 null 반환', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('network down'));

      const result = await service.getForecast('서울', 3);

      expect(result).toBeNull();
    });
  });

  describe('transform 방어 코드 (private 로직 → public API 경유 검증)', () => {
    let service: WeatherService;

    beforeEach(async () => {
      configService.get.mockReturnValue('test-api-key');
      service = await buildService(configService);
    });

    it('current.condition이 누락되면 conditionText/Icon은 빈 문자열로 default', async () => {
      vi.mocked(fetch).mockResolvedValue(
        okResponse({
          location: { name: '서울' },
          current: { temp_c: 10 }, // condition 없음
          forecast: { forecastday: [] },
        }),
      );

      const result = await service.getForecast('서울', 3);

      expect(result?.current).toEqual({
        tempC: 10,
        conditionText: '',
        conditionIcon: '',
      });
    });

    it('forecast.forecastday가 누락되면 빈 배열 반환', async () => {
      vi.mocked(fetch).mockResolvedValue(
        okResponse({
          location: { name: '서울' },
          current: { temp_c: 10, condition: { text: '맑음', icon: 'x' } },
          forecast: {}, // forecastday 없음
        }),
      );

      const result = await service.getForecast('서울', 3);

      expect(result?.forecast).toEqual([]);
    });
  });
});
