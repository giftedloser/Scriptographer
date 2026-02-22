# Scriptographer Edge Case Testing - Quick Start Guide

## Overview

This test suite provides comprehensive edge case validation for Scriptographer without modifying any application code. It includes automated tests, manual verification procedures, and test data generators.

---

## 📁 Test Suite Structure

```
tests/
├── run_all_tests.ps1              # Master test runner (START HERE)
├── edge_case_tests.ps1            # Automated test harness
├── generate_test_scripts.ps1      # Generates 10 test scripts
├── generate_target_lists.ps1      # Generates 10 target lists
├── MANUAL_VERIFICATION_CHECKLIST.md  # Manual testing guide
└── README.md                      # This file
```

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Run Automated Tests Only

```powershell
cd c:\Dev\Scriptographer\tests
.\run_all_tests.ps1
```

This will:

1. Check prerequisites (PowerShell version, WinRM, admin rights)
2. Generate test data (scripts and target lists)
3. Run 30+ automated tests
4. Generate comprehensive report

**Output**: `test_results_YYYYMMDD_HHMMSS\TEST_REPORT.md`

### Option 2: Quick Test (2 Minutes)

```powershell
.\run_all_tests.ps1 -Quick
```

Runs only critical network and script content tests.

### Option 3: Generate Test Data Only

```powershell
.\run_all_tests.ps1 -GenerateOnly
```

Creates test scripts and target lists for manual testing in the application.

---

## 📋 What Gets Tested

### Automated Tests (30+ tests)

1. **Network & Connectivity** (10 tests)
   - Invalid hostnames
   - Localhost variations
   - Timeout handling
   - DNS failures

2. **Script Content** (8 tests)
   - Special character escaping (quotes, unicode)
   - Large scripts (10KB+)
   - Empty scripts
   - Syntax errors
   - Exception handling
   - Multiline scripts

3. **Execution Methods** (5 tests)
   - PsExec availability
   - WinRM service status
   - PS Remoting to localhost
   - C$ share access
   - Temp directory write access

4. **Target Specifications** (5 tests)
   - Empty targets
   - Whitespace-only targets
   - Duplicate detection
   - Mixed valid/invalid targets
   - Large target lists (1000+)

### Manual Tests (40+ tests)

See `MANUAL_VERIFICATION_CHECKLIST.md` for detailed step-by-step instructions.

---

## 📊 Understanding Test Results

### Test Report Structure

The generated `TEST_REPORT.md` includes:

- **Executive Summary**: Pass/fail counts and overall pass rate
- **Prerequisites Check**: System configuration validation
- **Results by Category**: Breakdown by test category
- **Detailed Results**: Table of all test outcomes
- **Recommendations**: Critical issues and warnings
- **Next Steps**: Suggested follow-up actions

### Pass Rate Interpretation

- **95%+**: ✓ Excellent - Robust edge case handling
- **80-94%**: ⚠ Good - Minor improvements recommended
- **60-79%**: ⚠ Fair - Several issues to address
- **<60%**: ✗ Needs Improvement - Significant work required

---

## 🧪 Manual Testing Workflow

### Step 1: Generate Test Data

```powershell
.\generate_test_scripts.ps1
.\generate_target_lists.ps1
```

This creates:

