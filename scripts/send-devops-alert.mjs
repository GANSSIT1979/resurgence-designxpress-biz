const webhookUrl = process.env.SLACK_WEBHOOK_URL || process.env.DEVOPS_WEBHOOK_URL
const siteUrl = process.env.PRODUCTION_SITE_URL || 'https://www.resurgence-dx.biz'
const title = process.env.ALERT_TITLE || 'Resurgence production alert'
const message = process.env.ALERT_MESSAGE || 'Production validation failed.'
const severity = process.env.ALERT_SEVERITY || 'warning'
const runUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : null

if (!webhookUrl) {
  console.log('[devops-alert] no SLACK_WEBHOOK_URL or DEVOPS_WEBHOOK_URL configured; skipping external alert')
  process.exit(0)
}

const payload = {
  text: `${severity.toUpperCase()}: ${title}`,
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${severity.toUpperCase()}: ${title}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Site:* ${siteUrl}\n*Message:* ${message}`,
      },
    },
    ...(runUrl ? [{
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*GitHub run:* ${runUrl}`,
      },
    }] : []),
  ],
}

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'resurgence-devops-alert/1.0',
  },
  body: JSON.stringify(payload),
})

if (!response.ok) {
  const text = await response.text()
  throw new Error(`Alert webhook failed with ${response.status}: ${text}`)
}

console.log('[devops-alert] alert sent')
