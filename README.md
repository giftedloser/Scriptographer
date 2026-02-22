# Scriptographer

> A professional multi-language script deployment tool for Windows environments.

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![Platform](https://img.shields.io/badge/platform-Windows-lightgrey) ![License](https://img.shields.io/badge/license-MIT-green)

<img width="1384" height="861" alt="image" src="https://github.com/user-attachments/assets/53fc6437-3fa0-40a5-a1bf-c177a95a3f65" />

Deploy scripts to multiple machines simultaneously — with real-time feedback, full execution logging, and a UI that doesn't get in the way.


---

## Features

**Multi-Target Deployment**
Deploy to many machines at once with a non-blocking UI. Designed to handle real-world domain environments without grinding to a halt.

**Three Execution Methods**
- **PSRemoting** — Standard WinRM-based remote execution
- **PsExec** — High-privilege execution via Sysinternals
- **Copy-First** — Copies the script locally before executing, for restrictive environments

**Professional Editor**
Monaco editor with PowerShell syntax highlighting, word wrap, and `Ctrl+S` to save. The editor adapts to your active theme seamlessly.

**Script Organization**
Organize scripts into category folders with full drag-and-drop support and inline renaming.

**Target Groups**
Save and reuse lists of target machines for faster, repeatable deployments.

**Real-Time Logging**
Live color-coded output with execution metrics and full history retention.

**Theming**
Four built-in themes: Dark, Light, Cyberpunk, and Ocean.

---

## Quick Start

### Prerequisites

- Windows 10/11 or Windows Server 2016+
- PowerShell 5.1+
- Node.js v18+ *(only required for building from source)*

### Install (Pre-compiled)

Download the latest `Scriptographer Setup 1.0.0.exe` from the [Releases](https://github.com/yourusername/scriptographer/releases) page and run the installer.

### Build from Source

```bash
# Clone the repo
git clone https://github.com/yourusername/scriptographer.git
cd scriptographer

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build the production installer
npm run pack
```

The installer will be output to the `dist/` directory.

---

## Documentation

Full guides on execution methods, WinRM configuration, and troubleshooting are available in the [`__docs`](./__docs) directory.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Electron + React + TypeScript |
| Styling | Tailwind CSS + Lucide Icons |
| Editor | Monaco Editor |
| Database | SQLite (sql.js) |
| PowerShell | node-powershell |

---

## Contributing

Issues and pull requests are welcome. Check the [issues page](https://github.com/yourusername/scriptographer/issues) to get started.

Particularly interested in:
- Bug reports and edge cases from real domain environments
- New execution method ideas
- Support for additional script types (Bash, Python, Batch)
- UI/UX feedback

---

## License

MIT — see [LICENSE](./LICENSE) for details.
