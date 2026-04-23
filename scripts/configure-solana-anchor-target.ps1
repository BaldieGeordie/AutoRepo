param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,

  [string]$TargetKey = "solana-devnet",
  [string]$Label = "Solana Devnet",
  [string]$NetworkName = "solana-devnet",
  [string]$ProgramId = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
  [string]$ExplorerBaseUrl = "https://explorer.solana.com?cluster=devnet",
  [switch]$Primary,
  [int]$BackfillLimit = 500
)

$normalizedBaseUrl = $BaseUrl.TrimEnd("/")

$targetPayload = @{
  targetKey = $TargetKey
  label = $Label
  targetKind = "SOLANA"
  networkName = $NetworkName
  programId = $ProgramId
  explorerBaseUrl = $ExplorerBaseUrl
  enabled = $true
  isPrimary = [bool]$Primary
} | ConvertTo-Json -Depth 5

$backfillPayload = @{
  targetKey = $TargetKey
  limitPerTarget = $BackfillLimit
} | ConvertTo-Json -Depth 5

Write-Host "Configuring anchor target '$TargetKey' against $normalizedBaseUrl" -ForegroundColor Cyan

$targetResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "$normalizedBaseUrl/api/v1/admin/anchoring/targets" `
  -ContentType "application/json" `
  -Body $targetPayload

Write-Host "Target upserted:" -ForegroundColor Green
$targetResponse | ConvertTo-Json -Depth 8

$backfillResponse = Invoke-RestMethod `
  -Method Post `
  -Uri "$normalizedBaseUrl/api/v1/admin/anchoring/targets/backfill" `
  -ContentType "application/json" `
  -Body $backfillPayload

Write-Host "Backfill result:" -ForegroundColor Green
$backfillResponse | ConvertTo-Json -Depth 8

$statusResponse = Invoke-RestMethod `
  -Method Get `
  -Uri "$normalizedBaseUrl/api/v1/admin/anchoring/targets/$TargetKey/status"

Write-Host "Current target status:" -ForegroundColor Green
$statusResponse | ConvertTo-Json -Depth 8
