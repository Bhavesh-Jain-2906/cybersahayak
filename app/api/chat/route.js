import { NextResponse } from 'next/server';
import { runCyberSahayakWorkflow } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CyberSahayak LangGraph Conversational API Endpoint
 *
 * POST /api/chat
 * Payload:
 * {
 *   "message": "Someone sent me a fake electricity bill SMS with a link",
 *   "history": [
 *     { "role": "user", "content": "Hi" },
 *     { "role": "assistant", "content": "Hello, how can I assist you?" }
 *   ],
 *   "conversationId": "chat-12345",
 *   "clarificationsAsked": ["Did you click the link?"]
 * }
 */
export async function POST(req) {
  try {
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

    // 1. Input Validation
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

    // Sanitize and bound history array to prevent payload exhaustion
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

    // Sanitize conversation identifier
    const safeConvId = typeof conversationId === 'string' && conversationId.trim()
      ? conversationId.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100)
      : 'session-' + Date.now();

    // 2. Execute LangGraph.js Workflow
    const result = await runCyberSahayakWorkflow({
      message: trimmedMessage,
      history: sanitizedHistory,
      conversationId: safeConvId,
      clarificationsAsked: sanitizedClarifications,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[API /api/chat] LangGraph Error:', error);
    // Sanitize error response: do not expose internal stack traces or raw API key details
    const safeErrorMessage = error?.message && !error.message.includes('apiKey') && !error.message.includes('sk-')
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
