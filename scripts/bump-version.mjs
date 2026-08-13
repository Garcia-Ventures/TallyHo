import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function getSemverBump(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(Number);
  let [major, minor, patch] = parts;

  if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
    throw new Error(`Invalid current version: ${currentVersion}`);
  }

  switch (bumpType) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      break;
    case 'patch':
      patch += 1;
      break;
    default:
      if (/^\d+\.\d+\.\d+$/.test(bumpType)) {
        return bumpType;
      }
      throw new Error(
        `Invalid bump type "${bumpType}". Must be "patch", "minor", "major", or an explicit x.y.z version.`,
      );
  }

  return `${major}.${minor}.${patch}`;
}

function main() {
  const bumpArg = process.argv[2] || 'patch';
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const appJsonPath = path.resolve(process.cwd(), 'app.json');

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const currentVersion = pkg.version || '1.0.0';
  const newVersion = getSemverBump(currentVersion, bumpArg);

  console.log(`🚀 Bumping version: ${currentVersion} ➔ ${newVersion}`);

  // 1. Update package.json
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated package.json version: ${newVersion}`);

  // 2. Update app.json
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    if (appJson.expo) {
      appJson.expo.version = newVersion;
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n', 'utf8');
      console.log(`✅ Updated app.json expo.version: ${newVersion}`);
    }
  }

  // 3. Generate & append CHANGELOG section
  try {
    console.log(`📝 Generating CHANGELOG section for v${newVersion}...`);
    execSync(`node ./scripts/release-notes.mjs ${newVersion}`, { stdio: 'inherit' });
  } catch (err) {
    console.warn(`⚠️ Failed to generate release notes automatically:`, err.message);
  }

  // 4. Format updated files
  try {
    execSync(`npx prettier --write package.json app.json CHANGELOG.md`, { stdio: 'ignore' });
  } catch {
    // Ignore formatting errors
  }

  console.log(`\n✨ Version bump to v${newVersion} complete!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review changes: git diff`);
  console.log(
    `  2. Commit and tag: git commit -am "chore(release): bump version to v${newVersion}" && git tag v${newVersion}`,
  );
  console.log(`  3. Push to trigger production build: git push origin main --tags`);
}

main();
