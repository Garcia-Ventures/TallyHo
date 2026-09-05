import { spawn } from 'child_process';
import { appendFileSync, existsSync } from 'fs';

const args = process.argv.slice(2);

// Known regex patterns indicating EAS cloud plan, usage, or concurrency limits
export const QUOTA_ERROR_PATTERNS = [
  /free (plan|tier) limit/i,
  /plan (limit|threshold)/i,
  /exceeded (your|the)? (plan|concurrency|build|monthly)? ?limit/i,
  /concurrency limit/i,
  /out of (build |cloud )?usage/i,
  /payment required/i,
  /insufficient (credits|funds|balance)/i,
  /upgrade your (eas )?plan/i,
  /resource limit/i,
  /maximum number of concurrent builds/i,
  /quota exceeded/i,
  /account is out of/i,
  /billing limit/i,
  /no remaining build credits/i,
  /you have used all of your free builds/i,
];

/**
 * Determines if an error output matches known Expo EAS quota or usage limit messages.
 */
export function isQuotaLimitError(output) {
  if (!output) {
    return false;
  }
  return QUOTA_ERROR_PATTERNS.some((pattern) => pattern.test(output));
}

// Path patterns that require a native rebuild (EAS Build). Everything else
// can ship via EAS Update (OTA) without consuming build quota.
// Keep in sync with release-train.yml detect-native-changes.
export const NATIVE_CHANGE_PATTERNS = [
  /^android\//,
  /^ios\//,
  /^app\.json$/,
  /^eas\.json$/,
  /^package\.json$/,
  /^bun\.lock$/,
  /^\.env.*/,
  /^plugins\//,
  /^credentials?\.(json|properties)$/,
  /native/i,
];

/**
 * Returns true if any changed file requires a native rebuild.
 * @param {string[]} files git-changed file paths
 */
export function hasNativeChanges(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return false;
  }
  return files.some((f) => NATIVE_CHANGE_PATTERNS.some((pattern) => pattern.test(f)));
}

/**
 * Generates the local fallback instructions markdown for GitHub Step Summary.
 */
export function generateFallbackSummary(platform, errorOutput) {
  const isAndroid = platform === 'android';
  const isIos = platform === 'ios';

  const localCommand = isAndroid
    ? 'bun run build:android:local:submit'
    : isIos
      ? 'eas build --platform ios --profile production --local'
      : 'bun run build:android:local:submit';

  return `
## ⚠️ Expo EAS Cloud Build Usage Limit Exceeded

The remote EAS Cloud build could not be started because your **Expo account usage or concurrency quota has been reached**.

> **Trigger Details:**
> \`\`\`
> ${errorOutput.trim().slice(-400)}
> \`\`\`

---

### 🛠️ Recommended Action: Build & Submit Locally

You can execute a local production build and submit directly from your developer machine using your local toolchain:

\`\`\`bash
# 1. Pull the latest release tag / branch
git pull origin main

# 2. Build and submit locally
${localCommand}
\`\`\`

*Note: This workflow completed gracefully (Code 0) to avoid blocking release tagging.*
`;
}

/**
 * Main execution handler.
 */
async function main() {
  // Quota preflight: `node ./scripts/eas-build-safe.mjs --check-quota --platform android`
  // Prints a reminder + GitHub summary without consuming a build. Used by release-train.yml.
  if (args.includes('--check-quota')) {
    const platformArgIndex = args.indexOf('--platform');
    const platform = platformArgIndex !== -1 && args[platformArgIndex + 1] ? args[platformArgIndex + 1] : 'android';
    console.log('\n🔍 EAS quota preflight check');
    console.log(`Platform: ${platform}`);
    console.log('Free plan: 15 Android + 15 iOS builds/mo, resets on the 1st. Low-priority queue.');
    console.log('Check usage: https://expo.dev/settings/billing (Usage section).');
    console.log('Prefer OTA for JS-only: bun run update:production -- --message "<notes>"');
    console.log('Quota-free fallback: bun run build:android:local:submit / eas submit --latest\n');
    const summaryFile = process.env.GITHUB_STEP_SUMMARY;
    if (summaryFile && existsSync(summaryFile)) {
      try {
        appendFileSync(
          summaryFile,
          `\n### 🔍 EAS Quota Preflight (${platform})\n\nFree: 15 Android + 15 iOS builds/mo. Prefer OTA / \`--local\` / \`submit --latest\`. Check Billing → Usage before proceeding.\n`,
          'utf8',
        );
      } catch (err) {
        console.warn('Could not write to GITHUB_STEP_SUMMARY:', err);
      }
    }
    process.exit(0);
  }

  const platformArgIndex = args.indexOf('--platform');
  const platform = platformArgIndex !== -1 && args[platformArgIndex + 1] ? args[platformArgIndex + 1] : 'android';

  console.log(`\n🚀 Invoking EAS CLI with arguments: eas ${args.join(' ')}\n`);

  let combinedOutput = '';

  const child = spawn('eas', args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  });

  child.stdout.on('data', (data) => {
    const text = data.toString();
    combinedOutput += text;
    process.stdout.write(text);
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    combinedOutput += text;
    process.stderr.write(text);
  });

  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ EAS command completed successfully.');
      process.exit(0);
    }

    // Check if the failure was caused by quota or concurrency limits
    if (isQuotaLimitError(combinedOutput)) {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️ EAS CLOUD BUILD USAGE LIMIT DETECTED');
      console.log('='.repeat(60));
      console.log(
        'Your Expo account has exceeded its free build limit or concurrency quota.\n' +
          'To build and submit this release locally, run:\n\n' +
          (platform === 'android'
            ? '  👉 bun run build:android:local:submit\n'
            : '  👉 eas build --platform ios --profile production --local\n'),
      );
      console.log('='.repeat(60) + '\n');

      // Write to GitHub Step Summary if running in GitHub Actions
      const summaryFile = process.env.GITHUB_STEP_SUMMARY;
      if (summaryFile && existsSync(summaryFile)) {
        try {
          const summaryMarkdown = generateFallbackSummary(platform, combinedOutput);
          appendFileSync(summaryFile, summaryMarkdown, 'utf8');
        } catch (err) {
          console.warn('Could not write to GITHUB_STEP_SUMMARY:', err);
        }
      }

      // Output GitHub Action warning annotation
      console.log(
        `::warning title=EAS Cloud Build Limit Exceeded::Expo account quota reached. Build locally with: bun run build:android:local:submit`,
      );

      // Gracefully exit with 0
      process.exit(0);
    }

    // Non-quota error (compilation failure, invalid config, etc.)
    console.error(`\n❌ EAS command failed with exit code ${code}.`);
    process.exit(code || 1);
  });
}

// Only invoke main when run directly as CLI
if (process.argv[1] && process.argv[1].endsWith('eas-build-safe.mjs')) {
  main().catch((err) => {
    console.error('Fatal runner error:', err);
    process.exit(1);
  });
}
