import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolSetting, SchoolSettingSchema } from './schemas/school-setting.schema';
import { SchoolSettingRepository } from './school-setting.repository';
import { SchoolSettingsService } from './school-settings.service';
import { SchoolSettingsController } from './school-settings.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: SchoolSetting.name, schema: SchoolSettingSchema }])],
  controllers: [SchoolSettingsController],
  providers: [SchoolSettingRepository, SchoolSettingsService],
  exports: [SchoolSettingsService, SchoolSettingRepository],
})
export class SchoolSettingsModule {}
