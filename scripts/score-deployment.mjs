const targetUrl = process.env.DEPLOYMENT_URL || process.env.PRODUCTION_SITE_URL || 'https://www.resurgence-dx.biz'
const minScore = Number(process.env.MIN_DEPLOYMENT_SCORE || 90)
async function timed(url, options = {}) {
  const start = Date.now()
  const response = await fetch(url, options)
  const durationMs = Date.now() - start
  const text = await response.text()
  return { response, durationMs, text }
}
const root = await timed(targetUrl, { method: 'HEAD' })
const healthUrl = new URL('/api/health', targetUrl).toString()
const healthRes = await timed(healthUrl)
const health = JSON.parse(healthRes.text)
let score = 0
const failedChecks = []
if (root.response.ok) score += 20; else failedChecks.push('root_status')
if (root.durationMs <= 3000) score += 15; else failedChecks.push('root_latency')
if (healthRes.response.ok) score += 10; else failedChecks.push('health_status')
if (health.ok && health.status === 'ok') score += 15; else failedChecks.push('health_ok')
if (health.database === 'connected') score += 15; else failedChecks.push('database')
if (health.schema?.status === 'ok') score += 15; else failedChecks.push('schema')
if (health.support?.chatkitReady && health.support?.webhookReady) score += 10; else failedChecks.push('support')
const passed = score >= minScore && failedChecks.length === 0
console.log(JSON.stringify({ targetUrl, healthUrl, score, minScore, passed, failedChecks }, null, 2))
if (!passed) process.exit(1)
