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

loadDotEnv('.env');
loadDotEnv('.env.local', true);

const supportedProviders = new Set(['sqlite', 'postgresql']);
const provider = (process.env.PRISMA_DB_PROVIDER || 'sqlite').trim();

if (!supportedProviders.has(provider)) {
  throw new Error(
    `Unsupported PRISMA_DB_PROVIDER "${provider}". Use "sqlite" for local development or "postgresql" for managed production databases.`,
  );
}

const schemaPath = resolve(process.cwd(), 'prisma', 'schema.prisma');
const schemaSource = readFileSync(schemaPath, 'utf8');
const updatedSchema = schemaSource.replace(
  /provider = "(sqlite|postgresql)"/,
  `provider = "${provider}"`,
);

if (updatedSchema === schemaSource && !schemaSource.includes(`provider = "${provider}"`)) {
  throw new Error('Unable to update prisma/schema.prisma datasource provider.');
}

if (updatedSchema !== schemaSource) {
  writeFileSync(schemaPath, updatedSchema, 'utf8');
}

console.log(`[prisma:prepare] datasource provider set to ${provider}`);
