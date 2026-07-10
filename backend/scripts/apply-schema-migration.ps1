# Apply all EF Core migrations to the target PostgreSQL database.
# Usage:
#   $env:ConnectionStrings__Default = "Host=...;Database=...;Username=...;Password=...;Ssl Mode=Require"
#   ./backend/scripts/apply-schema-migration.ps1
#
# Or pass inline:
#   ./backend/scripts/apply-schema-migration.ps1 -ConnectionString "Host=..."

param(
    [string]$ConnectionString = $env:ConnectionStrings__Default
)

$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$backend = Join-Path $root "backend"

if ([string]::IsNullOrWhiteSpace($ConnectionString)) {
    Write-Error @"
Connection string required. Set one of:
  - `$env:ConnectionStrings__Default
  - -ConnectionString parameter

Example (Neon):
  `$env:ConnectionStrings__Default = 'Host=ep-xxx.neon.tech;Database=neondb;Username=neondb_owner;Password=SECRET;Ssl Mode=Require'
  ./backend/scripts/apply-schema-migration.ps1
"@
}

Write-Host "Applying EF migrations..."
Push-Location $backend
try {
    $env:ConnectionStrings__Default = $ConnectionString
    dotnet ef database update `
        --project src/Jaza.Infrastructure `
        --startup-project src/Jaza.Api
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "Schema migration complete."
}
finally {
    Pop-Location
}
