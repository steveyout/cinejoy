/**
 * Generate SEO-friendly slug from a title/name
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
export function generateSlug(title: string | undefined, id: number): string {
  if (!title) {
    return id.toString();
  }
  
  return title
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters (keep alphanumeric and hyphens)
    .replace(/[^a-z0-9-]/g, '')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Append ID for uniqueness
    + `-${id}`;
}

/**
 * Parse a slug to extract the ID
 * Slug format: title-12345
 */
export function parseSlug(slug: string): { title?: string; id: number } {
  const match = slug.match(/-(\d+)$/);
  
  if (!match) {
    // If no ID found, try parsing as pure number
    const numericId = parseInt(slug, 10);
    return { id: isNaN(numericId) ? 0 : numericId };
  }
  
  const id = parseInt(match[1], 10);
  
  // Extract title part (everything before the last hyphen-number)
  const titlePart = slug.slice(0, match.index);
  const title = titlePart || undefined;
  
  return { title, id };
}

/**
 * Extract the ID from a slug string
 */
export function extractIdFromSlug(slug: string): number {
  return parseSlug(slug).id;
}
