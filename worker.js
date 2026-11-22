const TARGET = 'https://www.mshalasova.cz/jidelnicek/';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (url.pathname !== '/api/menu') {
      return new Response('Jídelníček API běží. Použijte cestu /api/menu.', {
        status: 200,
        headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    try {
      const upstream = await fetch(TARGET, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MS-Halasova-Menu/1.0)' },
        cf: { cacheTtl: 300, cacheEverything: true }
      });
      if (!upstream.ok) {
        return new Response('Web školky vrátil HTTP ' + upstream.status, {
          status: 502, headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
      let html = await upstream.text();
      if (!html || html.length < 500) {
        return new Response('Web školky vrátil prázdný nebo neúplný obsah.', {
          status: 502, headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
      // Odstranění skriptů a stylů už na serveru: aplikace tak nikdy nezobrazí jejich kód jako jídlo.
      html = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');

      return new Response(html, {
        status: 200,
        headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' }
      });
    } catch (error) {
      return new Response('Chyba při načítání webu školky: ' + error.message, {
        status: 502, headers: { ...cors, 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  }
};
