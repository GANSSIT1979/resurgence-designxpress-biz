import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const templatePath = path.join(root, "prisma", "schema.template.prisma");
const outputPath = path.join(root, "prisma", "schema.prisma");

const rawProvider = process.env.PRISMA_DB_PROVIDER || "sqlite";
const provider = rawProvider.toLowerCase();
const supportedProviders = new Set(["sqlite", "postgresql"]);

if (!supportedProviders.has(provider)) {
  console.error(
    `Unsupported PRISMA_DB_PROVIDER="${rawProvider}". Use one of: ${Array.from(
      supportedProviders,
    ).join(", ")}`,
  );
  process.exit(1);
}

if (!fs.existsSync(templatePath)) {
  console.error(`Missing Prisma schema template: ${templatePath}`);
  process.exit(1);
}

function ensureCreatorRole(schemaText) {
  const roleEnumRegex = /enum\s+Role\s*\{([\s\S]*?)\}/m;
  const match = schemaText.match(roleEnumRegex);

  if (!match) {
    console.warn('No "enum Role" block found in schema template. Skipping CREATOR patch.');
    return schemaText;
  }

  const fullBlock = match[0];
  const inner = match[1];

  if (/\bCREATOR\b/.test(inner)) {
    return schemaText;
  }

  const updatedBlock = fullBlock.replace(/\}$/, "  CREATOR\n}");
  return schemaText.replace(fullBlock, updatedBlock);
}

const template = fs.readFileSync(templatePath, "utf8");
let rendered = template.replace(/__PRISMA_PROVIDER__/g, provider);
rendered = ensureCreatorRole(rendered);

fs.writeFileSync(outputPath, rendered, "utf8");
console.log(`Prepared prisma/schema.prisma for provider: ${provider}`);
console.log('Ensured Role enum contains "CREATOR".');