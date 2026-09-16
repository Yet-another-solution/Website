/**
 * Locale-aware access to the blog and projects collections.
 *
 * Slovak entries live in a `sk/` sub-folder of each collection, which Astro
 * folds into the entry slug (`sk/zaciname-s-blazorom`). English entries stay at
 * the collection root so their slugs — and therefore their public URLs — are
 * untouched by the translation work. `entrySlug()` strips the folder back off,
 * so `/sk/blog/<slug>/` never carries a doubled `sk` segment.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { defaultLang, languages, type Lang } from './ui';
import { localizePath, locales } from './routing';

type LocalizedCollection = 'blog' | 'projects';
type Entry<C extends LocalizedCollection> = CollectionEntry<C>;

const localeFolders = locales.filter((lang) => lang !== defaultLang);

/** The locale an entry belongs to, read from its folder. */
export function entryLang(entry: { slug: string }): Lang {
  const folder = localeFolders.find((lang) => entry.slug.startsWith(`${lang}/`));
  return folder ?? defaultLang;
}

/** The entry's slug with its locale folder removed — what the URL should use. */
export function entrySlug(entry: { slug: string }): string {
  const folder = localeFolders.find((lang) => entry.slug.startsWith(`${lang}/`));
  return folder ? entry.slug.slice(folder.length + 1) : entry.slug;
}

/**
 * Non-draft entries of `collection` written in `lang`.
 *
 * A locale with no translation of its own would render an empty list rather
 * than an English one; the Slovak site translates every entry, so this stays a
 * strict filter instead of silently mixing languages into one listing.
 */
export async function getLocalizedCollection<C extends LocalizedCollection>(
  collection: C,
  lang: Lang
): Promise<Entry<C>[]> {
  const entries = await getCollection(collection, ({ data }) => !data.draft);
  return entries.filter((entry) => entryLang(entry) === lang);
}

/**
 * The counterpart of `entry` in `target`, matched on the shared
 * `translationKey` frontmatter (falling back to an identical slug). Returns
 * undefined when the entry hasn't been translated, so callers can drop the
 * link rather than point at a 404.
 */
export async function getTranslatedEntry<C extends LocalizedCollection>(
  collection: C,
  entry: Entry<C>,
  target: Lang
): Promise<Entry<C> | undefined> {
  if (entryLang(entry) === target) return entry;
  const key = entry.data.translationKey ?? entrySlug(entry);
  const candidates = await getLocalizedCollection(collection, target);
  return candidates.find(
    (candidate) => (candidate.data.translationKey ?? entrySlug(candidate)) === key
  );
}

/**
 * Per-language URLs for `entry`'s page — what the switcher and the hreflang
 * tags need. A language with no translation of this entry maps to null.
 *
 * `basePath` is the collection's route root, e.g. '/blog' or '/projects'.
 */
export async function getEntryAlternates<C extends LocalizedCollection>(
  collection: C,
  entry: Entry<C>,
  basePath: string
): Promise<Record<Lang, string | null>> {
  const pairs = await Promise.all(
    (Object.keys(languages) as Lang[]).map(async (lang) => {
      const translated = await getTranslatedEntry(collection, entry, lang);
      return [
        lang,
        translated ? localizePath(`${basePath}/${entrySlug(translated)}/`, lang) : null,
      ] as const;
    })
  );
  return Object.fromEntries(pairs) as Record<Lang, string | null>;
}
