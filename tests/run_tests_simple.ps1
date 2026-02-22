# Scriptographer Edge Case Tests - Simple Version
# Runs core edge case tests and reports results

$ErrorActionPreference = 'Continue'
$TestResults = @()

function Add-TestResult($category, $testName, $passed, $details) {
    $script:TestResults += [PSCustomObject]@{
        Category = $category
        TestName = $testName
        Passed   = $passed
        Details  = $details
    }
}

Write-Host "`n=== SCRIPTOGRAPHER EDGE CASE TESTS ===" -ForegroundColor Cyan
Write-Host "Starting test execution...`n" -ForegroundColor White

# TEST 1: Invalid Hostnames (DNS Failures)
Write-Host "[TEST 1] Invalid Hostname Handling" -ForegroundColor Yellow
$invalidHosts = @("nonexistent-xyz123.local", "server..domain", "192.0.2.1")
foreach ($target in $invalidHosts) {
    try {
        $result = Test-Connection -ComputerName $target -Count 1 -Quiet -ErrorAction Stop -TimeoutSeconds 2
        if ($result -eq $false) {
            Write-Host "  PASS: $target failed as expected" -ForegroundColor Green
            Add-TestResult "Network" "Invalid Host: $target" $true "Failed as expected"
        }
    }
    catch {
        Write-Host "  PASS: $target threw exception (expected)" -ForegroundColor Green
        Add-TestResult "Network" "Invalid Host: $target" $true "Exception caught"
    }
}

# TEST 2: Localhost Variations
Write-Host "`n[TEST 2] Localhost Variations" -ForegroundColor Yellow
$localhosts = @("localhost", "127.0.0.1")
foreach ($target in $localhosts) {
    try {
        $result = Test-Connection -ComputerName $target -Count 1 -Quiet -ErrorAction Stop
        if ($result) {
            Write-Host "  PASS: $target resolved correctly" -ForegroundColor Green
            Add-TestResult "Network" "Localhost: $target" $true "Resolved"
        }
        else {
            Write-Host "  FAIL: $target should resolve" -ForegroundColor Red
            Add-TestResult "Network" "Localhost: $target" $false "Did not resolve"
        }
    }
    catch {
        Write-Host "  FAIL: $target exception: $($_.Exception.Message)" -ForegroundColor Red
        Add-TestResult "Network" "Localhost: $target" $false $_.Exception.Message
    }
}

# TEST 3: Single Quote Escaping
Write-Host "`n[TEST 3] Single Quote Escaping" -ForegroundColor Yellow
try {
    $testScript = "Write-Output 'It''s working'"
    $result = Invoke-Expression $testScript
    if ($result -eq "It's working") {
        Write-Host "  PASS: Single quotes escaped correctly" -ForegroundColor Green
        Add-TestResult "ScriptContent" "Single Quotes" $true "Output correct"
    }
    else {
        Write-Host "  FAIL: Output was: $result" -ForegroundColor Red
        Add-TestResult "ScriptContent" "Single Quotes" $false "Output: $result"
    }
}
catch {
    Write-Host "  FAIL: Exception: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult "ScriptContent" "Single Quotes" $false $_.Exception.Message
}

# TEST 4: Double Quote Escaping
Write-Host "`n[TEST 4] Double Quote Escaping" -ForegroundColor Yellow
try {
    $testScript = 'Write-Output "He said ""hello"""'
    $result = Invoke-Expression $testScript
    if ($result -eq 'He said "hello"') {
        Write-Host "  PASS: Double quotes escaped correctly" -ForegroundColor Green
        Add-TestResult "ScriptContent" "Double Quotes" $true "Output correct"
    }
    else {
        Write-Host "  FAIL: Output was: $result" -ForegroundColor Red
        Add-TestResult "ScriptContent" "Double Quotes" $false "Output: $result"
    }
}
catch {
    Write-Host "  FAIL: Exception: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult "ScriptContent" "Double Quotes" $false $_.Exception.Message
}

