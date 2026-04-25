import { spawnSync } from 'node:child_process'

const checks = [
  ['npm', ['run', 'prisma:generate']],
  ['npm', ['run', 'docs:production-status']],
  ['npm', ['run', 'docs:production-status:check']],
  ['npm', ['run', 'docs:check']],
  ['npm', ['run', 'local:preflight']],
]

for (const [command, args] of checks) {
  console.log(`[devops-health-gate] running ${command} ${args.join(' ')}`)
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0) {
    console.error(`[devops-health-gate] failed: ${command} ${args.join(' ')}`)
    process.exit(result.status ?? 1)
  }
}

console.log('[devops-health-gate] all checks passed')
