const path = require('path');
const { retrieveLegalContext, formatRetrievedContext } = require('../lib/rag/retriever');

async function testRetrieval() {
  console.log('=====================================================');
  console.log(' CyberSahayak RAG Semantic Retrieval Verification ');
  console.log('=====================================================\n');

  const testQueries = [
    {
      label: 'Scenario 1: Identity Theft & Impersonation',
      query: 'Someone created a fake profile with my name and photos to solicit money from people.',
      expected: 'Sec.66C IT Act (Identity theft)',
    },
    {
      label: 'Scenario 2: Bogus Shopping Websites & Cyber Frauds',
      query: 'I was cheated by a bogus online shopping website that took my payment and vanished.',
      expected: 'Sec.420 IPC (Bogus websites, Cyber Frauds)',
    },
    {
      label: 'Scenario 3: Hacking & Data Alteration',
      query: 'An unauthorized person gained access to my computer system and altered my sensitive files.',
      expected: 'Sec.66 IT Act (Hacking with computer systems, Data Alteration)',
    },
    {
      label: 'Scenario 4: Threatening Messages via Email & Criminal Intimidation',
      query: 'Sending threatening messages by e-mail or criminal intimidation.',
      expected: 'Sec.503 IPC (Sending threatening messages by e-mail)',
    },
    {
      label: 'Scenario 5: Software Piracy & Copyright Infringement',
      query: 'Using an illegal infringing copy of a proprietary computer program.',
      expected: 'Sec.63B Copyright Act (Knowing use of infringing copy of computer programme)',
    },
    {
      label: 'Scenario 6: Online Contraband & Drug Sales',
      query: 'Selling illegal narcotics and banned pharmaceutical drugs over the internet.',
      expected: 'NDPS Act (Online Sale of Drugs)',
    },
  ];

  const storePath = path.join(__dirname, '..', 'data', 'cyber_law_vectors.json');

  for (let i = 0; i < testQueries.length; i++) {
    const { label, query, expected } = testQueries[i];
    console.log(`[Test ${i + 1}/${testQueries.length}] ${label}`);
    console.log(`Query: "${query}"`);
    console.log(`Expected Reference: ${expected}`);

    const results = await retrieveLegalContext(query, {
      topK: 2,
      minScore: 0.15,
      vectorStorePath: storePath,
    });

    if (results.length === 0) {
      console.log('  ⚠️ No matches found above threshold.');
    } else {
      results.forEach((r, rIdx) => {
        const meta = r.metadata;
        console.log(`  -> Match ${rIdx + 1} (Score: ${r.score}): ${meta.legalSection} (${meta.act}) — ${meta.offence} [Page ${meta.pageNumber}]`);
      });
    }
    console.log('-----------------------------------------------------\n');
  }

  // Demonstration of context formatter for LLM prompts
  console.log('--- Sample Formatted RAG Context for Prompt Injection ---');
  const sampleResults = await retrieveLegalContext('bogus websites and cyber frauds', {
    topK: 2,
    vectorStorePath: storePath,
  });
  console.log(formatRetrievedContext(sampleResults));
  console.log('---------------------------------------------------------');
}

testRetrieval().catch((err) => {
  console.error('Retrieval test failed:', err);
  process.exit(1);
});
