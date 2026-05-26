// lillytech proxy v2
export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: 'API key no configurada' } }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    try {
      const body = await request.text();

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body,
      });

      return new Response(response.body, {
        status: response.status,
        headers: {
          ...corsHeaders(),
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
        },
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: { message: err.message } }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
