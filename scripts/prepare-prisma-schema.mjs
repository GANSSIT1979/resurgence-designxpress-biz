import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

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
