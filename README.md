# Scriptographer

**Version:** 1.0.0  
**Platform:** Windows  
**License:** MIT

Scriptographer is a professional, high-performance PowerShell deployment tool designed for Windows domain administrators. It enables rapid, reliable deployment of PowerShell scripts to multiple target machines with real-time feedback, complete execution logging, and a stunning UI.

<img width="1384" height="861" alt="image" src="https://github.com/user-attachments/assets/6c1d35a4-9891-4f6b-b249-494fb40f66f8" />


## ✨ Key Features

- 🚀 **Multi-Target Deployment** - Deploy scripts to hundreds of machines simultaneously without freezing the UI.
- 🛠️ **Three Execution Methods**:
  - **PSRemoting**: Standard WinRM-based execution.
  - **PsExec**: High-privilege remote execution via Sysinternals.
  - **Copy-First**: Copies scripts locally before execution for restrictive environments.
- 🎨 **Beautiful Theming** - Includes Dark, Light, Cyberpunk, and Ocean themes, with the Monaco editor seamlessly integrating into the active canvas.
- 🗂️ **Script Organization** - Organize scripts into **Categories (Folders)**. Features full **Drag-and-Drop** support and inline renaming.
- 💻 **Professional Editor** - Built-in Monaco editor with PowerShell syntax highlighting, word wrap, and shortcut support (Ctrl+S to save).
- 📊 **Real-Time Logging** - Live feedback with color-coded status, execution metrics, and full history retention.
- 🎯 **Target Groups** - Save and reuse lists of target computers for quick deployments.

## 🚀 Quick Start

### Prerequisites

- **Operating System:** Windows 10/11 or Windows Server 2016+
- **PowerShell:** 5.1 or later
- **Node.js**: v18+ (For building from source)

### Installation (Pre-compiled)

Download the latest `Scriptographer Setup 1.0.0.exe` release from the repository and install it.

### Building from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/scriptographer.git
   cd scriptographer
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Build the production installer:
   ```bash
   npm run pack
   ```
   _The installer will be placed in the `dist/` directory._

## 📚 Documentation

For detailed guides on how to use the different execution methods, configure WinRM, or troubleshoot connections, please view the [docs directory](docs/README.md).

## 🛠️ Tech Stack

- **Framework**: Electron + React + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Database**: SQLite (`sql.js`)
- **PowerShell Execution**: `node-powershell`

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/scriptographer/issues).

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
# Scriptographer
