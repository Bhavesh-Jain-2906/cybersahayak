import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a server-side Supabase client using Next.js 14 App Router cookie store.
 */
export function createClient() {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server component invocation warning can be ignored
        }
      },
    },
  });
}

/**
 * Authenticate request using Bearer JWT header or session cookies.
 * Returns the authenticated user, error (if any), and an authenticated supabase client instance.
 *
 * @param {Request} req
 * @returns {Promise<{ user: Object|null, error: Object|null, supabase: Object|null }>}
 */
export async function getAuthenticatedUser(req) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { user: null, error: new Error('Supabase not configured'), supabase: null };
  }

  // 1. Check Bearer token from Authorization header if present
  let authHeader = '';
  if (req && req.headers) {
    authHeader = req.headers.get('authorization') || '';
  }

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const tokenClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      const { data: { user }, error } = await tokenClient.auth.getUser(token);
      if (user && !error) {
        return { user, error: null, supabase: tokenClient };
      }
    }
  }

  // 2. Check session from cookies
  try {
    const cookieClient = createClient();
    const { data: { user }, error } = await cookieClient.auth.getUser();
    if (user && !error) {
      return { user, error: null, supabase: cookieClient };
    }
    return { user: null, error: error || new Error('Unauthenticated'), supabase: cookieClient };
  } catch (err) {
    return { user: null, error: err, supabase: null };
  }
}
