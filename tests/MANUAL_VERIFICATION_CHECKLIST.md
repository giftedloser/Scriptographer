# Scriptographer Edge Case Testing - Manual Verification Checklist

This document provides step-by-step instructions for manually verifying edge case handling in the Scriptographer application.

---

## Prerequisites

- [ ] Scriptographer application is running (`npm run dev`)
- [ ] Test scripts generated (run `tests\generate_test_scripts.ps1`)
- [ ] Target lists generated (run `tests\generate_target_lists.ps1`)
- [ ] WinRM service is running (check with `Get-Service WinRM`)
- [ ] Running PowerShell as Administrator (for full testing)

---

## Test Category 1: Network & Connectivity

### Test 1.1: Invalid Hostnames

**Objective**: Verify graceful handling of DNS resolution failures

1. Create a simple test script in Scriptographer (e.g., `Write-Output "Test"`)
2. Use target list from `tests\test_targets\invalid_hostnames.txt`
3. Execute the script
4. **Expected Results**:
   - [ ] All targets fail with "Unreachable" status
   - [ ] Clear error messages in log
   - [ ] Application doesn't crash
   - [ ] Execution completes for all targets
   - [ ] Success count = 0, Fail count = 7

### Test 1.2: Localhost Variations

**Objective**: Verify different localhost references work correctly

1. Use the same test script
2. Use target list from `tests\test_targets\localhost_variations.txt`
3. Execute the script
4. **Expected Results**:
   - [ ] All targets succeed
   - [ ] Output is identical for all variations
   - [ ] Success count = 5, Fail count = 0

### Test 1.3: Timeout Handling

**Objective**: Verify timeout enforcement

1. Use target list from `tests\test_targets\unreachable_targets.txt`
2. Execute the script
3. **Expected Results**:
   - [ ] Each target times out within ~5 seconds
   - [ ] Total execution time < 30 seconds (5 targets × 5s + overhead)
   - [ ] All marked as failed
   - [ ] Application remains responsive during timeouts

---

## Test Category 2: Script Content Edge Cases

### Test 2.1: Special Characters

**Objective**: Verify proper escaping of special characters

1. Create script with content from `tests\test_scripts\01_special_characters.txt`
2. Execute on localhost
3. **Expected Results**:
   - [ ] Script executes successfully
   - [ ] Output shows: "It's working"
   - [ ] Output shows: He said "hello"
   - [ ] Unicode characters display correctly: 测试 🚀 ✓ ✗
   - [ ] No escaping errors in logs

### Test 2.2: Long Running Script

**Objective**: Verify timeout handling for scripts exceeding 60s limit

1. Create script with content from `tests\test_scripts\02_long_running.txt`
2. Execute on localhost
3. **Expected Results**:
   - [ ] Script runs for 30 seconds
   - [ ] Progress updates appear in real-time
   - [ ] Script completes successfully
   - [ ] Output shows all 30 progress messages

### Test 2.3: Error Handling

**Objective**: Verify proper error capture and reporting

1. Create script with content from `tests\test_scripts\03_error_throw.txt`
2. Execute on localhost
3. **Expected Results**:
   - [ ] Execution fails (exit code ≠ 0)
   - [ ] Error message captured: "This is an intentional test error"
   - [ ] "This line should never execute" does NOT appear in output
   - [ ] Marked as failed in execution log

### Test 2.4: Large Output

**Objective**: Verify handling of large output data

1. Create script with content from `tests\test_scripts\04_large_output.txt`
2. Execute on localhost
3. **Expected Results**:
   - [ ] Script completes successfully
   - [ ] All 5000 lines captured in output
   - [ ] UI remains responsive
   - [ ] No truncation or data loss
   - [ ] Database saves successfully

### Test 2.5: Syntax Error

**Objective**: Verify handling of malformed scripts

1. Create script with content from `tests\test_scripts\05_syntax_error.txt`
2. Execute on localhost
3. **Expected Results**:
   - [ ] Execution fails
   - [ ] Error indicates syntax/parsing issue
   - [ ] Application doesn't crash
   - [ ] Clear error message in logs

### Test 2.6: Empty Script

**Objective**: Verify handling of empty script content

1. Create script with content from `tests\test_scripts\06_empty_script.txt` (empty)
2. Execute on localhost
3. **Expected Results**:
   - [ ] Execution completes (may succeed or fail gracefully)
   - [ ] No crash or hang
   - [ ] Clear status in logs

---

## Test Category 3: Execution Methods

### Test 3.1: PS Remoting Method

**Objective**: Verify PS Remoting execution

1. Select a simple test script
2. Choose "PS Remoting" as execution method
3. Target: localhost
4. Execute
5. **Expected Results**:
   - [ ] Script executes successfully
   - [ ] Output captured correctly
   - [ ] Exit code = 0
   - [ ] Execution time reasonable (< 10s for simple script)

### Test 3.2: Copy-First Method

**Objective**: Verify file copy and execute method

1. Select a simple test script
2. Choose "Copy First" as execution method
3. Target: localhost
4. Execute
5. **Expected Results**:
   - [ ] Script executes successfully
   - [ ] Temporary file created in C:\Temp
   - [ ] Temporary file cleaned up after execution
   - [ ] Output matches PS Remoting method

### Test 3.3: PsExec Method (if available)

**Objective**: Verify PsExec execution

1. Check if PsExec is available: `where.exe psexec.exe`
2. If not available:
   - [ ] Error message clearly states "PsExec.exe not found"
   - [ ] Provides helpful message about downloading from SysInternals
3. If available:
   - [ ] Script executes successfully
   - [ ] Output captured correctly

---

## Test Category 4: Target Specifications

### Test 4.1: Empty Target List

**Objective**: Verify handling of no targets

