const siteUrl = process.env.PRODUCTION_SITE_URL || 'https://www.resurgence-dx.biz'
const healthUrl = new URL('/api/health', siteUrl).toString()
const strict = process.argv.includes('--strict')
const startedAt = Date.now()
const res = await fetch(healthUrl, { headers: { accept: 'application/json' } })
const health = await res.json()
const durationMs = Date.now() - startedAt
const failures = []
const warnings = []
if (!res.ok) failures.push(`health endpoint returned HTTP ${res.status}`)
if (health?.ok !== true) failures.push('health.ok is not true')
if (health?.database !== 'connected') failures.push(`database is ${health?.database}`)
if (health?.schema?.status !== 'ok') failures.push(`schema.status is ${health?.schema?.status}`)
if (health?.support?.webhookReady !== true) warnings.push('webhook is not ready')
if (durationMs > 3000) warnings.push(`health endpoint is slow: ${durationMs}ms`)
if (strict && warnings.length) failures.push(...warnings)
console.log(JSON.stringify({ siteUrl, healthUrl, durationMs, failures, warnings, health }, null, 2))
if (failures.length) process.exit(1)
