const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { OpenAIEmbeddings } = require('@langchain/openai');

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'me', 'more', 'most', 'my', 'myself', 'no',
  'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
  'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'someone',
  'anyone', 'etc'
]);

/**
 * Lightweight, deterministic semantic embedding provider for offline / zero-config environments.
 * Uses normalized TF-IDF with sublinear term-frequency scaling mapped into a 256-dimensional dense space.
 */
class LocalSemanticEmbeddings {
  constructor(dimensions = 256) {
    this.dimensions = dimensions;
  }

  _hashToken(token, seed = 0) {
    let h = 0x811c9dc5 ^ seed;
    for (let i = 0; i < token.length; i++) {
      h ^= token.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return Math.abs(h);
  }

  _vectorize(text) {
    const vector = new Array(this.dimensions).fill(0);
    const rawTokens = (text || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOPWORDS.has(t));

    if (rawTokens.length === 0) return vector;

    // Count term frequencies
    const tf = {};
    for (const t of rawTokens) {
      tf[t] = (tf[t] || 0) + 1;
      // Also generate 3-char prefix stems (e.g. hack*, cheat*, forg*, scam*)
      if (t.length > 4) {
        const stem = t.slice(0, 4);
        tf[stem] = (tf[stem] || 0) + 0.5;
      }
    }

    // Hash into dense vector space with sign
    for (const [token, count] of Object.entries(tf)) {
      const weight = 1 + Math.log(count);
      const idx1 = this._hashToken(token, 1) % this.dimensions;
      const idx2 = this._hashToken(token, 2) % this.dimensions;
      const sign1 = (this._hashToken(token, 3) % 2 === 0) ? 1 : -1;
      const sign2 = (this._hashToken(token, 4) % 2 === 0) ? 1 : -1;

      vector[idx1] += weight * sign1;
      vector[idx2] += (weight * 0.6) * sign2;
    }

    // L2 normalization
    let norm = 0;
    for (let i = 0; i < this.dimensions; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i] = vector[i] / norm;
      }
    }

    return vector;
  }

  async embedQuery(text) {
    return this._vectorize(text);
  }

  async embedDocuments(documents) {
    return documents.map((doc) => this._vectorize(doc));
  }
}

/**
 * Resolves the active embedding provider based on environment variables.
 */
function getEmbeddingModel() {
  const provider = (process.env.EMBEDDING_PROVIDER || process.env.LLM_PROVIDER || '').toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && (provider === 'google' || !provider)) {
    try {
      return {
        instance: new GoogleGenerativeAIEmbeddings({
          apiKey: geminiKey,
          modelName: process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004',
        }),
        providerName: 'Google Gemini (text-embedding-004)',
      };
    } catch (e) {
      console.warn('Failed to initialize Google embeddings, falling back to local provider:', e.message);
    }
  }

  if (openaiKey && (provider === 'openai' || !provider)) {
    try {
      return {
        instance: new OpenAIEmbeddings({
          openAIApiKey: openaiKey,
          modelName: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
        }),
        providerName: 'OpenAI (text-embedding-3-small)',
      };
    } catch (e) {
      console.warn('Failed to initialize OpenAI embeddings, falling back to local provider:', e.message);
    }
  }

  return {
    instance: new LocalSemanticEmbeddings(256),
    providerName: 'Local Semantic Dense Vectorizer (Zero-API-key fallback)',
  };
}

module.exports = {
  getEmbeddingModel,
  LocalSemanticEmbeddings,
};
