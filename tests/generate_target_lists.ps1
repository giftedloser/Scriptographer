# Target List Generator for Edge Case Testing
# Generates various target list configurations for testing

param(
    [switch]$GenerateAll
)

$outputDir = "test_targets"
if (!(Test-Path $outputDir)) {
    New-Item -Path $outputDir -ItemType Directory | Out-Null
}

Write-Host "Generating target list files..." -ForegroundColor Cyan

# ============================================
# 1. Invalid Hostnames
# ============================================
@"
nonexistent-server-xyz123.local
server..domain.com
server-.domain.com
server@domain.com
server#123.local
invalid_host_with_underscores
host-with-very-long-name-that-exceeds-normal-dns-limits-and-might-cause-issues.domain.com
"@ | Out-File "$outputDir\invalid_hostnames.txt" -Encoding UTF8

Write-Host "✓ Generated: invalid_hostnames.txt (7 invalid targets)" -ForegroundColor Green

# ============================================
# 2. Localhost Variations
# ============================================
@"
localhost
127.0.0.1
::1
.
$env:COMPUTERNAME
"@ | Out-File "$outputDir\localhost_variations.txt" -Encoding UTF8

Write-Host "✓ Generated: localhost_variations.txt (5 localhost variants)" -ForegroundColor Green

# ============================================
# 3. Mixed Valid/Invalid
# ============================================
@"
localhost
invalid-host-xyz
127.0.0.1


   
$env:COMPUTERNAME
nonexistent.local
"@ | Out-File "$outputDir\mixed_targets.txt" -Encoding UTF8

Write-Host "✓ Generated: mixed_targets.txt (mix of valid/invalid/empty)" -ForegroundColor Green

# ============================================
# 4. Large Target List (1000 targets)
# ============================================
$largeList = 1..1000 | ForEach-Object { "target$_.domain.local" }
$largeList | Out-File "$outputDir\large_target_list.txt" -Encoding UTF8

Write-Host "✓ Generated: large_target_list.txt (1000 targets)" -ForegroundColor Green

# ============================================
# 5. Duplicates
# ============================================
@"
localhost
localhost
127.0.0.1
localhost
$env:COMPUTERNAME
localhost
127.0.0.1
"@ | Out-File "$outputDir\duplicate_targets.txt" -Encoding UTF8

Write-Host "✓ Generated: duplicate_targets.txt (7 entries, 3 unique)" -ForegroundColor Green

# ============================================
# 6. Empty/Whitespace Only
# ============================================
@"


   
	
  	  
"@ | Out-File "$outputDir\empty_targets.txt" -Encoding UTF8

Write-Host "✓ Generated: empty_targets.txt (only empty/whitespace)" -ForegroundColor Green

# ============================================
# 7. Special Characters in Hostnames
# ============================================
@"
server!test
server@domain
server#123
server$test
server%test
server^test
server&test
server*test
server(test)
server[test]
"@ | Out-File "$outputDir\special_char_targets.txt" -Encoding UTF8

Write-Host "✓ Generated: special_char_targets.txt (10 special char hostnames)" -ForegroundColor Green

# ============================================
# 8. IP Addresses (Valid and Invalid)
# ============================================
@"
127.0.0.1
192.168.1.1
10.0.0.1
172.16.0.1
192.0.2.1
256.256.256.256
192.168.1.999
999.999.999.999
::1
fe80::1
"@ | Out-File "$outputDir\ip_addresses.txt" -Encoding UTF8

Write-Host "✓ Generated: ip_addresses.txt (mix of valid/invalid IPs)" -ForegroundColor Green

# ============================================
# 9. Unreachable but Valid Format
# ============================================
@"
192.0.2.1
192.0.2.2
192.0.2.3
192.0.2.4
192.0.2.5
"@ | Out-File "$outputDir\unreachable_targets.txt" -Encoding UTF8

Write-Host "✓ Generated: unreachable_targets.txt (TEST-NET-1 addresses)" -ForegroundColor Green

# ============================================
# 10. Single Target
# ============================================
@"
localhost
"@ | Out-File "$outputDir\single_target.txt" -Encoding UTF8

