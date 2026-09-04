import { execFileSync } from 'child_process';
import { appendFileSync, existsSync } from 'fs';

// Free plan budget: 15 Android + 15 iOS cloud builds per calendar month.
// Paid plans use credits instead — override via --budget-android/--budget-ios.
const DEFAULT_BUDGET_ANDROID = 15;
const DEFAULT_BUDGET_IOS = 15;
const PAGE_LIMIT = 50;
const MAX_PAGES = 4;

// Canceled builds never consumed a worker — everything else counts against quota.
const COUNTED_STATUSES = new Set(['NEW', 'IN_QUEUE', 'IN_PROGRESS', 'PENDING_CANCEL', 'ERRORED', 'FINISHED']);

/**
 * CLI args for `node scripts/eas-quota.mjs`.
 * --platform <p>        android | ios | all — platforms to fetch (default: all)
 * --request <p>         android | ios | all — platforms about to be built (default: android)
 * --budget-android <n>  monthly Android budget (default: 15)
 * --budget-ios <n>      monthly iOS budget (default: 15)
 * --warn-at <n>         remaining count that triggers warning status (default: 5)
 * --fail-on-exhausted   exit 1 when a requested platform has 0 builds left
 * --json                print machine-readable JSON result
 * --github-output       append outputs to $GITHUB_OUTPUT
 * --summary             append quota badge to $GITHUB_STEP_SUMMARY
 */
export function parseArgs(argv) {
  const args = argv.slice(2);
  const get = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
  };
  const toInt = (v, fallback) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  const request = get('--request', get('--platform', 'android')) || 'android';
  return {
    platform: get('--platform', 'all'),
    request: request === '' ? 'android' : request,
    budgetAndroid: toInt(get('--budget-android', ''), DEFAULT_BUDGET_ANDROID),
    budgetIos: toInt(get('--budget-ios', ''), DEFAULT_BUDGET_IOS),
    warnAt: toInt(get('--warn-at', ''), 5),
    failOnExhausted: args.includes('--fail-on-exhausted'),
    json: args.includes('--json'),
    githubOutput: args.includes('--github-output'),
    summary: args.includes('--summary'),
  };
}

