import fs from 'node:fs';
import { imageMetadata } from 'astro/assets/utils';

/**
 * Intrinsic size of an image under public/ (`/img/…`), for `width`/`height`
 * attributes. A missing file throws, so a broken image path fails the build.
 */
export async function publicImageSize(src: string): Promise<{ width: number; height: number }> {
  const { width, height } = await imageMetadata(fs.readFileSync(`public${src}`), src);
  return { width, height };
}
