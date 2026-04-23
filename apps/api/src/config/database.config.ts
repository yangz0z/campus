import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const nodeEnv = configService.get<string>('NODE_ENV');
    const dbUrl = configService.get<string>('DATABASE_URL') ?? '';
    const isLocalDb = /localhost|127\.0\.0\.1|@postgres:/.test(dbUrl);
    const isProd = nodeEnv === 'production';
    return {
      type: 'postgres',
      url: dbUrl,
      ssl:
        isProd || !isLocalDb
          ? { rejectUnauthorized: false }
          : false,
      autoLoadEntities: true,
      // test 환경(vitest)에선 synchronize로 스키마를 만들고 migrations는 로드하지 않는다.
      // TS 파일을 직접 require하다 발생하는 Node ESM/CJS race condition 회피용.
      migrations: nodeEnv === 'test' ? [] : [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: !isProd && !!isLocalDb,
      logging: !isProd && nodeEnv !== 'test',
      extra: {
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
      },
      retryAttempts: 3,
      retryDelay: 1000,
    };
  },
};
