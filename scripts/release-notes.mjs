import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function getGitCommits() {
  let lastTag = '';
  try {
    lastTag = execSync('git describe --tags --abbrev=0 2>/dev/null', { encoding: 'utf8' }).trim();
  } catch {
    lastTag = '';
  }

  const range = lastTag ? `${lastTag}..HEAD` : 'HEAD';
  console.log(`🔍 Inspecting Git commits for range: ${range} ${lastTag ? `(since ${lastTag})` : '(all commits)'}`);

  try {
    const rawLog = execSync(`git log ${range} --pretty=format:"%s"`, { encoding: 'utf8' });
    return {
      lastTag,
      commits: rawLog.split('\n').filter(Boolean),
    };
  } catch {
    return { lastTag: '', commits: [] };
  }
}

function parseCommits(commits) {
  const categories = {
    Added: [],
    Fixed: [],
    Changed: [],
    Performance: [],
    Documentation: [],
    Internal: [],
  };

  for (const commit of commits) {
    const trimmed = commit.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith('feat:') || trimmed.startsWith('feat(')) {
      categories.Added.push(trimmed.replace(/^feat(\([^)]+\))?:\s*/, ''));
    } else if (trimmed.startsWith('fix:') || trimmed.startsWith('fix(')) {
      categories.Fixed.push(trimmed.replace(/^fix(\([^)]+\))?:\s*/, ''));
    } else if (trimmed.startsWith('perf:') || trimmed.startsWith('perf(')) {
      categories.Performance.push(trimmed.replace(/^perf(\([^)]+\))?:\s*/, ''));
    } else if (trimmed.startsWith('docs:') || trimmed.startsWith('docs(')) {
      categories.Documentation.push(trimmed.replace(/^docs(\([^)]+\))?:\s*/, ''));
    } else if (trimmed.startsWith('refactor:') || trimmed.startsWith('refactor(') || trimmed.startsWith('style:')) {
      categories.Changed.push(trimmed.replace(/^(refactor|style)(\([^)]+\))?:\s*/, ''));
    } else {
      categories.Internal.push(trimmed);
    }
  }

  return categories;
}

function generateMarkdown(version, categories) {
  const dateStr = new Date().toISOString().split('T')[0];
  let markdown = `## [${version}] - ${dateStr}\n\n`;

  for (const [category, items] of Object.entries(categories)) {
    if (items.length === 0 || category === 'Internal') {
      continue;
    }
    markdown += `### ${category}\n`;
    for (const item of items) {
      markdown += `- ${item}\n`;
    }
    markdown += '\n';
  }

  return markdown;
}

function main() {
  const versionArg = process.argv[2] || '1.0.0';
  const { commits } = getGitCommits();
  const categories = parseCommits(commits);
  const newSection = generateMarkdown(versionArg, categories);

  console.log('--- GENERATED RELEASE NOTES SECTION ---');
  console.log(newSection);
  console.log('---------------------------------------');

  const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
  if (fs.existsSync(changelogPath)) {
    const existingContent = fs.readFileSync(changelogPath, 'utf8');
    if (!existingContent.includes(`## [${versionArg}]`)) {
      const headerEnd = existingContent.indexOf('\n## ');
      let updatedContent = '';
      if (headerEnd !== -1) {
        updatedContent = existingContent.slice(0, headerEnd + 1) + newSection + existingContent.slice(headerEnd + 1);
      } else {
        updatedContent = existingContent + '\n' + newSection;
      }
      fs.writeFileSync(changelogPath, updatedContent, 'utf8');
      console.log(`✅ Appended release notes for version ${versionArg} to CHANGELOG.md`);
    } else {
      console.log(`ℹ️ Version section [${versionArg}] already exists in CHANGELOG.md`);
    }
  }
}

main();
