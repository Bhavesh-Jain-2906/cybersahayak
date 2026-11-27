/**
 * Manage Supabase Admin role assignment and credentials locally without storing secrets in code.
 *
 * Usage:
 *   node scripts/set-admin.js --email <email> [--password <new-password>] [--name <display-name>] [--revoke]
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or environment.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

function loadEnvLocal() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
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
  } catch {}
}

function parseArgs(argv) {
  const args = { revoke: false };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--email' && argv[i + 1]) {
      args.email = argv[++i].trim().toLowerCase();
    } else if (token === '--password' && argv[i + 1]) {
      args.password = argv[++i];
    } else if (token === '--name' && argv[i + 1]) {
      args.name = argv[++i].trim();
    } else if (token === '--revoke') {
      args.revoke = true;
    }
  }
  return args;
}

async function main() {
  loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));

  if (!args.email) {
    console.error(
      'Usage: node scripts/set-admin.js --email <email> [--password <password>] [--name <name>] [--revoke]'
    );
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment/.env.local.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) {
    console.error('Failed to query Supabase users:', listErr.message);
    process.exit(1);
  }

  const existing = (listData?.users || []).find(
    (u) => (u.email || '').toLowerCase() === args.email
  );

  const nextAppMeta = args.revoke
    ? { role: 'user', isAdmin: false }
    : { role: 'admin', isAdmin: true };

  if (existing) {
    const updatePayload = {
      app_metadata: { ...(existing.app_metadata || {}), ...nextAppMeta },
      email_confirm: true,
    };
    if (args.password) {
      if (args.password.length < 6) {
        console.error('Password must be at least 6 characters.');
        process.exit(1);
      }
      updatePayload.password = args.password;
    }
    if (args.name) {
      updatePayload.user_metadata = { ...(existing.user_metadata || {}), name: args.name };
    }

    const { error: updErr } = await supabase.auth.admin.updateUserById(existing.id, updatePayload);
    if (updErr) {
      console.error('Failed to update user:', updErr.message);
      process.exit(1);
    }

    console.log(
      `${args.revoke ? 'Revoked' : 'Granted'} admin role for ${args.email} (ID: ${existing.id}).`
    );
    return;
  }

  if (args.revoke) {
    console.error(`User ${args.email} does not exist.`);
    process.exit(1);
  }

  if (!args.password || args.password.length < 6) {
    console.error('Account does not exist yet. Provide --password (min 6 characters) to create it.');
    process.exit(1);
  }

  const displayName = args.name || 'System Administrator';
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: args.email,
    password: args.password,
    email_confirm: true,
    user_metadata: { name: displayName },
    app_metadata: nextAppMeta,
  });

  if (createErr) {
    console.error('Failed to create admin user:', createErr.message);
    process.exit(1);
  }

  await supabase.from('profiles').upsert({
    id: created.user.id,
    name: displayName,
    email: args.email,
  });

  console.log(`Created admin user ${args.email} (ID: ${created.user.id}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
