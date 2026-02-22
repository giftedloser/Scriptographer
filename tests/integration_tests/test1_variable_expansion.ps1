# Test Script 1: Variable Expansion Test
# Import this into Scriptographer and execute with PS Remoting
# BEFORE FIX: Would show your actual computer name
# AFTER FIX: Should show literal text "$env:COMPUTERNAME"

Write-Output "=== Variable Expansion Test ==="
Write-Output "Computer name variable: $env:COMPUTERNAME"
Write-Output "Username variable: $env:USERNAME"
Write-Output "Test variable: $testVar"
Write-Output ""
Write-Output "EXPECTED OUTPUT:"
Write-Output "  Computer name variable: `$env:COMPUTERNAME"
Write-Output "  Username variable: `$env:USERNAME"
Write-Output "  Test variable: `$testVar"
Write-Output ""
Write-Output "If you see literal dollar signs above, the bug is FIXED!"
Write-Output "If you see actual values, the bug still EXISTS!"
