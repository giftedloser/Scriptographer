# Scriptographer Integration Test Scripts
# These scripts are designed to be imported into Scriptographer for testing

# ============================================
# TEST SCRIPT 1: Special Characters Test
# ============================================
@"
Name: Edge Case - Special Characters
Description: Tests handling of quotes, unicode, and special characters
Content:
Write-Output "=== Special Characters Test ==="
Write-Output "Single quote test: It's working"
Write-Output 'Double quote test: He said "hello"'
Write-Output "Unicode test: 测试 🚀 ✓ ✗"
Write-Output "Backtick test: ``$variable"
Write-Output "Dollar sign: `$env:COMPUTERNAME"
Write-Output "Newline test:`nLine 2`nLine 3"
Write-Output "=== Test Complete ==="
Tags: test,edge-case,special-chars
"@ | Out-File "test_scripts\01_special_characters.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 2: Long Running Script
# ============================================
@"
Name: Edge Case - Long Running (30s)
Description: Tests timeout handling for scripts that take time
Content:
Write-Output "Starting long-running task..."
for (`$i = 1; `$i -le 30; `$i++) {
    Write-Output "Progress: `$i/30 seconds"
    Start-Sleep -Seconds 1
}
Write-Output "Long-running task completed"
Tags: test,edge-case,timeout
"@ | Out-File "test_scripts\02_long_running.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 3: Error Throwing Script
# ============================================
@"
Name: Edge Case - Intentional Error
Description: Tests error handling when script throws exception
Content:
Write-Output "About to throw an error..."
throw "This is an intentional test error"
Write-Output "This line should never execute"
Tags: test,edge-case,error
"@ | Out-File "test_scripts\03_error_throw.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 4: Large Output Script
# ============================================
@"
Name: Edge Case - Large Output (100KB)
Description: Tests handling of large output data
Content:
Write-Output "Generating large output..."
1..5000 | ForEach-Object {
    Write-Output "Line `$_: $('A' * 20)"
}
Write-Output "Large output generation complete"
Tags: test,edge-case,large-output
"@ | Out-File "test_scripts\04_large_output.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 5: Syntax Error Script
# ============================================
@"
Name: Edge Case - Syntax Error
Description: Tests handling of scripts with syntax errors
Content:
Write-Output "This has a syntax error
# Missing closing quote above
Write-Output "This won't execute"
Tags: test,edge-case,syntax-error
"@ | Out-File "test_scripts\05_syntax_error.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 6: Empty Script
# ============================================
@"
Name: Edge Case - Empty Script
Description: Tests handling of empty script content
Content:

Tags: test,edge-case,empty
"@ | Out-File "test_scripts\06_empty_script.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 7: Resource Intensive
# ============================================
@"
Name: Edge Case - Memory Intensive
Description: Tests handling of memory-intensive operations
Content:
Write-Output "Creating large array..."
`$largeArray = 1..100000
Write-Output "Array created with `$(`$largeArray.Count) elements"
Write-Output "Performing operations..."
`$sum = (`$largeArray | Measure-Object -Sum).Sum
Write-Output "Sum: `$sum"
`$largeArray = `$null
[System.GC]::Collect()
Write-Output "Memory test complete"
Tags: test,edge-case,memory
"@ | Out-File "test_scripts\07_memory_intensive.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 8: Multiple Commands
# ============================================
@"
Name: Edge Case - Multiple Commands
Description: Tests execution of multiple sequential commands
Content:
Write-Output "Command 1: Getting hostname"
`$hostname = `$env:COMPUTERNAME
Write-Output "Hostname: `$hostname"

Write-Output "Command 2: Getting OS version"
`$os = (Get-CimInstance Win32_OperatingSystem).Caption
Write-Output "OS: `$os"

Write-Output "Command 3: Getting uptime"
`$uptime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
`$uptimeDays = ((Get-Date) - `$uptime).Days
Write-Output "Uptime: `$uptimeDays days"

Write-Output "All commands completed successfully"
Tags: test,edge-case,multiple-commands
"@ | Out-File "test_scripts\08_multiple_commands.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 9: File Operations
# ============================================
@"
Name: Edge Case - File Operations
Description: Tests file creation, modification, and deletion
Content:
`$testFile = "C:\Temp\scriptographer_test_`$(Get-Random).txt"

Write-Output "Creating test file: `$testFile"
"Test content" | Out-File `$testFile

if (Test-Path `$testFile) {
    Write-Output "File created successfully"
    `$content = Get-Content `$testFile
    Write-Output "File content: `$content"
    
    Remove-Item `$testFile -Force
    Write-Output "File deleted successfully"
} else {
    Write-Output "ERROR: File creation failed"
}
Tags: test,edge-case,file-ops
"@ | Out-File "test_scripts\09_file_operations.txt" -Encoding UTF8

# ============================================
# TEST SCRIPT 10: Network Operations
# ============================================
@"
Name: Edge Case - Network Operations
Description: Tests network connectivity checks
Content:
Write-Output "Testing network connectivity..."

Write-Output "Test 1: Ping localhost"
`$ping1 = Test-Connection -ComputerName localhost -Count 1 -Quiet
Write-Output "Localhost: `$ping1"

Write-Output "Test 2: Ping valid external host"
`$ping2 = Test-Connection -ComputerName 8.8.8.8 -Count 1 -Quiet
Write-Output "8.8.8.8: `$ping2"

Write-Output "Test 3: Ping invalid host (should fail)"
`$ping3 = Test-Connection -ComputerName invalid-host-xyz.local -Count 1 -Quiet -ErrorAction SilentlyContinue
Write-Output "Invalid host: `$ping3"

Write-Output "Network tests complete"
Tags: test,edge-case,network
"@ | Out-File "test_scripts\10_network_operations.txt" -Encoding UTF8

Write-Host "✓ Test scripts generated in test_scripts\ directory" -ForegroundColor Green
Write-Host "`nTo use these scripts:" -ForegroundColor Cyan
Write-Host "1. Open each .txt file" -ForegroundColor White
Write-Host "2. Copy the content (excluding the Name/Description/Content/Tags lines)" -ForegroundColor White
Write-Host "3. Create a new script in Scriptographer with the corresponding name" -ForegroundColor White
Write-Host "4. Paste the script content" -ForegroundColor White
Write-Host "5. Execute on localhost to test edge case handling" -ForegroundColor White
