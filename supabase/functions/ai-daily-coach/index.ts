import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SYSTEM_PROMPT = `You are a compassionate Success Muslim coach. Use warm, encouraging tone. Never guilt-trip, shame, or give religious rulings. Never give medical advice. Keep responses under 100 words.`;

interface RequestBody {
  goal: string;
  status: 'done' | 'missed';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { goal, status } = (await req.json()) as RequestBody;
    if (!goal || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing goal or status' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          message: 'Great effort today. Every step counts.',
          suggested_next: null,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt =
      status === 'missed'
        ? `User missed goal: "${goal}". They need encouragement. Reframe positively. Suggest one smaller version for tomorrow. Example: "Read 30 min" -> "Read 5 min". Return JSON: { "message": "...", "suggested_next": "..." }`
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

    return new Response(
      JSON.stringify({
        message: parsed.message || 'Keep going. You are doing well.',
        suggested_next: parsed.suggested_next ?? null,
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err) {
    console.error('AI Coach error:', err);
    return new Response(
      JSON.stringify({
        message: 'Keep going. Every effort matters.',
        suggested_next: null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
