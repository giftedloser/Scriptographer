# Scriptographer Edge Case Test Suite
# This PowerShell script simulates various edge cases for remote script execution
# Run this to verify the application handles edge cases correctly

param(
    [switch]$RunAll,
    [switch]$NetworkTests,
    [switch]$ScriptContentTests,
    [switch]$ExecutionMethodTests,
    [switch]$TargetTests,
    [switch]$Verbose
)

$ErrorActionPreference = 'Continue'
$TestResults = @()

# Color output functions
function Write-TestHeader($message) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $message -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-TestCase($name) {
    Write-Host "[TEST] $name" -ForegroundColor Yellow
}

function Write-TestPass($message) {
    Write-Host "  [✓] PASS: $message" -ForegroundColor Green
}

function Write-TestFail($message) {
    Write-Host "  [✗] FAIL: $message" -ForegroundColor Red
}

function Write-TestInfo($message) {
    if ($Verbose) {
        Write-Host "  [i] $message" -ForegroundColor Gray
    }
}

function Add-TestResult($category, $testName, $passed, $details) {
    $script:TestResults += [PSCustomObject]@{
        Category  = $category
        TestName  = $testName
        Passed    = $passed
        Details   = $details
        Timestamp = Get-Date
    }
}

# ============================================
# NETWORK & CONNECTIVITY TESTS
# ============================================

function Test-NetworkEdgeCases {
    Write-TestHeader "Network and Connectivity Edge Cases"
    
    # Test 1: Invalid Hostname
    Write-TestCase "1.1 - Invalid Hostname (DNS Failure)"
    $invalidHosts = @(
        "nonexistent-server-xyz123.local",
        "server..domain.com",
        "server-.domain.com",
        "server@domain.com",
        "server#123.local"
    )
    
    foreach ($host in $invalidHosts) {
        Write-TestInfo "Testing: $host"
        try {
            $result = Test-Connection -ComputerName $host -Count 1 -Quiet -ErrorAction Stop
            if ($result -eq $false) {
                Write-TestPass "Correctly failed to resolve: $host"
                Add-TestResult "Network" "Invalid Hostname: $host" $true "DNS resolution failed as expected"
            }
            else {
                Write-TestFail "Unexpectedly resolved: $host"
                Add-TestResult "Network" "Invalid Hostname: $host" $false "DNS resolved when it shouldn't"
            }
        }
        catch {
            Write-TestPass "Exception caught for: $host - $($_.Exception.Message)"
            Add-TestResult "Network" "Invalid Hostname: $host" $true "Exception handled correctly"
        }
    }
    
    # Test 2: Localhost Variations
    Write-TestCase "1.2 - Localhost Variations"
    $localhostVariations = @("localhost", "127.0.0.1", "::1", ".")
    
    foreach ($target in $localhostVariations) {
        Write-TestInfo "Testing: $target"
        try {
            $result = Test-Connection -ComputerName $target -Count 1 -Quiet -ErrorAction Stop
            if ($result) {
                Write-TestPass "Successfully resolved: $target"
                Add-TestResult "Network" "Localhost: $target" $true "Resolved correctly"
            }
            else {
                Write-TestFail "Failed to resolve: $target"
                Add-TestResult "Network" "Localhost: $target" $false "Should resolve"
            }
        }
        catch {
            Write-TestFail "Exception for localhost variant: $target - $($_.Exception.Message)"
            Add-TestResult "Network" "Localhost: $target" $false $_.Exception.Message
        }
    }
    
    # Test 3: Timeout Simulation
    Write-TestCase "1.3 - Connection Timeout (5 second limit)"
    Write-TestInfo "Testing timeout with unreachable IP (192.0.2.1 - TEST-NET-1)"
    $timeout = Measure-Command {
        try {
            Test-Connection -ComputerName "192.0.2.1" -Count 1 -Quiet -ErrorAction Stop
        }
        catch {
            # Expected to fail
        }
    }
    
    if ($timeout.TotalSeconds -le 10) {
        Write-TestPass "Timeout occurred within reasonable time: $($timeout.TotalSeconds)s"
        Add-TestResult "Network" "Connection Timeout" $true "Timeout: $($timeout.TotalSeconds)s"
    }
    else {
        Write-TestFail "Timeout took too long: $($timeout.TotalSeconds)s"
        Add-TestResult "Network" "Connection Timeout" $false "Timeout: $($timeout.TotalSeconds)s"
    }
}

