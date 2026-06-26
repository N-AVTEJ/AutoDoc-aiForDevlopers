# AutoDoc AI 🚀

> Paste code or pull from GitHub → get professional documentation + bug analysis in seconds. Supports multiple LLM providers (Anthropic, OpenAI, Gemini).

---

## How to Run (Zero Setup)

1. Open `index.html` directly in Chrome or Edge (or run via a local dev server like VS Code Live Server or python `-m http.server`).
2. That's it. No npm, no server, no install.

> The app calls the configured provider's API directly from the browser using direct browser-enabled access/keys.

---

## AI Providers & Keys

You can use any of the following providers. Open the **API Key** panel in the navigation bar to configure:

* **Anthropic Claude**: Uses `claude-3-5-sonnet-20241022` with direct browser access enabled.
* **OpenAI GPT**: Uses `gpt-4o` chat completions.
* **Google Gemini**: Uses `gemini-2.5-flash` API.

*All API keys are saved locally in your browser's `localStorage` and are never sent to any third-party server.*

---

## Features

| Feature | Description |
|---|---|
| **Multi-Provider Support** | Select between Anthropic Claude, OpenAI GPT, and Google Gemini. |
| **Auto-Detect Key Provider**| Paste an API key, and AutoDoc AI automatically detects the provider (e.g., `sk-ant-` for Claude, `sk-` for OpenAI, `AIzaSy` for Gemini). |
| **GitHub URL Fetch** | Paste any public GitHub file URL → auto-loads the code and maps the language. |
| **Language Detection** | Auto-detects Python, JS, TS, Java, Go, Rust, and C++ from file extensions. |
| **4 Output Formats** | Docstring/JSDoc, README section, Inline comments, or API reference. |
| **Parallel Bug Analysis** | Reviews code in parallel — identifies security issues, code smells, and bugs. |
| **Stats Bar** | Displays lines added, time taken, doc coverage %, and issues found. |
| **History Panel** | Keeps track of past requests (up to 50 items) so you can reload them instantly. |
| **Export & Copy** | Copy to clipboard or export documentation directly as a `.md` markdown file. |

---

## Demo Script (90 seconds)

1. Open a public GitHub repository in another tab.
2. Copy a Python, JS, or TS file URL.
3. Paste the URL into the GitHub URL bar at the top → click **Fetch**.
4. Select the desired documentation format → click **Generate Docs + Analyse**.
5. Point at the split view: *"Raw code on the left, beautifully formatted documentation on the right."*
6. Point at the bug panel: *"It automatically runs a code audit in parallel, highlighting any security issues or bugs with line numbers and severity badges."*
7. Click **Export** to show the generated `.md` file.
8. Say: *"New hires lose weeks reading undocumented code. AutoDoc AI fixes that in seconds — and catches critical bugs while it's at it."*

---

## Tech Stack

- **Frontend**: Pure HTML5 + Vanilla CSS + ES6 JavaScript (Zero dependencies, no node_modules, no build step).
- **APIs**: Direct browser-access integrations with Anthropic Messages API, OpenAI Chat Completions, and Gemini Developer API.
- **Typography**: Google Fonts (Syne + DM Sans + JetBrains Mono).

---

Built for the AI Hackathon for Builders — GL Bajaj Institute of Management and Research
