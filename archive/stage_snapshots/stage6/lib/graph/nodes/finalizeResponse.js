/**
 * Node 6: finalize_response
 *
 * Prepares the final response payload, records any clarification question
 * asked to avoid repeating it in future turns, and appends the assistant's
 * turn to the conversation history.
 */

const { AIMessage } = require('@langchain/core/messages');

async function finalizeResponseNode(state) {
  const finalResponse = state.draftResponse || '';
  const validation = state.validation || {};
  const clarifications = [];

  if (validation.extractedQuestion) {
    clarifications.push(validation.extractedQuestion);
  }

  const nodes = [...(state.metadata?.executionNodes || []), 'finalize_response'];

  return {
    finalResponse,
    messages: [new AIMessage(finalResponse)],
    clarificationsAsked: clarifications,
    metadata: {
      ...state.metadata,
      executionNodes: nodes,
      timestamp: new Date().toISOString(),
    },
  };
}

module.exports = {
  finalizeResponseNode,
};
