import fs from 'node:fs'
import path from 'node:path'
const siteUrl = process.env.PRODUCTION_SITE_URL || 'https://www.resurgence-dx.biz'
const deploymentUrl = process.env.DEPLOYMENT_URL
const deploymentId = process.env.DEPLOYMENT_ID
if (!deploymentUrl || !deploymentId) throw new Error('DEPLOYMENT_URL and DEPLOYMENT_ID are required')
const health = await fetch(new URL('/api/health', siteUrl)).then(r => r.json())
if (!health.ok || health.database !== 'connected' || health.schema?.status !== 'ok') throw new Error('Health not OK')
const data = { productionSiteUrl: siteUrl, lastKnownGoodDeploymentUrl: deploymentUrl, lastKnownGoodDeploymentId: deploymentId, verifiedAt: new Date().toISOString(), verifiedBy: 'ci-health-check', health: { ok: true, database: health.database, schemaStatus: health.schema?.status } }
fs.mkdirSync(path.join(process.cwd(), 'ops'), { recursive: true })
fs.writeFileSync(path.join(process.cwd(), 'ops', 'last-known-good.json'), JSON.stringify(data, null, 2))
