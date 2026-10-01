import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ThemeRepository } from './theme.repository';
import { CreateThemeDto } from './dto/create-theme.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { ThemeDocument } from './schemas/theme.schema';

export const DEFAULT_PRESET_THEMES = [
  {
    name: 'Classic Navy & Gold',
    slug: 'classic-navy-gold',
    description: 'Timeless prestigious academic theme featuring deep navy blue and refined gold accents.',
    portal: 'web',
    isPreset: true,
    isActive: true,
    colors: {
      primary: 'oklch(0.45 0.12 247.7)',
      primaryForeground: 'oklch(0.985 0.005 250)',
      secondary: 'oklch(0.962 0.01 250)',
      secondaryForeground: 'oklch(0.27 0.075 265)',
      accent: 'oklch(0.94 0.035 88)',
      accentForeground: 'oklch(0.28 0.06 70)',
      gold: 'oklch(0.79 0.125 84)',
      goldSoft: 'oklch(0.92 0.06 88)',
      navy: 'oklch(0.27 0.075 265)',
      navyDeep: 'oklch(0.19 0.06 266)',
      background: 'oklch(0.995 0.003 250)',
      foreground: 'oklch(0.21 0.045 264)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.21 0.045 264)',
      border: 'oklch(0.915 0.012 255)',
      input: 'oklch(0.915 0.012 255)',
      ring: 'oklch(0.79 0.125 84)',
      gradientNavy: 'linear-gradient(140deg, oklch(0.22 0.06 266), oklch(0.45 0.12 247.7))',
    },
    typography: {
      fontDisplay: '"Fraunces", ui-serif, Georgia, serif',
      fontSans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
      baseFontSize: '16px',
    },
    layout: {
      radius: '0.9rem',
      headerStyle: 'standard',
      heroStyle: 'gradient',
      cardStyle: 'shadow',
    },
    customCss: '',
  },
  {
    name: 'Royal Emerald',
    slug: 'royal-emerald',
    description: 'Vibrant educational theme with deep royal emerald green, rich gold, and mint fresh accents.',
    portal: 'web',
    isPreset: true,
    isActive: false,
    colors: {
      primary: 'oklch(0.42 0.14 152)',
      primaryForeground: 'oklch(0.985 0.005 150)',
      secondary: 'oklch(0.95 0.02 150)',
      secondaryForeground: 'oklch(0.25 0.08 152)',
      accent: 'oklch(0.92 0.05 120)',
      accentForeground: 'oklch(0.22 0.06 140)',
      gold: 'oklch(0.80 0.14 85)',
      goldSoft: 'oklch(0.93 0.07 88)',
      navy: 'oklch(0.25 0.08 152)',
      navyDeep: 'oklch(0.18 0.07 155)',
      background: 'oklch(0.99 0.005 150)',
      foreground: 'oklch(0.20 0.05 152)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.20 0.05 152)',
      border: 'oklch(0.91 0.015 150)',
      input: 'oklch(0.91 0.015 150)',
      ring: 'oklch(0.80 0.14 85)',
      gradientNavy: 'linear-gradient(140deg, oklch(0.18 0.07 155), oklch(0.42 0.14 152))',
    },
    typography: {
      fontDisplay: '"Outfit", sans-serif',
      fontSans: '"Plus Jakarta Sans", sans-serif',
      baseFontSize: '16px',
    },
    layout: {
      radius: '1rem',
      headerStyle: 'glass',
      heroStyle: 'gradient',
      cardStyle: 'bordered',
    },
    customCss: '',
  },
  {
    name: 'Sunset Crimson & Amber',
    slug: 'sunset-crimson-amber',
    description: 'Warm regal academic palette featuring crimson red, amber orange, and warm parchment background.',
    portal: 'web',
    isPreset: true,
    isActive: false,
    colors: {
      primary: 'oklch(0.44 0.17 25)',
      primaryForeground: 'oklch(0.99 0.005 25)',
      secondary: 'oklch(0.96 0.02 40)',
      secondaryForeground: 'oklch(0.28 0.09 25)',
      accent: 'oklch(0.92 0.07 70)',
      accentForeground: 'oklch(0.30 0.08 30)',
      gold: 'oklch(0.78 0.16 65)',
      goldSoft: 'oklch(0.92 0.08 70)',
      navy: 'oklch(0.28 0.09 25)',
      navyDeep: 'oklch(0.20 0.08 20)',
      background: 'oklch(0.995 0.005 40)',
      foreground: 'oklch(0.22 0.05 25)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.22 0.05 25)',
      border: 'oklch(0.92 0.02 35)',
      input: 'oklch(0.92 0.02 35)',
      ring: 'oklch(0.78 0.16 65)',
      gradientNavy: 'linear-gradient(140deg, oklch(0.20 0.08 20), oklch(0.44 0.17 25))',
    },
    typography: {
      fontDisplay: '"Playfair Display", serif',
      fontSans: '"Inter", sans-serif',
      baseFontSize: '16px',
    },
    layout: {
      radius: '0.75rem',
      headerStyle: 'standard',
      heroStyle: 'bold-cards',
      cardStyle: 'shadow',
    },
    customCss: '',
  },
  {
    name: 'Cyber Dark Sapphire',
    slug: 'cyber-dark-sapphire',
    description: 'Sleek dark mode theme with glowing cyan, ice blue, and dark sapphire glass surfaces.',
    portal: 'web',
    isPreset: true,
    isActive: false,
    colors: {
      primary: 'oklch(0.62 0.18 230)',
      primaryForeground: 'oklch(0.12 0.05 240)',
      secondary: 'oklch(0.22 0.04 240)',
      secondaryForeground: 'oklch(0.95 0.02 230)',
      accent: 'oklch(0.26 0.05 240)',
      accentForeground: 'oklch(0.88 0.10 210)',
      gold: 'oklch(0.85 0.15 190)',
      goldSoft: 'oklch(0.30 0.06 200)',
      navy: 'oklch(0.18 0.05 240)',
      navyDeep: 'oklch(0.12 0.04 245)',
      background: 'oklch(0.14 0.04 245)',
      foreground: 'oklch(0.95 0.01 240)',
      card: 'oklch(0.18 0.04 242)',
      cardForeground: 'oklch(0.95 0.01 240)',
      border: 'oklch(0.26 0.04 240)',
      input: 'oklch(0.24 0.04 240)',
      ring: 'oklch(0.62 0.18 230)',
      gradientNavy: 'linear-gradient(140deg, oklch(0.12 0.04 245), oklch(0.22 0.06 235))',
    },
    typography: {
      fontDisplay: '"Outfit", sans-serif',
      fontSans: '"Plus Jakarta Sans", sans-serif',
      baseFontSize: '16px',
    },
    layout: {
      radius: '1.1rem',
      headerStyle: 'glass',
      heroStyle: 'glassmorphism',
      cardStyle: 'glass',
    },
    customCss: '',
  },
];

