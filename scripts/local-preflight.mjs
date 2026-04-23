import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const envExamplePath = path.join(root, ".env.example");
const envPath = path.join(root, ".env");
const uploadsPath = path.join(root, "public", "uploads");
const prismaDir = path.join(root, "prisma");
const sourceSchemaPath = path.join(prismaDir, "schema.prisma");
const generatedSchemaPath = path.join(prismaDir, "schema.generated.prisma");

function log(message) {
  console.log(`[doctor] ${message}`);
}

if (!fs.existsSync(envExamplePath)) {
  console.error("Missing .env.example file.");
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  fs.copyFileSync(envExamplePath, envPath);
  log("Created .env from .env.example");
} else {
  log("Found existing .env");
}

if (!fs.existsSync(sourceSchemaPath)) {
  console.error("Missing prisma/schema.prisma");
  process.exit(1);
}
log("Found prisma/schema.prisma");

if (fs.existsSync(generatedSchemaPath)) {
  log("Found prisma/schema.generated.prisma");
} else {
  log("prisma/schema.generated.prisma is not generated yet; run npm run prisma:prepare when needed");
}

fs.mkdirSync(uploadsPath, { recursive: true });
log("Ensured public/uploads exists");

const envContent = fs.readFileSync(envPath, "utf8");
if (!/JWT_SECRET\s*=/.test(envContent)) {
  log("JWT_SECRET is missing from .env");
}
if (
  /JWT_SECRET\s*=\s*"?local-dev-jwt-secret-not-for-production"?/.test(envContent) ||
  /JWT_SECRET\s*=\s*"?replace-with-a-long-random-production-secret"?/.test(envContent)
) {
  log("JWT_SECRET is still using a development placeholder");
}

const providerMatch = envContent.match(/^PRISMA_DB_PROVIDER=(.+)$/m);
const provider = providerMatch?.[1]?.trim().replace(/^"|"$/g, "") || "sqlite";
if (!["sqlite", "postgresql"].includes(provider)) {
  console.error(`Unsupported PRISMA_DB_PROVIDER="${provider}". Use sqlite or postgresql.`);
  process.exit(1);
}
log(`Detected Prisma provider: ${provider}`);

const packageJsonPath = path.join(root, "package.json");
if (!fs.existsSync(packageJsonPath)) {
  console.error("Missing package.json");
  process.exit(1);
}

const nodeMajor = Number(process.versions.node.split(".")[0] || 0);
if (nodeMajor < 20) {
  console.error(`Node.js ${process.version} detected. Use Node 20 or newer.`);
  process.exit(1);
}
log(`Node.js version is ${process.version}`);

try {
  execFileSync(process.execPath, [path.join(root, "scripts", "check-markdown-links.mjs")], {
    cwd: root,
    stdio: "inherit",
  });
  log("Markdown integrity check passed");
} catch (error) {
  console.error("Markdown integrity check failed during local preflight.");
  process.exit(error?.status || 1);
}

log("Local preflight checks passed");
