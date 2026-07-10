<#
.SYNOPSIS
  Builds Jaza.Api, optionally fetches OpenAPI, and refreshes API documentation artifacts.

.DESCRIPTION
  1. dotnet build backend/src/Jaza.Api
  2. Attempts GET https://localhost:5001/openapi/v1.json (skip if API not running)
  3. Writes docs/api/generated/routes.md (placeholder + manifest summary)
  4. Writes docs/api/endpoint-manifest.json (controller route inventory)

.EXAMPLE
  ./backend/scripts/export-api-docs.ps1
  ./backend/scripts/export-api-docs.ps1 -OpenApiUrl "https://localhost:5001/openapi/v1.json"
#>
[CmdletBinding()]
param(
    [string]$OpenApiUrl = "https://localhost:5001/openapi/v1.json",
    [string]$RepoRoot = "",
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

$apiProject = Join-Path $RepoRoot "backend\src\Jaza.Api\Jaza.Api.csproj"
$controllersDir = Join-Path $RepoRoot "backend\src\Jaza.Api\Controllers"
$docsApiDir = Join-Path $RepoRoot "docs\api"
$generatedDir = Join-Path $docsApiDir "generated"
$routesMd = Join-Path $generatedDir "routes.md"
$manifestJson = Join-Path $docsApiDir "endpoint-manifest.json"
$openApiCache = Join-Path $generatedDir "openapi-v1.json"

Write-Host "Repo root: $RepoRoot"

if (-not $SkipBuild) {
    Write-Host "Building Jaza.Api..."
    dotnet build $apiProject -c Release --nologo -v q
    if ($LASTEXITCODE -ne 0) { throw "dotnet build failed with exit code $LASTEXITCODE" }
}

New-Item -ItemType Directory -Force -Path $generatedDir | Out-Null

# Parse controllers for route manifest
function Get-ControllerRoutes {
    param([string]$Directory)

    $controllers = Get-ChildItem -Path $Directory -Filter "*Controller.cs" | Sort-Object Name
    $result = @()

    foreach ($file in $controllers) {
        $text = Get-Content -Raw -Path $file.FullName
        $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

        $routeMatch = [regex]::Match($text, '\[Route\("([^"]+)"\)\]')
        $prefix = if ($routeMatch.Success) { $routeMatch.Groups[1].Value } else { "" }

        $classAuth = @()
        if ($text -match '\[Authorize\(Policy\s*=\s*Policies\.(\w+)\)\]') { $classAuth += $Matches[1] }
        if ($text -match '\[RequireModule\(Modules\.(\w+)\)\]') { $classAuth += "Module:$($Matches[1].ToLower())" }

        $routes = @()
        $httpRegex = [regex]::new('\[(Http(Get|Post|Put|Patch|Delete))(?:\("([^"]*)"\))?\]', 'IgnoreCase')
        foreach ($m in $httpRegex.Matches($text)) {
            $method = $m.Groups[2].Value.ToUpper()
            $sub = $m.Groups[3].Value
            $path = if ($prefix) {
                if ($sub) { "/$prefix/$sub" -replace '//', '/' } else { "/$prefix" }
            } else { "/$sub" }
            $path = $path -replace '\{id:guid\}', '{id}' -replace '\{(\w+):guid\}', '{$1}'
            $routes += [ordered]@{ method = $method; path = $path; template = $sub }
        }

        $result += [ordered]@{
            controller = $name
            file         = "backend/src/Jaza.Api/Controllers/$($file.Name)"
            routePrefix  = $prefix
            auth         = $classAuth
            routeCount   = $routes.Count
            routes       = $routes
        }
    }

    return $result
}

Write-Host "Scanning controllers in $controllersDir..."
$manifest = [ordered]@{
    generatedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
    openApiPath    = "/openapi/v1.json"
    openApiUrl     = $OpenApiUrl
    controllerCount = 0
    routeCount      = 0
    controllers     = @()
}

$controllers = Get-ControllerRoutes -Directory $controllersDir
$manifest.controllers = $controllers
$manifest.controllerCount = $controllers.Count
$manifest.routeCount = ($controllers | ForEach-Object { $_.routeCount } | Measure-Object -Sum).Sum

$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $manifestJson -Encoding UTF8
Write-Host "Wrote $manifestJson ($($manifest.controllerCount) controllers, $($manifest.routeCount) routes)"

# Fetch OpenAPI (optional)
$openApiFetched = $false
$openApiNote = "OpenAPI document not fetched - start the API (dotnet run --project backend/src/Jaza.Api) and re-run, or open $OpenApiUrl in Development."

try {
    Write-Host "Fetching OpenAPI from $OpenApiUrl ..."
    # SkipCertificateCheck requires PowerShell 7+; ignore TLS errors for localhost dev cert on 5.1
    if ($PSVersionTable.PSVersion.Major -ge 7) {
        $response = Invoke-WebRequest -Uri $OpenApiUrl -SkipCertificateCheck -TimeoutSec 5 -UseBasicParsing
    } else {
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
        $response = Invoke-WebRequest -Uri $OpenApiUrl -TimeoutSec 5 -UseBasicParsing
    }
    if ($response.StatusCode -eq 200) {
        $response.Content | Set-Content -Path $openApiCache -Encoding UTF8
        $openApiFetched = $true
        $openApiNote = "Cached from $OpenApiUrl at $(Get-Date -Format o). See also docs/api/generated/openapi-v1.json."
        Write-Host "Cached OpenAPI to $openApiCache"
    }
}
catch {
    Write-Warning "Could not fetch OpenAPI: $($_.Exception.Message)"
}

# routes.md placeholder
$routesContent = @"
# Generated route inventory

> **Auto-generated** by ``backend/scripts/export-api-docs.ps1`` — do not edit by hand.
> Regenerate after controller changes.

**Generated:** $($manifest.generatedAtUtc)  
**Controllers:** $($manifest.controllerCount)  
**Action routes scanned:** $($manifest.routeCount)  
**OpenAPI:** $($manifest.openApiPath)  
**OpenAPI status:** $openApiNote

---

## Quick links

| Artifact | Path |
|----------|------|
| Endpoint manifest (JSON) | [../endpoint-manifest.json](../endpoint-manifest.json) |
| Human route reference | [../../http-api.md](../../http-api.md) |
| Module guides | [../modules/](../modules/) |
| OpenAPI cache | [openapi-v1.json](openapi-v1.json) |

---

## Controller summary

| Controller | Prefix | Routes | Auth |
|------------|--------|--------|------|
"@

foreach ($c in $controllers) {
    $authStr = if ($c.auth.Count -gt 0) { ($c.auth -join ", ") } else { "(per-action)" }
    $routesContent += "| ``$($c.controller)`` | ``/$($c.routePrefix)`` | $($c.routeCount) | $authStr |`n"
}

$routesContent += @"

---

## Full route list (from source scan)

"@

foreach ($c in $controllers) {
    $routesContent += "### $($c.controller)`n`n"
    $routesContent += "| Method | Path |`n|--------|------|`n"
    foreach ($r in $c.routes) {
        $routesContent += "| $($r.method) | ``$($r.path)`` |`n"
    }
    $routesContent += "`n"
}

$routesContent += @"
---

## OpenAPI

When the API is running locally in Development:

``````bash
curl -sk $OpenApiUrl -o docs/api/generated/openapi-v1.json
``````

Scalar UI is mapped in Development via ``MapScalarApiReference()`` on the API origin.

---

## Regenerate

``````powershell
./backend/scripts/export-api-docs.ps1
``````
"@

Set-Content -Path $routesMd -Value $routesContent -Encoding UTF8
Write-Host "Wrote $routesMd"
Write-Host "Done."
