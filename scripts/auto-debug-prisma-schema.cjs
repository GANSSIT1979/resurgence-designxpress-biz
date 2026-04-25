const fs = require('node:fs')
const path = require('node:path')

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
if (!fs.existsSync(schemaPath)) {
  console.error('[auto-debug] Missing prisma/schema.prisma')
  process.exit(1)
}

const backupPath = path.join(process.cwd(), 'prisma', `schema.prisma.backup-${Date.now()}`)
let s = fs.readFileSync(schemaPath, 'utf8')
fs.writeFileSync(backupPath, s)
console.log(`[auto-debug] Backup created: ${path.relative(process.cwd(), backupPath)}`)

s = s.replace(/\bodel\s+ShopCategory\b/g, 'model ShopCategory')
s = s.replace(/\}(?=(enum|model)\s+)/g, '}\n\n')

function findBlocks(keyword) {
  const re = new RegExp(`${keyword}\\s+(\\w+)\\s*\\{[\\s\\S]*?\\n\\}`, 'g')
  const blocks = []
  let match
  while ((match = re.exec(s))) blocks.push({ name: match[1], start: match.index, end: re.lastIndex, text: match[0] })
  return blocks
}

for (const keyword of ['enum', 'model']) {
  const seen = new Set()
  for (const block of findBlocks(keyword)) {
    if (seen.has(block.name)) {
      console.warn(`[auto-debug] Duplicate ${keyword} detected: ${block.name}`)
    }
    seen.add(block.name)
  }
}

const payoutMatch = s.match(/model CreatorPayoutRequest \{[\s\S]*?\n\}/)
if (!payoutMatch) {
  console.error('[auto-debug] Missing model CreatorPayoutRequest')
  process.exit(1)
}
let payout = payoutMatch[0]

const insertAfter = (text, needle, insertion) => text.includes(insertion.trim().split(/\s+/)[0]) ? text : text.replace(needle, `${needle}${insertion}`)

if (!payout.includes('creatorProfileId')) {
  payout = payout.replace(/(\s+creatorId\s+String\n)/, '$1  creatorProfileId   String?\n')
}
if (!payout.includes('amountCents')) {
  payout = payout.replace(/(\s+requestedAmount\s+Decimal\s+@default\(0\)\s+@db\.Decimal\(12,\s*2\)\n)/, '$1  amountCents        Int?\n')
}
if (!payout.includes('payoutAccountId')) {
  payout = payout.replace(/(\s+providerAccountId\s+String\?\n)/, '$1  payoutAccountId    String?\n')
}
if (!payout.includes('reviewedById')) {
  payout = payout.replace(/(\s+requestedAt\s+DateTime\s+@default\(now\(\)\)\n)/, '$1  reviewedById       String?\n  reviewedAt         DateTime?\n')
}
if (!payout.includes('@@index([creatorProfileId])')) {
  payout = payout.replace(/(\s+@@index\(\[creatorId\]\)\n)/, '$1  @@index([creatorProfileId])\n')
}
if (!payout.includes('@@index([reviewedById])')) {
  payout = payout.replace(/(\s+@@index\(\[requestedAt\]\)\n)/, '$1  @@index([reviewedById])\n')
}
if (!payout.includes('@@index([payoutAccountId])')) {
  payout = payout.replace(/(\s+@@index\(\[reviewedById\]\)\n)/, '$1  @@index([payoutAccountId])\n')
}

s = s.replace(payoutMatch[0], payout)
fs.writeFileSync(schemaPath, s.trim() + '\n')
console.log('[auto-debug] Patched prisma/schema.prisma')
console.log('[auto-debug] Run: npm run prisma:prepare && npx prisma validate --schema prisma/schema.generated.prisma && npm run prisma:generate && npm run vercel-build')
