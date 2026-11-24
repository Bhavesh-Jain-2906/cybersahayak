/**
 * LangGraph.js Workflow Definition for CyberSahayak
 *
 * Implements a complete context-aware, safety-validated conversational graph:
 *
 * [START]
 *    │
 *    ▼
 * understand_intent ───► (Needs Retrieval?)
 *    │                          │
 *    │ [No]                     │ [Yes]
 *    │                          ▼
 *    │                  retrieve_knowledge
 *    │                          │
 *    └──────────► ◄─────────────┘
 *                 │
 *                 ▼
 *          generate_response
 *                 │
 *                 ▼
 *          validate_response ──► (Valid & Safe?)
 *                 │                     │
 *                 │ [Yes]               │ [No]
 *                 │                     ▼
 *                 │              sanitize_and_fix
 *                 │                     │
 *                 └──────────► ◄────────┘
 *                              │
 *                              ▼
 *                       finalize_response
 *                              │
 *                              ▼
 *                            [END]
 */

const { StateGraph, START, END } = require('@langchain/langgraph');
const { CyberSahayakState } = require('./state');
const { understandIntentNode } = require('./nodes/understandIntent');
const { retrieveKnowledgeNode } = require('./nodes/retrieveKnowledge');
const { generateResponseNode } = require('./nodes/generateResponse');
const { validateResponseNode } = require('./nodes/validateResponse');
const { sanitizeAndFixNode } = require('./nodes/sanitizeAndFix');
const { finalizeResponseNode } = require('./nodes/finalizeResponse');

/**
 * Conditional router deciding whether RAG retrieval is required.
 */
function routeAfterIntent(state) {
  if (state.intent?.needsRetrieval) {
    return 'retrieve_knowledge';
  }
  return 'generate_response';
}

/**
 * Conditional router deciding whether the response needs sanitization.
 */
function routeAfterValidation(state) {
  if (state.validation?.isValid === false) {
    return 'sanitize_and_fix';
  }
  return 'finalize_response';
}

/**
 * Builds and compiles the LangGraph workflow.
 */
function createCyberSahayakGraph() {
  const workflow = new StateGraph(CyberSahayakState)
    // Add all functional nodes
    .addNode('understand_intent', understandIntentNode)
    .addNode('retrieve_knowledge', retrieveKnowledgeNode)
    .addNode('generate_response', generateResponseNode)
    .addNode('validate_response', validateResponseNode)
    .addNode('sanitize_and_fix', sanitizeAndFixNode)
    .addNode('finalize_response', finalizeResponseNode)

    // Entry point: START -> understand_intent
    .addEdge(START, 'understand_intent')

    // Conditional Branch 1: Retrieval Decision
    .addConditionalEdges('understand_intent', routeAfterIntent, {
      retrieve_knowledge: 'retrieve_knowledge',
      generate_response: 'generate_response',
    })

    // After retrieval, join to generation
    .addEdge('retrieve_knowledge', 'generate_response')

    // After generation, validate response
    .addEdge('generate_response', 'validate_response')

    // Conditional Branch 2: Safety & Quality Validation
    .addConditionalEdges('validate_response', routeAfterValidation, {
      sanitize_and_fix: 'sanitize_and_fix',
      finalize_response: 'finalize_response',
    })

    // After sanitization, join to finalization
    .addEdge('sanitize_and_fix', 'finalize_response')

    // Exit point: finalize_response -> END
    .addEdge('finalize_response', END);

  return workflow.compile();
}

// Singleton compiled graph instance
let compiledGraph = null;

function getCompiledGraph() {
  if (!compiledGraph) {
    compiledGraph = createCyberSahayakGraph();
  }
  return compiledGraph;
}

module.exports = {
  createCyberSahayakGraph,
  getCompiledGraph,
  routeAfterIntent,
  routeAfterValidation,
};