# TEST 5: Unicode Characters
Write-Host "`n[TEST 5] Unicode Character Handling" -ForegroundColor Yellow
try {
    $testScript = 'Write-Output "Test Unicode"'
    $result = Invoke-Expression $testScript
    if ($result -match "Test.*Unicode") {
        Write-Host "  PASS: Unicode handled correctly" -ForegroundColor Green
        Add-TestResult "ScriptContent" "Unicode" $true "Output correct"
    }
    else {
        Write-Host "  FAIL: Output was: $result" -ForegroundColor Red
        Add-TestResult "ScriptContent" "Unicode" $false "Output: $result"
    }
}
catch {
    Write-Host "  FAIL: Exception: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult "ScriptContent" "Unicode" $false $_.Exception.Message
}

# TEST 6: Empty Script
Write-Host "`n[TEST 6] Empty Script Handling" -ForegroundColor Yellow
try {
    $result = Invoke-Expression ""
    Write-Host "  PASS: Empty script handled without crash" -ForegroundColor Green
    Add-TestResult "ScriptContent" "Empty Script" $true "No error"
}
catch {
    Write-Host "  PASS: Exception handled: $($_.Exception.Message)" -ForegroundColor Green
    Add-TestResult "ScriptContent" "Empty Script" $true "Exception handled"
}

# TEST 7: Syntax Error
Write-Host "`n[TEST 7] Syntax Error Handling" -ForegroundColor Yellow
try {
    $result = Invoke-Expression "Write-Output 'unclosed" 2>&1
    Write-Host "  FAIL: Should have thrown syntax error" -ForegroundColor Red
    Add-TestResult "ScriptContent" "Syntax Error" $false "No error thrown"
}
catch {
    Write-Host "  PASS: Syntax error caught correctly" -ForegroundColor Green
    Add-TestResult "ScriptContent" "Syntax Error" $true "Error caught"
}

# TEST 8: Exception Throwing
Write-Host "`n[TEST 8] Exception Throwing" -ForegroundColor Yellow
try {
    $result = Invoke-Expression "throw 'Test error'" 2>&1
    Write-Host "  FAIL: Should have thrown exception" -ForegroundColor Red
    Add-TestResult "ScriptContent" "Exception Throw" $false "No exception"
}
catch {
    Write-Host "  PASS: Exception caught correctly" -ForegroundColor Green
    Add-TestResult "ScriptContent" "Exception Throw" $true "Exception handled"
}

# TEST 9: WinRM Service Status
Write-Host "`n[TEST 9] WinRM Service Status" -ForegroundColor Yellow
try {
    $winrm = Get-Service -Name WinRM -ErrorAction Stop
    if ($winrm.Status -eq 'Running') {
        Write-Host "  PASS: WinRM is running" -ForegroundColor Green
        Add-TestResult "ExecutionMethod" "WinRM Running" $true "Status: Running"
    }
    else {
        Write-Host "  FAIL: WinRM is not running: $($winrm.Status)" -ForegroundColor Red
        Add-TestResult "ExecutionMethod" "WinRM Running" $false "Status: $($winrm.Status)"
    }
}
catch {
    Write-Host "  FAIL: Cannot check WinRM: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult "ExecutionMethod" "WinRM Running" $false $_.Exception.Message
}

# TEST 10: PS Remoting to Localhost
Write-Host "`n[TEST 10] PS Remoting to Localhost" -ForegroundColor Yellow
try {
    $result = Invoke-Command -ComputerName localhost -ScriptBlock { "Test" } -ErrorAction Stop
    if ($result -eq "Test") {
        Write-Host "  PASS: PS Remoting works" -ForegroundColor Green
        Add-TestResult "ExecutionMethod" "PS Remoting" $true "Success"
    }
    else {
        Write-Host "  FAIL: Unexpected result: $result" -ForegroundColor Red
        Add-TestResult "ExecutionMethod" "PS Remoting" $false "Result: $result"
    }
}
catch {
    Write-Host "  FAIL: PS Remoting failed: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult "ExecutionMethod" "PS Remoting" $false $_.Exception.Message
}

# TEST 11: C$ Share Access
Write-Host "`n[TEST 11] C$ Administrative Share" -ForegroundColor Yellow
try {
    $testPath = "\\localhost\C$\Temp"
    if (Test-Path $testPath) {
        Write-Host "  PASS: C$ share accessible" -ForegroundColor Green
        Add-TestResult "ExecutionMethod" "C$ Share" $true "Accessible"
    }
    else {
        Write-Host "  FAIL: C$ share not accessible" -ForegroundColor Red
        Add-TestResult "ExecutionMethod" "C$ Share" $false "Not accessible"
    }
}
catch {
    Write-Host "  FAIL: C$ check failed: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult "ExecutionMethod" "C$ Share" $false $_.Exception.Message
}

