import { existsSync, rmSync, renameSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const mobileAppDir = join(projectRoot, 'apps', 'mobile', 'app');
const hiddenMobileAppDir = join(projectRoot, 'apps', 'mobile', '.app.web-build-hidden');
const nextBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';

let movedMobileApp = false;

try {
  if (existsSync(hiddenMobileAppDir)) {
    rmSync(hiddenMobileAppDir, { recursive: true, force: true });
  }

  if (existsSync(mobileAppDir)) {
    renameSync(mobileAppDir, hiddenMobileAppDir);
    movedMobileApp = true;
  }

  const result = spawnSync(nextBin, ['next', 'build'], {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  process.exitCode = result.status ?? 1;
} finally {
  if (movedMobileApp && existsSync(hiddenMobileAppDir)) {
    if (existsSync(mobileAppDir)) {
      rmSync(mobileAppDir, { recursive: true, force: true });
    }
    renameSync(hiddenMobileAppDir, mobileAppDir);
  }
}
