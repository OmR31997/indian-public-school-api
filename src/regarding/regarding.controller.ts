import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegardingService } from './regarding.service';

@ApiTags('Website Content')
@Controller('v1/regarding')
export class RegardingController {
  constructor(private readonly regardingService: RegardingService) {}

  @Get()
  @ApiOperation({ summary: 'Get the About/Regarding section for the public website' })
  getRegarding() {
    return this.regardingService.getRegarding();
  }

  @Get('datasource')
  @ApiOperation({ summary: 'Get public website data with JSON-file fallback' })
  getDatasource() {
    return this.regardingService.getDatasource();
  }
}
