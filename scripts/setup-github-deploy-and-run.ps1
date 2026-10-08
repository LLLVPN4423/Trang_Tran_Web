# Thiết lập secrets GitHub (GCP) từ .env + firebase JSON, rồi chạy deploy Cloud Run.
# Cần: đã `gh auth login` (một lần). Không in nội dung key ra màn hình.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "Chưa có GitHub CLI. Cài: winget install GitHub.cli — rồi chạy: gh auth login"
}

$null = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "Đăng nhập GitHub (mở trình duyệt)..." -ForegroundColor Cyan
  gh auth login -h github.com -p https -w
}

if (-not (Test-Path ".env")) { Write-Error "Thiếu .env" }

$envLines = Get-Content ".env"
$credLine = $envLines | Where-Object { $_ -match '^\s*FIREBASE_CREDENTIALS_PATH\s*=' } | Select-Object -First 1
$projLine = $envLines | Where-Object { $_ -match '^\s*FIREBASE_PROJECT_ID\s*=' } | Select-Object -First 1
if (-not $credLine -or -not $projLine) { Write-Error "Thiếu FIREBASE_CREDENTIALS_PATH hoặc FIREBASE_PROJECT_ID trong .env" }

$keyPath = ($credLine -split '=', 2)[1].Trim().Trim('"')
if (-not [IO.Path]::IsPathRooted($keyPath)) { $keyPath = Join-Path (Get-Location) $keyPath }
$gcpProject = ($projLine -split '=', 2)[1].Trim().Trim('"')

if (-not (Test-Path $keyPath)) { Write-Error "Không tìm thấy file key: $keyPath" }

Write-Host "=== Ghi secrets lên GitHub (repo LLLVPN4423/Trang_Tran_Web) ===" -ForegroundColor Cyan
gh secret set GCP_PROJECT_ID --body $gcpProject --repo LLLVPN4423/Trang_Tran_Web
Get-Content -Raw -Encoding UTF8 $keyPath | gh secret set GCP_SA_KEY --repo LLLVPN4423/Trang_Tran_Web

Write-Host "=== Kích hoạt Deploy Cloud Run API (mất ~8–15 phút trên GitHub) ===" -ForegroundColor Cyan
gh workflow run deploy-cloudrun.yml --repo LLLVPN4423/Trang_Tran_Web --ref main

Write-Host @"

Đang deploy trên GitHub Actions. Theo dõi:
  https://github.com/LLLVPN4423/Trang_Tran_Web/actions/workflows/deploy-cloudrun.yml

Sau khi job xanh, chạy:
  node scripts/smoke-test-production.js

Lưu ý: Service account Firebase có thể thiếu quyền Cloud Run — nếu job đỏ, tạo SA riêng có Cloud Run Admin + Cloud Build và thay GCP_SA_KEY.
"@ -ForegroundColor Yellow
