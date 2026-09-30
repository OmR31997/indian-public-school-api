import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class ThemeColorsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() primary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() primaryForeground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() secondary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() secondaryForeground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() accent?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() accentForeground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gold?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() goldSoft?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() navy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() navyDeep?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() background?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() foreground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() card?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cardForeground?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() border?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() input?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ring?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gradientNavy?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() headerBg?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() footerBg?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() topbarBg?: string;
}

export class ThemeTypographyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fontDisplay?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fontSans?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() baseFontSize?: string;
}

export class ThemeLayoutDto {
  @ApiPropertyOptional() @IsOptional() @IsString() radius?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() headerStyle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() heroStyle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cardStyle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() btnShape?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() btnRadius?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cardShape?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cardRadius?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoShape?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() logoRadius?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() badgeShape?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() badgeRadius?: string;
}

export class CreateThemeDto {
  @ApiProperty({ example: 'Royal Navy & Gold' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'royal-navy-gold' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Traditional prestigious school palette' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'web' })
  @IsOptional()
  @IsString()
  portal?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPreset?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => ThemeColorsDto)
  colors?: ThemeColorsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => ThemeTypographyDto)
  typography?: ThemeTypographyDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @Type(() => ThemeLayoutDto)
  layout?: ThemeLayoutDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customCss?: string;
}
