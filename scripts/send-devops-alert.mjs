const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DEVOPS_WEBHOOK_URL
if (!webhookUrl) {
  console.log('[devops-alert] webhook not configured')
  process.exit(0)
}
const title = process.env.ALERT_TITLE || 'Resurgence production alert'
const message = process.env.ALERT_MESSAGE || 'Production validation failed.'
const severity = process.env.ALERT_SEVERITY || 'warning'
const payload = { text: `${severity.toUpperCase()}: ${title}\n${message}` }
const res = await fetch(webhookUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
if (!res.ok) throw new Error(`alert failed: ${res.status}`)
console.log('[devops-alert] sent')