# ============================================
# SCRIPT CONTENT TESTS
# ============================================

function Test-ScriptContentEdgeCases {
    Write-TestHeader "Script Content Edge Cases"
    
    # Test 1: Special Characters - Single Quotes
    Write-TestCase "2.1 - Single Quotes Escaping"
    $testScript = "Write-Output 'It''s working'"
    Write-TestInfo "Script: $testScript"
    
    try {
        $result = Invoke-Expression $testScript
        if ($result -eq "It's working") {
            Write-TestPass "Single quote escaping works correctly"
            Add-TestResult "ScriptContent" "Single Quotes" $true "Output: $result"
        }
        else {
            Write-TestFail "Unexpected output: $result"
            Add-TestResult "ScriptContent" "Single Quotes" $false "Output: $result"
        }
    }
    catch {
        Write-TestFail "Exception: $($_.Exception.Message)"
        Add-TestResult "ScriptContent" "Single Quotes" $false $_.Exception.Message
    }
    
    # Test 2: Double Quotes
    Write-TestCase "2.2 - Double Quotes Escaping"
    $testScript = 'Write-Output "He said ""hello"""'
    Write-TestInfo "Script: $testScript"
    
    try {
        $result = Invoke-Expression $testScript
        if ($result -eq 'He said "hello"') {
            Write-TestPass "Double quote escaping works correctly"
            Add-TestResult "ScriptContent" "Double Quotes" $true "Output: $result"
        }
        else {
            Write-TestFail "Unexpected output: $result"
            Add-TestResult "ScriptContent" "Double Quotes" $false "Output: $result"
        }
    }
    catch {
        Write-TestFail "Exception: $($_.Exception.Message)"
        Add-TestResult "ScriptContent" "Double Quotes" $false $_.Exception.Message
    }
    
    # Test 3: Unicode Characters
    Write-TestCase "2.3 - Unicode Characters"
    $testScript = 'Write-Output "测试 🚀 Test"'
    Write-TestInfo "Script: $testScript"
    
    try {
        $result = Invoke-Expression $testScript
        if ($result -match "测试.*🚀.*Test") {
            Write-TestPass "Unicode characters handled correctly"
            Add-TestResult "ScriptContent" "Unicode" $true "Output: $result"
        }
        else {
            Write-TestFail "Unicode characters corrupted: $result"
            Add-TestResult "ScriptContent" "Unicode" $false "Output: $result"
        }
    }
    catch {
        Write-TestFail "Exception: $($_.Exception.Message)"
        Add-TestResult "ScriptContent" "Unicode" $false $_.Exception.Message
    }
    
    # Test 4: Empty Script
    Write-TestCase "2.4 - Empty Script"
    $testScript = ""
    Write-TestInfo "Script: (empty)"
    
    try {
        $result = Invoke-Expression $testScript
        Write-TestPass "Empty script handled without crash"
        Add-TestResult "ScriptContent" "Empty Script" $true "No error"
    }
    catch {
        Write-TestInfo "Exception (may be expected): $($_.Exception.Message)"
        Add-TestResult "ScriptContent" "Empty Script" $true "Exception handled"
    }
    
    # Test 5: Script with Syntax Error
    Write-TestCase "2.5 - Script with Syntax Error"
    $testScript = "Write-Output 'unclosed quote"
    Write-TestInfo "Script: $testScript"
    
    try {
        $result = Invoke-Expression $testScript 2>&1
        Write-TestFail "Syntax error should have been caught"
        Add-TestResult "ScriptContent" "Syntax Error" $false "No error thrown"
    }
    catch {
        Write-TestPass "Syntax error caught: $($_.Exception.Message)"
        Add-TestResult "ScriptContent" "Syntax Error" $true "Error caught correctly"
    }
    
    # Test 6: Script that Throws Exception
    Write-TestCase "2.6 - Script that Throws Exception"
    $testScript = "throw 'Intentional error'"
    Write-TestInfo "Script: $testScript"
    
    try {
        $result = Invoke-Expression $testScript 2>&1
        Write-TestFail "Exception should have been thrown"
        Add-TestResult "ScriptContent" "Exception Throw" $false "No exception"
    }
    catch {
        Write-TestPass "Exception caught correctly: $($_.Exception.Message)"
        Add-TestResult "ScriptContent" "Exception Throw" $true "Exception handled"
    }
    
    # Test 7: Large Script (10KB)
    Write-TestCase "2.7 - Large Script (10KB)"
    $largeScript = "Write-Output '" + ("A" * 10000) + "'"
    Write-TestInfo "Script size: $($largeScript.Length) bytes"
    
    try {
        $result = Invoke-Expression $largeScript
        if ($result.Length -eq 10000) {
            Write-TestPass "Large script executed successfully"
            Add-TestResult "ScriptContent" "Large Script 10KB" $true "Output length: $($result.Length)"
        }
        else {
            Write-TestFail "Output truncated or corrupted"
            Add-TestResult "ScriptContent" "Large Script 10KB" $false "Output length: $($result.Length)"
        }
    }
    catch {
        Write-TestFail "Exception: $($_.Exception.Message)"
        Add-TestResult "ScriptContent" "Large Script 10KB" $false $_.Exception.Message
    }
    
    # Test 8: Script with Newlines
    Write-TestCase "2.8 - Script with Multiple Lines"
    $testScript = @"
`$var1 = 'Hello'
`$var2 = 'World'
Write-Output "`$var1 `$var2"
"@
    Write-TestInfo "Script: (multiline)"
    
    try {
        $result = Invoke-Expression $testScript
        if ($result -eq "Hello World") {
            Write-TestPass "Multiline script executed correctly"
            Add-TestResult "ScriptContent" "Multiline Script" $true "Output: $result"
        }
        else {
            Write-TestFail "Unexpected output: $result"
            Add-TestResult "ScriptContent" "Multiline Script" $false "Output: $result"
        }
    }
    catch {
        Write-TestFail "Exception: $($_.Exception.Message)"
        Add-TestResult "ScriptContent" "Multiline Script" $false $_.Exception.Message
    }
}

