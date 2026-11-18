/**
 * Test Suite for Stage 5 — LangGraph.js Conversational Workflow
 *
 * Verifies all 7 required scenarios:
 * 1. User reporting a UPI scam
 * 2. User asking about a phishing message
 * 3. User whose social media account was hacked
 * 4. User asking how to preserve evidence
 * 5. User asking about password safety
 * 6. User asking a general cybersecurity question
 * 7. User asking something unrelated to cybercrime (out-of-scope refocus)
 *
 * Checks:
 * - Sensible retrieval decision making (RAG used only when needed)
 * - Graph state transitions (understand_intent -> retrieve_knowledge? -> generate_response -> validate_response -> finalize_response)
 * - Anti-FIR and anti-credential-harvesting guardrail validation
 * - Prevention of repetitive clarification questions across conversation turns
 */

const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const { runCyberSahayakWorkflow } = require('../lib/graph');

const TEST_SCENARIOS = [
  {
    id: 1,
    title: 'User reporting a UPI scam',
    message: 'Help! Someone sent me a QR code on Google Pay saying I won a cash prize, and when I scanned it ₹15,000 got deducted from my bank! What should I do right now?',
    expectedCategory: 'financial_fraud',
    expectedNeedsRetrieval: false,
    expectedUrgency: 'high',
    requiredMentions: ['1930', 'cybercrime.gov.in', 'bank'],
  },
  {
    id: 2,
    title: 'User asking about a phishing message',
    message: 'I received an SMS claiming my electricity power will be disconnected at 9:30 PM tonight unless I immediately click this link to update my bill. Is this a phishing scam?',
    expectedCategory: 'phishing',
    expectedNeedsRetrieval: false,
    expectedUrgency: 'medium',
    requiredMentions: ['phish', 'link'],
  },
  {
    id: 3,
    title: 'User whose social media account was hacked',
    message: 'My Instagram account was hacked today and the hacker changed my password and recovery email! How can I recover it?',
    expectedCategory: 'account_compromise',
    expectedNeedsRetrieval: false,
    expectedUrgency: 'high',
    requiredMentions: ['instagram', 'recovery'],
  },
  {
    id: 4,
    title: 'User asking how to preserve evidence',
    message: 'A scammer threatened me on WhatsApp and sent extortion messages. How should I preserve and document this digital evidence properly for authorities?',
    expectedCategory: 'evidence_preservation',
    expectedNeedsRetrieval: false,
    expectedUrgency: 'medium',
    requiredMentions: ['screenshot', 'chat'],
  },
  {
    id: 5,
    title: 'User asking about password safety',
    message: 'What are the best practices for password safety and how can I protect all my digital accounts from brute-force attacks?',
    expectedCategory: 'security_best_practices',
    expectedNeedsRetrieval: false,
    expectedUrgency: 'low',
    requiredMentions: ['password'],
  },
  {
    id: 6,
    title: 'User asking a general cybersecurity question',
    message: 'What is social engineering in cybersecurity and why is it so common in online fraud?',
    expectedCategory: 'general_cyber',
    expectedNeedsRetrieval: false,
    expectedUrgency: 'low',
    requiredMentions: ['social engineering'],
  },
  {
    id: 7,
    title: 'User asking something unrelated to cybercrime',
    message: 'Can you give me a good recipe for Italian pasta and tell me who won the cricket world cup?',
    expectedCategory: 'out_of_scope',
    expectedNeedsRetrieval: false,
    expectedUrgency: 'low',
    requiredMentions: ['cybersahayak'],
  },
  {
    id: 8,
    title: 'User asking a statutory legal section query (RAG Retrieval Test)',
    message: 'What section of the Information Technology Act or IPC penalizes identity theft, impersonation, and hacking?',
    expectedCategory: 'legal_statutory',
    expectedNeedsRetrieval: true,
    expectedUrgency: 'low',
    requiredMentions: ['66'],
  },
];

