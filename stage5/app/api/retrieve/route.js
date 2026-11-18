import { NextResponse } from 'next/server';
import { retrieveLegalContext, formatRetrievedContext } from '@/lib/rag/retriever';

/**
 * API Route Handler for RAG Knowledge Base Semantic Retrieval.
 * Usage: POST /api/retrieve
 * Body: { "query": "someone hacked my account", "topK": 3 }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { query, topK = 3, minScore = 0.15 } = body || {};

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required.' },
        { status: 400 }
      );
    }

    const trimmed = query.trim();
    const results = await retrieveLegalContext(trimmed, {
      topK: Math.min(Math.max(topK, 1), 10),
      minScore,
    });

    const formattedContext = formatRetrievedContext(results);

    return NextResponse.json({
      success: true,
      query: trimmed,
      count: results.length,
      results,
      formattedContext,
    });
  } catch (error) {
    console.error('Retrieval API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error during knowledge retrieval.',
      },
      { status: 500 }
    );
  }
}
