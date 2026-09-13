import { Module } from '@nestjs/common';
import { SchoolSettingsModule } from '../school-settings/school-settings.module';
import { RegardingController } from './regarding.controller';
import { RegardingService } from './regarding.service';

@Module({
  imports: [SchoolSettingsModule],
  controllers: [RegardingController],
  providers: [RegardingService],
})
export class RegardingModule {}
