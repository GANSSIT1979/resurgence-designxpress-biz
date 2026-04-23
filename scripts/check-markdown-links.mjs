import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

function getTrackedMarkdownFiles() {
  const output = execFileSync('git', ['ls-files'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.endsWith('.md'));
}

function isSkippableMarkdownTarget(target) {
  return /^(https?:|mailto:|#|app:\/\/|plugin:\/\/)/i.test(target);
}

function normalizeMarkdownTarget(target) {
  const trimmed = target.trim();
  const unwrapped =
    trimmed.startsWith('<') && trimmed.endsWith('>')
      ? trimmed.slice(1, -1)
      : trimmed;

  return unwrapped.split('#')[0].trim();
}

function isLikelyLocalFileReference(candidate) {
  if (!candidate || candidate.includes('\n')) return false;
  if (candidate.endsWith('/')) return false;
  if (candidate.includes('://')) return false;
  if (candidate.includes('...')) return false;
  if (/^[A-Z0-9_]+=/.test(candidate)) return false;

  return /^(?:\.{1,2}\/|src\/|docs\/|prisma\/|scripts\/|public\/|package\.json|vercel\.json|vercel\.production\.env\.example|\.vercelignore|README\.md|AGENTS\.md|\.env(?:\.[A-Za-z0-9._-]+)?|contentpost-[^/]+\.sql)[A-Za-z0-9._\/-]*$/i.test(
    candidate,
  );
}

function resolveFromMarkdown(filePath, target) {
  const baseDir = path.dirname(path.join(repoRoot, filePath));
  return path.resolve(baseDir, target);
}

function checkMarkdownLinks(files) {
  const issues = [];
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const file of files) {
    const content = readFileSync(path.join(repoRoot, file), 'utf8');

    for (const match of content.matchAll(linkPattern)) {
      const rawTarget = match[1] ?? '';
      if (isSkippableMarkdownTarget(rawTarget)) continue;

      const target = normalizeMarkdownTarget(rawTarget);
      if (!target) continue;

      const resolved = resolveFromMarkdown(file, target);
      if (!existsSync(resolved)) {
        issues.push(`${file} -> ${rawTarget}`);
      }
    }
  }

  return issues;
}

function checkBacktickFileReferences(files) {
  const issues = [];
  const codePattern = /`([^`\n]+)`/g;

  for (const file of files) {
    const content = readFileSync(path.join(repoRoot, file), 'utf8');

    for (const match of content.matchAll(codePattern)) {
      const candidate = (match[1] ?? '').trim();
      if (!isLikelyLocalFileReference(candidate)) continue;

      const resolved =
        candidate.startsWith('./') || candidate.startsWith('../')
          ? resolveFromMarkdown(file, candidate)
          : path.resolve(repoRoot, candidate.replaceAll('/', path.sep));
      if (!existsSync(resolved)) {
        issues.push(`${file} -> ${candidate}`);
      }
    }
  }

  return issues;
}

function main() {
  const files = getTrackedMarkdownFiles();
  const issues = [
    ...checkMarkdownLinks(files),
    ...checkBacktickFileReferences(files),
  ].sort();

  if (issues.length > 0) {
    console.error('Markdown integrity check failed:\n');
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(`Markdown integrity check passed for ${files.length} tracked Markdown files.`);
}

main();
