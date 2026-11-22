/**
 * Supabase Database Helper Functions for CyberSahayak
 *
 * Implements persistent storage for user profiles, conversations, and messages.
 * All operations execute within RLS boundaries based on the authenticated session.
 */

/**
 * Fetch profile for a specific user ID
 */
export async function getUserProfile(supabase, userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('[DB] getUserProfile error:', error.message);
    return null;
  }
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(supabase, userId, updates) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('[DB] updateUserProfile error:', error.message);
    throw error;
  }
  return data;
}

/**
 * Fetch all conversations for the authenticated user, ordered by latest updated_at
 */
export async function getConversations(supabase) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      title,
      created_at,
      updated_at,
      messages (
        id,
        role,
        content,
        metadata,
        created_at
      )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[DB] getConversations error:', error.message);
    return [];
  }

  // Format into client-friendly structure
  return (data || []).map((conv) => ({
    id: conv.id,
    title: conv.title,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at,
    messages: (conv.messages || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.created_at,
        ragUsed: Boolean(m.metadata?.ragUsed),
        retrievedSources: m.metadata?.retrievedSources || [],
        intent: m.metadata?.intent || null,
        metadata: m.metadata || {},
      })),
    clarificationsAsked: [],
  }));
}

/**
 * Create a new conversation in Supabase
 */
export async function createConversation(supabase, { title, id }) {
  if (!supabase) throw new Error('Supabase client is required');
  const payload = {
    title: title || 'New Conversation',
  };
  if (id) {
    payload.id = id;
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[DB] createConversation error:', error.message);
    throw error;
  }
  return data;
}

/**
 * Rename an existing conversation
 */
export async function updateConversationTitle(supabase, conversationId, title) {
  if (!supabase || !conversationId) return null;
  const { data, error } = await supabase
    .from('conversations')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .select()
    .single();

  if (error) {
    console.error('[DB] updateConversationTitle error:', error.message);
    throw error;
  }
  return data;
}

/**
 * Delete a conversation (messages cascade delete in DB)
 */
export async function deleteConversation(supabase, conversationId) {
  if (!supabase || !conversationId) return false;
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('[DB] deleteConversation error:', error.message);
    throw error;
  }
  return true;
}

/**
 * Insert a single message into messages table
 */
export async function insertMessage(supabase, { conversationId, role, content, metadata = {}, id }) {
  if (!supabase || !conversationId || !role || !content) {
    throw new Error('Missing required message fields');
  }

  const payload = {
    conversation_id: conversationId,
    role,
    content,
    metadata,
  };
  if (id) {
    payload.id = id;
  }

  const { data, error } = await supabase
    .from('messages')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[DB] insertMessage error:', error.message);
    throw error;
  }

  // Also touch updated_at on parent conversation
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}
