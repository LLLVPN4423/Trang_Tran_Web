# Deploy frontend lên Cloudflare Pages + smoke test production
# Chạy từ thư mục gốc repo

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path ".env")) {
  Write-Error "Thiếu .env — copy từ .env.plan-b.example và điền VITE_API_URL + Firebase keys"
}

Write-Host "=== Build frontend (đọc .env từ thư mục gốc) ===" -ForegroundColor Cyan
npm run build:frontend
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n=== Deploy Cloudflare Pages (dist + auth proxy via _redirects) ===" -ForegroundColor Cyan
Push-Location frontend
try {
  npx wrangler pages deploy dist --project-name=trangtran-hair --branch=main --commit-dirty=true
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  Pop-Location
}

Write-Host "`n=== Smoke test production ===" -ForegroundColor Cyan
node scripts/smoke-test-production.js
if ($LASTEXITCODE -ne 0) {
  Write-Host "Smoke test FAILED — kiểm tra log trước khi báo user test." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "`nDeploy OK — https://trangtran-hair.pages.dev" -ForegroundColor Green
