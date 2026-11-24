/**
 * CyberSahayak LangGraph.js Entry Point
 *
 * Provides a clean interface for executing the multi-node workflow,
 * managing session isolation and state transitions.
 */

const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const { getCompiledGraph } = require('./workflow');

/**
 * Formats incoming client conversation history into LangChain BaseMessage objects.
 *
 * @param {Array} history - Array of { role: 'user' | 'assistant', content: string }
 * @returns {Array} Array of BaseMessage instances
 */
function convertHistoryToMessages(history = []) {
  if (!Array.isArray(history)) return [];

  const formatted = [];
  for (const item of history) {
    if (!item || !item.content) continue;
    const clean = String(item.content).trim();
    if (!clean) continue;

    if (item.role === 'user') {
      formatted.push(new HumanMessage(clean));
    } else if (item.role === 'assistant') {
      formatted.push(new AIMessage(clean));
    }
  }

  return formatted;
}

/**
 * Executes the complete CyberSahayak LangGraph workflow.
 *
 * @param {Object} params
 * @param {string} params.message - The incoming user message
 * @param {Array} [params.history] - Array of previous { role, content } messages
 * @param {string} [params.conversationId] - Unique ID isolating this conversation
 * @param {Array} [params.clarificationsAsked] - List of previous clarifications to avoid repeating
 * @returns {Promise<Object>} Output containing finalResponse, intent, sources, and state
 */
async function runCyberSahayakWorkflow({
  message,
  history = [],
  conversationId = 'default-session',
  clarificationsAsked = [],
}) {
  if (!message || typeof message !== 'string' || !message.trim()) {
    throw new Error('Message is required and must be a non-empty string.');
  }

  const trimmed = message.trim();
  const graph = getCompiledGraph();

  // Convert history and append current user turn
  const pastMessages = convertHistoryToMessages(history);
  const currentMessage = new HumanMessage(trimmed);
  const allMessages = [...pastMessages, currentMessage];

  const initialState = {
    userMessage: trimmed,
    messages: allMessages,
    conversationId: String(conversationId || 'default-session'),
    intent: {
      category: 'general_cyber',
      urgency: 'low',
      needsRetrieval: false,
      confidence: 1.0,
      rationale: '',
    },
    retrievalQuery: '',
    retrievedDocs: [],
    draftResponse: '',
    validation: {
      isValid: true,
      hasFIRViolation: false,
      hasCredentialViolation: false,
      hasHelplineMention: true,
      clarificationCount: 0,
      extractedQuestion: null,
      sanitized: false,
      issues: [],
    },
    finalResponse: '',
    clarificationsAsked: Array.isArray(clarificationsAsked) ? clarificationsAsked : [],
    metadata: {
      provider: 'unknown',
      model: 'unknown',
      isDemo: false,
      executionNodes: [],
      timestamp: new Date().toISOString(),
    },
  };

  const startTime = Date.now();
  const finalState = await graph.invoke(initialState);
  const duration = Date.now() - startTime;

  return {
    success: true,
    response: finalState.finalResponse,
    intent: finalState.intent,
    ragUsed: Boolean(finalState.intent?.needsRetrieval && finalState.retrievedDocs?.length > 0),
    retrievedSources: (finalState.retrievedDocs || []).map((d) => ({
      offence: d.metadata?.offence,
      legalSection: d.metadata?.legalSection,
      act: d.metadata?.act,
      category: d.metadata?.category,
      source: d.metadata?.source,
      page: d.metadata?.pageNumber,
      slNo: d.metadata?.slNo,
      score: d.score,
    })),
    validation: finalState.validation,
    clarificationsAsked: finalState.clarificationsAsked,
    conversationId: finalState.conversationId,
    metadata: {
      ...finalState.metadata,
      executionTimeMs: duration,
    },
  };
}

module.exports = {
  runCyberSahayakWorkflow,
  convertHistoryToMessages,
};
