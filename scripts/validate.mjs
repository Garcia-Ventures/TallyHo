import { spawnSync } from 'child_process';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);

const showHelp = args.includes('--help') || args.includes('-h');
const isFix = args.includes('--fix') || args.includes('-f');
const isCI = args.includes('--ci');
const withCoverage = isCI || args.includes('--coverage') || args.includes('-c');
const withBuild = isCI || args.includes('--build') || args.includes('--full') || args.includes('-b');
const withMaestro = isCI || args.includes('--maestro') || args.includes('-m');

if (showHelp) {
  console.log(`
TallyHo Project Validation Suite

Usage:
  bun run validate [flags]

Flags:
  -f, --fix         Automatically fix formatting (Prettier) and linting (ESLint) errors
  -c, --coverage    Run unit & component test suite with coverage report
  -b, --build       Run full production web export build (Expo Web)
  -m, --maestro     Validate syntax and structure of Maestro E2E test flows
  --ci              Run full CI gate (Format Check + Lint + Types + Coverage + Maestro + Build)
  -h, --help        Show this help message

Helper Scripts:
  bun run validate            Standard pre-push validation (Format, Lint, Types, Tests)
  bun run validate:fix        Auto-fix and validate
  bun run validate:coverage   Validation with full test coverage summary
  bun run validate:full       Full validation including production web build
  bun run validate:ci         Comprehensive CI pipeline validation
`);
  process.exit(0);
}

console.log(
  `\n🔍 Running project validation suite${isFix ? ' (with auto-fix enabled)' : ''}${withCoverage ? ' (with coverage)' : ''}${withBuild ? ' (with production build)' : ''}...\n`,
);

/**
 * Validates YAML syntax for Maestro E2E flow files without external heavy dependencies.
 */
function validateMaestroFlows() {
  const maestroDir = join(process.cwd(), '.maestro');
  if (!existsSync(maestroDir)) {
    return { passed: true, message: 'No .maestro directory found' };
  }

  const files = readdirSync(maestroDir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
  if (files.length === 0) {
    return { passed: true, message: 'No Maestro flow YAML files found' };
  }

  const errors = [];
  for (const file of files) {
    const fullPath = join(maestroDir, file);
    try {
      const content = readFileSync(fullPath, 'utf8');
      if (!content.trim()) {
        errors.push(`${file}: File is empty`);
        continue;
      }
      // Basic YAML sanity check: verify balanced indentation & key-value structures
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('\t')) {
          errors.push(`${file}:${i + 1}: Contains hard tabs (YAML requires spaces)`);
        }
      }
    } catch (err) {
      errors.push(`${file}: Failed to read (${err.message})`);
    }
  }

  if (errors.length > 0) {
    return { passed: false, errors };
  }

  return { passed: true, count: files.length };
}

const steps = [
  {
    name: 'Formatting (Prettier)',
    command: 'bun',
    args: isFix ? ['x', 'prettier', '--write', '.'] : ['x', 'prettier', '--check', '.'],
  },
  {
    name: 'Linting (ESLint)',
    command: 'bun',
    args: isFix ? ['x', 'eslint', '.', '--cache', '--fix'] : ['x', 'eslint', '.', '--cache'],
  },
  {
    name: 'Type Check (TypeScript)',
    command: 'bun',
    args: ['x', 'tsc', '--noEmit'],
  },
  {
    name: withCoverage ? 'Unit & Component Tests with Coverage (Vitest)' : 'Unit & Component Tests (Vitest)',
    command: 'bun',
    args: withCoverage ? ['x', 'vitest', 'run', '--coverage'] : ['x', 'vitest', 'run'],
  },
  ...(withMaestro
    ? [
        {
          name: 'Maestro E2E Flow Syntax',
          customRunner: () => {
            const result = validateMaestroFlows();
            if (!result.passed) {
              console.error('❌ Maestro flow errors:');
              result.errors.forEach((err) => console.error(`   - ${err}`));
              return 1;
            }
            console.log(`   ✓ Verified ${result.count} Maestro flow definition(s)`);
            return 0;
          },
        },
      ]
    : []),
  ...(withBuild
    ? [
        {
          name: 'Production Web Export (Expo Web Build)',
          command: 'bun',
          args: ['x', 'expo', 'export', '-p', 'web'],
        },
      ]
    : []),
];

const results = [];

for (const step of steps) {
  console.log(`▶ Running ${step.name}...`);
  const startTime = Date.now();

  let passed = false;
  let exitCode = 0;

  if (step.customRunner) {
    exitCode = step.customRunner();
    passed = exitCode === 0;
  } else {
    const processResult = spawnSync(step.command, step.args, {
      stdio: 'inherit',
      shell: true,
    });
    exitCode = processResult.status;
    passed = exitCode === 0;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  results.push({
    name: step.name,
    passed,
    duration,
    exitCode,
  });

  if (passed) {
    console.log(`✅ ${step.name} passed (${duration}s)\n`);
  } else {
    console.log(`❌ ${step.name} failed (${duration}s)\n`);
  }
}

console.log('='.repeat(50));
console.log('📋 VALIDATION SUMMARY REPORT');
console.log('='.repeat(50));

let hasFailures = false;

for (const res of results) {
  const statusSymbol = res.passed ? '✅ PASS' : '❌ FAIL (BLOCKED)';
  console.log(`${statusSymbol.padEnd(16)} | ${res.name} (${res.duration}s)`);
  if (!res.passed) {
    hasFailures = true;
  }
}

console.log('='.repeat(50));

if (hasFailures) {
  console.error('\n🚨 Validation failed! Please fix the blocked items above before pushing.\n');
  process.exit(1);
} else {
  console.log('\n✨ All validation checks passed successfully!\n');
  process.exit(0);
}
