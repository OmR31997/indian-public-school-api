import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesRepository } from './pages.repository';

@Injectable()
export class PagesService implements OnModuleInit {
  constructor(private readonly pagesRepository: PagesRepository) { }

  async onModuleInit() {
    await this.seedDefaultPages();
  }

  async seedDefaultPages() {
    try {
      const homeHtml = `<section style="margin-bottom: 2.5rem;">
  <h2 style="font-size: 1.875rem; font-weight: 700; color: #102a4c; margin-bottom: 0.5rem;">About Our School</h2>
  <p style="font-size: 1.125rem; font-weight: 600; color: #1a5d9c; margin-bottom: 1rem;">Building Confident Learners for a Changing World</p>
  <p style="font-size: 1rem; color: #475569; line-height: 1.7; margin-bottom: 1rem;">
    Indian Public School is a co-educational CBSE school where academic rigour meets genuine care. Our classrooms are designed for enquiry rather than repetition, and our teachers know every child by name, strength and ambition.
  </p>
  <p style="font-size: 1rem; color: #475569; line-height: 1.7; margin-bottom: 1.5rem;">
    From the earliest years to senior secondary, students are guided to think clearly, speak confidently, collaborate generously and act with integrity.
  </p>
  
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
    <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 1.25rem; border-radius: 1rem;">
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #102a4c; margin-bottom: 0.5rem;">Our Mission</h3>
      <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6;">To nurture curious, compassionate learners through excellent teaching, strong values and real opportunity for every child.</p>
    </div>
    <div style="border: 1px solid #e2e8f0; background-color: #f8fafc; padding: 1.25rem; border-radius: 1rem;">
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #102a4c; margin-bottom: 0.5rem;">Our Vision</h3>
      <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6;">To be a benchmark school recognised for academic depth, character development, innovation and inclusive community spirit.</p>
    </div>
  </div>
</section>

<section style="margin-bottom: 2rem;">
  <h2 style="font-size: 1.5rem; font-weight: 700; color: #102a4c; margin-bottom: 1rem;">Campus Highlights</h2>
  <img src="https://res.cloudinary.com/niefrrkx/image/upload/v1789163175/indian-public-school/assets/Home/hero-campus.jpg" alt="Indian Public School Campus" style="width: 100%; max-height: 420px; object-fit: cover; border-radius: 1rem; margin-bottom: 1rem;" />
</section>`;

      const defaults = [
        {
          title: 'Home',
          slug: 'home',
          targetUrl: '/',
          textContent: homeHtml,
          order: 1,
          isPublished: true,
        },
        {
          title: 'About Us',
          slug: 'about',
          targetUrl: '/about',
          textContent: '<h1>About Our School</h1><p>Indian Public School is a co-educational CBSE school where academic rigour meets genuine care.</p>',
          order: 2,
          isPublished: true,
        },
        {
          title: 'Admission',
          slug: 'admission',
          targetUrl: '/admission',
          textContent: '<h1>Admissions & Enrolment</h1><p>Join the Indian Public School family. Admissions open for Session 2026-27.</p>',
          order: 3,
          isPublished: true,
        },
        {
          title: 'Notice & News',
          slug: 'news',
          targetUrl: '/news',
          textContent: '<h1>Notice Board & News</h1><p>Stay updated with latest announcements, circulars and campus news.</p>',
          order: 4,
          isPublished: true,
        },
        {
          title: 'Other Link',
          slug: 'other',
          targetUrl: '/other',
          textContent: '<h1>Other Important Links</h1><p>Quick access to school resources, guidelines and portals.</p>',
          order: 5,
          isPublished: true,
        },
      ];

      for (const item of defaults) {
        const existing = await this.pagesRepository.findBySlugOrId(item.slug);
        if (!existing) {
          await this.pagesRepository.create(item);
        } else if (item.slug === 'home') {
          await this.pagesRepository.update(String((existing as any)._id || (existing as any).id || existing.publicId), { textContent: homeHtml });
        }
      }
    } catch (err) {
      console.warn('[PagesService.seedDefaultPages] Skipped:', err);
    }
  }

  private generateSlug(title: string): string {
    return String(title || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private formatTargetUrl(targetUrl?: string, slug?: string): string {
    const raw = String(targetUrl || '').trim();
    if (raw) {
      if (raw.startsWith('/') || raw.startsWith('http')) return raw;
      return `/${raw}`;
    }
    return slug ? `/pages/${slug}` : '';
  }

  async create(createDto: CreatePageDto) {
    try {
      const payload: Record<string, any> = { ...createDto };

      if (!payload.slug && payload.title) {
        payload.slug = this.generateSlug(payload.title);
      }
      payload.targetUrl = this.formatTargetUrl(payload.targetUrl, payload.slug);

      return await this.pagesRepository.create(payload);
    } catch (err: any) {
      console.error('[PagesService.create Error]', err);
      throw err;
    }
  }

  async findAll(queryDto: PaginationQueryDto = {}) {
    const additionalFilter: Record<string, any> = {};

    const isPubParam = (queryDto as any).isPublished;
    const filterKey = (queryDto as any).filterKey;
    const filterValue = (queryDto as any).filterValue;

    if (isPubParam !== undefined && isPubParam !== '') {
      additionalFilter.isPublished = String(isPubParam) === 'true' || String(isPubParam) === '1';
    } else if (filterKey === 'isPublished' && filterValue && filterValue !== 'All') {
      additionalFilter.isPublished = String(filterValue).toLowerCase() === 'published';
    } else if (filterValue && (String(filterValue).toLowerCase() === 'published' || String(filterValue).toLowerCase() === 'draft')) {
      additionalFilter.isPublished = String(filterValue).toLowerCase() === 'published';
    }

    return this.pagesRepository.findAll(
      queryDto,
      ['title', 'slug', 'targetUrl', 'textContent'],
      additionalFilter,
    );
  }

  async findOne(id: string) {
    return this.pagesRepository.findBySlugOrId(id);
  }

  async findBySlug(slug: string) {
    return this.pagesRepository.findBySlugOrId(slug);
  }

  async update(id: string, updateDto: UpdatePageDto) {
    try {
      const payload: Record<string, any> = { ...updateDto };

      if (!payload.slug && payload.title) {
        payload.slug = this.generateSlug(payload.title);
      }
      payload.targetUrl = this.formatTargetUrl(payload.targetUrl, payload.slug);

      return await this.pagesRepository.update(id, payload);
    } catch (err: any) {
      console.error('[PagesService.update Error]', err);
      throw err;
    }
  }

  async remove(id: string) {
    return this.pagesRepository.delete(id);
  }
}