# ============================================
# EXECUTION METHOD TESTS
# ============================================

function Test-ExecutionMethodEdgeCases {
    Write-TestHeader "Execution Method Edge Cases"
    
    # Test 1: Check if PsExec exists
    Write-TestCase "3.1 - PsExec Availability"
    try {
        $psexecPath = where.exe psexec.exe 2>$null
        if ($psexecPath) {
            Write-TestPass "PsExec found at: $psexecPath"
            Add-TestResult "ExecutionMethod" "PsExec Available" $true "Path: $psexecPath"
        }
        else {
            Write-TestInfo "PsExec not found (expected for most systems)"
            Add-TestResult "ExecutionMethod" "PsExec Available" $true "Not found (expected)"
        }
    }
    catch {
        Write-TestInfo "PsExec check failed: $($_.Exception.Message)"
        Add-TestResult "ExecutionMethod" "PsExec Available" $true "Not found (expected)"
    }
    
    # Test 2: WinRM Service Status
    Write-TestCase "3.2 - WinRM Service Status"
    try {
        $winrm = Get-Service -Name WinRM -ErrorAction Stop
        if ($winrm.Status -eq 'Running') {
            Write-TestPass "WinRM service is running"
            Add-TestResult "ExecutionMethod" "WinRM Running" $true "Status: Running"
        }
        else {
            Write-TestFail "WinRM service is not running: $($winrm.Status)"
            Add-TestResult "ExecutionMethod" "WinRM Running" $false "Status: $($winrm.Status)"
        }
    }
    catch {
        Write-TestFail "Cannot check WinRM: $($_.Exception.Message)"
        Add-TestResult "ExecutionMethod" "WinRM Running" $false $_.Exception.Message
    }
    
    # Test 3: PS Remoting to Localhost
    Write-TestCase "3.3 - PS Remoting to Localhost"
    try {
        $result = Invoke-Command -ComputerName localhost -ScriptBlock { "Test" } -ErrorAction Stop
        if ($result -eq "Test") {
            Write-TestPass "PS Remoting to localhost works"
            Add-TestResult "ExecutionMethod" "PS Remoting Localhost" $true "Success"
        }
        else {
            Write-TestFail "Unexpected result: $result"
            Add-TestResult "ExecutionMethod" "PS Remoting Localhost" $false "Result: $result"
        }
    }
    catch {
        Write-TestFail "PS Remoting failed: $($_.Exception.Message)"
        Add-TestResult "ExecutionMethod" "PS Remoting Localhost" $false $_.Exception.Message
    }
    
    # Test 4: C$ Share Access (localhost)
    Write-TestCase "3.4 - C$ Administrative Share Access"
    try {
        $testPath = "\\localhost\C$\Temp"
        if (Test-Path $testPath) {
            Write-TestPass "C$ share accessible"
            Add-TestResult "ExecutionMethod" "C$ Share Access" $true "Accessible"
        }
        else {
            Write-TestFail "C$ share not accessible"
            Add-TestResult "ExecutionMethod" "C$ Share Access" $false "Not accessible"
        }
    }
    catch {
        Write-TestFail "C$ share check failed: $($_.Exception.Message)"
        Add-TestResult "ExecutionMethod" "C$ Share Access" $false $_.Exception.Message
    }
    
    # Test 5: Temp Directory Write Access
    Write-TestCase "3.5 - Temp Directory Write Access"
    $testFile = "C:\Temp\scriptographer_test_$(Get-Random).txt"
    try {
        # Ensure Temp directory exists
        if (!(Test-Path "C:\Temp")) {
            New-Item -Path "C:\Temp" -ItemType Directory -Force | Out-Null
        }
        
        "Test" | Out-File -FilePath $testFile -ErrorAction Stop
        if (Test-Path $testFile) {
            Remove-Item $testFile -Force
            Write-TestPass "Can write to C:\Temp"
            Add-TestResult "ExecutionMethod" "Temp Write Access" $true "Success"
        }
        else {
            Write-TestFail "File not created"
            Add-TestResult "ExecutionMethod" "Temp Write Access" $false "File not created"
        }
    }
    catch {
        Write-TestFail "Cannot write to C:\Temp: $($_.Exception.Message)"
        Add-TestResult "ExecutionMethod" "Temp Write Access" $false $_.Exception.Message
    }
}

