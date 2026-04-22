// WeatherController E2E:
// - WeatherModule만 단독 로드 (DB/Auth 미포함)
// - ConfigService는 overrideProvider로 mock 교체 (WEATHER_API_KEY 주입)
// - 외부 fetch는 vi.stubGlobal로 차단
// - main.ts의 useGlobalPipes(ValidationPipe)를 수동 복제
// - supertest로 실제 HTTP 요청을 쏴서 라우팅·예외→상태코드 변환·JSON 직렬화 검증
import { Logger, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { WeatherForecast } from '@campus/shared';
import request from 'supertest';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { WeatherModule } from '../src/modules/weather/weather.module';

type ConfigServiceMock = {
  get: ReturnType<typeof vi.fn>;
};

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

describe('WeatherController (E2E)', () => {
  let app: INestApplication;
  let configService: ConfigServiceMock;

  // WeatherService의 에러 경로 테스트가 Logger.error를 호출하므로
  // 콘솔 출력이 테스트 결과를 가리지 않도록 전역 비활성화.
  beforeAll(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeAll(async () => {
    configService = { get: vi.fn().mockReturnValue('test-api-key') };

    // Test.createTestingModule의 imports는 모듈을 통째로 끌어오는 E2E 관용구.
    // 단위 테스트의 providers 방식과 대비되는 지점.
    //
    // 주의: AppModule이 ConfigModule.forRoot({ isGlobal: true })로 등록해둔 덕에
    // WeatherModule은 자체 import 없이 ConfigService를 쓸 수 있음. E2E에서는
    // AppModule을 통째로 끌어오지 않았으므로 여기서 ConfigModule을 직접 등록해야
    // WeatherService의 생성자 주입이 해결된다.
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        WeatherModule,
      ],
    })
      // ConfigModule이 등록한 ConfigService를 mock으로 교체 → API 키 주입 제어
      .overrideProvider(ConfigService)
      .useValue(configService)
      .compile();

    app = moduleRef.createNestApplication();
    // main.ts의 설정은 테스트 앱에 자동 복제되지 않으므로 수동으로 재현.
    // WeatherController는 DTO가 없어 실제 영향은 미미하지만, 실무 관습상 포함.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 매 테스트마다 fetch mock을 새로 등록 → 테스트 간 격리 확보
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('입력 검증 (HTTP 400)', () => {
    it('location 쿼리 없이 요청하면 400 BadRequest', async () => {
      await request(app.getHttpServer())
        .get('/weather/forecast')
        .expect(400);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('location이 빈 문자열이면 400 BadRequest', async () => {
      await request(app.getHttpServer())
        .get('/weather/forecast')
        .query({ location: '' })
        .expect(400);

      expect(fetch).not.toHaveBeenCalled();
    });

    it('location이 공백만 있으면 400 BadRequest', async () => {
      await request(app.getHttpServer())
        .get('/weather/forecast')
        .query({ location: '   ' })
        .expect(400);

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('정상 경로 (HTTP 200 + JSON 래핑)', () => {
    it('location만 주면 200 + { forecast } 래핑된 JSON 응답', async () => {
      // Arrange
      vi.mocked(fetch).mockResolvedValue(okResponse(makeApiResponse()));

      // Act
      const res = await request(app.getHttpServer())
        .get('/weather/forecast')
        .query({ location: '서울' })
        .expect(200)
        .expect('Content-Type', /json/);

      // Assert — 응답 바디가 컨트롤러의 { forecast } 래핑 구조인지
      expect(res.body).toHaveProperty('forecast');
      expect(res.body.forecast).toMatchObject<Partial<WeatherForecast>>({
        location: '서울',
        current: {
          tempC: 12.5,
          conditionText: '맑음',
          conditionIcon: '//cdn/icon.png',
        },
      });
    });

    it('days 미지정 시 WeatherAPI를 days=3 파라미터로 호출', async () => {
      vi.mocked(fetch).mockResolvedValue(okResponse(makeApiResponse()));

      // 캐시 격리를 위해 다른 테스트와 겹치지 않는 location 사용
      await request(app.getHttpServer())
        .get('/weather/forecast')
        .query({ location: '인천' })
        .expect(200);

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('days=3');
    });

    it('days=20 주면 외부 호출 URL에서 days=14로 캡', async () => {
      vi.mocked(fetch).mockResolvedValue(okResponse(makeApiResponse()));

      await request(app.getHttpServer())
        .get('/weather/forecast')
        .query({ location: '대구', days: '20' })
        .expect(200);

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('days=14');
    });
  });

  // 주의: WeatherService는 NestJS 싱글톤이고 내부에 Map 캐시를 들고 있다.
  // beforeAll에서 한 번 만든 앱 인스턴스를 모든 테스트가 공유하므로,
  // 이전 테스트의 성공 응답이 캐시에 남아 에러 경로 테스트에서 null 대신
  // 캐시된 데이터가 반환되어 실패한다.
  //
  // 해결: 에러 경로 테스트는 앞선 정상 경로에서 쓴 적 없는 고유 location을
  // 사용해 캐시 키를 분리한다. (대안: 앱을 매 테스트마다 새로 만들기 — 비용 큼)
  describe('외부 API 실패 (HTTP 200 + forecast: null)', () => {
    it('WeatherAPI가 non-2xx를 반환하면 200 + forecast null', async () => {
      vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);

      const res = await request(app.getHttpServer())
        .get('/weather/forecast')
        .query({ location: '부산' }) // 캐시 격리용 고유 키
        .expect(200);

      expect(res.body).toEqual({ forecast: null });
    });

    it('fetch가 throw해도 예외가 전파되지 않고 200 + forecast null', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('network down'));

      const res = await request(app.getHttpServer())
        .get('/weather/forecast')
        .query({ location: '제주' }) // 캐시 격리용 고유 키
        .expect(200);

      expect(res.body).toEqual({ forecast: null });
    });
  });
});
