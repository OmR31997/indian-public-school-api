import { ConfigService } from '@nestjs/config';

/**
 * Returns the base URL prefix for media assets without a trailing slash.
 * Default: https://res.cloudinary.com/niefrrkx
 */
export function getMediaBaseUrl(configService?: ConfigService): string {
  const envUrl =
    configService?.get<string>('MEDIA_BASE_URL') ||
    process.env.MEDIA_BASE_URL;

  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  const cloudName =
    configService?.get<string>('CLOUDINARY_CLOUD_NAME') ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    'niefrrkx';

  return `https://res.cloudinary.com/${cloudName.trim()}`;
}

/**
 * Strips the media host / Cloudinary prefix from a full URL to store a relative path in DB.
 * E.g., "https://res.cloudinary.com/niefrrkx/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png"
 *  => "/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png"
 */
export function toRelativeMediaPath(
  urlOrPath: unknown,
  configService?: ConfigService,
): unknown {
  if (typeof urlOrPath !== 'string' || !urlOrPath.trim()) {
    return urlOrPath;
  }

  const trimmed = urlOrPath.trim();

  // If already relative
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // If HTTP/HTTPS absolute URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const baseUrl = getMediaBaseUrl(configService);

      // Check configured base URL prefix
      if (trimmed.startsWith(baseUrl)) {
        const relative = trimmed.slice(baseUrl.length);
        return relative.startsWith('/') ? relative : `/${relative}`;
      }

      // Check standard Cloudinary domain structure: https://res.cloudinary.com/<cloud_name>/...
      const cloudMatch = trimmed.match(/^https?:\/\/res\.cloudinary\.com\/[^/]+(\/.*)$/i);
      if (cloudMatch && cloudMatch[1]) {
        return cloudMatch[1];
      }

      // Generic URL fallback: if it's on Cloudinary domain or matching host
      const parsedUrl = new URL(trimmed);
      if (parsedUrl.hostname.includes('cloudinary.com')) {
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
        if (pathParts.length > 1) {
          return '/' + pathParts.slice(1).join('/') + parsedUrl.search + parsedUrl.hash;
        }
        return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
      }
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Attaches the media base URL prefix to a relative media path for API responses.
 * E.g., "/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png"
 *  => "https://res.cloudinary.com/niefrrkx/indian-public-school/assets/Visual%20Editor%20Picked/file_avevn4.png"
 */
export function toFullMediaUrl(
  pathOrUrl: unknown,
  configService?: ConfigService,
): unknown {
  if (typeof pathOrUrl !== 'string' || !pathOrUrl.trim()) {
    return pathOrUrl;
  }

  const trimmed = pathOrUrl.trim();

  // If already absolute URL, return as-is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Prepend prefix if relative path starting with '/'
  if (trimmed.startsWith('/')) {
    const baseUrl = getMediaBaseUrl(configService);
    return `${baseUrl}${trimmed}`;
  }

  return trimmed;
}

const MEDIA_FILE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|pdf|mp4|webm|mov|doc|docx|xls|xlsx|csv|zip)$/i;

const MEDIA_PROPERTY_KEYS = new Set([
  'fileUrl',
  'url',
  'avatar',
  'avatarUrl',
  'profileImageUrl',
  'marksheetUrl',
  'imageUrl',
  'photo',
  'logo',
  'banner',
  'attachment',
  'attachmentUrl',
  'resume',
  'file',
  'heroImage',
  'thumbnail',
  'coverImage',
  'mediaUrl',
  'icon',
  'src',
  'path',
]);

/**
 * Recursively strip prefixes from full media URLs to relative paths (for Request processing).
 */
export function transformMediaUrlsToRelative<T>(
  obj: T,
  configService?: ConfigService,
  seen = new WeakSet<object>(),
  depth = 0,
): T {
  if (obj === null || obj === undefined || depth > 15) return obj;

  if (typeof obj === 'string') {
    return toRelativeMediaPath(obj, configService) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      transformMediaUrlsToRelative(item, configService, seen, depth + 1),
    ) as unknown as T;
  }

  if (typeof obj === 'object') {
    if (seen.has(obj as object)) return obj;
    const constructorName = (obj as any).constructor?.name;
    if (
      constructorName &&
      constructorName !== 'Object' &&
      constructorName !== 'Array'
    ) {
      return obj;
    }
    seen.add(obj as object);

    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      transformed[key] = transformMediaUrlsToRelative(
        value,
        configService,
        seen,
        depth + 1,
      );
    }
    return transformed as unknown as T;
  }

  return obj;
}

/**
 * Recursively attach prefixes to relative media paths (for Response processing).
 */
export function transformMediaPathsToFull<T>(
  obj: T,
  configService?: ConfigService,
  seen = new WeakSet<object>(),
  depth = 0,
  parentKey?: string,
): T {
  if (obj === null || obj === undefined || depth > 15) return obj;

  if (typeof obj === 'string') {
    const trimmed = obj.trim();
    if (trimmed.startsWith('/')) {
      const isMediaPrefix =
        trimmed.startsWith('/indian-public-school') ||
        trimmed.startsWith('/image/upload') ||
        trimmed.startsWith('/uploads');

      const isMediaExt = MEDIA_FILE_EXTENSIONS.test(trimmed);
      const isMediaProp = parentKey && MEDIA_PROPERTY_KEYS.has(parentKey);

      if (isMediaPrefix || isMediaExt || isMediaProp) {
        return toFullMediaUrl(trimmed, configService) as unknown as T;
      }
    }
    return obj as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      transformMediaPathsToFull(item, configService, seen, depth + 1, parentKey),
    ) as unknown as T;
  }

  if (typeof obj === 'object') {
    if (seen.has(obj as object)) return obj;
    const constructorName = (obj as any).constructor?.name;
    if (
      constructorName &&
      constructorName !== 'Object' &&
      constructorName !== 'Array'
    ) {
      return obj;
    }
    seen.add(obj as object);

    const transformed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      transformed[key] = transformMediaPathsToFull(
        value,
        configService,
        seen,
        depth + 1,
        key,
      );
    }
    return transformed as unknown as T;
  }

  return obj;
}
