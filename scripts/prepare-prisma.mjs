import { execFileSync } from 'node:child_process';
import process from 'node:process';

console.warn(
  '[deprecated] scripts/prepare-prisma.mjs is a compatibility shim. Use "npm run prisma:prepare" or scripts/prepare-prisma-schema.mjs.',
);

execFileSync(process.execPath, ['scripts/prepare-prisma-schema.mjs'], {
  cwd: process.cwd(),
  stdio: 'inherit',
});
