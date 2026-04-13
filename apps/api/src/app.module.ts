import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampModule } from './modules/camp/camp.module';
import { ChecklistTemplateModule } from './modules/checklist-template/checklist-template.module';
import { UserModule } from './modules/user/user.module';
import { WeatherModule } from './modules/weather/weather.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    DatabaseModule,
    AuthModule,
    UserModule,
    ChecklistTemplateModule,
    CampModule,
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
