/**
 * Connor Admin Role & User Management Verification
 *
 * Reads credentials strictly from environment variables (never hardcoded):
 *   TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD
 *
 * Tests:
 * 1. Admin login using configured test admin credentials
 * 2. Regular user blocked from Admin API -> 403 Forbidden
 * 3. Regular user attempting client-side user_metadata escalation is still blocked -> 403 Forbidden
 * 4. Admin calls GET /api/admin/users -> 200 OK + user metrics
 * 5. Admin calls POST /api/admin/users to register a user directly in database
 * 6. Verify created user can log in
 * 7. Admin calls DELETE /api/admin/users to remove user and wipe their records
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
        const key = trimmed.slice(0, eqIdx).trim();
        if (!process.env[key]) {
          process.env[key] = trimmed.slice(eqIdx + 1).trim();
        }
      }
    }
  });
} catch (e) {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

async function runAdminTests() {
  console.log('====================================================');
  console.log(' Connor Admin Role & User Management Tests');
  console.log('====================================================\n');

  if (!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD) {
    console.error(
      'Missing TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD environment variables.\n' +
      'Provide them at runtime (not in source control) to execute this verification script.'
    );
    process.exit(1);
  }

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  // 1. Test Admin Login
  console.log('1. Testing Admin Authentication...');
  const { data: adminLogin, error: adminErr } = await client.auth.signInWithPassword({
    email: TEST_ADMIN_EMAIL,
    password: TEST_ADMIN_PASSWORD,
  });

  if (adminErr || !adminLogin.session) {
    console.error('FAIL: Admin login failed:', adminErr?.message);
    process.exit(1);
  }
  const adminToken = adminLogin.session.access_token;
  console.log('   PASS: Admin successfully authenticated.');

  // 2. Register a temporary citizen user to test non-admin access
  const runId = Date.now();
  const citizenEmail = `citizen_${runId}@gmail.com`;
  const citizenPass = `Pass_${runId}!123`;
  const { data: citizenLogin } = await client.auth.signUp({
    email: citizenEmail,
    password: citizenPass,
    options: { data: { name: 'Normal Citizen', role: 'admin' } },
  });
  const citizenToken = citizenLogin.session?.access_token;

  function callAdminApi({ method, token, pathSuffix = '', body = null }) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (payload) headers['Content-Length'] = Buffer.byteLength(payload);

      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: 3000,
          path: '/api/admin/users' + pathSuffix,
          method,
          headers,
        },
        (res) => {
          let data = '';
          res.on('data', (c) => (data += c));
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
      if (payload) req.write(payload);
      req.end();
    });
  }

  // TEST 2: Regular user (even claiming role:'admin' in self-writable user_metadata) is blocked
  console.log('\n2. Testing Access Control: Non-admin calling GET /api/admin/users...');
  const resForbidden = await callAdminApi({ method: 'GET', token: citizenToken });
  console.log(`   Response status: ${resForbidden.status}`);
  if (resForbidden.status === 403) {
    console.log('   PASS: Correctly rejected with 403 Forbidden!');
  } else {
    console.error(`   FAIL: Expected 403 but got ${resForbidden.status}`);
    process.exit(1);
  }

  // TEST 3: Admin calls GET /api/admin/users
  console.log('\n3. Testing Admin privilege: Admin calling GET /api/admin/users...');
  const resAdminGet = await callAdminApi({ method: 'GET', token: adminToken });
  console.log(`   Response status: ${resAdminGet.status}`);
  if (resAdminGet.status === 200 && resAdminGet.body?.success) {
    console.log(`   PASS: Admin retrieved user list! Total users: ${resAdminGet.body.users.length}`);
  } else {
    console.error('   FAIL: Admin GET failed:', resAdminGet.body);
    process.exit(1);
  }

  // TEST 4: Admin creates a new user via POST /api/admin/users
  const targetEmail = `added_by_admin_${runId}@gmail.com`;
  const targetPassword = `Created_${runId}!`;
  console.log(`\n4. Testing Admin adding a new user (${targetEmail})...`);
  const resAddUser = await callAdminApi({
    method: 'POST',
    token: adminToken,
    body: {
      name: 'Ramesh AdminCreated',
      email: targetEmail,
      password: targetPassword,
      role: 'user',
    },
  });
  console.log(`   Response status: ${resAddUser.status}`);
  const createdUserId = resAddUser.body?.user?.id;
  if (resAddUser.status === 200 && createdUserId) {
    console.log(`   PASS: User created successfully with ID: ${createdUserId}`);

    console.log('\n5. Verifying new user can log in...');
    const { data: newLogin, error: newLoginErr } = await client.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });
    if (newLogin?.session) {
      console.log('   PASS: Newly created user authenticated successfully!');
    } else {
      console.error('   FAIL: New user login failed:', newLoginErr?.message);
    }

    console.log(`\n6. Removing temporary test user (${createdUserId})...`);
    const resDelUser = await callAdminApi({
      method: 'DELETE',
      token: adminToken,
      pathSuffix: `?userId=${encodeURIComponent(createdUserId)}`,
    });
    console.log(`   Response status: ${resDelUser.status}`);
  } else {
    console.error('   FAIL: Admin user creation failed:', resAddUser.body);
  }

  if (citizenLogin?.user?.id) {
    await callAdminApi({
      method: 'DELETE',
      token: adminToken,
      pathSuffix: `?userId=${encodeURIComponent(citizenLogin.user.id)}`,
    });
  }

  console.log('\n====================================================');
  console.log(' Admin Role & Management Tests Completed!');
  console.log('====================================================');
}

runAdminTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
