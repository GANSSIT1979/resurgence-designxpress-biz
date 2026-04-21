import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const initialEnvKeys = new Set(Object.keys(process.env));

function parseDotEnvValue(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function loadDotEnv(fileName, overrideLoadedValues = false) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  const text = readFileSync(filePath, 'utf8');

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || initialEnvKeys.has(key)) continue;
    if (!overrideLoadedValues && process.env[key]) continue;

    process.env[key] = parseDotEnvValue(line.slice(separatorIndex + 1));
  }
}

function inferProviderFromDatabaseUrl(databaseUrl) {
  const normalized = databaseUrl.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.startsWith('file:')) return 'sqlite';
  if (normalized.startsWith('postgresql:') || normalized.startsWith('postgres:')) return 'postgresql';
  return null;
}

function resolveProvider() {
  const explicitProvider = process.env.PRISMA_DB_PROVIDER?.trim();
  const inferredProvider = inferProviderFromDatabaseUrl(process.env.DATABASE_URL || '');
  const isHostedRuntime = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

  if (explicitProvider) {
    return explicitProvider;
  }

  if (inferredProvider) {
    process.env.PRISMA_DB_PROVIDER = inferredProvider;
    return inferredProvider;
  }

  if (isHostedRuntime) {
    throw new Error(
      'Unable to determine the Prisma provider for a hosted build. Set PRISMA_DB_PROVIDER or a DATABASE_URL that starts with "postgresql:", "postgres:", or "file:".',
    );
  }

  process.env.PRISMA_DB_PROVIDER = 'sqlite';
  return 'sqlite';
}

function run(command, args, options = {}) {
  const executable = process.platform === 'win32' && command.endsWith('.cmd') ? 'cmd.exe' : command;
  const executableArgs =
    process.platform === 'win32' && command.endsWith('.cmd')
      ? ['/d', '/s', '/c', [command, ...args].join(' ')]
      : args;

  return execFileSync(executable, executableArgs, {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: options.captureOutput ? ['inherit', 'pipe', 'inherit'] : 'inherit',
    ...options,
  });
}

function toFileUrlFromCwd(absolutePath) {
  const repoRelative = relative(process.cwd(), absolutePath).replace(/\\/g, '/');
  if (!repoRelative) {
    return 'file:.';
  }

  return `file:${repoRelative.startsWith('.') ? repoRelative : `./${repoRelative}`}`;
}

loadDotEnv('.env');
loadDotEnv('.env.local', true);
const provider = resolveProvider();

run(process.execPath, ['scripts/prepare-prisma-schema.mjs']);

const generatedSchemaPath = resolve(process.cwd(), 'prisma', 'schema.generated.prisma');
const postgresHardeningSqlPath = resolve(process.cwd(), 'prisma', 'postgres-hardening.sql');
const postgresPublicReadPoliciesSqlPath = resolve(process.cwd(), 'prisma', 'postgres-public-read-policies.sql');
const prismaBin = resolve(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'prisma.cmd' : 'prisma',
);

if (provider !== 'sqlite') {
  run(prismaBin, ['db', 'push', '--schema', generatedSchemaPath]);
  if (existsSync(postgresHardeningSqlPath)) {
    run(prismaBin, ['db', 'execute', '--schema', generatedSchemaPath, '--file', postgresHardeningSqlPath]);
  }
  if (existsSync(postgresPublicReadPoliciesSqlPath)) {
    run(prismaBin, ['db', 'execute', '--schema', generatedSchemaPath, '--file', postgresPublicReadPoliciesSqlPath]);
  }
  process.exit(0);
}

const databaseUrl = (process.env.DATABASE_URL || '').trim();
if (!databaseUrl.startsWith('file:')) {
  throw new Error(`SQLite DATABASE_URL must start with "file:". Received "${databaseUrl || '(empty)'}".`);
}

const sqliteTarget = databaseUrl.slice('file:'.length);
if (!sqliteTarget) {
  throw new Error('SQLite DATABASE_URL is missing a file path.');
}

const schemaPath = generatedSchemaPath;
const schemaDir = dirname(schemaPath);
const sqlitePath = resolve(schemaDir, sqliteTarget);
const sqliteUrlFromCwd = toFileUrlFromCwd(sqlitePath);
const tempSqlPath = resolve(process.cwd(), '.tmp-prisma-sqlite-push.sql');

mkdirSync(dirname(sqlitePath), { recursive: true });

try {
  const diffArgs = existsSync(sqlitePath)
    ? ['migrate', 'diff', '--from-url', sqliteUrlFromCwd, '--to-schema-datamodel', generatedSchemaPath, '--script']
    : ['migrate', 'diff', '--from-empty', '--to-schema-datamodel', generatedSchemaPath, '--script'];

  const sql = run(prismaBin, diffArgs, { captureOutput: true });
  const trimmed = sql.trim();

  if (!trimmed) {
    console.log(`[prisma:push] SQLite schema already matches ${sqliteUrlFromCwd}`);
    run(prismaBin, ['generate', '--schema', generatedSchemaPath]);
    process.exit(0);
  }

  writeFileSync(tempSqlPath, sql, 'utf8');
  run(prismaBin, ['db', 'execute', '--url', sqliteUrlFromCwd, '--file', tempSqlPath]);
  run(prismaBin, ['generate', '--schema', generatedSchemaPath]);
  console.log(`[prisma:push] SQLite schema synced to ${sqliteUrlFromCwd}`);
} finally {
  if (existsSync(tempSqlPath)) {
    unlinkSync(tempSqlPath);
  }
}
