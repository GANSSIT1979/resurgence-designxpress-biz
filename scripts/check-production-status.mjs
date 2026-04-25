import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const statusPath = path.join(root, 'docs', 'PRODUCTION_STATUS.md')

if (!fs.existsSync(statusPath)) {
  throw new Error('Missing docs/PRODUCTION_STATUS.md. Run npm run docs:production-status first.')
}

const content = fs.readFileSync(statusPath, 'utf8')

const requiredSnippets = [
  '# Production Status',
  'https://www.resurgence-dx.biz',
  '/api/health',
  'DATABASE_URL',
  'DIRECT_URL',
  'PRISMA_DB_PROVIDER=postgresql',
]

const missing = requiredSnippets.filter((snippet) => !content.includes(snippet))

if (missing.length) {
  console.error('Production status doc check failed.')
  for (const snippet of missing) {
    console.error(`- Missing: ${snippet}`)
  }
  process.exit(1)
}

console.log('[docs:production-status:check] docs/PRODUCTION_STATUS.md is valid')
