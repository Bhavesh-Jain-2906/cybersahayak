import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const GMAIL_REGEX = /^[^\s@]+@(gmail|googlemail)\.com$/i;

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required on the server.');
  }

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabaseEphemeralClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
  }

  return createSupabaseClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function findRegisteredUserByEmail(adminClient, cleanEmail) {
  // Fast lookup via profiles table first
  const { data: profileRow } = await adminClient
    .from('profiles')
    .select('id, name, email')
    .ilike('email', cleanEmail)
    .maybeSingle();

  if (profileRow?.id) {
    return {
      id: profileRow.id,
      email: profileRow.email,
      name: profileRow.name || '',
    };
  }

  // Fallback bounded scan of Supabase Auth users in case profile row wasn't created yet
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;

    const match = data.users.find((u) => (u.email || '').toLowerCase() === cleanEmail);
    if (match) {
      return {
        id: match.id,
        email: match.email,
        name: match.user_metadata?.full_name || match.user_metadata?.name || '',
      };
    }

    if (data.users.length < 200) break;
  }

  return null;
}