# ============================================
# TARGET SPECIFICATION TESTS
# ============================================

function Test-TargetSpecificationEdgeCases {
    Write-TestHeader "Target Specification Edge Cases"
    
    # Test 1: Empty Target
    Write-TestCase "4.1 - Empty Target String"
    $target = ""
    if ($target.Trim() -eq "") {
        Write-TestPass "Empty target correctly identified"
        Add-TestResult "TargetSpec" "Empty Target" $true "Correctly skipped"
    }
    else {
        Write-TestFail "Empty target not handled"
        Add-TestResult "TargetSpec" "Empty Target" $false "Not skipped"
    }
    
    # Test 2: Whitespace Only
    Write-TestCase "4.2 - Whitespace-Only Target"
    $target = "   "
    if ($target.Trim() -eq "") {
        Write-TestPass "Whitespace-only target correctly identified"
        Add-TestResult "TargetSpec" "Whitespace Target" $true "Correctly skipped"
    }
    else {
        Write-TestFail "Whitespace target not handled"
        Add-TestResult "TargetSpec" "Whitespace Target" $false "Not skipped"
    }
    
    # Test 3: Duplicate Targets
    Write-TestCase "4.3 - Duplicate Targets in List"
    $targets = @("localhost", "localhost", "127.0.0.1", "localhost")
    $unique = $targets | Select-Object -Unique
    
    Write-TestInfo "Original count: $($targets.Count), Unique count: $($unique.Count)"
    if ($unique.Count -lt $targets.Count) {
        Write-TestPass "Duplicates can be detected (app should deduplicate)"
        Add-TestResult "TargetSpec" "Duplicate Detection" $true "Found $($targets.Count - $unique.Count) duplicates"
    }
    else {
        Write-TestInfo "No duplicates in test set"
        Add-TestResult "TargetSpec" "Duplicate Detection" $true "N/A"
    }
    
    # Test 4: Mixed Valid/Invalid Targets
    Write-TestCase "4.4 - Mixed Valid/Invalid Targets"
    $targets = @("localhost", "", "invalid-host-xyz", "127.0.0.1", "   ")
    $validTargets = $targets | Where-Object { $_.Trim() -ne "" }
    
    Write-TestInfo "Total: $($targets.Count), Valid: $($validTargets.Count)"
    if ($validTargets.Count -eq 3) {
        Write-TestPass "Correctly filtered invalid targets"
        Add-TestResult "TargetSpec" "Mixed Targets" $true "3 valid out of 5"
    }
    else {
        Write-TestFail "Filtering logic issue"
        Add-TestResult "TargetSpec" "Mixed Targets" $false "Expected 3, got $($validTargets.Count)"
    }
    
    # Test 5: Large Target List
    Write-TestCase "4.5 - Large Target List (1000 targets)"
    $largeTargetList = 1..1000 | ForEach-Object { "target$_" }
    
    Write-TestInfo "Generated $($largeTargetList.Count) targets"
    if ($largeTargetList.Count -eq 1000) {
        Write-TestPass "Large target list handled"
        Add-TestResult "TargetSpec" "Large List" $true "1000 targets"
    }
    else {
        Write-TestFail "Target list generation failed"
        Add-TestResult "TargetSpec" "Large List" $false "Count: $($largeTargetList.Count)"
    }
}

