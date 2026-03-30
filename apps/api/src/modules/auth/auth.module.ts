import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { User } from '../user/entities/user.entity';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
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
