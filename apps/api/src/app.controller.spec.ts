// AppController 단위 테스트:
// - 컨트롤러는 AppService.getHealth()로 단순 위임
// - useValue로 AppService를 mock하여 위임 동작만 격리 검증
//   (실제 시간 의존 로직은 AppService spec에서 검증)
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

type AppServiceMock = Pick<AppService, 'getHealth'>;

describe('AppController', () => {
  let controller: AppController;
  let appService: AppServiceMock;

  beforeEach(async () => {
    appService = { getHealth: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    controller = moduleRef.get<AppController>(AppController);
  });

  it('getHealth는 AppService.getHealth 결과를 그대로 반환', () => {
    // Arrange
    const stub = { status: 'ok', timestamp: '2026-04-20T00:00:00.000Z' };
    vi.mocked(appService.getHealth).mockReturnValue(stub);

    // Act
    const result = controller.getHealth();

    // Assert
    expect(appService.getHealth).toHaveBeenCalledTimes(1);
    expect(result).toBe(stub);
  });
});
