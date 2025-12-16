# Load ULTRA-CREATE environment variables
$envFile = 'C:\Claude-Code-Creation\.env.ultra-create'
$content = Get-Content $envFile

foreach ($line in $content) {
    if ($line -match '^([A-Z_]+)=(.+)$') {
        $name = $Matches[1]
        $value = $Matches[2]
        Write-Host "Setting $name..."
        [System.Environment]::SetEnvironmentVariable($name, $value, 'User')
    }
}

Write-Host "`nAll variables loaded! Restart Claude Code to apply."
