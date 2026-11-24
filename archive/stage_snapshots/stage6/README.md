# CyberSahayak — Stage 6: Frontend & Backend Integration

Stage 6 completes the full integration between the Next.js React user interface and the LangChain.js / LangGraph.js backend.

---

## 1. Key Capabilities Connected

- **Live Chat Composer**: Sends user messages to `POST /api/chat`.
- **Conversation Context & Isolation**: Each chat preserves its own independent message history and passes isolated turns to the LangGraph workflow.
- **Real LLM Inference**: Live AI responses from Groq LPU models (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`) and Google Gemini.
- **RAG Citation Display**: Assistant message cards feature collapsible "Knowledge Base Citations" displaying exact statutory provisions from `cyber-law.pdf` (e.g., Sec. 66C IT Act, match scores, categories, page numbers).
- **Safety Guardrails Active**: Anti-FIR generation, anti-credential harvesting, emergency 1930 / cybercrime.gov.in helplines.
- **Error Handling & Retry**: Interactive retry banner with automatic error capture and user notification.
- **Sidebar & Persistence**: Full conversation history persisted via `localStorage` with real-time search filtering, renaming, and deletion.

---

## 2. Request / Response Lifecycle

```
[User clicks suggested card or submits prompt]
        │
        ▼
ChatContext.sendMessage()
        │
        ▼
POST /api/chat { message, conversationId, history, clarificationsAsked }
        │
        ▼
LangGraph Execution Graph:
  1. understand_intent
  2. retrieve_knowledge (if legal query)
  3. generate_response (LLM)
  4. validate_response (Guardrails)
  5. sanitize_and_fix (Self-correction)
  6. finalize_response
        │
        ▼
Response JSON: { response, ragUsed, retrievedSources, validation, metadata }
        │
        ▼
ChatContext appends assistant turn to active conversation state & persists
        │
        ▼
AssistantMessage renders rich markdown + RAG citations accordion + 1930 helpline
```
