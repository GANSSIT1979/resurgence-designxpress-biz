$base = "http://localhost:3000"

function Test-Url($url) {
  try {
    $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
    Write-Host "[OK] $url -> $($r.StatusCode)" -ForegroundColor Green
  } catch {
    Write-Host "[FAIL] $url -> $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "== Public pages ==" -ForegroundColor Cyan
Test-Url "$base/"
Test-Url "$base/quotation"

Write-Host "`n== Admin pages ==" -ForegroundColor Cyan
Test-Url "$base/admin"
Test-Url "$base/admin/users"