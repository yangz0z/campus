// ChecklistTemplateController 단위 테스트:
// - 컨트롤러는 모든 메서드가 templateService로 단순 위임
// - 위임 패턴은 Step 3a WeatherController에서 검증된 동일 패턴
// - 여기선 대표 케이스 1개만 검증 (각 메서드를 모두 검증하면 가치 대비 반복 큼)
// - 라우팅·DTO 검증·ParseUUIDPipe는 NestJS 프레임워크 기능이라 단위에서 검증 불가
//   (E2E에서 검증 가능, Step 4.6 Camp E2E에서 ValidationPipe 검증 패턴 참고)
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { ChecklistTemplateController } from './checklist-template.controller';
import { ChecklistTemplateService } from './checklist-template.service';
import { User } from '../user/entities/user.entity';

type ChecklistServiceMock = Pick<
  ChecklistTemplateService,
  'getMyTemplate' | 'addGroup' | 'saveTemplate'
>;

function makeUser(): User {
  return {
    id: 'u_test',
    provider: 'clerk',
    providerId: 'clerk_abc',
    email: 'tester@example.com',
    nickname: '테스터',
    profileImage: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
}

describe('ChecklistTemplateController', () => {
  let controller: ChecklistTemplateController;
  let templateService: ChecklistServiceMock;

  beforeEach(async () => {
    templateService = {
      getMyTemplate: vi.fn(),
      addGroup: vi.fn(),
      saveTemplate: vi.fn(),
    };

    // 함정 — @CurrentUser() 데코레이터의 DI 의존성:
    // CurrentUser 파라미터 데코레이터는 내부에 CurrentUserPipe를 묶어두며,
    // CurrentUserPipe는 생성자에 AuthService를 주입받는다.
    // 컨트롤러를 controllers 배열에 등록하면 NestJS가 DI 그래프를 검증하면서
    // CurrentUserPipe → AuthService를 모두 resolve하려 시도한다.
    // 단위 테스트에선 controller 메서드를 직접 호출하므로 Pipe가 실제 실행되진
    // 않지만, 그래프 검증을 통과하려면 AuthService dummy를 등록해야 한다.
    const moduleRef = await Test.createTestingModule({
      controllers: [ChecklistTemplateController],
      providers: [
        { provide: ChecklistTemplateService, useValue: templateService },
        { provide: AuthService, useValue: {} }, // dummy — 실행 안 됨
      ],
    }).compile();

    controller = moduleRef.get<ChecklistTemplateController>(ChecklistTemplateController);
  });

  it('addGroup은 currentUser와 dto를 그대로 service.addGroup에 위임', async () => {
    // Arrange
    const user = makeUser();
    const dto = { title: '새 그룹' };
    const stub = { id: 'g1', title: '새 그룹', sortOrder: 0 };
    vi.mocked(templateService.addGroup).mockResolvedValue(stub);

    // Act
    const result = await controller.addGroup(user, dto);

    // Assert
    expect(templateService.addGroup).toHaveBeenCalledTimes(1);
    expect(templateService.addGroup).toHaveBeenCalledWith(user, dto);
    expect(result).toBe(stub);
  });
});
