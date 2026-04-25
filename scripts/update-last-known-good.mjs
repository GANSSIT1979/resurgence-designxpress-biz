import fs from 'node:fs'
import path from 'node:path'

const siteUrl = process.env.PRODUCTION_SITE_URL || 'https://www.resurgence-dx.biz'
const deploymentUrl = process.env.DEPLOYMENT_URL
const deploymentId = process.env.DEPLOYMENT_ID

if (!deploymentUrl || !deploymentId) {
  console.error('DEPLOYMENT_URL and DEPLOYMENT_ID are required')
  process.exit(1)
}

const healthUrl = new URL('/api/health', siteUrl).toString()

async function fetchHealth() {
  const res = await fetch(healthUrl)
  const json = await res.json()
  return json
}

const health = await fetchHealth()

if (!health.ok || health.database !== 'connected' || health.schema?.status !== 'ok') {
  console.error('Health not OK; refusing to mark as last known good')
  process.exit(1)
}

const filePath = path.join(process.cwd(), 'ops', 'last-known-good.json')

const data = {
  productionSiteUrl: siteUrl,
  lastKnownGoodDeploymentUrl: deploymentUrl,
  lastKnownGoodDeploymentId: deploymentId,
  verifiedAt: new Date().toISOString(),
  verifiedBy: 'ci-health-check',
  health: {
    ok: true,
    database: health.database,
    schemaStatus: health.schema?.status,
  },
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
console.log('[last-known-good] updated')
