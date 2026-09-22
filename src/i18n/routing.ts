/**
 * Path helpers for the two-locale routing scheme.
 *
 * English is the default locale and keeps the bare paths it has always had
 * (`/blog/`, `/projects/cod3rs/`); Slovak lives under a `/sk/` prefix. Keeping
 * the English URLs unprefixed means adding Slovak doesn't break a single
 * existing link or search result.
 */
import { defaultLang, languages, type Lang } from './ui';

export const locales = Object.keys(languages) as Lang[];

/** The `/sk` style prefix for a locale — empty string for the default one. */
export function langPrefix(lang: Lang): string {
  return lang === defaultLang ? '' : `/${lang}`;
}

/**
 * Turns a default-locale path into the equivalent path for `lang`.
 * `localizePath('/blog/', 'sk')` → `/sk/blog/`.
 */
export function localizePath(path: string, lang: Lang): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return normalized;
  // `/` would otherwise become `/sk/` via `/sk` + `/` — handled by the join below.
  return `${langPrefix(lang)}${normalized === '/' ? '/' : normalized}`;
}

/** Drops a locale prefix from a pathname, yielding the default-locale path. */
export function stripLangPrefix(pathname: string): string {
  for (const lang of locales) {
    if (lang === defaultLang) continue;
    if (pathname === `/${lang}` || pathname === `/${lang}/`) return '/';
    if (pathname.startsWith(`/${lang}/`)) return pathname.slice(`/${lang}`.length);
  }
  return pathname;
}

/** Reads the active locale out of a request URL. */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return locales.includes(first as Lang) && first !== defaultLang
    ? (first as Lang)
    : defaultLang;
}

/**
 * The same page in another locale, by prefix swap. Content pages whose slugs
 * differ between languages pass an explicit href to the switcher instead.
 */
export function switchLangPath(pathname: string, target: Lang): string {
  return localizePath(stripLangPrefix(pathname), target);
}
