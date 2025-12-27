# Script temporaire pour ajouter les hooks de notification
$settingsPath = "C:/Users/arnau/.claude/settings.json"
$json = Get-Content $settingsPath -Raw | ConvertFrom-Json

# Verifier si les hooks existent deja
$existingMatchers = $json.hooks.PostToolUse | ForEach-Object { $_.matcher }

# Ajouter TodoWrite si pas present
if ("TodoWrite" -notin $existingMatchers) {
    $todoHook = [PSCustomObject]@{
        matcher = "TodoWrite"
        hooks = @([PSCustomObject]@{
            type = "command"
            command = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Claude-Code-Creation\scripts\notify-light.ps1" -Type done'
        })
    }
    $json.hooks.PostToolUse += $todoHook
    Write-Host "Hook TodoWrite ajoute"
}

# Ajouter Write si pas present
if ("Write" -notin $existingMatchers) {
    $writeHook = [PSCustomObject]@{
        matcher = "Write"
        hooks = @([PSCustomObject]@{
            type = "command"
            command = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Claude-Code-Creation\scripts\notify-light.ps1" -Type tick'
        })
    }
    $json.hooks.PostToolUse += $writeHook
    Write-Host "Hook Write ajoute"
}

# Ajouter Edit si pas present
if ("Edit" -notin $existingMatchers) {
    $editHook = [PSCustomObject]@{
        matcher = "Edit"
        hooks = @([PSCustomObject]@{
            type = "command"
            command = 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Claude-Code-Creation\scripts\notify-light.ps1" -Type tick'
        })
    }
    $json.hooks.PostToolUse += $editHook
    Write-Host "Hook Edit ajoute"
}

# Sauvegarder
$json | ConvertTo-Json -Depth 10 | Set-Content $settingsPath -Encoding UTF8
Write-Host "Configuration sauvegardee!"
