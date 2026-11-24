# CyberSahayak — Stage 7: Advanced Cyber Awareness, Safety Quiz & Dashboard

## Overview
Stage 7 extends the CyberSahayak AI cybercrime assistance platform with rich educational, diagnostic, and resource features:
1. **Protection Hub (Dashboard)**: Central overview featuring personal greetings, live security metrics, quick question submission to the AI assistant, featured awareness guides, quiz launcher, and 1930 emergency shortcut.
2. **Cyber Awareness Academy**: 10 comprehensive, structured guides covering prevailing cyber threats in India (UPI fraud, phishing, password hygiene, social engineering, fake shopping, identity theft, malware/RATs, account takeover, social media impersonation, safe browsing). Each guide provides real-world fraud scenarios, step-by-step prevention checklists, and statutory legal citations (IT Act 2000 & IPC).
3. **Interactive Cyber Safety Quiz**: 8 scenario-based multiple choice questions with instant color-coded feedback, in-depth educational explanations, dynamic scoring, cybersecurity proficiency badges, and 1-click AI follow-up advice.
4. **Official Help & Resources**: Verified Indian cybercrime reporting infrastructure (National Helpline 1930, `cybercrime.gov.in`, RBI Sachet, DoT Sanchar Saathi/Chakshu, CEIR, TAFCOP, StopNCII), the 4-step Golden Hour emergency protocol, and a comprehensive pre-filing digital evidence checklist.
5. **Preferences & Profile Center**: Modal dialog with 4 organized tabs:
   - **Profile & Theme**: Custom display name, primary banking institution (for tailored dispute advice), emergency state cyber cell contact, and theme palette toggle (Vanta Black & Blue vs Light Clean).
   - **AI Guidance**: Response tone customization (Calm Step-by-Step, Concise Emergency Action, Educational & Statutory) and language preference (English vs Hinglish).
   - **Data & Privacy**: Local JSON chat transcript export, clear conversation history with confirmation, and strict confidentiality guarantee.
   - **About App**: Technical architecture specs (LangGraph.js 6-node state machine, 53 legal RAG vectors, Groq & Gemini multi-model failover) and verified government portals.
6. **Unified Sidebar Navigation**: One-click switching between AI Assistant, Protection Hub, Cyber Awareness, Safety Quiz, and Help & Resources, while keeping conversation history and search readily accessible.

## Technical Architecture
- **Framework**: Next.js 14 App Router, React 18, Tailwind CSS
- **Orchestration**: LangGraph.js `StateGraph` (6 nodes: `understand_intent`, `retrieve_knowledge`, `generate_response`, `validate_response`, `sanitize_and_fix`, `finalize_response`)
- **LLM Engine**: Groq (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`) with automatic failover to Google Gemini
- **RAG Retrieval**: Vector cosine similarity over 53 statutory provisions extracted from `cyber-law.pdf`
- **Data Persistence**: Safe local browser storage (`localStorage`) for conversations, user profile preferences, quiz scores, and recently viewed guides.

## Running Stage 7
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