1. Select any test script
2. Leave target list empty
3. Attempt to execute
4. **Expected Results**:
   - [ ] Validation error or graceful handling
   - [ ] No crash
   - [ ] Clear message about empty target list

### Test 4.2: Mixed Valid/Invalid Targets

**Objective**: Verify filtering and partial execution

1. Use target list from `tests\test_targets\mixed_targets.txt`
2. Execute any test script
3. **Expected Results**:
   - [ ] Empty lines skipped
   - [ ] Whitespace-only lines skipped
   - [ ] Valid targets (localhost, 127.0.0.1, COMPUTERNAME) execute
   - [ ] Invalid targets fail with clear errors
   - [ ] Accurate success/fail counts

### Test 4.3: Duplicate Targets

**Objective**: Verify duplicate handling

1. Use target list from `tests\test_targets\duplicate_targets.txt`
2. Execute any test script
3. **Expected Results**:
   - [ ] Application handles duplicates (may execute multiple times or deduplicate)
   - [ ] No crash
   - [ ] Counts are accurate based on behavior

### Test 4.4: Large Target List

**Objective**: Verify scalability

1. Use target list from `tests\test_targets\large_target_list.txt` (1000 targets)
2. Execute a simple script
3. **Expected Results**:
   - [ ] All 1000 targets processed
   - [ ] UI remains responsive throughout
   - [ ] Progress updates in real-time
   - [ ] Accurate final counts
   - [ ] Database saves successfully
   - [ ] No memory leaks or crashes

---

## Test Category 5: Database Operations

### Test 5.1: Execution History

**Objective**: Verify execution logging

1. Execute several test scripts with different outcomes
2. View execution history
3. **Expected Results**:
   - [ ] All executions listed
   - [ ] Timestamps accurate
   - [ ] Success/fail counts correct
   - [ ] Can view details of each execution

### Test 5.2: Concurrent Executions

**Objective**: Verify handling of multiple simultaneous executions

1. Start execution #1 (use long-running script)
2. Immediately start execution #2 (different script)
3. **Expected Results**:
   - [ ] Both executions tracked independently
   - [ ] No database corruption
   - [ ] Logs don't intermix
   - [ ] Both complete successfully

### Test 5.3: Application Restart During Execution

**Objective**: Verify state persistence

1. Start a long-running execution
2. Close and restart the application
3. **Expected Results**:
   - [ ] Previous execution visible in history
   - [ ] Status reflects interruption (if applicable)
   - [ ] Database integrity maintained
   - [ ] No corruption

---

## Test Category 6: UI/Frontend Behavior

### Test 6.1: Real-time Log Updates

**Objective**: Verify live log streaming

1. Execute script on multiple targets (10+)
2. Watch the log panel
3. **Expected Results**:
   - [ ] Logs appear in real-time
   - [ ] Timestamps are accurate
   - [ ] Color coding correct (success=green, error=red)
   - [ ] Target names displayed correctly
   - [ ] No lag or freezing

### Test 6.2: Large Log Volume

**Objective**: Verify UI performance with many log entries

1. Execute large output script on 10 targets
2. **Expected Results**:
   - [ ] All log entries displayed
   - [ ] Scrolling remains smooth
   - [ ] No memory issues
   - [ ] Log panel remains responsive

### Test 6.3: Script Editor

**Objective**: Verify script editing functionality

1. Create new script with special characters
2. Save and reload
3. **Expected Results**:
   - [ ] Special characters preserved
   - [ ] Formatting maintained
   - [ ] No data loss
   - [ ] Syntax highlighting works (if implemented)

---

## Critical Edge Cases (High Priority)

### CRITICAL 1: Quote Escaping in PS Remoting

**Risk**: Complex scripts with nested quotes may break

1. Create script: `Write-Output 'It''s a "test" with ''nested'' quotes'`
2. Execute via PS Remoting on localhost
3. **Expected**: Output matches input exactly
4. **Result**: [ ] PASS / [ ] FAIL

### CRITICAL 2: Cleanup After Copy-First Failure

**Risk**: Failed cleanup leaves .ps1 files on remote systems

1. Execute script via Copy-First method
2. Check C:\Temp for leftover script\_\*.ps1 files
3. **Expected**: No leftover files
4. **Result**: [ ] PASS / [ ] FAIL

### CRITICAL 3: Connection Test False Positives

**Risk**: Ping works but WinRM doesn't

1. Find a target where ping works but WinRM is disabled
2. Execute script
3. **Expected**: Clear error about WinRM, not generic failure
4. **Result**: [ ] PASS / [ ] FAIL

### CRITICAL 4: Database Corruption on Disk Full

**Risk**: Disk I/O failures could corrupt database

1. (Difficult to test - requires low disk space)
2. Monitor for database errors in logs
3. **Expected**: Graceful error, no corruption
4. **Result**: [ ] PASS / [ ] FAIL / [ ] NOT TESTED

---

## Test Results Summary

**Date**: ******\_\_\_******  
**Tester**: ******\_\_\_******  
**Application Version**: ******\_\_\_******

### Overall Results

- Total Tests Executed: **\_** / 40
- Tests Passed: **\_**
- Tests Failed: **\_**
- Tests Skipped: **\_**
- Pass Rate: **\_**%

### Critical Issues Found

1. ***
2. ***
3. ***

### Recommendations

1. ***
2. ***
3. ***

### Sign-off

- [ ] All critical tests passed
- [ ] No data corruption observed
- [ ] Application stable under edge cases
- [ ] Ready for production use

**Signature**: ******\_\_\_******  
**Date**: ******\_\_\_******

---

## Notes

Use this space for additional observations, edge cases discovered during testing, or other relevant information:

---

---

---

---
