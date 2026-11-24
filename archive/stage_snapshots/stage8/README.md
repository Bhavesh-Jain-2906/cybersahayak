# CyberSahayak — AI-Powered Cybercrime Assistance Platform

CyberSahayak is an empathetic, conversational cybersecurity assistant and awareness platform designed to help citizens understand cybercrime incidents, recover compromised accounts, identify scams, and preserve digital evidence.

> **Important**: CyberSahayak is strictly focused on guidance, awareness, and digital safety. It does **not** generate FIRs, draft legal complaints, or solicit sensitive credentials (passwords, OTPs, or PINs).

---

## 🛠️ Technology Stack (Stage 1)

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18, JavaScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with `@tailwindcss/typography`
- **Iconography**: [Lucide React](https://lucide.dev/)
- **Theme**: Dark Cybersecurity & Light Professional modes
- **State & Storage**: React Context with persistent LocalStorage

---

## 📁 Project Structure

```
cybersahay/
├── app/
│   ├── globals.css           # Tailwind base, dark mode, custom scrollbars
│   ├── layout.js             # Root layout with ThemeProvider and ChatProvider
│   └── page.js               # Main page layout (Sidebar + Chat Area)
├── components/
│   ├── chat/
│   │   ├── AssistantMessage.jsx   # Assistant response card with helpline notice
│   │   ├── ChatArea.jsx           # Main chat orchestration area
│   │   ├── ChatHeader.jsx         # Mobile toggle, active title, helpline badge
│   │   ├── LoadingIndicator.jsx   # Pulsing cybersecurity loading indicator
│   │   ├── MessageComposer.jsx    # Auto-resizing textarea with Enter to send
│   │   ├── MessageList.jsx        # Auto-scrolling chat history stream
│   │   ├── UserMessage.jsx        # User message bubble with copy action
│   │   └── WelcomeScreen.jsx      # Suggested prompt cards & safety guidance
│   ├── modals/
│   │   └── SettingsModal.jsx      # Appearance, JSON export, clear history
│   ├── sidebar/
│   │   ├── ChatHistoryList.jsx    # Date-grouped chat history
│   │   ├── ConversationItem.jsx   # Chat title, inline rename, delete prompt
│   │   ├── Sidebar.jsx            # Desktop sidebar & mobile drawer container
│   │   └── UserProfileSection.jsx # Citizen profile, theme toggle & settings
│   └── ui/
│       ├── MarkdownRenderer.jsx   # Zero-dependency structured text renderer
│       └── ThemeToggle.jsx        # Dark/Light theme switch button
├── context/
│   ├── ChatContext.jsx            # Conversation state, active chat, actions
│   └── ThemeContext.jsx           # Dark/Light mode management
├── lib/
│   ├── constants.js               # Suggested prompts, official helplines (1930)
│   ├── dateUtils.js               # Date-grouping (Today, Yesterday, 7 Days)
│   ├── storage.js                 # Safe localStorage persistence layer
│   └── utils.js                   # Class merging utility (clsx + tailwind-merge)
├── .env.example                   # Environment variable template
├── jsconfig.json                  # Path alias resolution (@/*)
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS plugins
├── tailwind.config.js             # Cybersecurity theme palette & typography
└── cyber-law.pdf                  # Knowledge base document for Stage 2 RAG
```

---

## 🚀 How to Run the Application

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Build for production
```bash
npm run build
npm start
```

### 4. Code quality check
```bash
npm run lint
```

---

## 📌 Status Summary (Stage 1)

### ✅ What is currently functional:
- **ChatGPT-Inspired UI**: Responsive two-column layout on desktop, sliding drawer on mobile.
- **Left Sidebar**:
  - Branding with cybersecurity badge.
  - "New Chat" button with `Ctrl+K` keyboard shortcut.
  - Real-time conversation search filtering.
  - Date-grouped conversation history (*Today*, *Yesterday*, *Previous 7 Days*, *Older*).
  - Inline conversation rename (`Enter` to save, `Esc` to cancel).
  - Conversation deletion with confirmation dialog.
- **Main Chat Area**:
  - Welcome screen with 6 curated cyber threat scenarios (UPI scams, phishing SMS, Instagram account hack, digital evidence preservation, SIM swap, fake profiles).
  - Chat bubbles for both user and assistant.
  - Message composer with auto-resize, `Enter` to send, and `Shift+Enter` for multiline.
  - Loading animation when processing queries.
  - Markdown-style rich text rendering (code blocks, bold, quotes, lists, links).
  - Auto-scroll to latest message.
- **Settings & Preferences**:
  - Dark Mode and Light Mode switching with persistence.
  - Export chat history as JSON.
  - Clear all conversation history.
  - Official resource directory (Helpline **1930**, **cybercrime.gov.in**, **sachet.rbi.org.in**).
- **Compliance with Master Rules**:
  - Zero complaint drafting / FIR generation / complaint preview components.
  - Zero solicitation of passwords, PINs, or OTPs.

### ⏳ What is NOT yet functional (Reserved for Upcoming Stages):
- **LangChain.js & LangGraph.js Agent Workflow**: Scheduled for **Stage 3**.
- **Vector Embeddings & RAG**: Knowledge extraction from `cyber-law.pdf` scheduled for **Stage 2**.
- **Live LLM API Calls**: Server-side model inference will be wired in **Stage 3**.
