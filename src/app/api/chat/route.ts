import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, chatId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const auth = req.headers.get('authorization');
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(`${BACKEND_URL}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': auth },
      body: JSON.stringify({ message, chatId }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ success: false, error: data.message || `API error (${response.status})` }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      reply: data.data?.assistantMessage?.content || '',
      chatId: data.data?.chatId || null,
    });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ success: false, error: 'Request timed out. Please try again.' }, { status: 504 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Something went wrong' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const url = id ? `${BACKEND_URL}/chat/${id}` : `${BACKEND_URL}/chat/history`;
    const response = await fetch(url, {
      headers: { 'Authorization': auth },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ success: false, error: data.message || 'Failed to fetch' }, { status: response.status });
    }
    return NextResponse.json({ success: true, data: data.data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Something went wrong' }, { status: 500 });
  }
}
