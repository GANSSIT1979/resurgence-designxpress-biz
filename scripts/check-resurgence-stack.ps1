$ErrorActionPreference = "Stop"

Write-Host "== RESURGENCE stack check ==" -ForegroundColor Cyan

$paths = @(
  "prisma\schema.template.prisma",
  "prisma\seed.ts",
  "lib\pricing.ts",
  "app\api\catalog\route.ts",
  "app\api\quotes\route.ts",
  "app\api\quotes\list\route.ts",
  "app\quotation\page.tsx",
  "app\admin\layout.tsx",
  "components\dashboard-shell.tsx",
  "app\admin\page.tsx",
  "app\admin\users\page.tsx",
  "app\api\admin\users\route.ts",
  "app\api\admin\users\[id]\route.ts",
  "app\globals.css",
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

Write-Host "`n== Prisma model references check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "prisma\schema.template.prisma" | Select-String -Pattern `
"model ProductCatalogItem|model ProductFlatPrice|model ProductTierPrice|model Quote|model QuoteItem|enum CatalogType|enum PricingMode|enum QuoteStatus"

Write-Host "`n== Seed hooks check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "prisma\seed.ts" | Select-String -Pattern `
"seedSubliCatalog|seedDtfCatalog|db\.productCatalogItem|db\.productFlatPrice|db\.productTierPrice|db\.quote|db\.quoteItem"

Write-Host "`n== Admin duplicate hero risk check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "app\admin\layout.tsx" | Select-String -Pattern "title=|subtitle="
Get-Content -LiteralPath "components\dashboard-shell.tsx" | Select-String -Pattern "dashboard-hero-card|title\?"
Get-Content -LiteralPath "app\admin\page.tsx" | Select-String -Pattern "Dashboard Workspace|System Admin Dashboard"

Write-Host "`n== API route presence check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "app\api\quotes\route.ts" | Select-String -Pattern "export async function POST|resolvePrice|generateQuoteNumber"
Get-Content -LiteralPath "app\api\catalog\route.ts" | Select-String -Pattern "export async function GET|productCatalogItem"

Write-Host "`n== Users API validation check ==" -ForegroundColor Cyan
Get-Content -LiteralPath "app\api\admin\users\route.ts" | Select-String -Pattern `
"Sponsor users must be linked to a sponsor|Partner users must be linked to a partner|normalizedSponsorId|normalizedPartnerId"

Get-Content -LiteralPath "app\api\admin\users\[id]\route.ts" | Select-String -Pattern `
"Sponsor users must be linked to a sponsor|Partner users must be linked to a partner|normalizedSponsorId|normalizedPartnerId"

Write-Host "`n== Done ==" -ForegroundColor Green