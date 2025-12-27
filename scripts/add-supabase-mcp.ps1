# Ajouter Supabase MCP
$settingsPath = "C:/Users/arnau/.claude/settings.json"
$settings = Get-Content $settingsPath -Raw | ConvertFrom-Json

# Verifier si Supabase existe deja
$mcpNames = ($settings.mcpServers | Get-Member -MemberType NoteProperty).Name
if ("supabase" -in $mcpNames) {
    Write-Host "Supabase MCP deja present"
    exit 0
}

# Ajouter Supabase MCP
$supabase = [PSCustomObject]@{
    command = "npx"
    args = @("-y", "@supabase/mcp-server-supabase@latest")
    env = [PSCustomObject]@{
        SUPABASE_ACCESS_TOKEN = "`${SUPABASE_ACCESS_TOKEN}"
    }
}

$settings.mcpServers | Add-Member -NotePropertyName "supabase" -NotePropertyValue $supabase -Force

$settings | ConvertTo-Json -Depth 10 | Set-Content $settingsPath -Encoding UTF8
Write-Host "Supabase MCP ajoute avec succes!"

# Compter les MCPs
$count = ($settings.mcpServers | Get-Member -MemberType NoteProperty).Count
Write-Host "Total MCPs: $count"
