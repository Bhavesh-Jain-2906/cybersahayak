import { NextResponse } from 'next/server';
import { generateCyberSahayakResponse } from '@/lib/llm/chatEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * CyberSahayak Conversational API Endpoint
 *
 * POST /api/chat
 * Payload:
 * {
 *   "message": "Someone sent me a fake electricity bill SMS with a link",
 *   "history": [
 *     { "role": "user", "content": "Hi" },
 *     { "role": "assistant", "content": "Hello, how can I assist you?" }
 *   ],
 *   "options": {
 *     "forceRag": false
 *   }
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

    const { message, history = [], options = {} } = body;

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

    // Validate history format if provided
    if (history && !Array.isArray(history)) {
      return NextResponse.json(
        {
          success: false,
          error: 'The "history" field must be an array of message objects { role, content }.',
        },
        { status: 400 }
      );
    }

    // 2. Invoke Chat Engine
    const result = await generateCyberSahayakResponse({
      message: trimmedMessage,
      history,
      options,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[API /api/chat] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred while processing your request.',
      },
      { status: 500 }
    );
  }
}
