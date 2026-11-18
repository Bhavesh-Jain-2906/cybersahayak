# CyberSahayak — Stage 5: LangGraph.js Conversational Workflow

Stage 5 replaces linear LLM chaining with a stateful, modular, context-aware execution graph built using **LangGraph.js** (`@langchain/langgraph`).

---

## 1. Graph Architecture & Workflow

```
[START]
   │
   ▼
1. understand_intent
   (Analyzes user message, extracts category, urgency, decides if RAG is needed)
   │
   ├─► [Conditional Edge: routeAfterIntent]
   │     ├─► needsRetrieval == true  ──► 2. retrieve_knowledge
   │     │                                       │
   │     └─► needsRetrieval == false ────────────┤
   │                                             ▼
   │                                     3. generate_response
   │                                             │
   │                                             ▼
   │                                     4. validate_response
   │                                             │
   │                                     [Conditional Edge: routeAfterValidation]
   │                                             ├─► isValid == false ──► 5. sanitize_and_fix ──┐
   │                                             │                                              │
   │                                             └─► isValid == true  ──────────────────────────┤
   │                                                                                            ▼
   │                                                                                    6. finalize_response
   │                                                                                            │
   │                                                                                            ▼
   │                                                                                          [END]
```

---

## 2. Graph State Schema (`lib/graph/state.js`)

Defined using `@langchain/langgraph`'s `Annotation.Root`:

- `userMessage`: The current user input string.
- `messages`: Chronological array of LangChain `BaseMessage` objects (`HumanMessage`, `AIMessage`), preserving conversation history.
- `conversationId`: Unique session identifier isolating different chats.
- `intent`:
  - `category`: `financial_fraud` | `phishing` | `account_compromise` | `evidence_preservation` | `security_best_practices` | `legal_statutory` | `general_cyber` | `out_of_scope`
  - `urgency`: `high` | `medium` | `low`
  - `needsRetrieval`: boolean
  - `confidence`: number
  - `rationale`: string
- `retrievalQuery`: query string for knowledge retrieval if triggered.
- `retrievedDocs`: array of retrieved chunks with metadata and similarity scores.
- `draftResponse`: preliminary LLM generation.
- `validation`:
  - `isValid`: boolean
  - `hasFIRViolation`: boolean
  - `hasCredentialViolation`: boolean
  - `hasHelplineMention`: boolean
  - `clarificationCount`: number
  - `extractedQuestion`: string | null
  - `sanitized`: boolean
- `finalResponse`: sanitized, finalized output returned to user.
- `clarificationsAsked`: history of clarifying questions asked in this conversation to prevent repetition.
- `metadata`: execution tracking (nodes visited, model used, latency, etc.).

---

## 3. Node Responsibilities

1. **`understand_intent`**:
   - Classifies query intent and determines if statutory legal retrieval is genuinely necessary.
   - Restricts RAG retrieval to legal/statutory queries only (IT Act, IPC, penalties, offences), saving tokens and avoiding prompt clutter for emergency incident triage.
2. **`retrieve_knowledge`**:
   - Queries `data/cyber_law_vectors.json` (53 vectorized provisions from `cyber-law.pdf`).
   - Attaches verified legal context with exact citations.
3. **`generate_response`**:
   - Injects empathetic CyberSahayak persona.
   - Enforces non-repetition by passing `clarificationsAsked` into system memory.
   - Politely redirects out-of-scope non-cyber queries back to cyber safety.
   - Calls LLM with automatic Groq model rotation (`openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.8-27b`).
4. **`validate_response`**:
   - Guardrail check: No formal FIR or police complaint letters.
   - Guardrail check: No password, OTP, or PIN solicitation.
   - Enforces single clarification question rule.
   - Checks presence of **1930** and **cybercrime.gov.in** for financial fraud.
5. **`sanitize_and_fix`**:
   - Intercepts and repairs any flagged drafts prior to user delivery.
6. **`finalize_response`**:
   - Commits the response to state, stores clarification memory, and formats the API output.

---

## 4. How to Run & Test

```bash
# Run LangGraph test suite
npm run test-graph

# Run Next.js development server
npm run dev
```
