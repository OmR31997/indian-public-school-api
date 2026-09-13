import { PartialType } from '@nestjs/swagger';
import { CreateSchoolSettingDto } from './create-school-setting.dto';

export class UpdateSchoolSettingDto extends PartialType(CreateSchoolSettingDto) {}