Write-Host "✓ Generated: single_target.txt (1 target)" -ForegroundColor Green

# ============================================
# Summary
# ============================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Target List Generation Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nGenerated 10 target list files in: $outputDir\" -ForegroundColor White
Write-Host "`nUsage Instructions:" -ForegroundColor Yellow
Write-Host "1. Open Scriptographer application" -ForegroundColor White
Write-Host "2. Select a test script to execute" -ForegroundColor White
Write-Host "3. Copy contents from one of the target list files" -ForegroundColor White
Write-Host "4. Paste into the target list field" -ForegroundColor White
Write-Host "5. Execute and observe behavior" -ForegroundColor White
Write-Host "`nExpected Behaviors:" -ForegroundColor Yellow
Write-Host "- Invalid hostnames: Should fail with clear error messages" -ForegroundColor White
Write-Host "- Localhost variations: Should all succeed" -ForegroundColor White
Write-Host "- Mixed targets: Should skip invalid/empty, execute valid" -ForegroundColor White
Write-Host "- Large list: Should process all targets without crash" -ForegroundColor White
Write-Host "- Duplicates: Should handle gracefully (may execute multiple times)" -ForegroundColor White
Write-Host "- Empty targets: Should skip all, show 0 executions" -ForegroundColor White
Write-Host "- Special chars: Should fail with validation errors" -ForegroundColor White
Write-Host "- Unreachable: Should timeout and mark as failed" -ForegroundColor White

# Create a summary file
@"
# Target List Test Files Summary

## Files Generated

1. **invalid_hostnames.txt** (7 targets)
   - Purpose: Test DNS resolution failures
   - Expected: All should fail with "Unreachable" or DNS errors

2. **localhost_variations.txt** (5 targets)
   - Purpose: Test different ways to reference localhost
   - Expected: All should succeed

3. **mixed_targets.txt** (8 lines, ~3 valid)
   - Purpose: Test filtering of invalid/empty targets
   - Expected: Only valid targets execute

4. **large_target_list.txt** (1000 targets)
   - Purpose: Test scalability and performance
   - Expected: All should fail (don't exist), but no crash

5. **duplicate_targets.txt** (7 entries, 3 unique)
   - Purpose: Test duplicate handling
   - Expected: May execute duplicates or deduplicate

6. **empty_targets.txt** (0 valid targets)
   - Purpose: Test empty target list handling
   - Expected: 0 executions, graceful handling

7. **special_char_targets.txt** (10 targets)
   - Purpose: Test hostname validation
   - Expected: Should fail with validation errors

8. **ip_addresses.txt** (10 IPs)
   - Purpose: Test IP address handling
   - Expected: Valid IPs may work, invalid should fail

9. **unreachable_targets.txt** (5 targets)
   - Purpose: Test timeout and unreachable handling
   - Expected: All should timeout/fail gracefully

10. **single_target.txt** (1 target)
    - Purpose: Test single target execution
    - Expected: Should succeed on localhost

## Test Scenarios

### Scenario 1: Basic Functionality
- Use: single_target.txt
- Script: Any simple test script
- Verify: Successful execution on localhost

### Scenario 2: Error Handling
- Use: invalid_hostnames.txt
- Script: Any test script
- Verify: Clear error messages, no crashes

### Scenario 3: Scalability
- Use: large_target_list.txt
- Script: Simple output script
- Verify: All targets processed, UI responsive

### Scenario 4: Edge Cases
- Use: mixed_targets.txt
- Script: Any test script
- Verify: Only valid targets execute, accurate counts

### Scenario 5: Timeout Handling
- Use: unreachable_targets.txt
- Script: Any test script
- Verify: Timeouts enforced, execution continues

## Success Criteria

For each test:
- ✓ Application doesn't crash
- ✓ Error messages are clear and helpful
- ✓ Success/fail counts are accurate
- ✓ Logs show all attempts
- ✓ UI remains responsive
- ✓ Database is updated correctly
"@ | Out-File "$outputDir\README.md" -Encoding UTF8

Write-Host "`n✓ Created README.md with usage instructions" -ForegroundColor Green