- `test_scripts\` - 10 PowerShell scripts covering edge cases
- `test_targets\` - 10 target list files

### Step 2: Import Test Scripts

1. Open Scriptographer application
2. For each file in `test_scripts\`:
   - Create new script
   - Copy content (skip the Name/Description/Tags lines)
   - Save with descriptive name

### Step 3: Execute Tests

Follow the checklist in `MANUAL_VERIFICATION_CHECKLIST.md`:

1. Network & Connectivity (3 tests)
2. Script Content (6 tests)
3. Execution Methods (3 tests)
4. Target Specifications (4 tests)
5. Database Operations (3 tests)
6. UI/Frontend (3 tests)
7. Critical Edge Cases (4 tests)

### Step 4: Document Results

Use the checklist to track:

- [ ] Tests passed
- [ ] Tests failed
- [ ] Issues discovered
- [ ] Recommendations

---

## 🎯 Critical Edge Cases (Must Test)

These are the highest-priority edge cases based on code analysis:

### 1. Quote Escaping in PS Remoting

**Risk**: Nested quotes may break script execution  
**Test**: Execute script with `'It''s a "test"'` via PS Remoting  
**Expected**: Output matches input exactly

### 2. Cleanup After Copy-First Failure

**Risk**: Failed cleanup leaves .ps1 files on remote systems  
**Test**: Check C:\Temp for leftover script\_\*.ps1 files  
**Expected**: No leftover files after execution

### 3. Connection Test False Positives

**Risk**: Ping succeeds but WinRM fails  
**Test**: Execute on target where WinRM is disabled  
**Expected**: Clear error message about WinRM

### 4. Timeout Enforcement

**Risk**: Scripts running longer than 60s hang indefinitely  
**Test**: Execute 30-second script, verify completion  
**Expected**: Completes within timeout, no hang

---

## 📈 Test Coverage Matrix

| Category          | Critical | High   | Medium | Low   | Total  |
| ----------------- | -------- | ------ | ------ | ----- | ------ |
| Network           | 4        | 3      | 2      | 1     | 10     |
| Script Content    | 3        | 4      | 2      | 1     | 10     |
| Execution Methods | 4        | 3      | 2      | 0     | 9      |
| Target Specs      | 2        | 2      | 2      | 1     | 7      |
| Database          | 3        | 2      | 1      | 0     | 6      |
| Error Handling    | 3        | 2      | 1      | 0     | 6      |
| UI/Frontend       | 1        | 2      | 2      | 1     | 6      |
| **TOTAL**         | **20**   | **18** | **12** | **4** | **54** |

---

## 🔧 Troubleshooting

### "WinRM service is not running"

```powershell
Start-Service WinRM
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "localhost" -Force
```

### "Not running as Administrator"

Right-click PowerShell → "Run as Administrator"

### "PsExec not found"

Download from: https://docs.microsoft.com/en-us/sysinternals/downloads/psexec

### "Tests fail on localhost"

Ensure PS Remoting is enabled:

```powershell
Enable-PSRemoting -Force
```

---

## 📝 Test Data Files

### Test Scripts (`test_scripts\`)

1. `01_special_characters.txt` - Quote and unicode handling
2. `02_long_running.txt` - 30-second timeout test
3. `03_error_throw.txt` - Exception handling
4. `04_large_output.txt` - 100KB output test
5. `05_syntax_error.txt` - Malformed script
6. `06_empty_script.txt` - Empty content
7. `07_memory_intensive.txt` - Large array operations
8. `08_multiple_commands.txt` - Sequential commands
9. `09_file_operations.txt` - File create/delete
10. `10_network_operations.txt` - Connectivity tests

### Target Lists (`test_targets\`)

1. `invalid_hostnames.txt` - DNS failure scenarios
2. `localhost_variations.txt` - Different localhost references
3. `mixed_targets.txt` - Valid/invalid/empty mix
4. `large_target_list.txt` - 1000 targets
5. `duplicate_targets.txt` - Duplicate detection
6. `empty_targets.txt` - Only whitespace
7. `special_char_targets.txt` - Invalid characters
8. `ip_addresses.txt` - IPv4/IPv6 addresses
9. `unreachable_targets.txt` - Timeout scenarios
10. `single_target.txt` - Single target test

---

## 🎓 Best Practices

1. **Run automated tests first** to identify systemic issues
2. **Review the test report** before manual testing
3. **Test one category at a time** to isolate issues
4. **Document all failures** with screenshots/logs
5. **Retest after fixes** to verify resolution
6. **Test on clean system** for accurate results

---

## 📞 Support

For questions or issues with the test suite:

1. Review `edge_case_test_plan.md` for detailed test descriptions
2. Check `MANUAL_VERIFICATION_CHECKLIST.md` for step-by-step procedures
3. Examine test output logs in `test_results_*\` directories

---

## ✅ Success Criteria

The application passes edge case testing if:

- ✓ **No Silent Failures**: All errors logged and visible
- ✓ **No Crashes**: Application remains stable
- ✓ **Data Integrity**: Database stays consistent
- ✓ **Clear Errors**: Users understand what went wrong
- ✓ **Proper Cleanup**: Temp files removed
- ✓ **Accurate Counts**: Success/fail counts match reality
- ✓ **Timeout Enforcement**: No indefinite hangs
- ✓ **Resource Cleanup**: No memory/handle leaks

---

**Last Updated**: 2026-02-10  
**Test Suite Version**: 1.0  
**Compatible with**: Scriptographer 1.0.0
