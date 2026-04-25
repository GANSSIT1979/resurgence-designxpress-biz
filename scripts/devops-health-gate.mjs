const siteUrl = process.env.PRODUCTION_SITE_URL || 'https://www.resurgence-dx.biz'
const healthUrl = new URL('/api/health', siteUrl).toString()
const strict = process.argv.includes('--strict')

async function fetchJson(url) {
  const startedAt = Date.now()
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'resurgence-devops-health-gate/1.0',
    },
  })
  const durationMs = Date.now() - startedAt
  const text = await response.text()
  let data = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(`Expected JSON from ${url}, received: ${text.slice(0, 300)}`)
  }

  return { response, data, durationMs }
}

function evaluate({ response, data, durationMs }) {
  const failures = []
  const warnings = []

  if (!response.ok) failures.push(`health endpoint returned HTTP ${response.status}`)
  if (data?.ok !== true) failures.push('health.ok is not true')
  if (data?.status !== 'ok') failures.push(`health.status is ${JSON.stringify(data?.status)}`)
  if (data?.database !== 'connected') failures.push(`database is ${JSON.stringify(data?.database)}`)
  if (data?.schema?.status !== 'ok') failures.push(`schema.status is ${JSON.stringify(data?.schema?.status)}`)
  if (Array.isArray(data?.schema?.issues) && data.schema.issues.length > 0) {
    failures.push(`schema issues: ${data.schema.issues.join(', ')}`)
  }

  if (data?.support?.webhookReady !== true) warnings.push('OpenAI webhook is not ready')
  if (data?.support?.chatkitReady !== true) warnings.push('ChatKit is not ready')
  if (durationMs > 3000) warnings.push(`health endpoint is slow: ${durationMs}ms`)
  if (strict && warnings.length) failures.push(...warnings)

  return { failures, warnings }
}

const result = await fetchJson(healthUrl)
const { failures, warnings } = evaluate(result)

const summary = {
  siteUrl,
  healthUrl,
  checkedAt: new Date().toISOString(),
  durationMs: result.durationMs,
  failures,
  warnings,
  health: result.data,
}

console.log(JSON.stringify(summary, null, 2))

if (failures.length) {
  process.exit(1)
}
