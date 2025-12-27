# ULTRA-CREATE v20.0 - Notification System ENHANCED
# Notifications audio PUISSANTES et visuelles pour Claude Code

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("complete", "attention", "error", "validation", "info")]
    [string]$Type,

    [Parameter(Mandatory=$false)]
    [string]$Message = "",

    [Parameter(Mandatory=$false)]
    [string]$Title = "Claude Code",

    [Parameter(Mandatory=$false)]
    [switch]$Silent
)

# Configuration des sons ENHANCED (frequence Hz, duree ms, repetitions)
# Plus fort, plus long, plus de repetitions
$Sounds = @{
    "complete"   = @{
        Pattern = @(
            @{Freq = 523; Duration = 300},  # Do
            @{Freq = 659; Duration = 300},  # Mi
            @{Freq = 784; Duration = 300},  # Sol
            @{Freq = 1047; Duration = 500}  # Do aigu
        )
        Repeat = 2
        Pause = 500
    }
    "attention"  = @{
        Pattern = @(
            @{Freq = 880; Duration = 400},
            @{Freq = 988; Duration = 400},
            @{Freq = 880; Duration = 400}
        )
        Repeat = 4
        Pause = 300
    }
    "error"      = @{
        Pattern = @(
            @{Freq = 200; Duration = 600},
            @{Freq = 150; Duration = 600}
        )
        Repeat = 5
        Pause = 200
    }
    "validation" = @{
        Pattern = @(
            @{Freq = 800; Duration = 200},
            @{Freq = 1000; Duration = 200},
            @{Freq = 800; Duration = 200},
            @{Freq = 1000; Duration = 200},
            @{Freq = 1200; Duration = 400}
        )
        Repeat = 3
        Pause = 400
    }
    "info"       = @{
        Pattern = @(
            @{Freq = 600; Duration = 150},
            @{Freq = 700; Duration = 150}
        )
        Repeat = 2
        Pause = 200
    }
}

# Messages par defaut
$DefaultMessages = @{
    "complete"   = "TERMINE! Claude a fini sa tache."
    "attention"  = "ATTENTION! Intervention necessaire!"
    "error"      = "ERREUR! Verification requise!"
    "validation" = "VALIDATION REQUISE! En attente de reponse..."
    "info"       = "Information"
}

# Icones ASCII pour les notifications
$Icons = @{
    "complete"   = "[OK]"
    "attention"  = "[!!]"
    "error"      = "[XX]"
    "validation" = "[??]"
    "info"       = "[ii]"
}

function Play-NotificationSound {
    param($Type)

    if ($Silent) { return }

    $sound = $Sounds[$Type]

    for ($r = 0; $r -lt $sound.Repeat; $r++) {
        foreach ($note in $sound.Pattern) {
            [Console]::Beep($note.Freq, $note.Duration)
        }
        if ($r -lt $sound.Repeat - 1) {
            Start-Sleep -Milliseconds $sound.Pause
        }
    }
}

function Play-SystemSound {
    param($Type)

    if ($Silent) { return }

    try {
        Add-Type -AssemblyName System.Media -ErrorAction SilentlyContinue

        switch ($Type) {
            "complete" {
                [System.Media.SystemSounds]::Exclamation.Play()
            }
            "attention" {
                [System.Media.SystemSounds]::Asterisk.Play()
            }
            "error" {
                [System.Media.SystemSounds]::Hand.Play()
            }
            "validation" {
                [System.Media.SystemSounds]::Question.Play()
            }
            default {
                [System.Media.SystemSounds]::Beep.Play()
            }
        }
    }
    catch { }
}

function Show-TerminalAlert {
    param($Type, $Message)

    $icon = $Icons[$Type]
    $displayMessage = if ($Message) { $Message } else { $DefaultMessages[$Type] }

    $colors = @{
        "complete"   = "Green"
        "attention"  = "Yellow"
        "error"      = "Red"
        "validation" = "Cyan"
        "info"       = "White"
    }

    $color = $colors[$Type]

    # Grande banniere visible
    Write-Host ""
    Write-Host ""
    Write-Host ("*" * 70) -ForegroundColor $color
    Write-Host ("*" + (" " * 68) + "*") -ForegroundColor $color
    Write-Host ("*" + (" " * 20) + "$icon CLAUDE CODE $icon" + (" " * 21) + "*") -ForegroundColor $color
    Write-Host ("*" + (" " * 68) + "*") -ForegroundColor $color
    Write-Host ("*" * 70) -ForegroundColor $color
    Write-Host ""
    Write-Host "  >>> $displayMessage <<<" -ForegroundColor White
    Write-Host ""
    Write-Host ("*" * 70) -ForegroundColor $color
    Write-Host ""
    Write-Host ""
}

