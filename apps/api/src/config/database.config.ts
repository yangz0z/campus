import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const nodeEnv = configService.get<string>('NODE_ENV');
    return {
      type: 'postgres',
      url: configService.get<string>('DATABASE_URL'),
      ssl:
        nodeEnv === 'production'
          ? { rejectUnauthorized: false }
          : false,
      autoLoadEntities: true,
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: nodeEnv !== 'production',
      logging: nodeEnv !== 'production',
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
