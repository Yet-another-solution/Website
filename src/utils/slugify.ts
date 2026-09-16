/**
 * Turns a tag or series name into a URL segment.
 *
 * Diacritics are folded to their base letters before the strip, so Slovak terms
 * survive as readable slugs ("Základy Blazoru" → "zaklady-blazoru") instead of
 * losing their accented characters entirely. English terms contain no
 * diacritics, so their existing slugs are unaffected.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/#/g, 'sharp')
    .replace(/\+/g, 'plus')
    // Decompose accented letters, then drop the combining marks.
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}
