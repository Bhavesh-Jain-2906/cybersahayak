/**
 * Node 3: generate_response
 *
 * Constructs the prompt and context-aware message chain, passes
 * previously asked clarifications to prevent repetition, and invokes
 * the LLM to produce a draft response.
 */

const { SystemMessage, HumanMessage, AIMessage } = require('@langchain/core/messages');
const { getChatModel, GROQ_CANDIDATE_MODELS } = require('../../llm/model');
const { formatRetrievedContext } = require('../../rag/retriever');
const { BASE_SYSTEM_PROMPT } = require('../../llm/prompts');

/**
 * Builds dynamic system prompt tailored to the graph state.
 */
function buildGraphSystemPrompt(state) {
  let prompt = BASE_SYSTEM_PROMPT;

  // 1. Handle Out of Scope queries
  if (state.intent?.category === 'out_of_scope') {
    return `${prompt}

### Special Instruction for Non-Cyber Questions:
The user has asked a question unrelated to cybercrime, cybersecurity, or digital safety.
- Acknowledge their message briefly and politely.
- Gently and clearly explain that you are **CyberSahayak**, dedicated specifically to helping citizens with cybercrime incidents, online fraud prevention, account security, and digital safety in India.
- Ask if they or someone they know has any questions or concerns regarding digital safety, phishing, or account security.`;
  }

  // 2. Attach retrieved legal context if available
  if (state.retrievedDocs && state.retrievedDocs.length > 0) {
    const formatted = formatRetrievedContext(state.retrievedDocs);
    prompt += `\n\n### Verified Legal Reference Provisions (from Knowledge Base):\n${formatted}\n\nInstruction: Use these verified legal provisions accurately when addressing the user's question. Do not hallucinate additional legal sections outside these verified facts.`;
  }

  // 3. Prevent repeated questions
  const pastClarifications = state.clarificationsAsked || [];
  if (pastClarifications.length > 0) {
    prompt += `\n\n### Conversation Memory — Previously Asked Clarifications:
The following questions have ALREADY been asked previously in this conversation:
${pastClarifications.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

STRICT RULE: DO NOT repeat any of the above questions or ask trivial variations of them. If more details are needed, either proceed with helpful guidance based on what is known or ask a completely different, crucial question.`;
  }

  return prompt;
}

async function generateResponseNode(state) {
  const systemPrompt = buildGraphSystemPrompt(state);
  const userMessage = state.userMessage || '';

  // Limit past history to last 10 messages for token efficiency
  const rawHistory = state.messages || [];
  const recentHistory = rawHistory.slice(-10);

  const formattedMessages = [
    new SystemMessage(systemPrompt),
    ...recentHistory,
  ];

  // Append current user message if not already the last message in history
  const lastMsg = rawHistory[rawHistory.length - 1];
  if (!lastMsg || lastMsg.content !== userMessage) {
    formattedMessages.push(new HumanMessage(userMessage));
  }

  let modelInfo;
  try {
    modelInfo = await getChatModel();
  } catch (err) {
    console.warn('[generate_response] Model init error, falling back to demo mode:', err.message);
    const { createDemoModel } = require('../../llm/model');
    modelInfo = {
      model: createDemoModel(),
      provider: 'demo',
      modelName: 'cybersahayak-demo-mode',
      isDemo: true,
    };
  }

  let responseContent = '';
  try {
    const rawResult = await modelInfo.model.invoke(formattedMessages);
    responseContent = typeof rawResult === 'string' ? rawResult : (rawResult.content || '');
  } catch (invokeErr) {
    console.warn(`[generate_response] Provider "${modelInfo.provider}" model "${modelInfo.modelName}" error:`, invokeErr.message);

    // Failover across alternative Groq candidate models
    if (modelInfo.provider === 'groq' && process.env.GROQ_API_KEY) {
      for (const altModel of GROQ_CANDIDATE_MODELS) {
        if (altModel === modelInfo.modelName) continue;
        try {
          console.info(`[generate_response] Failover to Groq model: ${altModel}...`);
          const altInfo = await getChatModel({ provider: 'groq', modelName: altModel });
          const altResult = await altInfo.model.invoke(formattedMessages);
          responseContent = typeof altResult === 'string' ? altResult : (altResult.content || '');
          if (responseContent) {
            modelInfo = altInfo;
            break;
          }
        } catch (rotErr) {
          console.warn(`[generate_response] Failover model ${altModel} failed:`, rotErr.message);
        }
      }
    }

    // Final fallback to intelligent demo responder
    if (!responseContent) {
      const { createDemoModel } = require('../../llm/model');
      const demoModel = createDemoModel();
      const demoResult = await demoModel.invoke(userMessage);
      responseContent = demoResult.content;
      modelInfo = {
        model: demoModel,
        provider: 'demo',
        modelName: 'cybersahayak-demo-mode',
        isDemo: true,
      };
    }
  }

  const nodes = [...(state.metadata?.executionNodes || []), 'generate_response'];

  return {
    draftResponse: responseContent,
    metadata: {
      ...state.metadata,
      provider: modelInfo.provider,
      model: modelInfo.modelName,
      isDemo: Boolean(modelInfo.isDemo),
      executionNodes: nodes,
    },
  };
}

module.exports = {
  generateResponseNode,
  buildGraphSystemPrompt,
};
