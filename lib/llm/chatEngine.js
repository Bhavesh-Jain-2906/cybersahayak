/**
 * Conversational Engine for Connor
 *
 * Coordinates:
 * - Query intent classification (conversational vs legal statutory retrieval)
 * - Conditional RAG integration from cyber-law.pdf knowledge base
 * - Context history management
 * - Multi-provider LLM invocation with resilient model rotation and graceful fallback
 */

const { SystemMessage, HumanMessage, AIMessage } = require('@langchain/core/messages');
const { getChatModel, GROQ_CANDIDATE_MODELS } = require('./model');
const { buildSystemPrompt } = require('./prompts');
const { retrieveLegalContext, formatRetrievedContext } = require('../rag/retriever');

// Regex patterns to detect when a user query warrants statutory legal retrieval
const LEGAL_INTENT_PATTERNS = [
  /\b(section|sec\.?|act|ipc|it\s*act|information\s*technology\s*act|indian\s*penal\s*code)\b/i,
  /\b(punishment|penalty|fine|imprisonment|jail|bailable|non-bailable|cognizable|non-cognizable)\b/i,
  /\b(legal\s*(provision|action|consequence|section|remedy)|offence|offense|statute|law|court)\b/i,
  /\b(cheating\s*by\s*personation|identity\s*theft|tampering|hacking\s*section|cyber\s*terrorism)\b/i,
  /\b(what\s*(is|are)\s*the\s*(legal|punishment|penalty|law|section))\b/i,
  /\b(which\s*section|under\s*which\s*section)\b/i,
];

/**
 * Determines whether a user question requires statutory legal retrieval from the PDF.
 *
 * @param {string} query
 * @returns {boolean}
 */
function shouldTriggerLegalRetrieval(query) {
  if (!query || typeof query !== 'string') return false;
  const trimmed = query.trim();
  if (trimmed.length < 5) return false;

  return LEGAL_INTENT_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Sanitizes and limits chat history to prevent context overflow while maintaining conversational context.
 *
 * @param {Array} history - Array of { role: 'user' | 'assistant', content: string }
 * @param {number} maxMessages - Maximum past messages to include
 * @returns {Array} Formatted LangChain message instances
 */
function formatChatHistory(history, maxMessages = 10) {
  if (!Array.isArray(history)) return [];

  const recent = history.slice(-maxMessages);
  const formatted = [];

  for (const item of recent) {
    if (!item || !item.content) continue;
    const cleanContent = String(item.content).trim();
    if (!cleanContent) continue;

    if (item.role === 'user') {
      formatted.push(new HumanMessage(cleanContent));
    } else if (item.role === 'assistant') {
      formatted.push(new AIMessage(cleanContent));
    }
  }

  return formatted;
}

/**
 * Generates an empathetic, accurate cybersecurity response for the user.
 *
 * @param {Object} params
 * @param {string} params.message - The incoming user question
 * @param {Array} [params.history] - Array of previous { role, content } messages
 * @param {Object} [params.options] - Optional overrides (provider, temperature, topK)
 * @returns {Promise<Object>}
 */
async function generateConnorResponse({ message, history = [], options = {} }) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message is required and must be a non-empty string.');
  }

  const query = message.trim();
  let retrievedChunks = [];
  let retrievedContext = null;
  let ragUsed = false;

  // 1. Determine if legal retrieval is needed
  const needsRetrieval = options.forceRag || shouldTriggerLegalRetrieval(query);

  if (needsRetrieval) {
    try {
      retrievedChunks = await retrieveLegalContext(query, {
        topK: options.topK || 3,
        minScore: options.minScore || 0.12,
      });

      if (retrievedChunks.length > 0) {
        retrievedContext = formatRetrievedContext(retrievedChunks);
        ragUsed = true;
      }
    } catch (ragErr) {
      console.warn('[ChatEngine] Retrieval error, proceeding without RAG context:', ragErr.message);
    }
  }

  // 2. Build system prompt
  const systemPrompt = buildSystemPrompt(retrievedContext);

  // 3. Prepare message sequence
  const historyMessages = formatChatHistory(history, 10);
  const fullMessages = [
    new SystemMessage(systemPrompt),
    ...historyMessages,
    new HumanMessage(query),
  ];

  // 4. Initialize model
  let modelInfo;
  try {
    modelInfo = await getChatModel(options);
  } catch (initErr) {
    console.error('[ChatEngine] Model init failed, falling back to demo mode:', initErr.message);
    const { createDemoModel } = require('./model');
    modelInfo = {
      model: createDemoModel(),
      provider: 'demo',
      modelName: 'connor-demo-mode',
      isDemo: true,
    };
  }

  // 5. Invoke LLM with resilient model rotation and graceful fallback
  let responseContent = '';
  try {
    const rawResult = await modelInfo.model.invoke(fullMessages);
    responseContent = typeof rawResult === 'string' ? rawResult : (rawResult.content || '');
  } catch (invokeErr) {
    console.warn(`[ChatEngine] Provider "${modelInfo.provider}" model "${modelInfo.modelName}" error:`, invokeErr.message);

    // If Groq had a rate limit or failure, try secondary Groq models
    if (modelInfo.provider === 'groq' && process.env.GROQ_API_KEY) {
      for (const altModel of GROQ_CANDIDATE_MODELS) {
        if (altModel === modelInfo.modelName) continue;
        try {
          console.info(`[ChatEngine] Rotating to alternative Groq model: ${altModel}...`);
          const altInfo = await getChatModel({ provider: 'groq', modelName: altModel });
          const altResult = await altInfo.model.invoke(fullMessages);
          responseContent = typeof altResult === 'string' ? altResult : (altResult.content || '');
          if (responseContent) {
            modelInfo = altInfo;
            break;
          }
        } catch (rotErr) {
          console.warn(`[ChatEngine] Model ${altModel} also failed:`, rotErr.message);
        }
      }
    }

    // Final fallback: intelligent demo responder
    if (!responseContent) {
      const { createDemoModel } = require('./model');
      const demoModel = createDemoModel();
      const demoResult = await demoModel.invoke(query);
      responseContent = demoResult.content;
      modelInfo = {
        model: demoModel,
        provider: 'demo',
        modelName: 'connor-demo-mode',
        isDemo: true,
      };
    }
  }

  // 6. Format returned source citations
  const sources = retrievedChunks.map((c) => ({
    offence: c.metadata.offence,
    legalSection: c.metadata.legalSection,
    act: c.metadata.act,
    category: c.metadata.category,
    source: c.metadata.source,
    page: c.metadata.pageNumber,
    slNo: c.metadata.slNo,
    relevanceScore: c.score,
  }));

  return {
    success: true,
    response: responseContent,
    ragUsed,
    retrievedSources: sources,
    metadata: {
      provider: modelInfo.provider,
      model: modelInfo.modelName,
      isDemo: Boolean(modelInfo.isDemo),
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  generateConnorResponse,
  generateCyberSahayakResponse: generateConnorResponse,
  shouldTriggerLegalRetrieval,
  formatChatHistory,
};
