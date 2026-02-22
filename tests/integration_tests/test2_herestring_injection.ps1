# Test Script 2: Here-String Injection Test
# Import this into Scriptographer and execute with Copy-First method
# BEFORE FIX: Would break or allow code injection
# AFTER FIX: Should output all lines safely

Write-Output "=== Here-String Injection Test ==="
Write-Output "Line 1: Before injection attempt"
Write-Output "'@ - This is a here-string terminator"
Write-Output "Line 2: After injection attempt"
Write-Output "@' - This is a here-string opener"
Write-Output "Line 3: Final line"
Write-Output ""
Write-Output "EXPECTED: All 5 lines should appear"
Write-Output "If all lines appear, the bug is FIXED!"
Write-Output "If script breaks or lines missing, bug still EXISTS!"
