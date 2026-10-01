import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ThemeService } from './theme.service';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Theme Management')
@Controller('v1/theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get currently active theme configuration for public web UI or admin panel' })
  getActiveTheme(@Query('portal') portal?: string) {
    return this.themeService.getActiveTheme(portal);
  }

  @Get()
  @ApiOperation({ summary: 'Get all themes (presets and custom)' })
  findAll() {
    return this.themeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get theme details by ID' })
  findOne(@Param('id') id: string) {
    return this.themeService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new custom theme' })
  create(@Body() dto: CreateThemeDto) {
    return this.themeService.create(dto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing theme by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateThemeDto) {
    return this.themeService.update(id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate a theme for the live public site' })
  activate(@Param('id') id: string) {
    return this.themeService.activate(id);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('reset-presets')
  @ApiOperation({ summary: 'Reset built-in preset themes to defaults' })
  resetPresets() {
    return this.themeService.resetPresets();
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a custom theme by ID' })
  remove(@Param('id') id: string) {
    return this.themeService.remove(id);
  }
}
