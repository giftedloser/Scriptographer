# Quick Start Guide

Get up and running with Scriptographer in 5 minutes.

## Step 1: Launch Application

1. Open Scriptographer from desktop or Start Menu
2. The application will initialize with 5 sample scripts

## Step 2: Understand the Interface

```
┌─────────────────────────────────────────────────────────┐
│ Scriptographer                PowerShell Deployment Tool│
├──────────┬──────────────────────────┬───────────────────┤
│ SCRIPTS  │ EDITOR                   │ EXECUTION         │
│          │                          │                   │
│ Search   │ Script Name              │ Method:           │
│ ────────│ Description, Tags        │ ○ PSRemoting      │
│          │ Category [Dropdown]      │ ○ Copy-First      │
│ 📁 Maint │ ┌────────────────────┐  │ ○ PsExec          │
│   Script1│ │ PowerShell Code    │  │                   │
│   Script2│ │                    │  │ Targets:          │
│ 📁 Utils │ │                    │  │ ┌───────────────┐ │
│   Script3│ │                    │  │ │ PC-001        │ │
│ 📁 Uncat │ │                    │  │ │ PC-002        │ │
│   Script4│ └────────────────────┘  │ └───────────────┘ │
│          │                          │                   │
│ + Script │ [Save (Ctrl+S)]          │ [Deploy (Ctrl+D)] │
│ + Folder │                          │                   │
│          │                          │                   │
│          │ [Save (Ctrl+S)]          │ [Deploy (Ctrl+D)] │
│          │                          │                   │
│          │                          │ Recent:           │
│          │                          │ - Execution #1    │
├──────────┴──────────────────────────┴───────────────────┤
│ OUTPUT LOG                                              │
│ [15:30:45] [PC-001] Script started...                   │
│ [15:30:46] [PC-001] ✓ Success                           │
└─────────────────────────────────────────────────────────┘
```

### Interface Components

- **Left Panel (Scripts)** - Browse and manage scripts
- **Center Panel (Editor)** - Edit PowerShell code with syntax highlighting
- **Right Panel (Execution)** - Configure and deploy scripts
- **Bottom Panel (Output)** - View real-time execution logs

### Toggle Panels

- Click **X** on left panel to hide script library
- Click **Hide** on bottom panel to hide output log
- Panels reappear when you click **Show** buttons

## Step 3: Test with Sample Script

Let's deploy a script to your local machine:

### 3.1 Select Script

1. In the left panel, click **"Get System Info"**
2. The script loads in the editor

### 3.2 Review Code

The editor shows:

```powershell
# Get System Information
$os = Get-CimInstance Win32_OperatingSystem
$cpu = Get-CimInstance Win32_Processor
$mem = Get-CimInstance Win32_PhysicalMemory

Write-Output "OS: $($os.Caption)"
Write-Output "CPU: $($cpu.Name)"
Write-Output "RAM: $([math]::Round(($mem | Measure-Object Capacity -Sum).Sum / 1GB, 2)) GB"
```

### 3.3 Configure Deployment

In the **Execution Panel** (right side):

1. **Method:** Select **PSRemoting** (default)
2. **Targets:** Type `localhost`
3. Click **Deploy (Ctrl+D)** or press **Ctrl+D**

### 3.4 View Results

Watch the **Output Log** (bottom):

```
[15:30:45] [localhost] Starting execution...
[15:30:46] [localhost] OS: Microsoft Windows 11 Pro
[15:30:46] [localhost] CPU: Intel(R) Core(TM) i7-9700K
[15:30:46] [localhost] RAM: 16 GB
[15:30:47] [localhost] ✓ Execution completed successfully
```

✅ **Success!** You've deployed your first script.

## Step 4: Deploy to Multiple Machines

Now let's deploy to multiple targets:

### 4.1 Prepare Target List

In the **Targets** field, enter multiple machines:

```
PC-001
PC-002
PC-003
```

Or comma-separated:

```
PC-001, PC-002, PC-003
```

### 4.2 Choose Execution Method

**PSRemoting** (Recommended)

- Fast and secure
- Requires WinRM enabled
- Best for modern Windows

**Copy-First**

- Copies script to admin share first
- Good for restricted environments
- Requires SMB access

**PsExec**

- Legacy compatibility
- Requires PsExec installed
- Fallback option

### 4.3 Deploy

1. Click **Deploy (Ctrl+D)**
2. Watch real-time progress in Output Log
3. Each target shows individual status

