# Scriptographer Documentation

**Version:** 1.0.0  
**Platform:** Windows  
**License:** MIT

## Overview

Scriptographer is a professional PowerShell deployment tool designed for Windows domain administrators. It enables rapid, reliable deployment of PowerShell scripts to multiple target machines with real-time feedback and comprehensive logging.

## Documentation Index

### Getting Started

- [Installation Guide](installation.md) - Install and configure Scriptographer
- [Quick Start](quick-start.md) - Get up and running in 5 minutes
- [User Manual](user-manual.md) - Complete guide to all features

### Technical Documentation

- [Architecture Overview](architecture.md) - System design and components
- [PowerShell Execution Methods](execution-methods.md) - PSRemoting, Copy-First, and PsExec
- [Database Schema](database.md) - SQLite structure and data models
- [API Reference](api-reference.md) - IPC API documentation

### Advanced Topics

- [Troubleshooting](troubleshooting.md) - Common issues and solutions
- [Security Considerations](security.md) - Best practices and security model
- [Development Guide](development.md) - Build from source and contribute

## Key Features

✅ **Multi-Target Deployment** - Deploy to hundreds of machines simultaneously  
✅ **Three Execution Methods** - PSRemoting, Copy-First, and PsExec support  
✅ **Real-Time Logging** - Live feedback with color-coded status  
✅ **Script Management** - Full CRUD operations with search  
✅ **Monaco Editor** - Professional code editing with syntax highlighting  
✅ **Execution History** - Track all deployments with success/failure metrics  
✅ **Keyboard Shortcuts** - Power user features (Ctrl+S, Ctrl+D)  
✅ **Collapsible UI** - Maximize screen space when needed

## System Requirements

- **Operating System:** Windows 10/11 or Windows Server 2016+
- **PowerShell:** 5.1 or later
- **Permissions:** Domain administrator or equivalent
- **Network:** Access to target machines via WinRM, SMB, or PsExec
- **Disk Space:** 150 MB minimum

## Quick Links

- [Download Latest Release](../dist/Scriptographer%20Setup%201.0.0.exe)
- [Report Issues](https://github.com/yourusername/scriptographer/issues)
- [View Source Code](https://github.com/yourusername/scriptographer)

## Support

For questions, issues, or feature requests, please refer to the [Troubleshooting Guide](troubleshooting.md) or open an issue on GitHub.

---

**Built with:** Electron, React, TypeScript, Monaco Editor, sql.js
