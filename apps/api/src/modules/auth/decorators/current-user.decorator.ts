import { createParamDecorator, ExecutionContext, Inject, Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';

/** clerkUserId → User 엔티티 변환 */
@Injectable()
export class CurrentUserPipe implements PipeTransform<string, Promise<User>> {
  constructor(
    @Inject(AuthService)
    private authService: AuthService,
  ) {}

  async transform(clerkUserId: string): Promise<User> {
    if (!clerkUserId) throw new UnauthorizedException();

    const user = await this.authService.findByClerkId(clerkUserId);
    if (user) return user;

    return this.authService.createFromClerk(clerkUserId);
  }
}

/** request에서 clerkUserId를 추출한 뒤 CurrentUserPipe로 User 엔티티 변환 */
export const CurrentUser = () =>
  createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string => {
      return ctx.switchToHttp().getRequest().clerkUserId;
    },
  )(undefined, CurrentUserPipe);
