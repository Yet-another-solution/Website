/**
 * Tag and series names across languages.
 *
 * Taxonomy terms are content, not UI: they are written into each post's
 * frontmatter, and the Slovak posts use Slovak terms. That means `/tags/tutorial/`
 * and `/sk/tags/navod/` are the same page in two languages, which a plain `/sk/`
 * prefix swap can't work out on its own. This table is the missing link — it
 * feeds the language switcher and the hreflang tags on taxonomy pages.
 *
 * Purely technical names (Blazor, C#) are intentionally identical in both
 * languages: translating a framework's name would only make it harder to find.
 */
import { languages, type Lang } from './ui';
import { localizePath } from './routing';
import { getLocalizedCollection } from './content';
import { slugify } from '../utils/slugify';

type TermRow = Record<Lang, string>;

const TERMS: TermRow[] = [
  // Tags
  { en: 'Blazor', sk: 'Blazor' },
  { en: 'C#', sk: 'C#' },
  { en: 'Web Development', sk: 'Vývoj webu' },
  { en: 'Tutorial', sk: 'Návod' },
  // Series
  { en: 'Blazor Fundamentals', sk: 'Základy Blazoru' },
  // Categories
  { en: 'Blog', sk: 'Blog' },
];

/**
 * The equivalent of `term` in `target`, or null when the term has no known
 * counterpart — in which case callers drop the cross-language link rather than
 * guess at a URL.
 */
export function translateTerm(term: string, target: Lang): string | null {
  const row = TERMS.find((candidate) =>
    Object.values(candidate).some((value) => value.toLowerCase() === term.toLowerCase())
  );
  return row ? row[target] : null;
}

/**
 * Per-language URLs for a tag or series page, for the switcher and hreflang.
 *
 * A counterpart is only linked when it both has a known translation *and* is
 * actually used by a post in that language — otherwise the link would point at
 * a taxonomy page Astro never generated.
 */
export async function getTaxonomyAlternates(
  kind: 'tags' | 'series',
  term: string,
  lang: Lang
): Promise<Record<Lang, string | null>> {
  const pairs = await Promise.all(
    (Object.keys(languages) as Lang[]).map(async (target) => {
      if (target === lang) {
        return [target, localizePath(`/${kind}/${slugify(term)}/`, lang)] as const;
      }
      const counterpart = translateTerm(term, target);
      if (!counterpart) return [target, null] as const;

      const posts = await getLocalizedCollection('blog', target);
      const used = posts.some((post) =>
        (kind === 'tags' ? post.data.tags : post.data.series)?.includes(counterpart)
      );
      return [
        target,
        used ? localizePath(`/${kind}/${slugify(counterpart)}/`, target) : null,
      ] as const;
    })
  );
  return Object.fromEntries(pairs) as Record<Lang, string | null>;
}
