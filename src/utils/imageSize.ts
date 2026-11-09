import fs from 'node:fs';
import { imageMetadata } from 'astro/assets/utils';

const cache = new Map<string, Promise<{ width: number; height: number } | undefined>>();

/**
 * Intrinsic size of a local image under public/ (`/img/…`), for `width`/
 * `height` attributes. Anything else (a remote URL) gives undefined, so the
 * attributes are simply left off. A missing local file throws, so a broken
 * image path fails the build. Cached per path: cards repeat across pages.
 */
export function publicImageSize(src: string): Promise<{ width: number; height: number } | undefined> {
  if (!src.startsWith('/img/')) return Promise.resolve(undefined);
  let size = cache.get(src);
  if (!size) {
    size = imageMetadata(fs.readFileSync(`public${src}`), src).then(({ width, height }) => ({ width, height }));
    cache.set(src, size);
  }
  return size;
}
