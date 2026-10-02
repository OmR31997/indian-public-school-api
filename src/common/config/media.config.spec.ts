import {
  getMediaBaseUrl,
  toRelativeMediaPath,
  toFullMediaUrl,
  transformMediaUrlsToRelative,
  transformMediaPathsToFull,
} from './media.config';

describe('MediaConfig', () => {
  const BASE_URL = 'https://res.cloudinary.com/niefrrkx';

  describe('getMediaBaseUrl', () => {
    it('should return default base URL', () => {
      expect(getMediaBaseUrl()).toBe(BASE_URL);
    });
  });

  describe('toRelativeMediaPath', () => {
    it('should strip Cloudinary domain prefix from full URL', () => {
      const fullUrl = 'https://res.cloudinary.com/niefrrkx/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png';
      expect(toRelativeMediaPath(fullUrl)).toBe('/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png');
    });

    it('should handle full Cloudinary upload URLs', () => {
      const fullUrl = 'https://res.cloudinary.com/niefrrkx/image/upload/v1789163175/indian-public-school/assets/Home/hero-campus.jpg';
      expect(toRelativeMediaPath(fullUrl)).toBe('/image/upload/v1789163175/indian-public-school/assets/Home/hero-campus.jpg');
    });

    it('should preserve relative paths starting with /', () => {
      const relative = '/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png';
      expect(toRelativeMediaPath(relative)).toBe(relative);
    });
  });

  describe('toFullMediaUrl', () => {
    it('should attach base URL prefix to relative path', () => {
      const relative = '/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png';
      expect(toFullMediaUrl(relative)).toBe(
        'https://res.cloudinary.com/niefrrkx/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png',
      );
    });

    it('should preserve external HTTP/HTTPS URLs', () => {
      const external = 'https://images.unsplash.com/photo-12345';
      expect(toFullMediaUrl(external)).toBe(external);
    });
  });

  describe('transformMediaUrlsToRelative', () => {
    it('should convert object properties with full URLs to relative paths', () => {
      const payload = {
        name: 'Test Student',
        avatarUrl: 'https://res.cloudinary.com/niefrrkx/indian-public-school/assets/avatar.png',
        nested: {
          fileUrl: ['https://res.cloudinary.com/niefrrkx/indian-public-school/assets/doc.pdf'],
        },
      };

      const result = transformMediaUrlsToRelative(payload);
      expect(result).toEqual({
        name: 'Test Student',
        avatarUrl: '/indian-public-school/assets/avatar.png',
        nested: {
          fileUrl: ['/indian-public-school/assets/doc.pdf'],
        },
      });
    });
  });

  describe('transformMediaPathsToFull', () => {
    it('should convert relative media paths in response objects to full URLs', () => {
      const responseData = {
        name: 'Test Student',
        avatarUrl: '/indian-public-school/assets/avatar.png',
        nested: {
          fileUrl: ['/indian-public-school/assets/doc.pdf'],
        },
      };

      const result = transformMediaPathsToFull(responseData);
      expect(result).toEqual({
        name: 'Test Student',
        avatarUrl: 'https://res.cloudinary.com/niefrrkx/indian-public-school/assets/avatar.png',
        nested: {
          fileUrl: ['https://res.cloudinary.com/niefrrkx/indian-public-school/assets/doc.pdf'],
        },
      });
    });
  });
});
