import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CampModule } from './modules/camp/camp.module';
import { ChecklistTemplateModule } from './modules/checklist-template/checklist-template.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(databaseConfig),
    ChecklistTemplateModule,
    CampModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
