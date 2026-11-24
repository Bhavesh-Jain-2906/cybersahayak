const fs = require('fs');
const path = require('path');
const { Document } = require('@langchain/core/documents');

/**
 * Calculates cosine similarity between two numeric vectors.
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Lightweight, persistent Vector Store for CyberSahayak RAG knowledge retrieval.
 * Completely self-contained, repeatable, and compatible with LangChain Document objects.
 */
class PersistentVectorStore {
  constructor(embeddings) {
    this.embeddings = embeddings;
    this.entries = []; // Array of { id, document: Document, vector: number[] }
  }

  /**
   * Adds an array of chunks / documents with their computed vector embeddings.
   */
  async addDocuments(chunks, vectors = null) {
    const texts = chunks.map((c) => c.content || c.pageContent);
    const computedVectors = vectors || (await this.embeddings.embedDocuments(texts));

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const doc = new Document({
        pageContent: chunk.content || chunk.pageContent,
        metadata: chunk.metadata || {},
      });

      this.entries.push({
        id: chunk.id || `doc-${Date.now()}-${i}`,
        document: doc,
        vector: computedVectors[i],
      });
    }

    return this.entries.length;
  }

  /**
   * Performs semantic similarity search against the stored vectors.
   */
  async similaritySearchWithScore(query, k = 4, filter = null) {
    if (this.entries.length === 0) return [];

    const queryVector = await this.embeddings.embedQuery(query);

    const scored = this.entries
      .filter((entry) => {
        if (!filter) return true;
        for (const [key, val] of Object.entries(filter)) {
          if (entry.document.metadata[key] !== val) return false;
        }
        return true;
      })
      .map((entry) => ({
        document: entry.document,
        score: cosineSimilarity(queryVector, entry.vector),
      }));

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, k);
  }

  /**
   * Returns top-k documents without raw score values.
   */
  async similaritySearch(query, k = 4, filter = null) {
    const results = await this.similaritySearchWithScore(query, k, filter);
    return results.map((r) => r.document);
  }

  /**
   * Serializes vectors and documents into a clean JSON file for fast zero-re-embedding loading.
   */
  saveToFile(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const payload = {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      totalEntries: this.entries.length,
      entries: this.entries.map((e) => ({
        id: e.id,
        content: e.document.pageContent,
        metadata: e.document.metadata,
        vector: e.vector,
      })),
    };

    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    return filePath;
  }

  /**
   * Deserializes and loads vectors from a saved JSON file.
   */
  loadFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Vector store file not found at: ${filePath}. Please run the ingestion script first.`);
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);

    this.entries = parsed.entries.map((item) => ({
      id: item.id,
      document: new Document({
        pageContent: item.content,
        metadata: item.metadata,
      }),
      vector: item.vector,
    }));

    return this.entries.length;
  }
}

module.exports = {
  PersistentVectorStore,
  cosineSimilarity,
};
