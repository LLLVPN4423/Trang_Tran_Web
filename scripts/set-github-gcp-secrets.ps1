# Upload GCP secrets for GitHub Actions Deploy Cloud Run (run once after gh auth login).
# Usage: .\scripts\set-github-gcp-secrets.ps1
$ErrorActionPreference = 'Stop'
$repo = 'LLLVPN4423/Trang_Tran_Web'
$keyPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'github-sa-key.json'
if (-not (Test-Path $keyPath)) {
  Write-Error "Missing github-sa-key.json at repo root. Create SA key first or run from maintainer."
}
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Chua dang nhap gh. Chay: gh auth login --web" -ForegroundColor Yellow
  exit 1
}
$projectId = 'trangtranhairsalon-872c5'
Write-Host "Setting GCP_PROJECT_ID on $repo ..."
gh secret set GCP_PROJECT_ID --body $projectId --repo $repo
Write-Host "Setting GCP_SA_KEY from $keyPath ..."
Get-Content -Raw $keyPath | gh secret set GCP_SA_KEY --repo $repo
Write-Host "Done. Test: gh workflow run deploy-cloudrun.yml --repo $repo -f ref=main"
