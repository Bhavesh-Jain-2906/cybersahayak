/**
 * CyberSahayak Supabase Multi-User Auth & RLS Verification Test
 *
 * Tests:
 * 1. User registration & authentication with email/password
 * 2. Profile auto-creation in `profiles` table
 * 3. User A creates a conversation & message
 * 4. User B registers & logs in
 * 5. User B fetches conversations -> User A's conversation is NOT visible (RLS Isolation)
 * 6. User B attempts to directly query/modify User A's conversation -> blocked by RLS
 * 7. Multi-user session persistence
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
try {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const k = trimmed.slice(0, eqIdx).trim();
        const v = trimmed.slice(eqIdx + 1).trim();
        process.env[k] = v;
      }
    }
  });
} catch (e) {
  // Ignore
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yearmzgvkelyyqbjctrj.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('FAIL: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
  process.exit(1);
}

const runId = Date.now();
const userA_email = `test_user_a_${runId}@gmail.com`;
const userA_pass = `Pass_A_${runId}!123`;
const userB_email = `test_user_b_${runId}@gmail.com`;
const userB_pass = `Pass_B_${runId}!123`;

async function runTests() {
  console.log('====================================================');
  console.log(' CyberSahayak Multi-User Auth & RLS Isolation Tests');
  console.log('====================================================\n');

  // Client A
  const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Client B
  const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // TEST 1: Register User A
  console.log('1. Registering User A:', userA_email);
  const { data: signUpA, error: errSignUpA } = await clientA.auth.signUp({
    email: userA_email,
    password: userA_pass,
    options: { data: { name: 'Inspector User A' } },
  });

  if (errSignUpA) {
    console.error('FAIL User A sign up:', errSignUpA.message);
    process.exit(1);
  }
  const userA_id = signUpA.user?.id;
  console.log('   User A registered with ID:', userA_id);

  // If session not returned directly (e.g. if confirmation is required), attempt signIn
  let tokenA = signUpA.session?.access_token;
  if (!tokenA) {
    console.log('   Attempting sign in for User A...');
    const { data: signInA, error: errSignInA } = await clientA.auth.signInWithPassword({
      email: userA_email,
      password: userA_pass,
    });
    if (errSignInA) {
      console.log('   Note: Email confirmation may be enabled on Supabase project:', errSignInA.message);
    } else {
      tokenA = signInA.session?.access_token;
    }
  }

  // TEST 2: Register User B
  console.log('\n2. Registering User B:', userB_email);
  const { data: signUpB, error: errSignUpB } = await clientB.auth.signUp({
    email: userB_email,
    password: userB_pass,
    options: { data: { name: 'Citizen User B' } },
  });

  if (errSignUpB) {
    console.error('FAIL User B sign up:', errSignUpB.message);
    process.exit(1);
  }
  const userB_id = signUpB.user?.id;
  console.log('   User B registered with ID:', userB_id);

  let tokenB = signUpB.session?.access_token;
  if (!tokenB) {
    console.log('   Attempting sign in for User B...');
    const { data: signInB, error: errSignInB } = await clientB.auth.signInWithPassword({
      email: userB_email,
      password: userB_pass,
    });
    if (errSignInB) {
      console.log('   Note: Email confirmation may be enabled on Supabase project:', errSignInB.message);
    } else {
      tokenB = signInB.session?.access_token;
    }
  }

  // If both users have active sessions, test database isolation
  if (tokenA && tokenB) {
    console.log('\n3. Testing Database CRUD with User A session...');
    // Create conversation as User A
    const { data: convA, error: errConvA } = await clientA
      .from('conversations')
      .insert([
        {
          user_id: userA_id,
          title: 'User A Private Fraud Inquiry',
        },
      ])
      .select()
      .single();

    if (errConvA) {
      console.error('FAIL: User A conversation creation:', errConvA.message);
    } else {
      console.log('   User A created conversation:', convA.id, '-', convA.title);

      // Insert message as User A
      const { data: msgA, error: errMsgA } = await clientA
        .from('messages')
        .insert([
          {
            conversation_id: convA.id,
            role: 'user',
            content: 'Confidential message: Someone phished my credentials.',
          },
        ])
        .select()
        .single();

      if (errMsgA) {
        console.error('FAIL: User A message insertion:', errMsgA.message);
      } else {
        console.log('   User A inserted message:', msgA.id);
      }

      // TEST 4: User B queries conversations
      console.log('\n4. Verifying RLS Isolation: User B querying conversations...');
      const { data: convsForB, error: errConvsForB } = await clientB
        .from('conversations')
        .select('*');

      console.log(`   User B sees ${convsForB ? convsForB.length : 0} conversations.`);
      const leakedConv = (convsForB || []).find((c) => c.id === convA.id);
      if (leakedConv) {
        console.error('FAIL: RLS LEAK! User B can see User A conversation!');
      } else {
        console.log('   PASS: User A conversation is completely invisible to User B!');
      }

      // TEST 5: User B direct access attempt to User A's conversation
      console.log("\n5. Testing Direct Attack: User B querying User A's conversation directly by ID...");
      const { data: directAccess, error: errDirect } = await clientB
        .from('conversations')
        .select('*')
        .eq('id', convA.id);

      if (directAccess && directAccess.length > 0) {
        console.error("FAIL: User B bypassed RLS and read User A's conversation!");
      } else {
        console.log("   PASS: Direct query returned 0 rows! RLS correctly blocked access.");
      }

      // TEST 6: User B attempts to read User A's messages directly
      console.log("\n6. Testing Message Access: User B querying User A's messages directly...");
      const { data: msgsForB, error: errMsgsB } = await clientB
        .from('messages')
        .select('*')
        .eq('conversation_id', convA.id);

      if (msgsForB && msgsForB.length > 0) {
        console.error("FAIL: User B read User A's messages!");
      } else {
        console.log("   PASS: 0 messages returned. Messages are strictly protected via parent conversation ownership.");
      }

      // TEST 7: User B attempts to delete User A's conversation
      console.log("\n7. Testing Delete Tampering: User B attempting to delete User A's conversation...");
      const { data: deleteAttempt, error: errDelete } = await clientB
        .from('conversations')
        .delete()
        .eq('id', convA.id)
        .select();

      if (deleteAttempt && deleteAttempt.length > 0) {
        console.error("FAIL: User B was able to delete User A's conversation!");
      } else {
        console.log("   PASS: Delete was blocked by RLS. 0 rows affected.");
      }

      // Verify conversation still exists for User A
      const { data: verifyA } = await clientA
        .from('conversations')
        .select('*')
        .eq('id', convA.id);
      if (verifyA && verifyA.length === 1) {
        console.log("   PASS: User A's conversation is intact.");
      }

      // Clean up test data
      await clientA.from('conversations').delete().eq('id', convA.id);
      console.log('\n   Cleaned up test conversation.');
    }
  }

  console.log('\n====================================================');
  console.log(' Supabase Multi-User & RLS Test Suite Completed!');
  console.log('====================================================');
}

runTests().catch(console.error);
