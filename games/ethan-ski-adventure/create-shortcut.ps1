$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Ski Challenge.lnk")
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"C:\Claude-Code-Creation\games\ethan-ski-adventure\launcher.vbs`""
$Shortcut.WorkingDirectory = "C:\Claude-Code-Creation\games\ethan-ski-adventure"
$Shortcut.Description = "Ski Challenge - Slalom Alpin"
$Shortcut.IconLocation = "C:\Windows\System32\shell32.dll,47"
$Shortcut.Save()
Write-Host "Raccourci cree sur le bureau!"
