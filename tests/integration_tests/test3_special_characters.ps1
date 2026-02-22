# Test Script 3: Special Characters Comprehensive Test
# Import this into Scriptographer and execute with both methods
# Tests all special characters that previously caused issues

Write-Output "=== Special Characters Test ==="
Write-Output ""

Write-Output "1. Dollar signs: $variable $env:PATH $test"
Write-Output "2. Backticks: `$escaped ``backtick"
Write-Output "3. Single quotes: It's working with 'quotes'"
Write-Output "4. Double quotes: He said ""hello"" to me"
Write-Output "5. Here-string markers: '@ and @'"
Write-Output "6. Mixed: $var with 'quotes' and ``backticks"
Write-Output ""

Write-Output "EXPECTED: All lines show literal characters"
Write-Output "If everything appears as written, ALL BUGS ARE FIXED!"
