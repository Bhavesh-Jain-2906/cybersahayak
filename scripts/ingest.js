const path = require('path');
const fs = require('fs');
const { loadCyberLawPdf, parseLegalEntries } = require('../lib/rag/pdfLoader');
const { createSemanticChunks } = require('../lib/rag/chunker');
const { getEmbeddingModel } = require('../lib/rag/embeddings');
const { PersistentVectorStore } = require('../lib/rag/vectorStore');

async function runIngestion() {
  console.log('=====================================================');
  console.log(' CyberSahayak RAG Knowledge Base Ingestion Pipeline');
  console.log('=====================================================\n');

  // Step 1: Locate the PDF document
  const pdfCandidates = [
    path.join(__dirname, '..', 'cyber-law.pdf'),
    path.join(process.cwd(), 'archive', 'stage_snapshots', 'stage3', 'cyber-law.pdf'),
    path.join(process.cwd(), 'cyber-law.pdf'),
  ];

  let pdfPath = null;
  for (const candidate of pdfCandidates) {
    if (fs.existsSync(candidate)) {
      pdfPath = candidate;
      break;
    }
  }

  if (!pdfPath) {
    console.error('❌ Error: cyber-law.pdf could not be found.');
    console.error('Please place cyber-law.pdf in the project folder before running ingestion.');
    process.exit(1);
  }

  console.log(`[1/4] Found knowledge base document: ${pdfPath}`);

  // Step 2: Extract text and parse legal provisions
  console.log('[2/4] Extracting text and parsing statutory sections...');
  const { numPages, pages, totalCharacters } = await loadCyberLawPdf(pdfPath);
  console.log(`      ✓ Extracted ${numPages} pages (${totalCharacters} characters) cleanly.`);

  const legalEntries = parseLegalEntries(pages);
  console.log(`      ✓ Parsed ${legalEntries.length} statutory offences across all acts:`);

  const actBreakdown = {};
  legalEntries.forEach((e) => {
    actBreakdown[e.act] = (actBreakdown[e.act] || 0) + 1;
  });
  for (const [act, count] of Object.entries(actBreakdown)) {
    console.log(`        - ${act}: ${count} provisions`);
  }

  // Step 3: Create semantic chunks
  console.log('\n[3/4] Generating semantic chunks with metadata preservation...');
  const chunks = createSemanticChunks(legalEntries);
  console.log(`      ✓ Generated ${chunks.length} structured chunks with full metadata.`);

  // Step 4: Generate embeddings & serialize vector store
  const { instance: embeddings, providerName } = getEmbeddingModel();
  console.log(`\n[4/4] Creating embeddings using: "${providerName}"...`);
  const startTime = Date.now();

  const store = new PersistentVectorStore(embeddings);
  await store.addDocuments(chunks);

  const outputPath = path.join(__dirname, '..', 'data', 'cyber_law_vectors.json');
  store.saveToFile(outputPath);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`      ✓ Successfully computed and stored ${chunks.length} vector embeddings in ${duration}s.`);
  console.log(`      ✓ Persisted vector database to: ${outputPath}`);

  console.log('\n=====================================================');
  console.log(' Ingestion Complete & Ready for Semantic Retrieval! ');
  console.log('=====================================================\n');
}

runIngestion().catch((err) => {
  console.error('Ingestion failed with error:', err);
  process.exit(1);
});
