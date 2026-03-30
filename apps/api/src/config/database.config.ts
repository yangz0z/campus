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
      synchronize: nodeEnv !== 'production',
      logging: nodeEnv !== 'production',
    };
  },
};
