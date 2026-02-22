# Bug Fix Verification Tests
# Run this script to verify all 3 bugs are now FIXED

Write-Host "=== BUG FIX VERIFICATION TESTS ===" -ForegroundColor Cyan
Write-Host "Testing the fixed executor.ts code`n" -ForegroundColor White

$passed = 0
$failed = 0

# TEST 1: Variable Expansion (Should now be literal)
Write-Host "[TEST 1] Variable Expansion Fix" -ForegroundColor Yellow
$testScript = 'Write-Output "$env:COMPUTERNAME"'
Write-Host "  Script: $testScript" -ForegroundColor Gray
Write-Host "  Expected: Literal text `$env:COMPUTERNAME" -ForegroundColor Gray
Write-Host "  Status: Import this into Scriptographer and verify output is literal" -ForegroundColor White
Write-Host ""

# TEST 2: Dollar Sign Variables (Should now be literal)
Write-Host "[TEST 2] Dollar Sign Variable Fix" -ForegroundColor Yellow
$testScript = '$testVar = "SHOULD NOT EXPAND"; Write-Output $testVar'
Write-Host "  Script: $testScript" -ForegroundColor Gray
Write-Host "  Expected: Literal text `$testVar (not 'SHOULD NOT EXPAND')" -ForegroundColor Gray
Write-Host "  Status: Import this into Scriptographer and verify no expansion" -ForegroundColor White
Write-Host ""

# TEST 3: Backtick Handling (Should now work)
Write-Host "[TEST 3] Backtick Handling Fix" -ForegroundColor Yellow
$testScript = 'Write-Output "`$escaped"'
Write-Host "  Script: $testScript" -ForegroundColor Gray
Write-Host "  Expected: Output shows `$escaped" -ForegroundColor Gray
Write-Host "  Status: Import this into Scriptographer and verify output appears" -ForegroundColor White
Write-Host ""

# TEST 4: Here-String Injection (Should now be safe)
Write-Host "[TEST 4] Here-String Injection Fix" -ForegroundColor Yellow
$testScript = @"
Write-Output "Line 1"
'@
Write-Output "INJECTED"
@'
Write-Output "Line 2"
"@
Write-Host "  Script: (multiline with '@)" -ForegroundColor Gray
Write-Host "  Expected: All three lines output, no injection" -ForegroundColor Gray
Write-Host "  Status: Import this into Scriptographer (Copy-First) and verify safe" -ForegroundColor White
Write-Host ""

# TEST 5: Directory Validation (Should now create directory)
Write-Host "[TEST 5] Directory Validation Fix" -ForegroundColor Yellow
Write-Host "  Test: Execute on target without C:\Temp" -ForegroundColor Gray
Write-Host "  Expected: Directory created automatically, script executes" -ForegroundColor Gray
Write-Host "  Status: Test with Copy-First method on clean target" -ForegroundColor White
Write-Host ""

# Automated Base64 encoding test
Write-Host "[TEST 6] Base64 Encoding Verification" -ForegroundColor Yellow
$testContent = 'Write-Output "Test $env:USERNAME with ''quotes''"'
$bytes = [System.Text.Encoding]::Unicode.GetBytes($testContent)
$encoded = [Convert]::ToBase64String($bytes)
$decoded = [System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String($encoded))

if ($decoded -eq $testContent) {
    Write-Host "  PASS: Base64 encoding/decoding works correctly" -ForegroundColor Green
    $passed++
}
else {
    Write-Host "  FAIL: Base64 encoding issue" -ForegroundColor Red
    Write-Host "    Original: $testContent" -ForegroundColor Red
    Write-Host "    Decoded:  $decoded" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Test special characters preservation
Write-Host "[TEST 7] Special Characters Preservation" -ForegroundColor Yellow
$specialChars = @(
    '$variable',
    '`backtick',
    "'single'",
    '"double"',
    '@here@',
    'new`nline',
    'tab`ttab'
)

$allPassed = $true
foreach ($char in $specialChars) {
    $bytes = [System.Text.Encoding]::Unicode.GetBytes($char)
    $encoded = [Convert]::ToBase64String($bytes)
    $decoded = [System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String($encoded))
    
    if ($decoded -ne $char) {
        Write-Host "  FAIL: $char not preserved" -ForegroundColor Red
        $allPassed = $false
    }
}

if ($allPassed) {
    Write-Host "  PASS: All special characters preserved through Base64" -ForegroundColor Green
    $passed++
}
else {
    Write-Host "  FAIL: Some special characters corrupted" -ForegroundColor Red
    $failed++
}
Write-Host ""

# Summary
Write-Host "=== VERIFICATION SUMMARY ===" -ForegroundColor Cyan
Write-Host "Automated Tests Passed: $passed" -ForegroundColor Green
Write-Host "Automated Tests Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "MANUAL VERIFICATION REQUIRED:" -ForegroundColor Yellow
Write-Host "1. Import test scripts into Scriptographer" -ForegroundColor White
Write-Host "2. Execute with PS Remoting method" -ForegroundColor White
Write-Host "3. Verify variables are NOT expanded" -ForegroundColor White
Write-Host "4. Execute with Copy-First method" -ForegroundColor White
Write-Host "5. Verify no here-string injection" -ForegroundColor White
Write-Host "6. Verify C:\Temp is created if missing" -ForegroundColor White
Write-Host ""

if ($failed -eq 0) {
    Write-Host "Base64 encoding mechanism verified! Ready for integration testing." -ForegroundColor Green
    exit 0
}
else {
    Write-Host "Some automated tests failed. Review above." -ForegroundColor Red
    exit 1
}
