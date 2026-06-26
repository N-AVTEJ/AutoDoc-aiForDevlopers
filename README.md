# AutoDoc AI 🚀

[![JavaScript](https://img.shields.io/badge/JavaScript-48.9%25-f7df1e?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS](https://img.shields.io/badge/CSS-27.7%25-1572b6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![HTML](https://img.shields.io/badge/HTML-23.4%25-e34c26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat)](https://github.com/N-AVTEJ/AutoDoc-aiForDevlopers)

> **Paste code or pull from GitHub → get professional documentation + bug analysis in seconds.**
> 
> Supports multiple LLM providers (Anthropic, OpenAI, Gemini) with zero dependencies.

---

## 📋 Table of Contents

- [✨ Features](#features)
- [🚀 Quick Start](#quick-start)
- [🔑 AI Providers](#ai-providers--keys)
- [⚙️ Tech Stack](#tech-stack)
- [🎬 Demo](#demo-script-90-seconds)
- [📝 License](#license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔄 **Multi-Provider Support** | Select between Anthropic Claude, OpenAI GPT, and Google Gemini. |
| 🎯 **Auto-Detect Key Provider** | Paste an API key, and AutoDoc AI automatically detects the provider (e.g., `sk-ant-` for Claude, `sk-` for OpenAI, `AIzaSy` for Gemini). |
| 🔗 **GitHub URL Fetch** | Paste any public GitHub file URL → auto-loads the code and maps the language. |
| 🔍 **Language Detection** | Auto-detects Python, JS, TS, Java, Go, Rust, and C++ from file extensions. |
| 📄 **4 Output Formats** | Docstring/JSDoc, README section, Inline comments, or API reference. |
| 🐛 **Parallel Bug Analysis** | Reviews code in parallel — identifies security issues, code smells, and bugs. |
| 📊 **Stats Bar** | Displays lines added, time taken, doc coverage %, and issues found. |
| 📚 **History Panel** | Keeps track of past requests (up to 50 items) so you can reload them instantly. |
| 💾 **Export & Copy** | Copy to clipboard or export documentation directly as a `.md` markdown file. |

---

## 🚀 Quick Start

### How to Run (Zero Setup)

1. Open `index.html` directly in Chrome or Edge
2. Or run via a local dev server:
   - VS Code Live Server
   - Python: `python -m http.server`
   - Node: `npx http-server`

> **That's it.** No npm, no server, no install.

> The app calls the configured provider's API directly from the browser using direct browser-enabled access/keys.

---

## 🔑 AI Providers & Keys

Configure any of the following providers in the **API Key** panel in the navigation bar:

| Provider | Model | Setup |
|----------|-------|-------|
| **Anthropic Claude** | `claude-3-5-sonnet-20241022` | Direct browser access enabled |
| **OpenAI GPT** | `gpt-4o` | Chat completions API |
| **Google Gemini** | `gemini-2.5-flash` | Developer API |

💡 **Privacy First**: All API keys are saved locally in your browser's `localStorage` and are never sent to any third-party server.

---

## ⚙️ Tech Stack

- **Frontend**: Pure HTML5 + Vanilla CSS + ES6 JavaScript
  - Zero dependencies, no node_modules, no build step
- **APIs**: Direct browser-access integrations
  - Anthropic Messages API
  - OpenAI Chat Completions
  - Gemini Developer API
- **Typography**: Google Fonts (Syne + DM Sans + JetBrains Mono)

---

## 🎬 Demo Script (90 seconds)

1. Open a public GitHub repository in another tab
2. Copy a Python, JS, or TS file URL
3. Paste the URL into the GitHub URL bar at the top → click **Fetch**
4. Select the desired documentation format → click **Generate Docs + Analyse**
5. Point at the split view: *"Raw code on the left, beautifully formatted documentation on the right."*
6. Point at the bug panel: *"It automatically runs a code audit in parallel, highlighting any security issues or bugs with line numbers and severity badges."*
7. Click **Export** to show the generated `.md` file
8. Say: *"New hires lose weeks reading undocumented code. AutoDoc AI fixes that in seconds — and catches critical bugs while it's at it."*

---

<div align="center">
  
**Made with ❤️ for developers**

