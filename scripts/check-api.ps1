$base = "http://localhost:3000"

Write-Host "== Catalog API ==" -ForegroundColor Cyan
try {
  $catalog = Invoke-RestMethod -Uri "$base/api/catalog" -Method GET
  Write-Host "Catalog ok: $($catalog.ok)" -ForegroundColor Green
  Write-Host "Products count: $($catalog.products.Count)"
} catch {
  Write-Host "Catalog API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n== Quote API dry structure test ==" -ForegroundColor Cyan
$payload = @{
  customerName = "Smoke Test Customer"
  companyName  = "RESURGENCE QA"
  email        = "qa@example.com"
  phone        = "09170000000"
  address      = "Test Address"
  notes        = "Smoke test"
  discount     = 0
  vatRate      = 0
  items        = @()
} | ConvertTo-Json -Depth 10

try {
  $res = Invoke-WebRequest -Uri "$base/api/quotes" -Method POST -ContentType "application/json" -Body $payload -UseBasicParsing
  Write-Host "Unexpected success: $($res.Content)" -ForegroundColor Yellow
} catch {
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $body = $reader.ReadToEnd()
    Write-Host "Expected validation response:" -ForegroundColor Green
    Write-Host $body
  } else {
    Write-Host "Quote API failed: $($_.Exception.Message)" -ForegroundColor Red
  }
}