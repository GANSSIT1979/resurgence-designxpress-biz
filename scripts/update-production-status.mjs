import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outputPath = path.join(root, 'docs', 'PRODUCTION_STATUS.md')
const productionUrl = process.env.PRODUCTION_STATUS_URL || 'https://www.resurgence-dx.biz'
const healthUrl = `${productionUrl.replace(/\/$/, '')}/api/health`

async function fetchHealth() {
  const response = await fetch(healthUrl, {
    headers: {
      accept: 'application/json',
      'user-agent': 'resurgence-docs-production-status/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

function formatJson(value) {
  return JSON.stringify(value, null, 2)
}

const health = await fetchHealth()
const now = new Date().toISOString()

const markdown = `# Production Status

Last updated: ${now}

## Canonical Production URL

- ${productionUrl}

## Health Check

Endpoint:

\`\`\`txt
${healthUrl}
\`\`\`

Latest response:

\`\`\`json
${formatJson(health)}
\`\`\`

## Current Status

| Area | Status |
|---|---|
| App | ${health.ok ? 'OK' : 'Check required'} |
| Database | ${health.database || 'unknown'} |
| Prisma schema | ${health.schema?.status || 'unknown'} |
| AI configured | ${health.aiConfigured ? 'yes' : 'no'} |
| ChatKit ready | ${health.support?.chatkitReady ? 'yes' : 'no'} |
| Webhook ready | ${health.support?.webhookReady ? 'yes' : 'no'} |

## Counts

| Resource | Count |
|---|---:|
| Users | ${health.counts?.users ?? 'unknown'} |
| Sponsors | ${health.counts?.sponsors ?? 'unknown'} |
| Packages | ${health.counts?.packages ?? 'unknown'} |

## Verification Commands

\`\`\`bash
curl -I ${productionUrl}
curl ${healthUrl}
npm run docs:check
\`\`\`

## Notes

- Old Vercel log entries can reference previous deployment IDs. Verify against the active deployment before treating historical errors as current.
- Unsigned or manually posted requests to \`/api/openai/webhook\` may return \`400\` by design.
- Production runtime requires \`DATABASE_URL\`, \`DIRECT_URL\`, and \`PRISMA_DB_PROVIDER=postgresql\`.
`

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, markdown)

console.log(`[docs:production-status] wrote ${path.relative(root, outputPath)}`)
