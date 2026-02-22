# User Manual

Complete guide to all Scriptographer features and functionality.

## Table of Contents

1. [Interface Overview](#interface-overview)
2. [Script Management](#script-management)
3. [Script Editor](#script-editor)
4. [Execution Panel](#execution-panel)
5. [Output Log](#output-log)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Advanced Features](#advanced-features)

---

## Interface Overview

### Main Window Layout

Scriptographer uses a 4-panel layout optimized for workflow efficiency:

```
┌─────────────────────────────────────────────────────────┐
│ Header: Scriptographer | PowerShell Deployment Tool     │
├──────────┬──────────────────────────┬───────────────────┤
│          │                          │                   │
│ Script   │ Script Editor            │ Execution         │
│ Library  │                          │ Panel             │
│          │                          │                   │
│ (280px)  │ (flexible)               │ (320px)           │
│          │                          │                   │
├──────────┴──────────────────────────┴───────────────────┤
│ Output Log (collapsible, 224px)                         │
└─────────────────────────────────────────────────────────┘
```

### Panel Functions

| Panel               | Purpose                            | Collapsible           |
| ------------------- | ---------------------------------- | --------------------- |
| **Script Library**  | Browse, search, and manage scripts | Yes (toggle on panel) |
| **Script Editor**   | Edit PowerShell code and metadata  | No                    |
| **Execution Panel** | Configure and deploy scripts       | No                    |
| **Output Log**      | View real-time execution logs      | Yes (toggle on panel) |

### UI Controls

**Toggle Script Library:**

- Click **X** icon in library header to hide
- Click **Show Sidebar** in main header to restore

**Toggle Output Log:**

- Click **Hide** button in log header to collapse
- Click **Show Output** bar at bottom to restore

---

## Script Management

### Script Library Panel

Located on the left side, displays all saved scripts.

#### Search Scripts

**Location:** Top of Script Library panel

**Usage:**

1. Click search box or press **Ctrl+F**
2. Type script name or tag
3. Results filter in real-time
4. Clear search to show all scripts

**Search Tips:**

- Searches both script names and tags
- Case-insensitive
- Partial matches supported
- Use tags for categorization

#### Script List

**Display Format:**

Scripts are grouped into logical **Categories** (Folders) that can be collapsed or expanded.

```
┌─────────────────────────┐
│ 📂 Maintenance          │
│   🖥️ Get System Info  │
│      system, audit     │
│   🖥️ Clear Temp Files │
│      cleanup           │
│ 📁 Utilities            │
└─────────────────────────┘
```

**Folder Actions:**

- **Add:** Click the Folder+ icon at the bottom of the sidebar.
- **Rename:** Hover over a folder and click the pencil icon.
- **Delete:** Hover over a folder and click the trash can. Scripts inside are safely moved to "Uncategorized".

**Script Actions:**

- **Organize:** Drag and drop scripts directly into folders!

**Active Script:**

- Highlighted in blue background
- White text
- Subtle glow effect

**Hover State:**

- Slightly lighter background
- Trash icon appears on right

#### Create New Script

**Button:** Bottom of Script Library panel

**Steps:**

1. Click **+ New Script** button
2. New script appears with default values:
   - Name: "New Script"
   - Description: ""
   - Content: "# Enter your PowerShell script here\n"
   - Tags: ""
3. Script automatically selected in editor
4. Edit and save with **Ctrl+S**

#### Delete Script

**Method 1: Hover Delete**

1. Hover over script in list
2. Click trash icon that appears
3. Confirm deletion in dialog

**Method 2: Right-Click** (if implemented)

1. Right-click script
2. Select "Delete"
3. Confirm

> **Warning:** Deletion is permanent and cannot be undone!

### Sample Scripts

Scriptographer includes 5 pre-loaded scripts:

1. **Get System Info**
   - Tags: `system, info`
   - Retrieves OS, CPU, RAM details

2. **Check Disk Space**
   - Tags: `disk, storage`
   - Reports disk usage for all drives

3. **Get Installed Software**
   - Tags: `software, inventory`
   - Lists installed applications

4. **Test Network Connectivity**
   - Tags: `network, connectivity`
   - Tests network connections

5. **Clear Temp Files**
   - Tags: `cleanup, maintenance`
   - Cleans Windows temp directories

---

## Script Editor

### Editor Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Script Name Input]      [Category Dropdown]            │
│ [Description Input]      [Tags Input]     [Save Button] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ # PowerShell Code                                        │
│ Write-Output "Hello World"                               │
│                                                          │
│ [Monaco Editor with syntax highlighting]                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Metadata Fields

#### Script Name

- **Location:** Top left of editor
- **Type:** Text input
- **Required:** Yes
- **Max Length:** 255 characters
- **Validation:** Must not be empty

**Best Practices:**

- Use descriptive names
- Follow naming convention (e.g., "Verb-Noun")
- Examples: "Get-SystemInfo", "Clear-TempFiles"

#### Category

- **Location:** Top right, next to the script name
- **Type:** Dropdown select
- **Required:** No (defaults to Uncategorized)

**Usage:**
Easily assign the selected script to an existing category, or remove it from all categories. Categories are created in the Script Library sidebar.

#### Description

- **Location:** Below script name, left side
- **Type:** Text input
- **Required:** No
- **Max Length:** 1000 characters

**Best Practices:**

- Explain what the script does
- Note any prerequisites
- Mention expected output

#### Tags

- **Location:** Below script name, right side
- **Type:** Text input (comma-separated)
- **Required:** No
- **Format:** `tag1, tag2, tag3`

**Best Practices:**

- Use lowercase
- Separate with commas
- Common tags: `maintenance`, `audit`, `security`, `network`

### Code Editor (Monaco)

**Features:**

- ✅ PowerShell syntax highlighting
- ✅ Line numbers
- ✅ Auto-indentation
- ✅ Bracket matching
- ✅ Find/Replace (Ctrl+F)
- ✅ Multi-cursor editing
- ✅ Code folding

**Editor Settings:**

- Font: Consolas, Monaco, monospace
- Font Size: 13px
- Tab Size: 2 spaces
- Line Height: 1.5
- Theme: VS Dark

**Keyboard Shortcuts (in editor):**
| Shortcut | Action |
|----------|--------|
| **Ctrl+F** | Find |
| **Ctrl+H** | Replace |
| **Ctrl+/** | Toggle comment |
| **Alt+Up/Down** | Move line up/down |
| **Ctrl+D** | Select next occurrence |
| **Ctrl+Shift+K** | Delete line |

### Save Script

**Button:** Top right of editor (blue when changes detected)

**Methods:**

1. Click **Save** button
2. Press **Ctrl+S**

**Save Behavior:**

- Updates existing script in database
- Saves all metadata (name, description, tags, content)
- Button disabled when no changes
- Button highlighted blue when unsaved changes exist

**Auto-Save:** Not implemented (manual save only)

### Empty State

When no script is selected:

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                    📄                                    │
│          Select a script to begin editing               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Execution Panel

### Panel Layout

```
┌───────────────────────┐
│ METHOD                │
│ ○ PSRemoting          │
│ ○ Copy-First          │
│ ○ PsExec              │
├───────────────────────┤
│ TARGETS               │
│ ┌───────────────────┐ │
│ │ PC-001            │ │
│ │ PC-002            │ │
│ │ PC-003            │ │
│ └───────────────────┘ │
│ 3 targets             │
├───────────────────────┤
│ [Deploy (Ctrl+D)]     │
├───────────────────────┤
│ RECENT                │
│ - Execution #1        │
│ - Execution #2        │
└───────────────────────┘
```

### Execution Methods

#### PSRemoting (Recommended)

**Description:** Uses PowerShell Remoting (WinRM)

**Pros:**

- Fast and efficient
- Native PowerShell feature
- Secure (encrypted)
- Best for modern Windows

**Cons:**

- Requires WinRM enabled
- Firewall must allow port 5985/5986

**Prerequisites:**

```powershell
# On target machines
Enable-PSRemoting -Force
```

**When to Use:**

- Modern Windows environments (Win10+, Server 2016+)
- Domain-joined machines
- When WinRM is already configured

---

#### Copy-First

**Description:** Copies script to admin share, then executes

**Pros:**

- Works when WinRM is disabled
- Uses standard SMB protocol
- Good for restricted environments

**Cons:**

- Slower (file copy overhead)
- Requires admin shares enabled
- Leaves script file on target

**Prerequisites:**

```powershell
# Admin shares must be enabled (default on Windows)
# Firewall must allow SMB (port 445)
```

**When to Use:**

- WinRM is disabled or blocked
- Legacy Windows systems
- Environments with strict remoting policies

---

#### PsExec (Legacy)

**Description:** Uses Sysinternals PsExec tool

**Pros:**

- Works on very old Windows versions
- Doesn't require WinRM
- Fallback option

**Cons:**

- Requires PsExec.exe installed
- Slower than other methods
- Less secure
- May trigger antivirus

**Prerequisites:**

```powershell
# Download PsExec from Sysinternals
# Add to PATH or place in script directory
```

**When to Use:**

- Very old Windows systems
- When both PSRemoting and Copy-First fail
- Compatibility with legacy infrastructure

---

### Target Configuration

**Input Field:** Multi-line textarea

**Formats Supported:**

**Newline-separated:**

```
PC-001
PC-002
PC-003
```

**Comma-separated:**

```
PC-001, PC-002, PC-003
```

**Mixed:**

```
PC-001, PC-002
PC-003
```

**Target Counter:**

- Displays below textarea
- Updates in real-time
- Format: "X target(s)"

**Target Validation:**

- Trims whitespace
- Removes empty lines
- Deduplicates entries

### Deploy Button

**Location:** Below targets field

**States:**

**Enabled (Blue):**

- Script is selected
- At least one target specified
- Not currently executing

**Disabled (Gray):**

- No script selected
- No targets specified
- Execution in progress

**Executing (Blue, animated):**

- Text changes to "Executing..."
- Button disabled during execution

**Trigger Methods:**

1. Click button
2. Press **Ctrl+D**

### Execution History

**Location:** Bottom of Execution Panel

**Display Format:**

```
┌─────────────────────────┐
│ Script #5               │
│ ✓ 3  |  ✗ 1  |  PSREMO │
│ 15:30:45                │
└─────────────────────────┘
```

**Information Shown:**

- Script ID
- Success count (green)
- Failure count (red)
- Execution method (uppercase)
- Start time

**Limit:** Shows last 10 executions

---

## Output Log

### Log Panel Layout

```
┌─────────────────────────────────────────────────────────┐
│ OUTPUT              [Clear] [Export] [Hide]             │
├─────────────────────────────────────────────────────────┤
│ [15:30:45] [PC-001] Starting execution...               │
│ [15:30:46] [PC-001] ✓ Script completed successfully     │
│ [15:30:47] [PC-002] ✗ Error: Access denied              │
└─────────────────────────────────────────────────────────┘
```

### Log Entry Format

**Structure:**

```
[HH:MM:SS] [TARGET] MESSAGE
```

**Example:**

```
[15:30:45] [PC-001] Starting execution...
```

**Components:**

- **Timestamp:** 24-hour format (HH:MM:SS)
- **Target:** Machine name in brackets (optional)
- **Message:** Log message content

### Log Levels

| Level       | Color  | Use Case              |
| ----------- | ------ | --------------------- |
| **Info**    | Gray   | General information   |
| **Success** | Green  | Successful operations |
| **Error**   | Red    | Failures and errors   |
| **Warning** | Orange | Warnings and cautions |

### Log Controls

#### Clear Button

**Location:** Top right of log panel

**Function:** Removes all log entries

**Usage:**

1. Click **Clear** button
2. Logs immediately cleared
3. No confirmation required

**When to Use:**

- Before starting new deployment
- When logs become too long
- To focus on new execution

#### Export Button

**Location:** Top right of log panel

**Function:** Saves logs to text file

**Usage:**

1. Click **Export** button
2. File downloads automatically
3. Filename: `scriptographer-log-{timestamp}.txt`

**Export Format:**

```
[15:30:45] [PC-001] Starting execution...
[15:30:46] [PC-001] Script completed successfully
[15:30:47] [PC-002] Error: Access denied
```

**When to Use:**

- Archiving execution records
- Sharing results with team
- Troubleshooting issues
- Compliance documentation

#### Hide Button

**Location:** Top right of log panel

**Function:** Collapses output log panel

**Usage:**

1. Click **Hide** button
2. Panel collapses to thin bar
3. Click **Show Output** to restore

**When to Use:**

- Maximize editor space
- Focus on script writing
- When logs not needed

### Auto-Scroll

**Behavior:**

- Automatically scrolls to latest log entry
- Triggered when new logs arrive
- Keeps most recent logs visible

**Manual Scroll:**

- Scroll up to view older logs
- Auto-scroll resumes when new logs arrive

### Log Limits

**Maximum Entries:** 10,000

- Oldest entries automatically removed
- Prevents memory issues
- Recommended to export before limit

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut   | Action        | Context  |
| ---------- | ------------- | -------- |
| **Ctrl+S** | Save script   | Anywhere |
| **Ctrl+D** | Deploy script | Anywhere |

### Editor Shortcuts

| Shortcut         | Action                 |
| ---------------- | ---------------------- |
| **Ctrl+F**       | Find                   |
| **Ctrl+H**       | Replace                |
| **Ctrl+/**       | Toggle comment         |
| **Alt+Up/Down**  | Move line              |
| **Ctrl+D**       | Select next occurrence |
| **Ctrl+Shift+K** | Delete line            |
| **Ctrl+Z**       | Undo                   |
| **Ctrl+Y**       | Redo                   |

### Navigation Shortcuts

| Shortcut      | Action                  |
| ------------- | ----------------------- |
| **Tab**       | Navigate between fields |
| **Shift+Tab** | Navigate backwards      |

---

## Advanced Features

### Concurrent Execution

**Behavior:**

- Executes on multiple targets simultaneously
- Configurable concurrency limit (default: 5)
- Prevents overwhelming network/targets

**Configuration:**

- Set in `executor.ts`
- Modify `CONCURRENT_LIMIT` constant

### Error Isolation

**Behavior:**

- Errors on one target don't stop others
- Each target executes independently
- Individual success/failure tracking

**Benefits:**

- Resilient deployments
- Partial success possible
- Clear error reporting per target

### Real-Time Logging

**Mechanism:**

- IPC (Inter-Process Communication)
- Main process → Renderer process
- Event-driven updates

**Performance:**

- Minimal overhead
- Buffered for efficiency
- Non-blocking UI

### Database Persistence

**Technology:** SQLite (via sql.js)

**Location:** `%APPDATA%\scriptographer\database.db`

**Tables:**

- `scripts` - Script storage
- `executions` - Execution history
- `execution_logs` - Detailed logs

**Backup:**

```powershell
# Manual backup
Copy-Item "$env:APPDATA\scriptographer\database.db" "backup.db"
```

---

## Tips & Best Practices

### Script Writing

✅ **Do:**

- Test scripts locally first
- Use `Write-Output` for logging
- Handle errors with try/catch
- Include comments
- Use meaningful variable names

❌ **Don't:**

- Use interactive prompts (Read-Host)
- Rely on user input
- Use hardcoded paths
- Forget error handling

### Deployment

✅ **Do:**

- Start with small target groups
- Verify connectivity first
- Use appropriate execution method
- Monitor output logs
- Export logs for records

❌ **Don't:**

- Deploy to all machines at once (untested)
- Ignore error messages
- Skip testing phase
- Deploy without backups

### Organization

✅ **Do:**

- Use descriptive script names
- Tag scripts consistently
- Keep scripts focused (single purpose)
- Document complex scripts
- Regular database backups

❌ **Don't:**

- Create duplicate scripts
- Use vague names
- Mix multiple functions in one script
- Leave scripts untagged

---

## Troubleshooting

See the [Troubleshooting Guide](troubleshooting.md) for detailed solutions to common issues.

**Quick Fixes:**

| Issue                  | Solution                      |
| ---------------------- | ----------------------------- |
| Can't save script      | Check database permissions    |
| Deploy button disabled | Select script and add targets |
| No output logs         | Check IPC connection          |
| Access denied errors   | Run as administrator          |
| Target unreachable     | Verify network connectivity   |

---

## Next Steps

- Review [Execution Methods](execution-methods.md) for detailed method comparison
- Read [Security Guide](security.md) for security best practices
- Check [Architecture](architecture.md) to understand internals
- See [Development Guide](development.md) to contribute

---

**Need Help?** See [Troubleshooting](troubleshooting.md) or open an issue on GitHub.
