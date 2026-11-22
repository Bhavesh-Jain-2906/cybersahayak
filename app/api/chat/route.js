import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { runCyberSahayakWorkflow } from '@/lib/graph';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CyberSahayak LangGraph Conversational API Endpoint with Supabase Auth & RLS
 *
 * POST /api/chat
 * Payload:
 * {
 *   "message": "Someone sent me a fake electricity bill SMS with a link",
 *   "history": [
 *     { "role": "user", "content": "Hi" },
 *     { "role": "assistant", "content": "Hello, how can I assist you?" }
 *   ],
 *   "conversationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
 *   "clarificationsAsked": ["Did you click the link?"]
 * }
 */
export async function POST(req) {
  try {
    // 1. Authenticate User via Server-Side Supabase Session / JWT
    const { user, error: authError, supabase } = await getAuthenticatedUser(req);

    if (!user || authError || !supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized. Please sign in to CyberSahayak to access the AI assistant.',
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body. Expected JSON object with a "message" field.',
        },
        { status: 400 }
      );
    }

    const { message, history = [], conversationId, clarificationsAsked = [] } = body;

    // 2. Input Validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'The "message" field is required and must be a non-empty string.',
        },
        { status: 400 }
      );
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length > 4000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message exceeds maximum allowed character length of 4000 characters.',
        },
        { status: 400 }
      );
    }

    if (history && !Array.isArray(history)) {
      return NextResponse.json(
        {
          success: false,
          error: 'The "history" field must be an array of message objects { role, content }.',
        },
        { status: 400 }
      );
    }

    // Sanitize history array
    const sanitizedHistory = (Array.isArray(history) ? history : [])
      .slice(-20)
      .filter((m) => m && typeof m === 'object' && typeof m.content === 'string')
      .map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content.slice(0, 4000),
      }));

    // Sanitize clarifications list
    const sanitizedClarifications = (Array.isArray(clarificationsAsked) ? clarificationsAsked : [])
      .filter((q) => typeof q === 'string' && q.trim().length > 0)
      .slice(-15);

    // 3. Conversation Ownership & Thread Isolation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let targetConvId = typeof conversationId === 'string' && uuidRegex.test(conversationId.trim())
      ? conversationId.trim()
      : null;

    // If conversation ID is provided, verify ownership in Supabase
    if (targetConvId) {
      const { data: existingConv, error: fetchErr } = await supabase
        .from('conversations')
        .select('id, user_id, title')
        .eq('id', targetConvId)
        .maybeSingle();

      if (fetchErr) {
        console.error('[API /api/chat] Error checking conversation:', fetchErr.message);
      }

      if (existingConv) {
        // Enforce strict user isolation: User cannot access another user's conversation
        if (existingConv.user_id !== user.id) {
          return NextResponse.json(
            {
              success: false,
              error: 'Forbidden. You do not have permission to access or modify this conversation.',
            },
            { status: 403 }
          );
        }
      } else {
        // ID provided but not in DB yet: create it for this user
        const newTitle = trimmedMessage.length > 34
          ? trimmedMessage.slice(0, 34) + '...'
          : trimmedMessage;

        const { data: createdConv, error: createErr } = await supabase
          .from('conversations')
          .insert([
            {
              id: targetConvId,
              user_id: user.id,
              title: newTitle,
            },
          ])
          .select('id')
          .single();

        if (createErr) {
          console.error('[API /api/chat] Error creating initial conversation:', createErr.message);
        } else if (createdConv) {
          targetConvId = createdConv.id;
        }
      }
    } else {
      // No valid UUID conversation provided: generate a new one
      targetConvId = crypto.randomUUID();
      const newTitle = trimmedMessage.length > 34
        ? trimmedMessage.slice(0, 34) + '...'
        : trimmedMessage;

      const { data: createdConv, error: createErr } = await supabase
        .from('conversations')
        .insert([
          {
            id: targetConvId,
            user_id: user.id,
            title: newTitle,
          },
        ])
        .select('id')
        .single();

      if (createErr) {
        console.error('[API /api/chat] Error auto-generating conversation:', createErr.message);
      }
    }

    // 4. Save User Message in PostgreSQL
    const { data: savedUserMsg } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: targetConvId,
          role: 'user',
          content: trimmedMessage,
          metadata: {},
        },
      ])
      .select('id, created_at')
      .single();

    // 5. Execute LangGraph.js Workflow with thread isolation
    const result = await runCyberSahayakWorkflow({
      message: trimmedMessage,
      history: sanitizedHistory,
      conversationId: targetConvId,
      clarificationsAsked: sanitizedClarifications,
    });

    // 6. Save Assistant Response in PostgreSQL
    const assistantMetadata = {
      ragUsed: Boolean(result.ragUsed),
      retrievedSources: result.retrievedSources || [],
      intent: result.intent,
      clarificationsAsked: result.clarificationsAsked || [],
      metadata: result.metadata || {},
    };

    const { data: savedAssistantMsg } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: targetConvId,
          role: 'assistant',
          content: result.response,
          metadata: assistantMetadata,
        },
      ])
      .select('id, created_at')
      .single();

    // 7. Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetConvId);

    return NextResponse.json(
      {
        ...result,
        conversationId: targetConvId,
        userMessageId: savedUserMsg?.id || null,
        assistantMessageId: savedAssistantMsg?.id || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API /api/chat] LangGraph Error:', error);
    const safeErrorMessage =
      error?.message && !error.message.includes('apiKey') && !error.message.includes('sk-')
        ? error.message
        : 'An unexpected error occurred while processing your request. Please try again.';

    return NextResponse.json(
      {
        success: false,
        error: safeErrorMessage,
      },
      { status: 500 }
    );
  }
}
