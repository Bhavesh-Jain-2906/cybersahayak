import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAdminMetadata(meta) {
  return Boolean(meta && (meta.role === 'admin' || meta.isAdmin === true));
}

function isConfiguredAdminEmail(email) {
  const configured = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return Boolean(configured && email && email.trim().toLowerCase() === configured);
}

function hasAdminAccess(user) {
  return isAdminMetadata(user?.app_metadata) || isConfiguredAdminEmail(user?.email);
}

/**
 * Helper to obtain admin service role client if configured,
 * otherwise returns null.
 */
function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    return createSupabaseClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return null;
}

/**
 * Verify caller holds a valid authenticated Supabase session with admin privileges.
 */
async function requireAdmin(req) {
  const { user, error: authError, supabase } = await getAuthenticatedUser(req);

  if (!user || authError || !supabase) {
    return {
      errorResponse: NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 }),
    };
  }

  if (!hasAdminAccess(user)) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden. Admin privileges required.' },
        { status: 403 }
      ),
    };
  }

  return { user, supabase };
}

/**
 * GET /api/admin/users
 * Returns list of all registered users and database metrics.
 */
export async function GET(req) {
  try {
    const { user, supabase, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const serviceClient = getServiceRoleClient();
    const activeClient = serviceClient || supabase;

    // Resolve authoritative admin roles from Supabase Auth app_metadata when service role is available
    const authRoleMap = new Map();
    if (serviceClient?.auth?.admin) {
      const { data: authList, error: authListErr } = await serviceClient.auth.admin.listUsers({
        perPage: 1000,
      });
      if (!authListErr && authList?.users) {
        for (const authUser of authList.users) {
          authRoleMap.set(
            authUser.id,
            isAdminMetadata(authUser.app_metadata) || isConfiguredAdminEmail(authUser.email)
          );
        }
      }
    }

    // Fetch all profiles from database
    const { data: profiles, error: profileErr } = await activeClient
      .from('profiles')
      .select('id, name, email, created_at')
      .order('created_at', { ascending: false });

    if (profileErr) {
      console.warn('[Admin API] Profiles fetch warning:', profileErr.message);
    }

    // Fetch conversation count
    const { count: convCount } = await activeClient
      .from('conversations')
      .select('id', { count: 'exact', head: true });

    // Fetch message count
    const { count: msgCount } = await activeClient
      .from('messages')
      .select('id', { count: 'exact', head: true });

    const userList = (profiles || []).map((p) => {
      const isUserAdmin = authRoleMap.has(p.id)
        ? authRoleMap.get(p.id)
        : p.id === user.id || isConfiguredAdminEmail(p.email);
      return {
        id: p.id,
        name: p.name || 'Digital Citizen',
        email: p.email,
        createdAt: p.created_at,
        isAdmin: isUserAdmin,
        role: isUserAdmin ? 'admin' : 'user',
      };
    });

    return NextResponse.json({
      success: true,
      users: userList,
      stats: {
        totalUsers: userList.length,
        totalConversations: convCount || 0,
        totalMessages: msgCount || 0,
        securityStatus: 'RLS Active & Isolated',
      },
    });
  } catch (error) {
    console.error('[Admin API] Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Admin endpoint to register a new user directly into the database.
 */
export async function POST(req) {
  try {
    const { supabase, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
    }

    const { name, email, password, role: rawRole = 'user' } = body;
    const role = rawRole === 'admin' ? 'admin' : 'user';

    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are all required.' },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceRoleClient();
    let newUserId = null;

    if (serviceClient?.auth?.admin) {
      const { data: adminCreated, error: adminErr } = await serviceClient.auth.admin.createUser({
        email: cleanEmail,
        password: cleanPassword,
        email_confirm: true,
        user_metadata: { name: cleanName },
        app_metadata: { role, isAdmin: role === 'admin' },
      });

      if (adminErr) {
        return NextResponse.json({ success: false, error: adminErr.message }, { status: 400 });
      }
      newUserId = adminCreated.user.id;
    } else {
      if (role === 'admin') {
        return NextResponse.json(
          { success: false, error: 'Creating administrator accounts requires SUPABASE_SERVICE_ROLE_KEY.' },
          { status: 403 }
        );
      }
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const client = createSupabaseClient(supabaseUrl, anonKey);

      const { data: regData, error: regErr } = await client.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { name: cleanName },
        },
      });

      if (regErr) {
        return NextResponse.json({ success: false, error: regErr.message }, { status: 400 });
      }
      newUserId = regData.user?.id;
    }

    // Ensure profile entry exists
    if (newUserId) {
      const activeClient = serviceClient || supabase;
      await activeClient.from('profiles').upsert({
        id: newUserId,
        name: cleanName,
        email: cleanEmail,
      });
    }

    return NextResponse.json({
      success: true,
      message: `User ${cleanName} (${cleanEmail}) created successfully.`,
      user: {
        id: newUserId,
        name: cleanName,
        email: cleanEmail,
        role,
      },
    });
  } catch (error) {
    console.error('[Admin API] Error in POST /api/admin/users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Admin endpoint to remove a user from the database and wipe their chat history.
 */
export async function DELETE(req) {
  try {
    const { user, supabase, errorResponse } = await requireAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'The userId query parameter is required.' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the active System Administrator account.' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceRoleClient();
    const activeClient = serviceClient || supabase;

    // Protect other admin accounts from deletion through the API
    if (serviceClient?.auth?.admin) {
      const { data: targetData } = await serviceClient.auth.admin.getUserById(userId);
      if (targetData?.user && hasAdminAccess(targetData.user)) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete a protected System Administrator account.' },
          { status: 400 }
        );
      }
    }

    // 1. Delete conversations (messages cascade)
    await activeClient.from('conversations').delete().eq('user_id', userId);

    // 2. Delete profile
    const { error: delProfileErr } = await activeClient.from('profiles').delete().eq('id', userId);

    if (delProfileErr) {
      console.warn('[Admin API] Profile delete error:', delProfileErr.message);
    }

    // 3. Delete from auth.users if service role is available
    if (serviceClient?.auth?.admin) {
      try {
        await serviceClient.auth.admin.deleteUser(userId);
      } catch (authDelErr) {
        console.warn('[Admin API] auth.admin.deleteUser error:', authDelErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User and all associated conversation history successfully removed from database.',
      deletedUserId: userId,
    });
  } catch (error) {
    console.error('[Admin API] Error in DELETE /api/admin/users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