function Show-ToastNotification {
    param($Type, $Title, $Message)

    $icon = $Icons[$Type]
    $displayMessage = if ($Message) { $Message } else { $DefaultMessages[$Type] }

    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue

        $balloon = New-Object System.Windows.Forms.NotifyIcon
        $balloon.Icon = [System.Drawing.SystemIcons]::Information
        $balloon.BalloonTipIcon = switch ($Type) {
            "error" { [System.Windows.Forms.ToolTipIcon]::Error }
            "attention" { [System.Windows.Forms.ToolTipIcon]::Warning }
            "validation" { [System.Windows.Forms.ToolTipIcon]::Warning }
            default { [System.Windows.Forms.ToolTipIcon]::Info }
        }
        $balloon.BalloonTipTitle = "$icon $Title - ACTION REQUISE"
        $balloon.BalloonTipText = $displayMessage
        $balloon.Visible = $true
        $balloon.ShowBalloonTip(15000)  # 15 secondes

        Start-Sleep -Seconds 16
        $balloon.Dispose()
    }
    catch { }
}

function Flash-TaskbarIcon {
    # Flash la fenetre dans la barre des taches
    try {
        Add-Type -TypeDefinition @"
            using System;
            using System.Runtime.InteropServices;
            public class FlashWindow {
                [DllImport("user32.dll")]
                [return: MarshalAs(UnmanagedType.Bool)]
                public static extern bool FlashWindowEx(ref FLASHWINFO pwfi);

                [StructLayout(LayoutKind.Sequential)]
                public struct FLASHWINFO {
                    public UInt32 cbSize;
                    public IntPtr hwnd;
                    public UInt32 dwFlags;
                    public UInt32 uCount;
                    public UInt32 dwTimeout;
                }

                public const UInt32 FLASHW_ALL = 3;
                public const UInt32 FLASHW_TIMERNOFG = 12;
            }
"@ -ErrorAction SilentlyContinue

        $process = Get-Process -Id $PID
        $hwnd = $process.MainWindowHandle

        if ($hwnd -ne [IntPtr]::Zero) {
            $flashInfo = New-Object FlashWindow+FLASHWINFO
            $flashInfo.cbSize = [System.Runtime.InteropServices.Marshal]::SizeOf($flashInfo)
            $flashInfo.hwnd = $hwnd
            $flashInfo.dwFlags = 15  # FLASHW_ALL | FLASHW_TIMERNOFG
            $flashInfo.uCount = 10
            $flashInfo.dwTimeout = 500
            [FlashWindow]::FlashWindowEx([ref]$flashInfo) | Out-Null
        }
    }
    catch { }
}

# Execution principale
try {
    # 0. Flash la barre des taches
    Flash-TaskbarIcon

    # 1. Son systeme Windows (plus fort)
    Play-SystemSound -Type $Type
    Start-Sleep -Milliseconds 200

    # 2. Jouer la melodie (beeps longs et forts)
    Play-NotificationSound -Type $Type

    # 3. Afficher alerte terminal (grande banniere)
    Show-TerminalAlert -Type $Type -Message $Message

    # 4. Notification Windows toast en arriere-plan
    $job = Start-Job -ScriptBlock {
        param($Type, $Title, $Message, $DefaultMessages, $Icons)

        try {
            $displayMessage = if ($Message) { $Message } else { $DefaultMessages[$Type] }
            $icon = $Icons[$Type]

            Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
            $balloon = New-Object System.Windows.Forms.NotifyIcon
            $balloon.Icon = [System.Drawing.SystemIcons]::Information
            $balloon.BalloonTipTitle = "$icon $Title - ACTION REQUISE"
            $balloon.BalloonTipText = $displayMessage
            $balloon.Visible = $true
            $balloon.ShowBalloonTip(15000)
            Start-Sleep -Seconds 16
            $balloon.Dispose()
        }
        catch { }
    } -ArgumentList $Type, $Title, $Message, $DefaultMessages, $Icons

    exit 0
}
catch {
    Write-Error "Notification error: $_"
    exit 1
}
