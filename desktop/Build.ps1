param(
    [Parameter(Mandatory)][string]$WebView2Sdk,
    [Parameter(Mandatory)][string]$OutputDirectory
)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$sdk = (Resolve-Path -LiteralPath $WebView2Sdk).Path
$out = (New-Item -ItemType Directory -Path $OutputDirectory -Force).FullName
$compiler = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
$core = Join-Path $sdk 'lib/net462/Microsoft.Web.WebView2.Core.dll'
$forms = Join-Path $sdk 'lib/net462/Microsoft.Web.WebView2.WinForms.dll'
$exe = Join-Path $out 'Project X - Benteng Lembah.exe'
$compileArgs = @('/nologo', '/target:winexe', '/platform:x64', '/optimize+', "/out:$exe",
    '/reference:System.Windows.Forms.dll', '/reference:System.Drawing.dll',
    "/reference:$core", "/reference:$forms", (Join-Path $PSScriptRoot 'Program.cs'))
& $compiler @compileArgs
if ($LASTEXITCODE) { throw 'Kompilasi desktop gagal.' }

Copy-Item -LiteralPath $core,$forms,(Join-Path $sdk 'runtimes/win-x64/native/WebView2Loader.dll') -Destination $out
$game = New-Item -ItemType Directory -Path (Join-Path $out 'game/web') -Force
foreach ($file in 'index.html','screen.css','simulation.js','map.js','game.js') {
    Copy-Item -LiteralPath (Join-Path $repo "web/$file") -Destination $game.FullName
}
$source = Join-Path $repo 'assets/project-x-v0.1'
$assets = New-Item -ItemType Directory -Path (Join-Path $out 'game/assets/project-x-v0.1') -Force
foreach ($folder in 'citizens','portraits','threats','tiles','ui','world') {
    $target = New-Item -ItemType Directory -Path (Join-Path $assets.FullName $folder) -Force
    Copy-Item -Path (Join-Path $source "$folder/*") -Recurse -Destination $target.FullName
}
$licenses = New-Item -ItemType Directory -Path (Join-Path $out 'ThirdParty/Microsoft.Web.WebView2') -Force
Copy-Item -LiteralPath (Join-Path $sdk 'LICENSE.txt'),(Join-Path $sdk 'NOTICE.txt') -Destination $licenses.FullName
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'MULAI.txt') -Destination $out
