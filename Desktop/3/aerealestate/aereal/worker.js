export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // === CORS HEADERS (Update this to your real domain later) ===
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://agx1.silversurfacebkk.workers.dev',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // === HANDLE CORS PREFlight ===
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // === IMAGE UPLOAD ENDPOINT ===
    if (url.pathname === '/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || !(file instanceof File)) {
          return new Response(JSON.stringify({ error: 'No file uploaded' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const key = `listings/${crypto.randomUUID()}-${file.name}`;
        await env.LISTING_IMAGES.put(key, file.stream(), {
          httpMetadata: { contentType: file.type },
        });

        const optimizedBase = `https://imagedelivery.net/${env.IMAGES.account_id}/${key}/public`;

        return new Response(JSON.stringify({
          success: true,
          key,
          url: optimizedBase,
          full: `${optimizedBase}?width=1920&quality=90&format=avif`,
          large: `${optimizedBase}?width=1200&quality=85&format=webp`,
          thumbnail: `${optimizedBase}?width=600&quality=80&format=webp`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: 'Upload failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // === YOUR ORIGINAL AI ENDPOINT (ALL POSTS EXCEPT /upload) ===
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { prompt, context, type } = await request.json();

      if (typeof prompt !== 'string' || !prompt.trim()) {
        return new Response(JSON.stringify({ error: "Prompt is required." }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const personas = {
        agent: `You are Alex, an elite AI real estate consultant. Be sophisticated, warm, and concise. Current context: ${context || 'No listing selected'}`,
        writer: `You are a world-class luxury real estate copywriter. Use evocative, aspirational language with words like "bespoke", "timeless", "panoramic", "curated", "masterpiece".`,
      };
      const systemPrompt = personas[type] || "You are a helpful assistant.";

      const cacheKey = `ai:${type || 'general'}:${prompt}`;
      const cache = caches.default;
      const cached = await cache.match(cacheKey);
      if (cached) return cached;

      const aiResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-medium-latest',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`Mistral API Error: ${await aiResponse.text()}`);
      }

      const data = await aiResponse.json();
      const reply = data.choices[0]?.message?.content?.trim() || "No response generated.";

      const response = new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;

    } catch (error) {
      console.error("Worker Error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  },
};