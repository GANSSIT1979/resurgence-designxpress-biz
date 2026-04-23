$ErrorActionPreference = "Stop"

Write-Host "== RESURGENCE stack check ==" -ForegroundColor Cyan

$paths = @(
  "prisma\schema.prisma",
  "prisma\schema.generated.prisma",
  "prisma\seed.ts",
  "src\app\login\page.tsx",
  "src\app\feed\page.tsx",
  "src\app\member\page.tsx",
  "src\app\creator\dashboard\page.tsx",
  "src\app\creator\posts\page.tsx",
  "src\app\creator\posts\new\page.tsx",
  "src\app\api\media\cloudflare\direct-upload\route.ts",
  "src\app\api\creator\posts\create\route.ts",
  "src\app\api\creator\analytics\route.ts",
  "src\app\api\feed\[postId]\comments\route.ts",
  "src\components\feed\creator-commerce-feed.tsx",
  "src\components\resurgence\CreatorPostComposer.tsx",
  "src\components\resurgence\CreatorAnalyticsDashboard.tsx",
  "src\lib\feed\mutations.ts",
  "src\lib\creator-analytics\getCreatorAnalyticsDashboard.ts",
  "src\lib\session-server.ts",
  "src\app\globals.css",
  "scripts\prepare-prisma-schema.mjs",
  "scripts\prepare-prisma.mjs"
)

$missing = @()
foreach ($p in $paths) {
  if (-not (Test-Path -LiteralPath $p)) {
    $missing += $p
  }
}

if ($missing.Count -gt 0) {
  Write-Host "Missing files:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
} else {
  Write-Host "All required files exist." -ForegroundColor Green
}

Write-Host "`n== Prisma provider workflow check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "prisma\schema.prisma" | Select-String -Pattern 'provider = "sqlite"|provider = "postgresql"'
Get-Content -LiteralPath "scripts\prepare-prisma-schema.mjs" | Select-String -Pattern 'schema.generated.prisma|PRISMA_DB_PROVIDER|DATABASE_URL'
Get-Content -LiteralPath "scripts\prepare-prisma.mjs" | Select-String -Pattern 'compatibility shim|prepare-prisma-schema.mjs'

Write-Host "`n== Session and auth surface check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "src\lib\session-server.ts" | Select-String -Pattern 'export async function getServerSession|export async function getCurrentSessionUser'

Write-Host "`n== Feed mutation surface check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "src\lib\feed\mutations.ts" | Select-String -Pattern 'export async function createFeedPost|export async function togglePostLike|export async function createPostComment|export async function togglePostSave|export async function incrementPublicPostShare'

Write-Host "`n== Creator upload and analytics route check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "src\app\api\media\cloudflare\direct-upload\route.ts" | Select-String -Pattern "runtime = 'nodejs'|export async function POST"
Get-Content -LiteralPath "src\app\api\creator\posts\create\route.ts" | Select-String -Pattern "runtime = 'nodejs'|export async function POST"
Get-Content -LiteralPath "src\app\api\creator\analytics\route.ts" | Select-String -Pattern "runtime = 'nodejs'|export async function GET"

Write-Host "`n== Comments and dashboard helper check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "src\app\api\feed\[postId]\comments\route.ts" | Select-String -Pattern 'export async function GET|export async function POST'
Get-Content -LiteralPath "src\lib\creator-analytics\getCreatorAnalyticsDashboard.ts" | Select-String -Pattern 'export async function getCreatorAnalyticsDashboard'

Write-Host "`n== Done ==" -ForegroundColor Green