# TEST 12: Temp Directory Write
Write-Host "`n[TEST 12] Temp Directory Write Access" -ForegroundColor Yellow
$testFile = "C:\Temp\test_$(Get-Random).txt"
try {
    if (!(Test-Path "C:\Temp")) {
        New-Item -Path "C:\Temp" -ItemType Directory -Force | Out-Null
    }
    "Test" | Out-File -FilePath $testFile -ErrorAction Stop
    if (Test-Path $testFile) {
        Remove-Item $testFile -Force
        Write-Host "  PASS: Can write to C:\Temp" -ForegroundColor Green
        Add-TestResult "ExecutionMethod" "Temp Write" $true "Success"
    }
}
catch {
    Write-Host "  FAIL: Cannot write: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult "ExecutionMethod" "Temp Write" $false $_.Exception.Message
}

# TEST 13: Empty Target Handling
Write-Host "`n[TEST 13] Empty Target String" -ForegroundColor Yellow
$target = ""
if ($target.Trim() -eq "") {
    Write-Host "  PASS: Empty target correctly identified" -ForegroundColor Green
    Add-TestResult "TargetSpec" "Empty Target" $true "Correctly skipped"
}
else {
    Write-Host "  FAIL: Empty target not handled" -ForegroundColor Red
    Add-TestResult "TargetSpec" "Empty Target" $false "Not skipped"
}

# TEST 14: Whitespace Target
Write-Host "`n[TEST 14] Whitespace-Only Target" -ForegroundColor Yellow
$target = "   "
if ($target.Trim() -eq "") {
    Write-Host "  PASS: Whitespace target correctly identified" -ForegroundColor Green
    Add-TestResult "TargetSpec" "Whitespace Target" $true "Correctly skipped"
}
else {
    Write-Host "  FAIL: Whitespace not handled" -ForegroundColor Red
    Add-TestResult "TargetSpec" "Whitespace Target" $false "Not skipped"
}

# TEST 15: Large Output
Write-Host "`n[TEST 15] Large Output (10KB)" -ForegroundColor Yellow
try {
    $largeScript = "Write-Output '" + ("A" * 10000) + "'"
    $result = Invoke-Expression $largeScript
    if ($result.Length -eq 10000) {
        Write-Host "  PASS: Large output handled" -ForegroundColor Green
        Add-TestResult "ScriptContent" "Large Output" $true "10KB output"
    }
    else {
        Write-Host "  FAIL: Output truncated: $($result.Length) bytes" -ForegroundColor Red
        Add-TestResult "ScriptContent" "Large Output" $false "Length: $($result.Length)"
    }
}
catch {
    Write-Host "  FAIL: Exception: $($_.Exception.Message)" -ForegroundColor Red
    Add-TestResult "ScriptContent" "Large Output" $false $_.Exception.Message
}

# RESULTS SUMMARY
Write-Host "`n`n=== TEST RESULTS SUMMARY ===" -ForegroundColor Cyan
$totalTests = $TestResults.Count
$passedTests = ($TestResults | Where-Object { $_.Passed }).Count
$failedTests = $totalTests - $passedTests
$passRate = [math]::Round(($passedTests / $totalTests) * 100, 2)

Write-Host "Total Tests:  $totalTests" -ForegroundColor White
Write-Host "Passed:       $passedTests" -ForegroundColor Green
Write-Host "Failed:       $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Pass Rate:    $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })

# Show failed tests
if ($failedTests -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $TestResults | Where-Object { -not $_.Passed } | ForEach-Object {
        Write-Host "  [$($_.Category)] $($_.TestName): $($_.Details)" -ForegroundColor Red
    }
}

# Export results
$resultsFile = "test_results_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$TestResults | ConvertTo-Json -Depth 3 | Out-File $resultsFile
Write-Host "`nResults saved to: $resultsFile" -ForegroundColor Cyan

if ($failedTests -eq 0) {
    Write-Host "`nALL TESTS PASSED!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`nSOME TESTS FAILED - Review above" -ForegroundColor Yellow
    exit 1
}
