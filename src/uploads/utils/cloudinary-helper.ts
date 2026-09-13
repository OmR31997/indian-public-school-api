/**
 * Extract Cloudinary public ID from a Cloudinary URL string.
 * Examples:
 * https://res.cloudinary.com/demo/image/upload/v1234567890/folder/sample.jpg -> folder/sample
 * https://res.cloudinary.com/demo/image/upload/sample.png -> sample
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  // Match path after /upload/ (optional /v123456/) until file extension
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback: If URL doesn't contain /upload/ but is a path
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  if (filename) {
    const dotIndex = filename.lastIndexOf('.');
    return dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
  }

  return null;
}
