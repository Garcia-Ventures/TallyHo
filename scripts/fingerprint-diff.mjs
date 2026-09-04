import { execFileSync } from 'child_process';
import { appendFileSync, existsSync, mkdtempSync, rmSync, symlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { hasNativeChanges } from './eas-build-safe.mjs';

const DEP_CHANGE_PATTERNS = [/^package\.json$/, /^bun\.lock$/];

/**
 * CLI args for `node scripts/fingerprint-diff.mjs`.
 * --base <git-ref>      Base ref to compare against (default: latest tag, else HEAD~1)
 * --platform <p>        android | ios | all (default: android)
 * --json                Print machine-readable JSON result
 * --github-output       Append changed/method/hashes to $GITHUB_OUTPUT
 * --no-fingerprint      Skip fingerprint compare, path-filter only
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  const get = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
  };
  return {
    base: get('--base', null),
    platform: get('--platform', 'android'),
    json: args.includes('--json'),
    githubOutput: args.includes('--github-output'),
    useFingerprint: !args.includes('--no-fingerprint'),
  };
}

export function mapPlatforms(input) {
  if (input === 'all') {
    return ['android', 'ios'];
  }
  if (input === 'ios') {
    return ['ios'];
  }
  return ['android'];
}

/**
 * Pure decision: path-filter hit always forces a build; fingerprint is
 * authoritative for config/plugin/native-dir changes; on fingerprint failure
 * we fall back to the path filter rather than guessing.
 */
export function decideNativeChanged({ pathFilterHit, fingerprintChanged, fingerprintFailed }) {
  if (fingerprintFailed) {
    return pathFilterHit;
  }
  return Boolean(pathFilterHit || fingerprintChanged);
}

function runGit(args, cwd) {
  try {
    return execFileSync('git', args, { cwd: cwd ?? process.cwd(), encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

export function resolveBaseRef(explicitBase) {
  if (explicitBase) {
    return explicitBase;
  }
  const tag = runGit(['describe', '--tags', '--abbrev=0']);
  if (tag) {
    return tag;
  }
  const hasParent = runGit(['rev-parse', '--verify', 'HEAD~1']);
  if (hasParent) {
    return 'HEAD~1';
  }
  return '';
}

export function getChangedFilesSince(base) {
  if (!base) {
    return [];
  }
  // Empty diff is a valid "no changes" result — only fall back when the
  // command itself fails (null), not when output is empty.
  let out = runGit(['diff', '--name-only', `${base}...HEAD`]);
  if (out === null) {
    out = runGit(['diff', '--name-only', 'HEAD~1', 'HEAD']);
  }
  if (out === null) {
    out = '';
  }
  return out
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isDepChange(files) {
  return files.some((f) => DEP_CHANGE_PATTERNS.some((re) => re.test(f)));
}

async function withBaseWorktree(baseRef, fn) {
  const tmp = mkdtempSync(join(tmpdir(), 'tallyho-fp-'));
  try {
    execFileSync('git', ['worktree', 'add', '--detach', tmp, baseRef], { encoding: 'utf8' });
    // Deps are identical when lockfile is unchanged (dep changes short-circuit
    // before we get here), so symlinking node_modules keeps autolinking +
    // plugin hashes comparable without a second install.
    const liveModules = join(process.cwd(), 'node_modules');
    const baseModules = join(tmp, 'node_modules');
    if (!existsSync(baseModules) && existsSync(liveModules)) {
      try {
        symlinkSync(liveModules, baseModules, 'dir');
      } catch {
        // Non-fatal: fingerprint will still run, may report extra diffs.
      }
    }
    return await fn(tmp);
  } finally {
    try {
      execFileSync('git', ['worktree', 'remove', '--force', tmp], { encoding: 'utf8' });
    } catch {
      try {
        rmSync(tmp, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup.
      }
    }
  }
}

function writeGithubOutput(entries) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file || !existsSync(file)) {
    return;
  }
  try {
    appendFileSync(file, entries.map(([k, v]) => `${k}=${v}`).join('\n') + '\n', 'utf8');
  } catch (err) {
    console.warn('Could not write to GITHUB_OUTPUT:', err);
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  const platforms = mapPlatforms(opts.platform);
  const base = resolveBaseRef(opts.base);

  if (!base) {
    const result = { changed: false, method: 'no-base', base, baseHash: '', headHash: '', platforms };
    if (opts.json) {
      console.log(JSON.stringify(result));
    } else {
      console.log(
        'No base ref found (no tags, no parent commit). Assuming JS-only; use manual opt-in build for first release.',
      );
    }
    if (opts.githubOutput) {
      writeGithubOutput([
        ['changed', 'false'],
        ['method', 'no-base'],
      ]);
    }
    process.exit(0);
  }

  const files = getChangedFilesSince(base);
  const pathFilterHit = hasNativeChanges(files);

  // Lockfile/package.json changes mean installed native code may differ from
  // the symlinked node_modules in the base worktree — trust the path filter
  // and skip the (misleading) fingerprint compare.
  if (isDepChange(files)) {
    const result = {
      changed: true,
      method: 'path-filter-deps',
      base,
      baseHash: '',
      headHash: '',
      platforms,
      files,
    };
    if (opts.json) {
      console.log(JSON.stringify(result));
    } else {
      console.log(`native_changed=true (method=path-filter-deps, base=${base}, dep manifest changed)`);
    }
    if (opts.githubOutput) {
      writeGithubOutput([
        ['changed', 'true'],
        ['method', 'path-filter-deps'],
        ['base_ref', base],
      ]);
    }
    process.exit(0);
  }

  let fingerprintChanged = false;
  let fingerprintFailed = false;
  let baseHash = '';
  let headHash = '';
  let diffCount = 0;
  let method = 'path-filter';

  if (opts.useFingerprint) {
    try {
      const { createFingerprintAsync, diffFingerprints } = await import('@expo/fingerprint');
      const head = await createFingerprintAsync(process.cwd(), { platforms });
      headHash = head.hash;
      const baseFp = await withBaseWorktree(base, (dir) => createFingerprintAsync(dir, { platforms }));
      baseHash = baseFp.hash;
      const diff = diffFingerprints(baseFp, head);
      diffCount = diff.length;
      fingerprintChanged = baseHash !== headHash;
      method = fingerprintChanged ? 'fingerprint' : pathFilterHit ? 'path-filter' : 'fingerprint-match';
    } catch (err) {
      fingerprintFailed = true;
      method = 'path-filter-fallback';
      console.warn(`Fingerprint compare failed, falling back to path filter: ${err.message}`);
    }
  }

  const changed = decideNativeChanged({ pathFilterHit, fingerprintChanged, fingerprintFailed });
  const result = {
    changed,
    method,
    base,
    baseHash,
    headHash,
    diffCount,
    platforms,
    files,
    pathFilterHit,
    fingerprintChanged,
    fingerprintFailed,
  };

  if (opts.json) {
    console.log(JSON.stringify(result));
  } else {
    console.log(`base=${base} baseHash=${baseHash || 'n/a'} headHash=${headHash || 'n/a'} diff=${diffCount}`);
    console.log(`pathFilter=${pathFilterHit} fingerprintChanged=${fingerprintChanged} failed=${fingerprintFailed}`);
    console.log(`native_changed=${changed} (method=${method})`);
  }
  if (opts.githubOutput) {
    writeGithubOutput([
      ['changed', String(changed)],
      ['method', method],
      ['base_ref', base],
      ['base_hash', baseHash],
      ['head_hash', headHash],
    ]);
  }
  process.exit(0);
}

const invokedAsCli = process.argv[1] && process.argv[1].endsWith('fingerprint-diff.mjs');
if (invokedAsCli) {
  main().catch((err) => {
    console.error('Fatal fingerprint-diff error:', err);
    process.exit(1);
  });
}
