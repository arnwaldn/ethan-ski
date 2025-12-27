# ULTRA-CREATE - Notification Legere (petit bip rapide)
param(
    [string]$Type = "tick"
)

try {
    switch ($Type) {
        "tick" {
            # Petit bip rapide - fin d'action
            [Console]::Beep(800, 100)
        }
        "done" {
            # Melodie complete - fin de tache
            [Console]::Beep(523, 150)
            [Console]::Beep(659, 150)
            [Console]::Beep(784, 200)
        }
        "alert" {
            # Alerte attention
            [Console]::Beep(1000, 200)
            Start-Sleep -Milliseconds 100
            [Console]::Beep(1000, 200)
        }
    }
}
catch { }
