Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Claude-Code-Creation\games\ethan-ski-adventure"

' Start the dev server hidden
WshShell.Run "cmd /c npm run dev", 0, False

' Wait for server to start
WScript.Sleep 3000

' Open browser
WshShell.Run "http://localhost:5174/", 1, False
