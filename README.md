# MermaidAI Studio 🎨🤖

> An AI-powered diagram studio and interactive visual editor built with Next.js 15, Monaco Editor, Mermaid.js v11, and Google Gemini 2.5 Flash.

![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8e75ff?style=flat-square&logo=googlegemini)
![Mermaid.js](https://img.shields.io/badge/Mermaid.js-v11.4-ff3670?style=flat-square)

---

## ✨ Features

- 🤖 **Natural Language to Diagram**: Describe any workflow, system architecture, sequence, database schema, or mindmap in plain English to instantly generate valid Mermaid.js code.
- 🎨 **Floating AI Copilot & Presets**: In-canvas floating prompt panel with quick-refactoring presets (*Add Cache Layer*, *Error Handling*, *Sequence Diagram*, *Metrics Node*, *Simplify Layout*).
- 🩹 **Self-Healing Syntax Auto-Fix**: Real-time syntax validation that displays an actionable **"Fix with AI"** banner when errors occur, plus client/server syntax pre-processing (`autoFixMermaidCode`).
- 📝 **Collapsible Monaco Code Editor**: Full VS Code markdown editing experience featuring custom `'fblack-dark'` theme, line numbers, smooth carets, live sync, and 1-click drawer toggle.
- 🔍 **Interactive SVG Viewport Canvas**: Smooth mouse drag/pan and zoom scale controls (40% to 300%) with reset view capability.
- ⚡ **Starter Templates**: Pre-loaded templates for E-Commerce Checkout, OAuth 2.0 Sequence, Microservice Architecture, ER Diagrams, AI Mindmaps, and Sprint Gantt charts.
- 📥 **High-Resolution Exports**: Download diagrams in raw **SVG** format or **2x High-Definition PNG** with automatic font-import sanitization.
- 🌓 **Glassmorphism Design System**: Dynamic dark (`.dark`) and light (`.light`) themes with glassmorphic floating bars, CSS variable tokens, and sleek typography.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) + [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **AI Engine** | [Google Gemini 2.5 Flash](https://ai.google.dev/) via `@google/genai` |
| **Code Editor** | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| **Diagram Engine** | [Mermaid.js v11](https://mermaid.js.org/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Styling** | Custom Vanilla CSS (`globals.css`) with CSS design tokens |

---

## 📁 Project Structure

```
MermaidAi/
├── .env.local.example       # Environment template containing GEMINI_API_KEY
├── next.config.mjs          # Next.js configuration
├── package.json             # Dependencies and project scripts
├── PROJECT_KNOWLEDGE.md     # Technical developer & agent reference
├── src/
│   ├── app/
│   │   ├── api/generate/    # Gemini 2.5 Flash API route with server-side auto-fix
│   │   ├── globals.css      # Design system CSS tokens & theme styling
│   │   ├── layout.tsx       # Root layout and metadata
│   │   └── page.tsx         # Dashboard workspace & state orchestration
│   ├── components/
│   │   ├── AiSidebar/       # Floating AI prompt panel & quick presets
│   │   ├── Canvas/          # Interactive SVG diagram viewport & pan/zoom
│   │   ├── Editor/          # Monaco Markdown Code Editor component
│   │   └── Navbar/          # Top header bar, template selector & export menu
│   └── lib/
│       ├── mermaid-config.ts # Client-side safe Mermaid renderer & syntax validator
│       └── templates.ts      # Starter diagram template definitions
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `pnpm` (recommended) or `npm` / `yarn`
- **Google Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/MermaidAi.git
   cd MermaidAi
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   # OR
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Run the Development Server**
   ```bash
   pnpm dev
   # OR
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build

To build and run the application in production mode:

```bash
# Build production bundle
pnpm build

# Start production server
pnpm start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
