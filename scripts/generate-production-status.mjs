import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const args = new Set(process.argv.slice(2))
const root = process.cwd()
const statusPath = path.join(root, 'docs', 'PRODUCTION_STATUS.md')

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

if (args.has('--check')) {
  if (!fs.existsSync(statusPath)) {
    console.error('Missing docs/PRODUCTION_STATUS.md. Run npm run docs:production-status first.')
    process.exit(1)
  }

  run('npm', ['run', 'docs:production-status:check'])
} else {
  run('npm', ['run', 'docs:production-status'])
}
