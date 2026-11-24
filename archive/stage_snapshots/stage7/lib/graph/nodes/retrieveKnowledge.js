/**
 * Node 2: retrieve_knowledge
 *
 * Executes semantic vector search against cyber_law_vectors.json
 * when the intent classifier determines that statutory or legal section
 * knowledge is required.
 */

const { retrieveLegalContext } = require('../../rag/retriever');

async function retrieveKnowledgeNode(state) {
  const query = state.retrievalQuery || state.userMessage || '';
  let retrieved = [];

  if (query.trim()) {
    try {
      retrieved = await retrieveLegalContext(query, {
        topK: 3,
        minScore: 0.12,
      });
    } catch (err) {
      console.warn('[retrieve_knowledge] Error querying vector store:', err.message);
    }
  }

  const nodes = [...(state.metadata?.executionNodes || []), 'retrieve_knowledge'];

  return {
    retrievedDocs: retrieved,
    metadata: {
      ...state.metadata,
      executionNodes: nodes,
    },
  };
}

module.exports = {
  retrieveKnowledgeNode,
};