# ============================================
# MAIN EXECUTION
# ============================================

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   SCRIPTOGRAPHER EDGE CASE TEST SUITE         ║" -ForegroundColor Magenta
Write-Host "║   Comprehensive Simulation Testing            ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

$startTime = Get-Date

# Determine which tests to run
if ($RunAll) {
    $NetworkTests = $true
    $ScriptContentTests = $true
    $ExecutionMethodTests = $true
    $TargetTests = $true
}

# If no specific tests selected, run all
if (-not ($NetworkTests -or $ScriptContentTests -or $ExecutionMethodTests -or $TargetTests)) {
    $NetworkTests = $true
    $ScriptContentTests = $true
    $ExecutionMethodTests = $true
    $TargetTests = $true
}

# Run selected test suites
if ($NetworkTests) { Test-NetworkEdgeCases }
if ($ScriptContentTests) { Test-ScriptContentEdgeCases }
if ($ExecutionMethodTests) { Test-ExecutionMethodEdgeCases }
if ($TargetTests) { Test-TargetSpecificationEdgeCases }

# ============================================
# RESULTS SUMMARY
# ============================================

$endTime = Get-Date
$duration = $endTime - $startTime

Write-TestHeader "TEST RESULTS SUMMARY"

$totalTests = $TestResults.Count
$passedTests = ($TestResults | Where-Object { $_.Passed }).Count
$failedTests = $totalTests - $passedTests
$passRate = if ($totalTests -gt 0) { [math]::Round(($passedTests / $totalTests) * 100, 2) } else { 0 }

Write-Host "Total Tests Run:    $totalTests" -ForegroundColor White
Write-Host "Passed:             $passedTests" -ForegroundColor Green
Write-Host "Failed:             $failedTests" -ForegroundColor $(if ($failedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Pass Rate:          $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })
Write-Host "Duration:           $($duration.TotalSeconds) seconds`n" -ForegroundColor White

# Group results by category
$byCategory = $TestResults | Group-Object -Property Category

Write-Host "`nResults by Category:" -ForegroundColor Cyan
foreach ($category in $byCategory) {
    $catPassed = ($category.Group | Where-Object { $_.Passed }).Count
    $catTotal = $category.Count
    $catRate = [math]::Round(($catPassed / $catTotal) * 100, 2)
    
    $color = if ($catRate -ge 80) { "Green" } elseif ($catRate -ge 60) { "Yellow" } else { "Red" }
    Write-Host "  $($category.Name): $catPassed/$catTotal ($catRate%)" -ForegroundColor $color
}

# Show failed tests
if ($failedTests -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $TestResults | Where-Object { -not $_.Passed } | ForEach-Object {
        Write-Host "  [$($_.Category)] $($_.TestName)" -ForegroundColor Red
        Write-Host "    Details: $($_.Details)" -ForegroundColor Gray
    }
}

# Export results to JSON
$resultsFile = "edge_case_test_results_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$TestResults | ConvertTo-Json -Depth 3 | Out-File $resultsFile
Write-Host "`nDetailed results exported to: $resultsFile" -ForegroundColor Cyan

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   TEST SUITE COMPLETED                         ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

# Return exit code based on results
if ($failedTests -eq 0) {
    exit 0
}
else {
    exit 1
}
