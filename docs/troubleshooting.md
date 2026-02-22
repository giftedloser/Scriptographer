# Troubleshooting Guide

Solutions to common issues and error messages in Scriptographer.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Application Startup](#application-startup)
3. [Script Management](#script-management)
4. [Execution Errors](#execution-errors)
5. [Network & Connectivity](#network--connectivity)
6. [Performance Issues](#performance-issues)
7. [Database Problems](#database-problems)

---

## Installation Issues

### Installer Won't Run

**Symptom:** Double-clicking installer does nothing or shows "Windows protected your PC"

**Solutions:**

1. **Bypass SmartScreen:**
   - Click "More info"
   - Click "Run anyway"

2. **Run as Administrator:**
   - Right-click installer
   - Select "Run as administrator"

3. **Check Antivirus:**
   - Temporarily disable antivirus
   - Add installer to exclusions

4. **Verify Download:**
   - Re-download installer
   - Check file size (should be ~80 MB)

### Installation Fails Midway

**Symptom:** Installation stops with error

**Solutions:**

1. **Close Running Instances:**

   ```powershell
   # Kill any running Scriptographer processes
   Get-Process | Where-Object { $_.Name -like "*scriptographer*" } | Stop-Process -Force
   ```

2. **Check Disk Space:**

   ```powershell
   # Verify free space (need 150 MB)
   Get-PSDrive C | Select-Object Used,Free
   ```

3. **Check Permissions:**
   - Ensure you have write access to Program Files
   - Run installer as administrator

4. **Clean Previous Installation:**
   ```powershell
   # Remove old installation
   Remove-Item "$env:LOCALAPPDATA\Programs\scriptographer" -Recurse -Force -ErrorAction SilentlyContinue
   ```

---

## Application Startup

### App Won't Launch

**Symptom:** Nothing happens when launching Scriptographer

**Solutions:**

1. **Check Event Viewer:**

   ```powershell
   # View application errors
   Get-EventLog -LogName Application -Source "Electron" -Newest 10
   ```

2. **Run from Command Line:**

   ```powershell
   # Launch with console output
   & "$env:LOCALAPPDATA\Programs\scriptographer\Scriptographer.exe"
   ```

3. **Reset User Data:**

   ```powershell
   # Backup first!
   Copy-Item "$env:APPDATA\scriptographer" "$env:APPDATA\scriptographer.backup" -Recurse

   # Remove and retry
   Remove-Item "$env:APPDATA\scriptographer" -Recurse -Force
   ```

4. **Reinstall:**
   - Uninstall completely
   - Delete user data
   - Reinstall fresh

### Database Initialization Error

**Symptom:** "Failed to initialize database" on startup

**Solutions:**

1. **Check Folder Permissions:**

   ```powershell
   # Verify AppData is writable
   Test-Path "$env:APPDATA\scriptographer" -PathType Container

   # Create if missing
   New-Item -ItemType Directory -Path "$env:APPDATA\scriptographer" -Force
   ```

2. **Antivirus Blocking:**
   - Add `%APPDATA%\scriptographer` to exclusions
   - Temporarily disable real-time protection

3. **Disk Full:**
   ```powershell
   # Check free space
   Get-PSDrive | Where-Object { $_.Name -eq 'C' }
   ```

### Blank White Screen

**Symptom:** App launches but shows only white screen

**Solutions:**

1. **Clear Cache:**

   ```powershell
   Remove-Item "$env:APPDATA\scriptographer\Cache" -Recurse -Force
   Remove-Item "$env:APPDATA\scriptographer\GPUCache" -Recurse -Force
   ```

2. **Disable Hardware Acceleration:**
   - Launch with `--disable-gpu` flag
   - Or edit shortcut to add flag

3. **Update Graphics Drivers:**
   - Update to latest GPU drivers
   - Restart computer

---

## Script Management

### Can't Save Scripts

**Symptom:** Save button doesn't work or shows error

**Solutions:**

1. **Check Script Name:**
   - Ensure name is not empty
   - Remove special characters: `\ / : * ? " < > |`

2. **Database Locked:**

   ```powershell
   # Close other Scriptographer instances
   Get-Process | Where-Object { $_.Name -like "*scriptographer*" } | Select-Object Id, ProcessName
   ```

3. **Database Permissions:**

   ```powershell
   # Check database file permissions
   Get-Acl "$env:APPDATA\scriptographer\database.db"
   ```

4. **Database Corruption:**
   ```powershell
   # Backup and reset
   Copy-Item "$env:APPDATA\scriptographer\database.db" "$env:APPDATA\scriptographer\database.db.backup"
   Remove-Item "$env:APPDATA\scriptographer\database.db"
   # Restart app to recreate
   ```

### Scripts Disappear

**Symptom:** Scripts missing from library after restart

**Solutions:**

1. **Check Database File:**

   ```powershell
   # Verify database exists
   Test-Path "$env:APPDATA\scriptographer\database.db"

   # Check file size (should be > 0)
   Get-Item "$env:APPDATA\scriptographer\database.db" | Select-Object Length
   ```

2. **Restore from Backup:**

   ```powershell
   # If you have a backup
   Copy-Item "$env:APPDATA\scriptographer\database.db.backup" "$env:APPDATA\scriptographer\database.db" -Force
   ```

3. **Database Corruption:**
   - Database may be corrupted
   - Check for `.db-journal` file
   - May need to recreate database

### Search Not Working

**Symptom:** Search returns no results or incorrect results

**Solutions:**

1. **Clear Search:**
   - Click X in search box
   - Verify all scripts reappear

2. **Check Tags:**
   - Ensure scripts have tags
   - Tags are comma-separated

3. **Restart App:**
   - Close and reopen Scriptographer
   - Search index may need refresh

---

## Execution Errors

### "Access Denied" Errors

**Symptom:** Script fails with "Access is denied"

**Solutions:**

1. **Run as Administrator:**
   - Right-click Scriptographer
   - Select "Run as administrator"

2. **Check Target Permissions:**

   ```powershell
   # Verify you have admin rights on target
   Test-WSMan TARGET-PC -Credential (Get-Credential)
   ```

3. **Verify Credentials:**
   - Ensure you're logged in as domain admin
   - Or have local admin rights on targets

4. **UAC Settings:**
   ```powershell
   # On target machine, may need to adjust UAC
   New-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" `
     -Name "LocalAccountTokenFilterPolicy" -Value 1 -PropertyType DWORD -Force
   ```

### "Target Unreachable" Errors

**Symptom:** Can't connect to target machines

**Solutions:**

1. **Test Connectivity:**

   ```powershell
   # Ping test
   Test-Connection TARGET-PC

   # WinRM test
   Test-WSMan TARGET-PC

   # SMB test
   Test-Path "\\TARGET-PC\C$"
   ```

2. **Check Firewall:**

   ```powershell
   # Test specific ports
   Test-NetConnection TARGET-PC -Port 5985  # WinRM
   Test-NetConnection TARGET-PC -Port 445   # SMB
   ```

3. **Verify DNS:**

   ```powershell
   # Resolve hostname
   Resolve-DnsName TARGET-PC

   # Try IP address instead
   ```

4. **Check Network:**
   - Ensure machines on same network/VLAN
   - VPN may be required

### Scripts Timeout

**Symptom:** Execution hangs or times out

**Solutions:**

1. **Increase Timeout:**
   - Modify timeout in `executor.ts`
   - Default is 300 seconds (5 minutes)

2. **Optimize Script:**
   - Remove interactive prompts (Read-Host)
   - Reduce processing time
   - Add progress output

3. **Check Target Load:**
   - Target may be overloaded
   - Reduce concurrent executions

4. **Network Latency:**
   - Test network speed to target
   - May need to deploy in smaller batches

### Exit Code Errors

**Symptom:** Script completes but shows non-zero exit code

**Solutions:**

1. **Check Script Logic:**

   ```powershell
   # Add explicit exit codes
   try {
       # Your code
       exit 0  # Success
   } catch {
       Write-Error $_.Exception.Message
       exit 1  # Failure
   }
   ```

2. **Review Output Logs:**
   - Check for PowerShell errors
   - Look for exception messages

3. **Test Locally:**
   - Run script on localhost first
   - Debug in PowerShell ISE

---

## Network & Connectivity

### WinRM Not Working

**Symptom:** PSRemoting method fails

**Solutions:**

1. **Enable WinRM on Targets:**

   ```powershell
   # On each target machine
   Enable-PSRemoting -Force
   ```

2. **Configure Trusted Hosts:**

   ```powershell
   # On deployment machine
   Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force

   # Or specific machines
   Set-Item WSMan:\localhost\Client\TrustedHosts -Value "PC-001,PC-002" -Force
   ```

3. **Check WinRM Service:**

   ```powershell
   # Verify service is running
   Get-Service WinRM

   # Start if stopped
   Start-Service WinRM
   Set-Service WinRM -StartupType Automatic
   ```

4. **Test WinRM:**

   ```powershell
   # Test connection
   Test-WSMan TARGET-PC

   # Test with credentials
   Test-WSMan TARGET-PC -Credential (Get-Credential)
   ```

### Firewall Blocking

**Symptom:** Connection refused or timeout errors

**Solutions:**

1. **Check Firewall Rules:**

   ```powershell
   # On target machine
   Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*Remote*" }
   ```

2. **Enable WinRM Rules:**

   ```powershell
   Enable-NetFirewallRule -DisplayGroup "Windows Remote Management"
   ```

3. **Enable SMB Rules:**

   ```powershell
   Enable-NetFirewallRule -DisplayGroup "File and Printer Sharing"
   ```

4. **Create Custom Rule:**
   ```powershell
   # Allow WinRM
   New-NetFirewallRule -Name "WinRM-HTTP" -DisplayName "WinRM HTTP" `
     -Enabled True -Direction Inbound -Protocol TCP -LocalPort 5985
   ```

### Domain Trust Issues

**Symptom:** Authentication fails in domain environment

**Solutions:**

1. **Verify Domain Membership:**

   ```powershell
   # Check if machine is domain-joined
   (Get-WmiObject Win32_ComputerSystem).PartOfDomain

   # Get domain name
   (Get-WmiObject Win32_ComputerSystem).Domain
   ```

2. **Test Domain Connectivity:**

   ```powershell
   # Test domain controller
   Test-ComputerSecureChannel -Verbose
   ```

3. **Rejoin Domain:**
   - May need to remove and rejoin domain
   - Contact domain administrator

---

## Performance Issues

### Slow Execution

**Symptom:** Scripts take longer than expected

**Solutions:**

1. **Reduce Concurrency:**
   - Lower concurrent execution limit
   - Default is 5, try reducing to 2-3

2. **Network Optimization:**
   - Check network bandwidth
   - Deploy during off-peak hours

3. **Optimize Scripts:**
   - Remove unnecessary operations
   - Use efficient PowerShell cmdlets
   - Avoid loops when possible

4. **Choose Right Method:**
   - PSRemoting is fastest
   - Copy-First is slower
   - PsExec is slowest

### High Memory Usage

**Symptom:** Scriptographer uses excessive RAM

**Solutions:**

1. **Clear Logs:**
   - Click "Clear" in Output Log
   - Logs limited to 10,000 entries

2. **Restart Application:**
   - Close and reopen Scriptographer
   - Clears memory cache

3. **Reduce Concurrent Executions:**
   - Lower concurrency limit
   - Process targets in smaller batches

### UI Freezing

**Symptom:** Interface becomes unresponsive

**Solutions:**

1. **Wait for Completion:**
   - Large deployments may cause temporary freeze
   - Check Output Log for progress

2. **Reduce Load:**
   - Deploy to fewer targets at once
   - Split into multiple deployments

3. **Restart Application:**
   - If truly frozen, force close and restart

---

## Database Problems

### Database Corruption

**Symptom:** Errors accessing scripts or database won't open

**Solutions:**

1. **Backup Current Database:**

   ```powershell
   Copy-Item "$env:APPDATA\scriptographer\database.db" `
     "$env:APPDATA\scriptographer\database.db.corrupt"
   ```

2. **Try SQLite Repair:**

   ```powershell
   # Download SQLite tools
   # Run: sqlite3 database.db ".recover" | sqlite3 database_recovered.db
   ```

3. **Reset Database:**

   ```powershell
   # WARNING: Loses all scripts!
   Remove-Item "$env:APPDATA\scriptographer\database.db" -Force
   # Restart app to recreate
   ```

4. **Restore from Backup:**
   - If you have a backup, restore it
   - Check for `.db.backup` files

### Database Locked

**Symptom:** "Database is locked" error

**Solutions:**

1. **Close Other Instances:**

   ```powershell
   Get-Process | Where-Object { $_.Name -like "*scriptographer*" } | Stop-Process -Force
   ```

2. **Remove Lock File:**

   ```powershell
   Remove-Item "$env:APPDATA\scriptographer\database.db-journal" -Force
   ```

3. **Restart Computer:**
   - May have orphaned file handles
   - Restart clears all locks

---

## Getting Help

### Collect Diagnostic Information

When reporting issues, include:

1. **Application Version:**
   - Check "About" in Scriptographer
   - Or check installer filename

2. **Error Messages:**
   - Full error text from Output Log
   - Screenshots if applicable

3. **System Information:**

   ```powershell
   # Collect system info
   Get-ComputerInfo | Select-Object WindowsVersion, OsArchitecture, CsProcessors

   # PowerShell version
   $PSVersionTable
   ```

4. **Logs:**
   - Export Output Log
   - Include execution history

### Report Issues

1. **GitHub Issues:** (if applicable)
   - Provide detailed description
   - Include steps to reproduce
   - Attach logs and screenshots

2. **Contact Support:**
   - Email with diagnostic info
   - Reference this troubleshooting guide

---

## Additional Resources

- [User Manual](user-manual.md) - Complete feature documentation
- [Execution Methods](execution-methods.md) - Method-specific troubleshooting
- [Installation Guide](installation.md) - Setup and configuration
- [Architecture](architecture.md) - Technical internals

---

**Still Having Issues?** Open an issue on GitHub with detailed information.
