/**
 * Convert string to URL-friendly slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Generate unique slug by appending number if exists
 */
export const generateUniqueSlug = async (
  baseSlug: string,
  checkExistsFn: (slug: string) => Promise<boolean>
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExistsFn(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Generate SKU
 */
export const generateSKU = (prefix: string = 'SKU'): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Generate document number (Invoice, PO, etc.)
 */
export const generateDocumentNumber = (prefix: string, lastNumber: number = 0): string => {
  const nextNumber = (lastNumber + 1).toString().padStart(6, '0');
  return `${prefix}-${nextNumber}`;
};
