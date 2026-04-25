const targetUrl = process.env.DEPLOYMENT_URL || process.env.PRODUCTION_SITE_URL || 'https://www.resurgence-dx.biz'
const healthUrl = new URL('/api/health', targetUrl).toString()
const minScore = Number(process.env.MIN_DEPLOYMENT_SCORE || 90)

async function timedFetch(url, options = {}) {
  const startedAt = Date.now()
  const response = await fetch(url, {
    headers: {
      accept: 'application/json,text/html,*/*',
      'user-agent': 'resurgence-deployment-score/1.0',
    },
    ...options,
  })
  const durationMs = Date.now() - startedAt
  const text = await response.text()
  return { response, durationMs, text }
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function scoreLatency(ms) {
  if (ms <= 750) return 20
  if (ms <= 1500) return 15
  if (ms <= 3000) return 8
  return 0
}

const checks = []
let score = 0

const root = await timedFetch(targetUrl, { method: 'HEAD' })
checks.push({ name: 'root_status', ok: root.response.ok, value: root.response.status })
if (root.response.ok) score += 20
score += scoreLatency(root.durationMs)
checks.push({ name: 'root_latency_ms', ok: root.durationMs <= 3000, value: root.durationMs })

const healthResult = await timedFetch(healthUrl)
const health = safeJson(healthResult.text)
checks.push({ name: 'health_status', ok: healthResult.response.ok, value: healthResult.response.status })
if (healthResult.response.ok) score += 10

const healthOk = health?.ok === true && health?.status === 'ok'
checks.push({ name: 'health_ok', ok: healthOk, value: health?.status || null })
if (healthOk) score += 15

const dbOk = health?.database === 'connected'
checks.push({ name: 'database_connected', ok: dbOk, value: health?.database || null })
if (dbOk) score += 15

const schemaOk = health?.schema?.status === 'ok' && (!health?.schema?.issues || health.schema.issues.length === 0)
checks.push({ name: 'schema_ok', ok: schemaOk, value: health?.schema || null })
if (schemaOk) score += 15

const supportReady = health?.support?.chatkitReady === true && health?.support?.webhookReady === true
checks.push({ name: 'support_ready', ok: supportReady, value: health?.support || null })
if (supportReady) score += 5

score += scoreLatency(healthResult.durationMs)
checks.push({ name: 'health_latency_ms', ok: healthResult.durationMs <= 3000, value: healthResult.durationMs })

const failedChecks = checks.filter((check) => !check.ok)
const passed = score >= minScore && failedChecks.length === 0

const result = {
  targetUrl,
  healthUrl,
  checkedAt: new Date().toISOString(),
  score,
  minScore,
  passed,
  failedChecks,
  checks,
}

console.log(JSON.stringify(result, null, 2))

if (!passed) {
  process.exit(1)
}
