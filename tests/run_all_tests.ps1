# Scriptographer Edge Case Test Runner
# Master script to run all tests and generate comprehensive report

param(
    [switch]$Quick,
    [switch]$Full,
    [switch]$GenerateOnly,
    [switch]$SkipSystemTests
)

$ErrorActionPreference = 'Continue'

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     SCRIPTOGRAPHER COMPREHENSIVE TEST SUITE                  ║
║     Edge Case Validation & Simulation Testing                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# ============================================
# PHASE 1: Setup and Preparation
# ============================================

Write-Host "`n[PHASE 1] Setup and Preparation" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Create output directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputDir = "test_results_$timestamp"
New-Item -Path $outputDir -ItemType Directory -Force | Out-Null
Write-Host "✓ Created output directory: $outputDir" -ForegroundColor Green

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

$prereqResults = @()

# Check PowerShell version
$psVersion = $PSVersionTable.PSVersion
if ($psVersion.Major -ge 5) {
    Write-Host "✓ PowerShell version: $psVersion" -ForegroundColor Green
    $prereqResults += "PowerShell $psVersion - OK"
}
else {
    Write-Host "✗ PowerShell version too old: $psVersion (need 5.0+)" -ForegroundColor Red
    $prereqResults += "PowerShell $psVersion - FAIL"
}

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if ($isAdmin) {
    Write-Host "✓ Running as Administrator" -ForegroundColor Green
    $prereqResults += "Administrator - OK"
}
else {
    Write-Host "⚠ Not running as Administrator (some tests may fail)" -ForegroundColor Yellow
    $prereqResults += "Administrator - WARNING"
}

# Check WinRM service
try {
    $winrm = Get-Service -Name WinRM -ErrorAction Stop
    if ($winrm.Status -eq 'Running') {
        Write-Host "✓ WinRM service is running" -ForegroundColor Green
        $prereqResults += "WinRM - Running"
    }
    else {
        Write-Host "⚠ WinRM service is not running: $($winrm.Status)" -ForegroundColor Yellow
        $prereqResults += "WinRM - $($winrm.Status)"
    }
}
catch {
    Write-Host "✗ Cannot check WinRM service" -ForegroundColor Red
    $prereqResults += "WinRM - ERROR"
}

# ============================================
# PHASE 2: Generate Test Data
# ============================================

