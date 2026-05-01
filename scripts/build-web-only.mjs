import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const isWindows = process.platform === 'win32';

const nextBin = path.join(
  process.cwd(),
  'node_modules',
  'next',
  'dist',
  'bin',
  'next'
);

if (!existsSync(nextBin)) {
  console.error('[build-web-only] Next.js binary not found.');
  console.error('[build-web-only] Run npm install first.');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [nextBin, 'build'],
  {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: process.env.NEXT_TELEMETRY_DISABLED || '1',
    },
    windowsHide: true,
  }
);

if (result.error) {
  console.error('[build-web-only] Build failed to start:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);