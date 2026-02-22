# Real Bug Verification Test - Run in Scriptographer App

# This script will EXPOSE the bugs in your executor.ts
# Import this into Scriptographer and run it to see the failures

Write-Output "=== BUG VERIFICATION TESTS ==="
Write-Output ""

# BUG TEST 1: Variable Expansion (Should output literal text, but won't)
Write-Output "TEST 1: Variable Expansion Bug"
Write-Output "Expected: Dollar sign env:COMPUTERNAME"
Write-Output "Actual: $env:COMPUTERNAME"
Write-Output "If you see your computer name above, the bug exists!"
Write-Output ""

# BUG TEST 2: Dollar Sign Escaping
Write-Output "TEST 2: Dollar Sign Bug"
$testVar = "THIS SHOULD NOT APPEAR"
Write-Output "Variable value: $testVar"
Write-Output "If you see 'THIS SHOULD NOT APPEAR', the bug exists!"
Write-Output ""

# BUG TEST 3: Backtick Handling
Write-Output "TEST 3: Backtick Bug"
Write-Output "Backtick test: `$escaped"
Write-Output "If the line above is empty or errors, the bug exists!"
Write-Output ""

# BUG TEST 4: Single Quote Escaping (This should work)
Write-Output "TEST 4: Single Quote (Should work)"
Write-Output 'It''s working'
Write-Output "If you see: It's working - this part is OK"
Write-Output ""

# BUG TEST 5: Here-String Terminator (For Copy-First method)
Write-Output "TEST 5: Here-String Injection Test"
Write-Output "Line 1"
Write-Output "'@ - This is a here-string terminator"
Write-Output "Line 2"
Write-Output "If you see all three lines, Copy-First is vulnerable!"
Write-Output ""

Write-Output "=== END OF BUG TESTS ==="
Write-Output ""
Write-Output "SUMMARY:"
Write-Output "- If TEST 1 shows your computer name: BUG EXISTS"
Write-Output "- If TEST 2 shows 'THIS SHOULD NOT APPEAR': BUG EXISTS"  
Write-Output "- If TEST 3 line is empty: BUG EXISTS"
Write-Output "- If TEST 4 shows 'It's working': OK"
Write-Output "- If TEST 5 shows all lines with Copy-First: VULNERABILITY EXISTS"
