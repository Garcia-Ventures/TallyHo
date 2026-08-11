import { spawnSync } from 'child_process';

const isFix = process.argv.includes('--fix') || process.argv.includes('-f');

console.log(`\n🔍 Running project validation suite${isFix ? ' (with auto-fix enabled)' : ''}...\n`);

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
    name: 'Unit Tests (Vitest)',
    command: 'bun',
    args: ['x', 'vitest', 'run'],
  },
];

const results = [];

for (const step of steps) {
  console.log(`▶ Running ${step.name}...`);
  const startTime = Date.now();

  const processResult = spawnSync(step.command, step.args, {
    stdio: 'inherit',
    shell: true,
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const passed = processResult.status === 0;

  results.push({
    name: step.name,
    passed,
    duration,
    exitCode: processResult.status,
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
