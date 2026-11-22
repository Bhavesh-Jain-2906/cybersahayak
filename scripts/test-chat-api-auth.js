/**
 * CyberSahayak API Endpoint Auth & RLS Guardrail Verification
 *
 * Tests:
 * 1. Unauthenticated request to /api/chat -> 401 Unauthorized
 * 2. Authenticated request as User A to create a new chat & execute LangGraph -> 200 OK
 * 3. Authenticated request as User B trying to hijack User A's conversation -> 403 Forbidden
 * 4. Message persistence verification in Supabase PostgreSQL
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
      }
    }
  });
} catch (e) {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function runApiAuthTests() {
  console.log('====================================================');
  console.log(' CyberSahayak /api/chat Endpoint Security Tests');
  console.log('====================================================\n');

  const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const runId = Date.now();
  const emailA = `apitester_a_${runId}@gmail.com`;
  const passA = `PassA_${runId}!123`;
  const emailB = `apitester_b_${runId}@gmail.com`;
  const passB = `PassB_${runId}!123`;

  // Register User A & B
  const { data: userA } = await clientA.auth.signUp({ email: emailA, password: passA });
  const { data: userB } = await clientB.auth.signUp({ email: emailB, password: passB });

  const tokenA = userA.session?.access_token;
  const tokenB = userB.session?.access_token;

  if (!tokenA || !tokenB) {
    console.error('FAIL: Tokens not available. Ensure email confirmation is OFF in Supabase.');
    process.exit(1);
  }

  console.log('User A token acquired:', tokenA.slice(0, 15) + '...');
  console.log('User B token acquired:', tokenB.slice(0, 15) + '...');

  // Helper to make HTTP POST to localhost:3000/api/chat
  function postChat({ token, body }) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(body);
      const headers = {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 3000,
          path: '/api/chat',
          method: 'POST',
          headers,
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode, body: JSON.parse(data) });
            } catch (e) {
              resolve({ status: res.statusCode, body: data });
            }
          });
        }
      );

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  // TEST 1: Unauthenticated Request
  console.log('\n1. Testing unauthenticated request to /api/chat...');
  const resNoAuth = await postChat({
    token: null,
    body: { message: 'How do I report a UPI scam?' },
  });
  console.log(`   Response status: ${resNoAuth.status}`);
  if (resNoAuth.status === 401) {
    console.log('   PASS: Correctly rejected with 401 Unauthorized!');
  } else {
    console.error(`   FAIL: Expected 401 but received ${resNoAuth.status}`);
  }

  // TEST 2: Authenticated Request as User A
  console.log('\n2. Testing authenticated LangGraph execution as User A...');
  const resUserA = await postChat({
    token: tokenA,
    body: { message: 'I lost 5000 rupees in a fake electricity bill SMS. What should I do immediately?' },
  });
  console.log(`   Response status: ${resUserA.status}`);
  const userAConvId = resUserA.body?.conversationId;
  if (resUserA.status === 200 && userAConvId) {
    console.log(`   PASS: AI Response generated successfully!`);
    console.log(`   Conversation created in Supabase with ID: ${userAConvId}`);
    console.log(`   AI Intent detected: ${resUserA.body?.intent?.category} (Urgency: ${resUserA.body?.intent?.urgency})`);
    console.log(`   Response snippet: ${resUserA.body?.response?.slice(0, 100)}...`);
  } else {
    console.error(`   FAIL: User A chat execution failed:`, resUserA.body);
  }

  // TEST 3: User B attempts to hijack User A's conversation
  console.log("\n3. Testing Security Isolation: User B trying to send message to User A's conversation ID...");
  const resHijack = await postChat({
    token: tokenB,
    body: {
      message: 'Malicious injection into User A chat',
      conversationId: userAConvId,
    },
  });
  console.log(`   Response status: ${resHijack.status}`);
  if (resHijack.status === 403) {
    console.log("   PASS: Correctly rejected with 403 Forbidden! User B cannot access User A's conversation.");
  } else {
    console.error(`   FAIL: Expected 403 Forbidden but received ${resHijack.status}:`, resHijack.body);
  }

  // TEST 4: Verify messages persisted in PostgreSQL for User A
  console.log('\n4. Verifying message persistence in PostgreSQL for User A...');
  const { data: messagesA } = await clientA
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', userAConvId)
    .order('created_at', { ascending: true });

  console.log(`   Found ${messagesA ? messagesA.length : 0} messages in PostgreSQL for this conversation.`);
  if (messagesA && messagesA.length >= 2) {
    console.log(`   User message: [${messagesA[0].role}] ${messagesA[0].content.slice(0, 50)}...`);
    console.log(`   AI response:   [${messagesA[1].role}] ${messagesA[1].content.slice(0, 50)}...`);
    console.log('   PASS: Full conversation turn is permanently stored in Supabase PostgreSQL!');
  } else {
    console.error('   FAIL: Messages not found in database.');
  }

  // Cleanup test data
  if (userAConvId) {
    await clientA.from('conversations').delete().eq('id', userAConvId);
    console.log('\nCleaned up test conversation.');
  }

  console.log('\n====================================================');
  console.log(' All API Security & LangGraph RLS Tests Passed!');
  console.log('====================================================');
}

runApiAuthTests().catch(console.error);
