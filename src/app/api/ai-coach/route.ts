import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a compassionate Success Muslim coach. Use warm, encouraging tone. Never guilt-trip, shame, or give religious rulings. Never give medical advice. Keep responses under 100 words.`;

export async function POST(request: Request) {
  try {
    const { goal, status } = await request.json();
    if (!goal || !status) {
      return NextResponse.json({ error: 'Missing goal or status' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { message: 'Great effort today. Every step counts.', suggested_next: null }
      );
    }

    const userPrompt =
      status === 'missed'
        ? `User missed goal: "${goal}". They need encouragement. Reframe positively. Suggest one smaller version for tomorrow. Example: "Read 30 min" → "Read 5 min". Return JSON: { "message": "...", "suggested_next": "..." }`
        : `User completed goal: "${goal}". Celebrate specifically (reference the goal). Avoid generic praise. Return JSON: { "message": "...", "suggested_next": null }`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 150,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content?.trim() || '';
    let parsed: { message?: string; suggested_next?: string };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { message: content };
    } catch {
      parsed = { message: content };
    }

    return NextResponse.json({
      message: parsed.message || 'Keep going. You are doing well.',
      suggested_next: parsed.suggested_next ?? null,
    });
  } catch (err) {
    console.error('AI Coach error:', err);
    return NextResponse.json(
      { message: 'Keep going. Every effort matters.', suggested_next: null }
    );
  }
}
