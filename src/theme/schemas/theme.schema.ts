import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ThemeDocument = Theme & Document;

export class ThemeColors {
  @Prop({ default: 'oklch(0.45 0.12 247.7)' })
  primary: string;

  @Prop({ default: 'oklch(0.985 0.005 250)' })
  primaryForeground: string;

  @Prop({ default: 'oklch(0.962 0.01 250)' })
  secondary: string;

  @Prop({ default: 'oklch(0.27 0.075 265)' })
  secondaryForeground: string;

  @Prop({ default: 'oklch(0.94 0.035 88)' })
  accent: string;

  @Prop({ default: 'oklch(0.28 0.06 70)' })
  accentForeground: string;

  @Prop({ default: 'oklch(0.79 0.125 84)' })
  gold: string;

  @Prop({ default: 'oklch(0.92 0.06 88)' })
  goldSoft: string;

  @Prop({ default: 'oklch(0.27 0.075 265)' })
  navy: string;

  @Prop({ default: 'oklch(0.19 0.06 266)' })
  navyDeep: string;

  @Prop({ default: 'oklch(0.995 0.003 250)' })
  background: string;

  @Prop({ default: 'oklch(0.21 0.045 264)' })
  foreground: string;

  @Prop({ default: 'oklch(1 0 0)' })
  card: string;

  @Prop({ default: 'oklch(0.21 0.045 264)' })
  cardForeground: string;

  @Prop({ default: 'oklch(0.915 0.012 255)' })
  border: string;

  @Prop({ default: 'oklch(0.915 0.012 255)' })
  input: string;

  @Prop({ default: 'oklch(0.79 0.125 84)' })
  ring: string;

  @Prop({ default: 'linear-gradient(140deg, oklch(0.22 0.06 266), oklch(0.45 0.12 247.7))' })
  gradientNavy: string;

  @Prop({ default: '' })
  headerBg?: string;

  @Prop({ default: '' })
  footerBg?: string;

  @Prop({ default: '' })
  topbarBg?: string;
}

export class ThemeTypography {
  @Prop({ default: '"Fraunces", ui-serif, Georgia, serif' })
  fontDisplay: string;

  @Prop({ default: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif' })
  fontSans: string;

  @Prop({ default: '16px' })
  baseFontSize: string;
}

export class ThemeLayout {
  @Prop({ default: '0.9rem' })
  radius: string;

  @Prop({ default: 'standard' })
  headerStyle: string; // standard, glass, centered, split

  @Prop({ default: 'gradient' })
  heroStyle: string; // gradient, glassmorphism, bold-cards, minimalist

  @Prop({ default: 'shadow' })
  cardStyle: string; // shadow, bordered, glass, flat

  @Prop({ default: 'pill' })
  btnShape: string; // pill, rounded, soft, sharp

  @Prop({ default: '9999px' })
  btnRadius: string;

  @Prop({ default: 'rounded' })
  cardShape: string; // extra-rounded, rounded, soft, sharp

  @Prop({ default: '1rem' })
  cardRadius: string;

  @Prop({ default: 'circle' })
  logoShape: string; // circle, rounded, square, leaf

  @Prop({ default: '50%' })
  logoRadius: string;

  @Prop({ default: 'pill' })
  badgeShape: string; // pill, soft, sharp

  @Prop({ default: '9999px' })
  badgeRadius: string;
}

@Schema({ timestamps: true })
export class Theme {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  slug: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'web' })
  portal: string; // web, admin, both

  @Prop({ default: false })
  isPreset: boolean;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: ThemeColors, default: () => ({}) })
  colors: ThemeColors;

  @Prop({ type: ThemeTypography, default: () => ({}) })
  typography: ThemeTypography;

  @Prop({ type: ThemeLayout, default: () => ({}) })
  layout: ThemeLayout;

  @Prop({ default: '' })
  customCss: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ThemeSchema = SchemaFactory.createForClass(Theme);