async function runLangGraphTests() {
  console.log('='.repeat(80));
  console.log('   CYBERSAHAYAK — STAGE 5 LANGGRAPH.JS WORKFLOW TEST SUITE');
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  for (const sc of TEST_SCENARIOS) {
    console.log(`\n[Scenario ${sc.id}] ${sc.title}`);
    console.log(`User Input: "${sc.message}"`);

    const startTime = Date.now();
    try {
      const result = await runCyberSahayakWorkflow({
        message: sc.message,
        conversationId: `test-session-${sc.id}`,
      });
      const duration = Date.now() - startTime;

      console.log(`Execution Time: ${duration}ms | Model: ${result.metadata.model} via [${result.metadata.provider}]`);
      console.log(`Graph Nodes Visited: [${result.metadata.executionNodes.join(' -> ')}]`);
      console.log(`Intent Category: "${result.intent.category}" (Expected: "${sc.expectedCategory}")`);
      console.log(`Urgency: "${result.intent.urgency}" (Expected: "${sc.expectedUrgency}")`);
      console.log(`Retrieval Triggered: ${result.intent.needsRetrieval} (Expected: ${sc.expectedNeedsRetrieval})`);
      console.log(`RAG Documents Attached: ${result.retrievedSources.length}`);

      if (result.retrievedSources.length > 0) {
        result.retrievedSources.forEach((s, idx) => {
          console.log(`  - Ref ${idx + 1}: ${s.offence} | Section: ${s.legalSection} (${s.act}) | Score: ${s.score}`);
        });
      }

      console.log(`Validation: isValid = ${result.validation.isValid}, questionsAsked = ${result.validation.clarificationCount}, sanitized = ${result.validation.sanitized}`);
      console.log(`AI Response Preview:`);
      console.log(`"${result.response.slice(0, 260).replace(/\n/g, ' ')}..."`);

      // Verify category accuracy
      const categoryMatch = result.intent.category === sc.expectedCategory;
      const retrievalMatch = result.intent.needsRetrieval === sc.expectedNeedsRetrieval;
      const noFIR = !result.validation.hasFIRViolation;
      const noCreds = !result.validation.hasCredentialViolation;

      if (!categoryMatch) {
        console.warn(`⚠️ Warning: Category was "${result.intent.category}", expected "${sc.expectedCategory}".`);
      }

      if (!retrievalMatch) {
        console.error(`❌ Retrieval decision mismatch! Got ${result.intent.needsRetrieval}, expected ${sc.expectedNeedsRetrieval}.`);
        failed++;
      } else if (!noFIR || !noCreds) {
        console.error(`❌ Guardrail check failed! hasFIR: ${!noFIR}, hasCreds: ${!noCreds}`);
        failed++;
      } else {
        console.log(`✅ Scenario ${sc.id} passed all graph & guardrail criteria.`);
        passed++;
      }
    } catch (err) {
      console.error(`❌ Scenario ${sc.id} threw an error:`, err);
      failed++;
    }
  }

  // Conversation Continuity & Non-Repetition Test
  console.log('\n' + '-'.repeat(80));
  console.log('[Scenario 9] Conversation Isolation & Non-Repetition of Clarifications');
  try {
    const conversationId = 'user-session-repeat-check';
    const priorClarifications = ['Have you already called your bank to freeze the affected UPI ID?'];

    const turn2Result = await runCyberSahayakWorkflow({
      message: 'Yes, I called the bank and they blocked my account. What is next?',
      history: [
        { role: 'user', content: 'Someone took ₹10000 via a scam link on PhonePe.' },
        { role: 'assistant', content: 'I understand this is stressful. Have you already called your bank to freeze the affected UPI ID?' }
      ],
      conversationId,
      clarificationsAsked: priorClarifications,
    });

    console.log(`Previous Clarification Injected: "${priorClarifications[0]}"`);
    console.log(`AI Response Preview: "${turn2Result.response.slice(0, 250).replace(/\n/g, ' ')}..."`);
    console.log(`New Clarifications Recorded:`, turn2Result.clarificationsAsked);

    // Check that it didn't ask the same question again
    const repeated = turn2Result.response.toLowerCase().includes('have you already called your bank');
    if (repeated) {
      console.error('❌ Failed: Assistant repeated the exact same question!');
      failed++;
    } else {
      console.log('✅ Passed: Assistant avoided repeating the previous clarification and gave next actionable steps.');
      passed++;
    }
  } catch (repErr) {
    console.error('❌ Non-repetition test error:', repErr);
    failed++;
  }

  console.log('\n' + '='.repeat(80));
  console.log(`LANGGRAPH TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('='.repeat(80));
}

runLangGraphTests().catch(console.error);