### 4.4 Check Results

Output shows per-target results:

```
[15:35:10] [PC-001] ✓ Success (exit code 0)
[15:35:12] [PC-002] ✓ Success (exit code 0)
[15:35:15] [PC-003] ✗ Failed: Access denied
```

## Step 5: Create Your Own Script

### 5.1 Create New Script

1. Click **+ New Script** button (bottom of left panel)
2. A new script appears in the editor

### 5.2 Edit Metadata

At the top of the editor:

- **Name:** `My Custom Script`
- **Category:** `Uncategorized` (or select an existing folder)
- **Description:** `Does something useful`
- **Tags:** `custom, test`

### 5.3 Write PowerShell Code

In the code editor:

```powershell
# My Custom Script
Write-Output "Hello from $env:COMPUTERNAME"
Write-Output "Current user: $env:USERNAME"
Write-Output "Time: $(Get-Date)"
```

### 5.4 Save Script

- Click **Save** button
- Or press **Ctrl+S**

The script is now saved to the database!

### 5.5 Test Your Script

1. Enter `localhost` in Targets
2. Click **Deploy (Ctrl+D)**
3. View output in log panel

## Step 6: Manage Scripts

### Search Scripts

1. Use the search box at top of left panel
2. Type script name or tag
3. Results filter in real-time

### Delete Scripts

1. Hover over a script in the list
2. Click the **trash icon** that appears
3. Confirm deletion

### Organize into Categories

1. Click the **+ Folder** icon in the sidebar to create a new Category.
2. Drag and drop any script into the new Category folder.
3. You can rename categories by hovering over them and clicking the **pencil icon**.
4. Deleting a Category simply moves all of its scripts to the "Uncategorized" section automatically.

### Edit Existing Scripts

1. Click any script in the list
2. Modify code, name, description, or category
3. Press **Ctrl+S** to save changes

## Common Tasks

### Export Logs

1. Deploy a script
2. In Output Log panel, click **Export**
3. Saves logs to text file with timestamp

### Clear Logs

1. In Output Log panel, click **Clear**
2. Removes all current log entries

### View Execution History

In the **Execution Panel** (right), scroll down to see:

- Recent deployments
- Success/failure counts
- Execution method used
- Timestamp

## Keyboard Shortcuts

| Shortcut   | Action                       |
| ---------- | ---------------------------- |
| **Ctrl+S** | Save current script          |
| **Ctrl+D** | Deploy script to targets     |
| **Ctrl+F** | Focus search box (in editor) |

## Tips for Success

### ✅ Best Practices

1. **Test locally first** - Always test on `localhost` before deploying
2. **Use descriptive names** - Name scripts clearly for easy searching
3. **Add tags** - Use tags to categorize scripts (e.g., `maintenance`, `audit`)
4. **Check permissions** - Ensure you have admin rights on targets
5. **Start small** - Test on 1-2 machines before mass deployment

### ⚠️ Common Mistakes

1. **Wrong execution method** - PSRemoting requires WinRM enabled
2. **Firewall blocking** - Ensure ports are open (5985 for WinRM, 445 for SMB)
3. **Invalid targets** - Check machine names are correct and reachable
4. **Syntax errors** - Test PowerShell code in PowerShell ISE first
5. **Missing credentials** - Run Scriptographer as domain admin

## Troubleshooting Quick Fixes

### "Access Denied" Errors

**Solution:** Run Scriptographer as administrator

```powershell
# Right-click Scriptographer → Run as administrator
```

### "Target unreachable" Errors

**Solution:** Test connectivity first

```powershell
Test-Connection PC-001
Test-WSMan PC-001  # For PSRemoting
```

### Scripts not saving

**Solution:** Check database permissions

```powershell
# Ensure folder exists and is writable
$env:APPDATA\scriptographer
```

## Next Steps

Now that you're familiar with the basics:

1. **Read the [User Manual](user-manual.md)** - Learn all features in detail
2. **Review [Execution Methods](execution-methods.md)** - Choose the right method for your environment
3. **Check [Security Guide](security.md)** - Understand security implications
4. **See [Troubleshooting](troubleshooting.md)** - Solutions to common problems

## Need Help?

- **Documentation:** See [User Manual](user-manual.md)
- **Issues:** Check [Troubleshooting Guide](troubleshooting.md)
- **Support:** Open an issue on GitHub

---

**Ready to deploy at scale!** 🚀