@Injectable()
export class ThemeService implements OnModuleInit {
  constructor(private readonly themeRepository: ThemeRepository) { }

  async onModuleInit() {
    await this.seedPresetsIfEmpty();
    await this.sanitizeActiveThemes();
  }

  async sanitizeActiveThemes(): Promise<void> {
    const all = await this.themeRepository.findAllRaw();
    // Default missing portal fields to 'web'
    for (const t of all) {
      if (!t.portal) {
        await this.themeRepository.update(t._id.toString(), { portal: 'web' } as any);
        t.portal = 'web';
      }
    }
    const webActive = all.filter(t => t.isActive && (t.portal === 'web' || t.portal === 'both'));
    if (webActive.length > 1) {
      webActive.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      const toKeep = webActive[0];
      for (const theme of webActive) {
        if (theme._id.toString() !== toKeep._id.toString()) {
          await this.themeRepository.update(theme._id.toString(), { isActive: false } as any);
        }
      }
    }
    const adminActive = all.filter(t => t.isActive && t.portal === 'admin');
    if (adminActive.length > 1) {
      adminActive.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      const toKeep = adminActive[0];
      for (const theme of adminActive) {
        if (theme._id.toString() !== toKeep._id.toString()) {
          await this.themeRepository.update(theme._id.toString(), { isActive: false } as any);
        }
      }
    }
  }

