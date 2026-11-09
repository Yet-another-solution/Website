import { execFileSync } from 'node:child_process';

// Plain .mjs so astro.config.mjs can import it too.
let shallow;
const cache = new Map();

/**
 * Date of the last commit that touched `path`, or undefined when git is
 * missing, the clone is shallow (its history would give a wrong date), or the
 * file is not committed yet. Never falls back to the build time. Cached, since
 * every page of a build asks.
 */
export function gitLastModified(path) {
  if (cache.has(path)) return cache.get(path);
  let date;
  try {
    shallow ??= git('rev-parse', '--is-shallow-repository') === 'true';
    if (!shallow) {
      const iso = git('log', '-1', '--format=%cI', '--', path);
      if (iso) date = new Date(iso);
    }
  } catch {
    shallow = true;
  }
  cache.set(path, date);
  return date;
}

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}
