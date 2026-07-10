# Legacy SQL Server → PostgreSQL ETL migration.
# Usage (dry-run first):
#   ./backend/scripts/run-etl-migration.ps1 `
#     -LegacyConnectionString "Server=...;Database=LegacyWMS;User Id=sa;Password=...;TrustServerCertificate=True" `
#     -TargetConnectionString "Host=...;Database=neondb;Username=...;Password=...;Ssl Mode=Require" `
#     -Division "DISTRIBUTIONBDG" `
#     -DryRun
#
# Wet run (commits data):
#   ./backend/scripts/run-etl-migration.ps1 ... -DryRun:$false

param(
    [Parameter(Mandatory = $true)]
    [string]$LegacyConnectionString,

    [Parameter(Mandatory = $true)]
    [string]$TargetConnectionString,

    [string]$Division = "DISTRIBUTIONBDG",

    [string[]]$Only = @(
        "Units", "Categories", "Brands", "Suppliers", "Customers",
        "Warehouses", "Items", "PurchaseOrders", "SalesOrders",
        "Invoices", "Payments"
    ),

    [datetime]$Since,

    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backend = Join-Path $root "backend"

$args = @(
    "run", "--project", "src/Jaza.Migration", "--",
    "--legacy-cs=$LegacyConnectionString",
    "--target-cs=$TargetConnectionString",
    "--division=$Division",
    "--only=$($Only -join ',')"
)

if ($DryRun) { $args += "--dry-run" }
if ($Since) { $args += "--since=$($Since.ToString('yyyy-MM-dd'))" }

Write-Host "ETL starting (DryRun=$DryRun, Division=$Division)..."
Push-Location $backend
try {
    dotnet @args
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "ETL complete. See backend/etl-errors/summary.json"
}
finally {
    Pop-Location
}
