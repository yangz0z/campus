// WeatherController 단위 테스트:
// - Test.createTestingModule로 NestJS DI 컨테이너를 경유해 조립
// - WeatherService는 useValue로 mock 주입 (외부 fetch 호출을 차단)
// - HTTP 레이어 없이 컨트롤러 메서드를 직접 호출하여 입력 검증/기본값/응답 조립 로직 검증
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import type { WeatherForecast } from '@campus/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

type WeatherServiceMock = {
  getForecast: ReturnType<typeof vi.fn>;
};

function makeForecast(overrides: Partial<WeatherForecast> = {}): WeatherForecast {
  return {
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
    ...overrides,
  };
}

describe('WeatherController', () => {
  let controller: WeatherController;
  let weatherService: WeatherServiceMock;

  beforeEach(async () => {
    weatherService = { getForecast: vi.fn() };

    // NestJS DI 컨테이너를 경유한 모듈 조립:
    // - controllers: 테스트 대상 컨트롤러 등록
    // - providers: 의존성을 mock 인스턴스로 교체 (useValue)
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [{ provide: WeatherService, useValue: weatherService }],
    }).compile();

    controller = moduleRef.get<WeatherController>(WeatherController);
  });

  describe('getForecast 입력 검증', () => {
    it('location이 undefined면 BadRequestException 발생', async () => {
      // Arrange - Act - Assert (rejects 헬퍼로 async throw 검증)
      await expect(controller.getForecast(undefined as unknown as string)).rejects.toThrow(
        BadRequestException,
      );
      expect(weatherService.getForecast).not.toHaveBeenCalled();
    });

    it('location이 빈 문자열이면 BadRequestException 발생', async () => {
      await expect(controller.getForecast('')).rejects.toThrow(BadRequestException);
    });

    it('location이 공백만 있으면 BadRequestException 발생', async () => {
      await expect(controller.getForecast('   ')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getForecast 정상 경로', () => {
    it('days 미지정이면 3을 기본값으로 WeatherService 호출', async () => {
      // Arrange
      const forecast = makeForecast();
      weatherService.getForecast.mockResolvedValue(forecast);

      // Act
      const result = await controller.getForecast('서울');

      // Assert
      expect(weatherService.getForecast).toHaveBeenCalledWith('서울', 3);
      expect(result).toEqual({ forecast });
    });

    it('location 앞뒤 공백은 trim하여 서비스에 전달', async () => {
      weatherService.getForecast.mockResolvedValue(makeForecast());

      await controller.getForecast('  부산  ', '5');

      expect(weatherService.getForecast).toHaveBeenCalledWith('부산', 5);
    });

    it('days가 "0"이면 falsy로 간주되어 기본값 3 적용', async () => {
      // Number('0') === 0 이고 0 || 3 === 3 이므로 결과는 3
      weatherService.getForecast.mockResolvedValue(makeForecast());

      await controller.getForecast('서울', '0');

      expect(weatherService.getForecast).toHaveBeenCalledWith('서울', 3);
    });

    it('days가 음수면 Math.max 가드로 최소값 1로 보정', async () => {
      weatherService.getForecast.mockResolvedValue(makeForecast());

      await controller.getForecast('서울', '-5');

      expect(weatherService.getForecast).toHaveBeenCalledWith('서울', 1);
    });

    it('days가 14 초과면 최대값 14로 캡하여 서비스 호출', async () => {
      weatherService.getForecast.mockResolvedValue(makeForecast());

      await controller.getForecast('서울', '20');

      expect(weatherService.getForecast).toHaveBeenCalledWith('서울', 14);
    });

    it('days가 숫자가 아니면 기본값 3으로 보정', async () => {
      weatherService.getForecast.mockResolvedValue(makeForecast());

      await controller.getForecast('서울', 'abc');

      expect(weatherService.getForecast).toHaveBeenCalledWith('서울', 3);
    });
  });
});
