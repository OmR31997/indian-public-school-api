/**
 * Extract Cloudinary public ID from a Cloudinary URL string.
 * Examples:
 * https://res.cloudinary.com/demo/image/upload/v1234567890/folder/sample.jpg -> folder/sample
 * https://res.cloudinary.com/demo/image/upload/sample.png -> sample
 */
export function extractCloudinaryPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const decodedUrl = decodeURIComponent(url);

  // If it's a full Cloudinary URL with /upload/
  const match = decodedUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  if (match && match[1]) {
    return match[1];
  }

  // If it's already a Cloudinary public ID or key without http(s)://
  if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
    // Remove extension if present, but keep folder hierarchy
    return decodedUrl.replace(/\.[a-zA-Z0-9]+$/, '');
  }

  // Fallback: extract last filename part if full URL couldn't match /upload/
  const parts = decodedUrl.split('/');
  const filename = parts[parts.length - 1];
  if (filename) {
    return filename.replace(/\.[a-zA-Z0-9]+$/, '');
  }

  return null;
}
