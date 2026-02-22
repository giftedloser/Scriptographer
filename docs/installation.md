# Installation Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [First Launch](#first-launch)
4. [Configuration](#configuration)
5. [Uninstallation](#uninstallation)

---

## System Requirements

### Minimum Requirements

- **OS:** Windows 10 (64-bit) or Windows Server 2016
- **RAM:** 4 GB
- **Disk Space:** 150 MB
- **PowerShell:** Version 5.1 or later
- **Network:** TCP/IP connectivity to target machines

### Recommended Requirements

- **OS:** Windows 11 or Windows Server 2022
- **RAM:** 8 GB or more
- **PowerShell:** Version 7.x
- **Permissions:** Domain Administrator account

### Network Requirements

Depending on your chosen execution method:

**PSRemoting (Recommended)**

- WinRM enabled on target machines
- Port 5985 (HTTP) or 5986 (HTTPS) open
- Target machines in same domain or trusted

**Copy-First**

- Admin shares enabled (`C$`, `ADMIN$`)
- SMB ports 445 open
- File and Printer Sharing enabled

**PsExec**

- PsExec.exe installed and in PATH
- Port 445 (SMB) open
- Administrative credentials

---

## Installation Steps

### Step 1: Download Installer

Navigate to the `dist` folder in your Scriptographer directory:

```
C:\Dev\Scriptographer\dist\Scriptographer Setup 1.0.0.exe
```

Or download from the releases page.

### Step 2: Run Installer

1. **Right-click** `Scriptographer Setup 1.0.0.exe`
2. Select **"Run as administrator"**
3. If Windows SmartScreen appears, click **"More info"** → **"Run anyway"**

### Step 3: Installation Wizard

1. **Welcome Screen** - Click "Next"
2. **License Agreement** - Accept and click "Next"
3. **Installation Location** - Choose directory (default: `C:\Users\<username>\AppData\Local\Programs\scriptographer`)
4. **Start Menu Folder** - Choose folder name (default: "Scriptographer")
5. **Additional Tasks** - Select:
   - ☑ Create desktop shortcut
   - ☑ Create Start Menu entry
6. **Install** - Click to begin installation
7. **Finish** - Click to complete

### Step 4: Verify Installation

1. Launch Scriptographer from desktop or Start Menu
2. You should see the main window with:
   - Script library on the left (5 sample scripts)
   - Script editor in the center
   - Execution panel on the right
   - Output log at the bottom

---

## First Launch

### Initial Setup

On first launch, Scriptographer will:

1. **Create Database** - Initialize SQLite database in:

   ```
   C:\Users\<username>\AppData\Roaming\scriptographer\
   ```

2. **Load Sample Scripts** - Pre-populate with 5 example scripts:
   - Get System Info
   - Check Disk Space
   - Get Installed Software
   - Test Network Connectivity
   - Clear Temp Files

3. **Initialize Settings** - Create default configuration

### Test the Application

1. **Select a Script** - Click "Get System Info" in the left panel
2. **Review Code** - Examine the PowerShell script in the editor
3. **Test Locally** - Enter `localhost` in the Targets field
4. **Deploy** - Click "Deploy (Ctrl+D)" or press Ctrl+D
5. **Check Output** - View real-time logs in the bottom panel

If you see output with system information, the installation is successful!

---

## Configuration

### PowerShell Execution Policy

Ensure PowerShell can execute scripts:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set to RemoteSigned (recommended)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Enable WinRM (for PSRemoting)

On **target machines**, run as Administrator:

```powershell
# Enable WinRM
Enable-PSRemoting -Force

# Configure trusted hosts (if not in domain)
Set-Item WSMan:\localhost\Client\TrustedHosts -Value "*" -Force

# Verify WinRM is running
Test-WSMan
```

### Configure Firewall

On **target machines**, allow WinRM:

```powershell
# Allow WinRM through firewall
Enable-NetFirewallRule -DisplayGroup "Windows Remote Management"
```

### Domain Configuration

For domain environments:

1. **Group Policy** - Enable WinRM via GPO:

   ```
   Computer Configuration → Policies → Administrative Templates
   → Windows Components → Windows Remote Management (WinRM)
   → WinRM Service → Allow remote server management through WinRM
   ```

2. **Firewall Rules** - Deploy firewall rules via GPO to allow WinRM

---

## Uninstallation

### Method 1: Windows Settings

1. Open **Settings** → **Apps** → **Installed apps**
2. Find **Scriptographer**
3. Click **⋮** (three dots) → **Uninstall**
4. Confirm uninstallation

### Method 2: Control Panel

1. Open **Control Panel** → **Programs** → **Uninstall a program**
2. Find **Scriptographer**
3. Click **Uninstall**
4. Follow the wizard

### Remove User Data (Optional)

To completely remove all data:

```powershell
# Remove application data
Remove-Item -Path "$env:APPDATA\scriptographer" -Recurse -Force

# Remove local data
Remove-Item -Path "$env:LOCALAPPDATA\scriptographer" -Recurse -Force
```

> **Warning:** This will delete all your scripts and execution history!

---

## Troubleshooting Installation

### Installer Won't Run

**Problem:** "Windows protected your PC" message

**Solution:**

1. Click "More info"
2. Click "Run anyway"
3. Or disable SmartScreen temporarily

### Installation Fails

**Problem:** Error during installation

**Solution:**

1. Ensure you have administrator rights
2. Close any running instances of Scriptographer
3. Temporarily disable antivirus
4. Check disk space (need 150 MB free)

### App Won't Launch

**Problem:** Application doesn't start after installation

**Solution:**

1. Check Windows Event Viewer for errors
2. Verify .NET Framework is installed
3. Try running as administrator
4. Reinstall the application

### Database Initialization Fails

**Problem:** Error creating database on first launch

**Solution:**

1. Check permissions on `%APPDATA%` folder
2. Ensure antivirus isn't blocking file creation
3. Manually create folder: `%APPDATA%\scriptographer`
4. Restart application

---

## Next Steps

- Read the [Quick Start Guide](quick-start.md) to learn basic operations
- Review [User Manual](user-manual.md) for detailed feature documentation
- Check [Execution Methods](execution-methods.md) to choose the right deployment method
- See [Troubleshooting](troubleshooting.md) for common issues

---

**Need Help?** See the [Troubleshooting Guide](troubleshooting.md) or open an issue on GitHub.
