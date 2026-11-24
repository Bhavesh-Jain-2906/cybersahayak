const path = require('path');
const fs = require('fs');
const { getEmbeddingModel } = require('./embeddings');
const { PersistentVectorStore } = require('./vectorStore');

let cachedVectorStore = null;

/**
 * Initializes and returns the active vector store, loading persisted vectors if available.
 */
function getVectorStore(customPath = null) {
  if (cachedVectorStore && !customPath) {
    return cachedVectorStore;
  }

  const { instance: embeddings } = getEmbeddingModel();
  const store = new PersistentVectorStore(embeddings);

  const defaultStorePath = path.join(process.cwd(), 'stage3', 'data', 'cyber_law_vectors.json');
  const fallbackPath = path.join(process.cwd(), 'data', 'cyber_law_vectors.json');
  const targetPath = customPath || (fs.existsSync(defaultStorePath) ? defaultStorePath : fallbackPath);

  if (fs.existsSync(targetPath)) {
    store.loadFromFile(targetPath);
    if (!customPath) {
      cachedVectorStore = store;
    }
  }

  return store;
}

/**
 * Retrieves semantically relevant legal provisions for a user query.
 */
async function retrieveLegalContext(query, options = {}) {
  const { topK = 3, minScore = 0.15, filter = null, vectorStorePath = null } = options;

  if (!query || !query.trim()) {
    return [];
  }

  const store = getVectorStore(vectorStorePath);

  if (store.entries.length === 0) {
    return [];
  }

  const scoredResults = await store.similaritySearchWithScore(query, topK, filter);

  // Filter by minimum similarity score threshold
  const filtered = scoredResults.filter((r) => r.score >= minScore);

  return filtered.map((item) => ({
    content: item.document.pageContent,
    metadata: item.document.metadata,
    score: Math.round(item.score * 1000) / 1000,
  }));
}

/**
 * Formats retrieved legal chunks into clear, cited text context for prompt synthesis.
 */
function formatRetrievedContext(retrievedChunks) {
  if (!retrievedChunks || retrievedChunks.length === 0) {
    return '';
  }

  return retrievedChunks
    .map((chunk, idx) => {
      const meta = chunk.metadata;
      return `[Reference ${idx + 1}]
- Offence: ${meta.offence}
- Governing Legal Section: ${meta.legalSection} (${meta.act})
- Legal Category: ${meta.category}
- Document Source: ${meta.source}, Page ${meta.pageNumber} (Sl.No ${meta.slNo})
- Relevance Score: ${chunk.score}`;
    })
    .join('\n\n');
}

module.exports = {
  getVectorStore,
  retrieveLegalContext,
  formatRetrievedContext,
};
