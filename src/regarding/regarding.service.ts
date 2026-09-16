import { Injectable } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SchoolSettingsService } from '../school-settings/school-settings.service';

type Datasource = Record<string, unknown>;

/**
 * Serves the public website content without making the website dependent on a
 * seeded MongoDB record. The JSON file is the reliable fallback used during
 * first deployment and whenever the setting has not been created yet.
 */
@Injectable()
export class RegardingService {
  constructor(private readonly schoolSettingsService: SchoolSettingsService) {}

  async getDatasource(): Promise<Datasource> {
    let datasource: Datasource = {};
    try {
      const setting = await this.schoolSettingsService.findActiveSetting();
      const value = setting?.value;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        datasource = { ...(value as Datasource) };
      }
    } catch {
      // The JSON fallback must also work when MongoDB is temporarily down.
    }

    if (!datasource || Object.keys(datasource).length === 0) {
      try {
        const filePath = join(process.cwd(), 'public', 'cloud-datasource.json');
        datasource = JSON.parse(await readFile(filePath, 'utf8')) as Datasource;
      } catch {
        datasource = {};
      }
    }

    return datasource;
  }

  async getRegarding() {
    const datasource = await this.getDatasource();
    return datasource.aboutUs ?? [];
  }
}
