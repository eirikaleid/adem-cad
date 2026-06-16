param(
    [int[]]$Ports = @(5173, 5174, 5175, 3001)
)

foreach ($port in $Ports) {
    $procIds = netstat -ano | Select-String ":$port\s" | ForEach-Object {
        ($_ -split '\s+')[-1]
    } | Sort-Object -Unique | Where-Object { $_ -match '^\d+$' -and $_ -ne '0' }

    foreach ($procId in $procIds) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Host "Killed PID $procId on port $port"
        } catch {
            # already exited
        }
    }
}
