// ============================================================
// LillyTech — Anthropic API Proxy (Cloudflare Worker)
// ============================================================
// Instrucciones de deploy:
// 1. Ve a https://workers.cloudflare.com → Sign up / Log in
// 2. Create a Worker → pega este código
// 3. En Settings → Variables → agrega: ANTHROPIC_API_KEY = sk-ant-...
// 4. Deploy → copia la URL del Worker (ej: my-proxy.username.workers.dev)
// 5. En el HTML de LillyTech cambia la URL del fetch a la del Worker
// ============================================================

export default {
  async fetch(request, env) {

    // ── CORS preflight ──────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // ── Solo POST permitido ─────────────────────────────────
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
    }

    // ── API key desde variable de entorno ───────────────────
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: 'API key no configurada en el Worker' } }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }

    // ── Reenviar el request a Anthropic ────────────────────
    try {
      const body = await request.text();

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         apiKey,
          'anthropic-version': '2023-06-01',
        },
        body,
      });

      // Streaming: pasar la respuesta tal cual
      const headers = {
        ...corsHeaders(),
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      };

      return new Response(response.body, {
        status:  response.status,
        headers,
      });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: { message: err.message } }),
        { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      );
    }
  },
};

// ── Cabeceras CORS ──────────────────────────────────────────
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
