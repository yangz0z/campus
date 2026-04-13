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
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: !isProd && !!isLocalDb,
      logging: !isProd,
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