/** Start of the current UTC calendar month (Free quota resets on the 1st). */
export function monthStartUTC(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export function monthLabel(now = new Date()) {
  return now.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function statusFor(remaining, warnAt) {
  if (remaining <= 0) {
    return 'exhausted';
  }
  if (remaining <= warnAt) {
    return 'warning';
  }
  return 'ok';
}

/**
 * Count this month's quota-consuming builds per platform.
 * @param {Array} builds raw `eas build:list --json` entries
 */
export function summarizeBuilds(
  builds,
  { now = new Date(), budgetAndroid = DEFAULT_BUDGET_ANDROID, budgetIos = DEFAULT_BUDGET_IOS, warnAt = 5 } = {},
) {
  const start = monthStartUTC(now);
  const used = { android: 0, ios: 0 };
  let counted = 0;
  for (const b of builds) {
    if (!b || !COUNTED_STATUSES.has(String(b.status || '').toUpperCase())) {
      continue;
    }
    const created = new Date(b.createdAt);
    if (Number.isNaN(created.getTime()) || created < start) {
      continue;
    }
    const platform = String(b.platform || '').toLowerCase();
    if (platform === 'android') {
      used.android += 1;
    } else if (platform === 'ios') {
      used.ios += 1;
    } else {
      continue;
    }
    counted += 1;
  }
  const remaining = { android: Math.max(0, budgetAndroid - used.android), ios: Math.max(0, budgetIos - used.ios) };
  const perPlatform = {
    android: statusFor(remaining.android, warnAt),
    ios: statusFor(remaining.ios, warnAt),
  };
  const overall =
    perPlatform.android === 'exhausted' || perPlatform.ios === 'exhausted'
      ? 'exhausted'
      : perPlatform.android === 'warning' || perPlatform.ios === 'warning'
        ? 'warning'
        : 'ok';
  return {
    month: monthLabel(now),
    used,
    remaining,
    budget: { android: budgetAndroid, ios: budgetIos },
    status: perPlatform,
    overall,
    counted,
  };
}

/** True when every requested platform still has budget left. */
export function requestOk(summary, request) {
  const platforms = request === 'all' ? ['android', 'ios'] : [request === 'ios' ? 'ios' : 'android'];
  return platforms.every((p) => summary.remaining[p] > 0);
}

export function formatBadge(summary) {
  const bar = (used, budget) => {
    const pct = budget === 0 ? 100 : Math.min(100, Math.round((used / budget) * 100));
    const filled = Math.round(pct / 10);
    return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${pct}%`;
  };
  const icon = summary.overall === 'exhausted' ? '🛑' : summary.overall === 'warning' ? '⚠️' : '✅';
  return [
    `## ${icon} EAS Build Quota — ${summary.month}`,
    '',
    `- Android: **${summary.used.android}/${summary.budget.android}** used (${summary.remaining.android} left) ${bar(summary.used.android, summary.budget.android)}`,
    `- iOS: **${summary.used.ios}/${summary.budget.ios}** used (${summary.remaining.ios} left) ${bar(summary.used.ios, summary.budget.ios)}`,
    '',
    summary.overall === 'ok'
      ? 'Headroom is healthy. JS-only changes should still prefer OTA updates.'
      : summary.overall === 'warning'
        ? 'Budget is getting tight — prefer OTA updates and `--local` builds until reset on the 1st.'
        : 'A platform budget is exhausted — cloud builds will fail until reset on the 1st. Use `bun run build:android:local:submit` or `eas submit --latest`.',
    '',
    '_Counts cloud builds created this month (canceled excluded). Free quota resets on the 1st._',
  ].join('\n');
}

function fetchBuildsPage(platform, offset) {
  const out = execFileSync(
    'eas',
    [
      'build:list',
      '--platform',
      platform,
      '--limit',
      String(PAGE_LIMIT),
      '--offset',
      String(offset),
      '--json',
      '--non-interactive',
    ],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const parsed = JSON.parse(out);
  return Array.isArray(parsed) ? parsed : [];
}

function fetchRecentBuilds(platform) {
  const all = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const batch = fetchBuildsPage(platform, page * PAGE_LIMIT);
    if (batch.length === 0) {
      break;
    }
    all.push(...batch);
    if (batch.length < PAGE_LIMIT) {
      break;
    }
  }
  return all;
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

function writeStepSummary(markdown) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file || !existsSync(file)) {
    return;
  }
  try {
    appendFileSync(file, `\n${markdown}\n`, 'utf8');
  } catch (err) {
    console.warn('Could not write to GITHUB_STEP_SUMMARY:', err);
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  const fetchPlatform = ['android', 'ios'].includes(opts.platform) ? opts.platform : 'all';

  let builds;
  try {
    builds = fetchRecentBuilds(fetchPlatform);
  } catch (err) {
    // Telemetry must never block the train: report unavailable, exit 0.
    const message = err.message || String(err);
    console.warn(`Could not fetch EAS build list (telemetry unavailable): ${message.split('\n')[0]}`);
    const result = { method: 'unavailable', reason: message.split('\n')[0], request: opts.request, requestOk: true };
    if (opts.json) {
      console.log(JSON.stringify(result));
    }
    if (opts.githubOutput) {
      writeGithubOutput([
        ['quota_status', 'unknown'],
        ['request_ok', 'true'],
      ]);
    }
    if (opts.summary) {
      writeStepSummary(
        '## ❓ EAS Build Quota — unavailable\n\nCould not reach `eas build:list`; quota gate skipped (fail-open). Check Billing → Usage manually.',
      );
    }
    process.exit(0);
  }

  const summary = summarizeBuilds(builds, {
    budgetAndroid: opts.budgetAndroid,
    budgetIos: opts.budgetIos,
    warnAt: opts.warnAt,
  });
  const ok = requestOk(summary, opts.request);
  const result = {
    method: 'eas-build-list',
    month: summary.month,
    used: summary.used,
    remaining: summary.remaining,
    budget: summary.budget,
    status: summary.status,
    overall: summary.overall,
    request: opts.request,
    requestOk: ok,
    counted: summary.counted,
  };

  if (opts.json) {
    console.log(JSON.stringify(result));
  } else {
    console.log(
      `EAS quota ${summary.month}: android ${summary.used.android}/${summary.budget.android} (${summary.remaining.android} left), ios ${summary.used.ios}/${summary.budget.ios} (${summary.remaining.ios} left) — ${summary.overall}`,
    );
  }
  if (opts.githubOutput) {
    writeGithubOutput([
      ['android_used', String(summary.used.android)],
      ['ios_used', String(summary.used.ios)],
      ['android_remaining', String(summary.remaining.android)],
      ['ios_remaining', String(summary.remaining.ios)],
      ['quota_status', summary.overall],
      ['request_ok', String(ok)],
    ]);
  }
  if (opts.summary) {
    writeStepSummary(formatBadge(summary));
  }
  if (opts.failOnExhausted && !ok) {
    console.error(
      `Requested platform (${opts.request}) has no EAS builds left this month. Use --local builds or OTA updates.`,
    );
    process.exit(1);
  }
  process.exit(0);
}

const invokedAsCli = process.argv[1] && process.argv[1].endsWith('eas-quota.mjs');
if (invokedAsCli) {
  main().catch((err) => {
    console.error('Fatal eas-quota error:', err);
    process.exit(1);
  });
}