  async seedPresetsIfEmpty(): Promise<void> {
    const count = await this.themeRepository.countThemes();
    if (count === 0) {
      for (const preset of DEFAULT_PRESET_THEMES) {
        await this.themeRepository.create(preset as any);
      }
    }
  }

  async getActiveTheme(portal?: string): Promise<ThemeDocument> {
    let active = await this.themeRepository.findActive(portal);
    if (!active) {
      const all = await this.themeRepository.findAllRaw();
      if (portal) {
        active = all.find(t => t.isActive && (t.portal === portal || t.portal === 'both')) || null;
      }
      if (!active && all.length > 0) {
        active = all.find(t => t.portal === portal || t.portal === 'both') || all[0];
      } else if (!active) {
        await this.seedPresetsIfEmpty();
        active = await this.themeRepository.findActive(portal);
      }
    }
    if (!active) {
      return DEFAULT_PRESET_THEMES[0] as any;
    }
    return active;
  }

  async findAll(): Promise<ThemeDocument[]> {
    await this.sanitizeActiveThemes();
    return this.themeRepository.findAllRaw();
  }

  async findOne(id: string): Promise<ThemeDocument> {
    const theme = await this.themeRepository.findById(id);
    if (!theme) {
      throw new NotFoundException(`Theme with ID "${id}" not found`);
    }
    return theme;
  }

  async create(dto: CreateThemeDto): Promise<ThemeDocument> {
    const baseSlug = (dto.slug || dto.name || 'custom-theme')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'custom-theme';
    
    let slug = baseSlug;
    let counter = 1;
    while (await this.themeRepository.findBySlug(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }

    const targetPortal = dto.portal || 'web';
    if (dto.isActive) {
      await this.themeRepository.deactivateForPortal(targetPortal);
    }

    return this.themeRepository.create({
      ...dto,
      slug,
      portal: targetPortal,
      isPreset: dto.isPreset ?? false,
      isActive: dto.isActive ?? false,
    } as any);
  }

  async update(id: string, dto: UpdateThemeDto): Promise<ThemeDocument> {
    const theme = await this.findOne(id);

    const targetPortal = dto.portal || theme.portal || 'web';
    if (dto.isActive) {
      await this.themeRepository.deactivateForPortal(targetPortal);
    }

    if (dto.name || dto.slug) {
      const baseSlug = (dto.slug || dto.name || theme.slug)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'theme';
      
      let slug = baseSlug;
      let counter = 1;
      let existing = await this.themeRepository.findBySlug(slug);
      while (existing && existing._id.toString() !== id) {
        slug = `${baseSlug}-${counter++}`;
        existing = await this.themeRepository.findBySlug(slug);
      }
      dto.slug = slug;
    }

    const updated = await this.themeRepository.update(id, dto as any);
    if (!updated) {
      throw new NotFoundException(`Theme with ID "${id}" not found`);
    }
    return updated;
  }

  async activate(id: string): Promise<ThemeDocument> {
    const theme = await this.findOne(id);
    const portal = theme.portal || 'web';
    await this.themeRepository.deactivateForPortal(portal);
    const activated = await this.themeRepository.update(id, { isActive: true } as any);
    await this.sanitizeActiveThemes();
    return activated;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const theme = await this.findOne(id);
    if (theme.isActive) {
      throw new BadRequestException('Cannot delete the currently active theme. Please activate another theme first.');
    }
    if (theme.isPreset) {
      throw new BadRequestException('Built-in preset themes cannot be deleted.');
    }
    await this.themeRepository.delete(id);
    return { success: true, message: 'Theme deleted successfully' };
  }

  async resetPresets(): Promise<{ success: boolean; count: number }> {
    for (const preset of DEFAULT_PRESET_THEMES) {
      const existing = await this.themeRepository.findBySlug(preset.slug);
      if (existing) {
        await this.themeRepository.update(existing._id.toString(), preset as any);
      } else {
        await this.themeRepository.create(preset as any);
      }
    }
    return { success: true, count: DEFAULT_PRESET_THEMES.length };
  }
}
