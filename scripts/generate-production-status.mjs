import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
const outputPath = path.join(root, 'docs', 'PRODUCTION_STATUS.md')
const siteUrl = process.env.PRODUCTION_SITE_URL || 'https://www.resurgence-dx.biz'
const healthUrl = new URL('/api/health', siteUrl).toString()
const mode = process.argv.includes('--check') ? 'check' : 'write'
const res = await fetch(healthUrl, { headers: { accept: 'application/json' } })
const health = await res.json()
if (!res.ok || !health.ok || health.database !== 'connected' || health.schema?.status !== 'ok') {
  throw new Error('Production health check failed')
}
const content = `# Production Status\n\nUpdated: ${new Date().toISOString()}\n\nCanonical site: ${siteUrl}\n\nHealth endpoint: ${healthUrl}\n\n## Health Summary\n\n- ok: ${health.ok}\n- status: ${health.status}\n- database: ${health.database}\n- schema: ${health.schema?.status}\n- aiConfigured: ${health.aiConfigured}\n\n## Counts\n\n- users: ${health.counts?.users ?? 'unknown'}\n- sponsors: ${health.counts?.sponsors ?? 'unknown'}\n- packages: ${health.counts?.packages ?? 'unknown'}\n\n## Verify\n\n\`\`\`bash\ncurl -I ${siteUrl}\ncurl ${healthUrl}\n\`\`\`\n`
if (mode === 'check') {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8') : ''
  const normalize = (v) => v.replace(/^Updated: .*$/m, 'Updated: <generated>').trim()
  if (normalize(current) !== normalize(content)) process.exit(1)
  console.log('[production-status] current')
} else {
  fs.writeFileSync(outputPath, content)
  console.log('[production-status] wrote docs/PRODUCTION_STATUS.md')
}
