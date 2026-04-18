import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const workflowId = process.env.OPENAI_WORKFLOW_ID;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY.' }, { status: 500 });
  }

  if (!workflowId) {
    return NextResponse.json({ error: 'Missing OPENAI_WORKFLOW_ID.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body?.userId === 'string' && body.userId.trim() ? body.userId.trim() : crypto.randomUUID();

  try {
    const session = await client.beta.chatkit.sessions.create({
      workflow: { id: workflowId },
      user: userId,
    });

    return NextResponse.json({
      client_secret: session.client_secret,
      expires_at: session.expires_at,
      userId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create ChatKit session.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
