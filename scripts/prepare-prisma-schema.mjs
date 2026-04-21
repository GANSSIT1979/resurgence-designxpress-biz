import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

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

  for (const rawLine of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
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
    return { provider: explicitProvider, source: 'PRISMA_DB_PROVIDER' };
  }

  if (inferredProvider) {
    return { provider: inferredProvider, source: 'DATABASE_URL' };
  }

  if (isHostedRuntime) {
    throw new Error(
      'Unable to determine the Prisma provider for a hosted build. Set PRISMA_DB_PROVIDER or a DATABASE_URL that starts with "postgresql:", "postgres:", or "file:".',
    );
  }

  return { provider: 'sqlite', source: 'default' };
}

loadDotEnv('.env');
loadDotEnv('.env.local', true);

const supportedProviders = new Set(['sqlite', 'postgresql']);
const { provider, source } = resolveProvider();

if (!supportedProviders.has(provider)) {
  throw new Error(
    `Unsupported PRISMA_DB_PROVIDER "${provider}". Use "sqlite" for local development or "postgresql" for managed production databases.`,
  );
}

const schemaSourcePath = resolve(process.cwd(), 'prisma', 'schema.prisma');
const schemaOutputPath = resolve(process.cwd(), 'prisma', 'schema.generated.prisma');
const schemaSource = readFileSync(schemaSourcePath, 'utf8');
const updatedSchema = schemaSource.replace(
  /provider = "(sqlite|postgresql)"/,
  `provider = "${provider}"`,
);

if (updatedSchema === schemaSource && !schemaSource.includes(`provider = "${provider}"`)) {
  throw new Error('Unable to update prisma/schema.prisma datasource provider.');
}

writeFileSync(schemaOutputPath, updatedSchema, 'utf8');
process.env.PRISMA_DB_PROVIDER = provider;

console.log(`[prisma:prepare] datasource provider set to ${provider} in prisma/schema.generated.prisma (${source})`);