if (-not $SkipSystemTests) {
    Write-Host "`n[PHASE 2] Generating Test Data" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

    # Generate target lists
    Write-Host "Generating target lists..." -ForegroundColor Yellow
    try {
        & ".\generate_target_lists.ps1" | Out-Null
        Write-Host "✓ Target lists generated" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to generate target lists: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Generate test scripts
    Write-Host "Generating test scripts..." -ForegroundColor Yellow
    try {
        & ".\generate_test_scripts.ps1" | Out-Null
        Write-Host "✓ Test scripts generated" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to generate test scripts: $($_.Exception.Message)" -ForegroundColor Red
    }

    if ($GenerateOnly) {
        Write-Host "`n✓ Test data generation complete. Exiting (GenerateOnly mode)." -ForegroundColor Green
        exit 0
    }
}

# ============================================
# PHASE 3: Run Automated Tests
# ============================================

Write-Host "`n[PHASE 3] Running Automated Tests" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$testStartTime = Get-Date

# Run the main edge case test suite
Write-Host "Executing edge case test suite..." -ForegroundColor Yellow

$testParams = @{}
if ($Quick) {
    $testParams['NetworkTests'] = $true
    $testParams['ScriptContentTests'] = $true
}
else {
    $testParams['RunAll'] = $true
}

try {
    $testOutput = & ".\edge_case_tests.ps1" @testParams 2>&1
    $testExitCode = $LASTEXITCODE
    
    # Save test output
    $testOutput | Out-File "$outputDir\edge_case_test_output.log" -Encoding UTF8
    
    if ($testExitCode -eq 0) {
        Write-Host "✓ All automated tests passed" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ Some automated tests failed (see log for details)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Test execution failed: $($_.Exception.Message)" -ForegroundColor Red
}

$testEndTime = Get-Date
$testDuration = $testEndTime - $testStartTime

# ============================================
# PHASE 4: System Information Collection
# ============================================

Write-Host "`n[PHASE 4] Collecting System Information" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

$systemInfo = @{
    Hostname          = $env:COMPUTERNAME
    OSVersion         = (Get-CimInstance Win32_OperatingSystem).Caption
    OSArchitecture    = (Get-CimInstance Win32_OperatingSystem).OSArchitecture
    PowerShellVersion = $PSVersionTable.PSVersion.ToString()
    IsAdministrator   = $isAdmin
    WinRMStatus       = (Get-Service WinRM -ErrorAction SilentlyContinue).Status
    TestTimestamp     = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    TestDuration      = $testDuration.TotalSeconds
}

$systemInfo | ConvertTo-Json -Depth 3 | Out-File "$outputDir\system_info.json" -Encoding UTF8
Write-Host "✓ System information collected" -ForegroundColor Green

# ============================================
# PHASE 5: Generate Comprehensive Report
# ============================================

Write-Host "`n[PHASE 5] Generating Test Report" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Find the most recent test results JSON
$resultsJson = Get-ChildItem -Filter "edge_case_test_results_*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($resultsJson) {
    $testResults = Get-Content $resultsJson.FullName | ConvertFrom-Json
    
    # Generate markdown report
    $report = @"
# Scriptographer Edge Case Test Report

**Generated:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Test Duration:** $([math]::Round($testDuration.TotalSeconds, 2)) seconds  
**System:** $($systemInfo.Hostname) - $($systemInfo.OSVersion)

---

## Executive Summary

- **Total Tests:** $($testResults.Count)
- **Passed:** $(($testResults | Where-Object { $_.Passed }).Count)
- **Failed:** $(($testResults | Where-Object { -not $_.Passed }).Count)
- **Pass Rate:** $([math]::Round((($testResults | Where-Object { $_.Passed }).Count / $testResults.Count) * 100, 2))%

---

## Prerequisites Check

| Prerequisite | Status |
|--------------|--------|
$(foreach ($prereq in $prereqResults) { "| $prereq |`n" })

---

## Test Results by Category

$(
    $testResults | Group-Object -Property Category | ForEach-Object {
        $category = $_.Name
        $total = $_.Count
        $passed = ($_.Group | Where-Object { $_.Passed }).Count
        $failed = $total - $passed
        $passRate = [math]::Round(($passed / $total) * 100, 2)
        
        "### $category`n`n"
        "- **Total:** $total`n"
        "- **Passed:** $passed`n"
        "- **Failed:** $failed`n"
        "- **Pass Rate:** $passRate%`n`n"
        
        if ($failed -gt 0) {
            "#### Failed Tests`n`n"
            $_.Group | Where-Object { -not $_.Passed } | ForEach-Object {
                "- **$($_.TestName)**: $($_.Details)`n"
            }
            "`n"
        }
    }
)

---

## Detailed Test Results

| Category | Test Name | Status | Details |
|----------|-----------|--------|---------|
$(
    $testResults | ForEach-Object {
        $status = if ($_.Passed) { "✓ PASS" } else { "✗ FAIL" }
        "| $($_.Category) | $($_.TestName) | $status | $($_.Details) |`n"
    }
)

---

## Recommendations

### Critical Issues
$(
    $criticalIssues = $testResults | Where-Object { -not $_.Passed -and $_.Category -in @('Network', 'ExecutionMethod') }
    if ($criticalIssues.Count -gt 0) {
        $criticalIssues | ForEach-Object {
            "- **$($_.TestName)**: $($_.Details)`n"
        }
    } else {
        "No critical issues detected.`n"
    }
)

### Warnings
$(
    if (-not $isAdmin) {
        "- Tests were not run as Administrator. Some functionality may be limited.`n"
    }
    if ((Get-Service WinRM -ErrorAction SilentlyContinue).Status -ne 'Running') {
        "- WinRM service is not running. PS Remoting tests may fail.`n"
    }
)

---

## Next Steps

1. **Review Failed Tests**: Investigate any failed tests in the detailed results above
2. **Manual Testing**: Use the generated test scripts and target lists for manual validation
3. **Integration Testing**: Test with actual Scriptographer application
4. **Performance Testing**: Test with large target lists (1000+ targets)
5. **Security Testing**: Verify proper handling of malicious script content

---

## Test Artifacts

- Test Results JSON: ``$($resultsJson.Name)``
- System Information: ``system_info.json``
- Test Output Log: ``edge_case_test_output.log``
- Test Scripts: ``test_scripts\`` directory
- Target Lists: ``test_targets\`` directory

---

## Conclusion

$(
    $passRate = [math]::Round((($testResults | Where-Object { $_.Passed }).Count / $testResults.Count) * 100, 2)
    if ($passRate -ge 95) {
        "✓ **EXCELLENT**: The application demonstrates robust edge case handling with a $passRate% pass rate."
    } elseif ($passRate -ge 80) {
        "⚠ **GOOD**: The application handles most edge cases well ($passRate% pass rate), but some improvements are recommended."
    } elseif ($passRate -ge 60) {
        "⚠ **FAIR**: The application has moderate edge case handling ($passRate% pass rate). Several issues should be addressed."
    } else {
        "✗ **NEEDS IMPROVEMENT**: The application requires significant work on edge case handling ($passRate% pass rate)."
    }
)

---

*Report generated by Scriptographer Edge Case Test Suite*
"@

    $report | Out-File "$outputDir\TEST_REPORT.md" -Encoding UTF8
    Write-Host "✓ Test report generated: $outputDir\TEST_REPORT.md" -ForegroundColor Green
    
    # Copy results JSON to output directory
    Copy-Item $resultsJson.FullName "$outputDir\" -Force
    Write-Host "✓ Test results copied to output directory" -ForegroundColor Green
    
}
else {
    Write-Host "⚠ No test results found" -ForegroundColor Yellow
}

# ============================================
# FINAL SUMMARY
# ============================================

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                   TEST SUITE COMPLETE                        ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Magenta

Write-Host "Test Duration: $([math]::Round($testDuration.TotalSeconds, 2)) seconds" -ForegroundColor White
Write-Host "Output Directory: $outputDir\" -ForegroundColor White
Write-Host "`nGenerated Files:" -ForegroundColor Cyan
Get-ChildItem $outputDir | ForEach-Object {
    Write-Host "  - $($_.Name)" -ForegroundColor Gray
}

Write-Host "`n📊 View the full report: $outputDir\TEST_REPORT.md" -ForegroundColor Green
Write-Host "📁 Test artifacts available in: test_scripts\ and test_targets\" -ForegroundColor Green

Write-Host "`n✓ All phases completed successfully!" -ForegroundColor Green
