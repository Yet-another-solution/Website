import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';

// Plain .mjs so astro.config.mjs can import it too.
let shallow;
const cache = new Map();

/**
 * Date of the last commit that touched the file at absolute `path`, or
 * undefined when git is missing, the clone is shallow (its history would give
 * a wrong date), or the file is not committed yet. Never falls back to the
 * build time. Cached, since every page of a build asks.
 */
export function gitLastModified(path) {
  if (cache.has(path)) return cache.get(path);
  const cwd = dirname(path);
  let date;
  try {
    shallow ??= git(cwd, 'rev-parse', '--is-shallow-repository') === 'true';
    if (!shallow) {
      const iso = git(cwd, 'log', '-1', '--format=%cI', '--', path);
      if (iso) date = new Date(iso);
    }
  } catch {
    shallow = true;
  }
  cache.set(path, date);
  return date;
}

/** The latest of the given files' commit dates, or undefined if none has one. */
export function latestGitDate(paths) {
  const dates = paths.map(gitLastModified).filter(Boolean);
  return dates.length ? new Date(Math.max(...dates)) : undefined;
}

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}
