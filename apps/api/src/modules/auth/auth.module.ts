import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from '../user/user.module';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { AuthService } from './auth.service';

@Global()
@Module({
  imports: [UserModule],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
