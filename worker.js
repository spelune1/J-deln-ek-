const TARGET = 'https://www.mshalasova.cz/jidelnicek/';

export default {
  async fetch(request) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300'
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers });
    if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers });
    try {
      const upstream = await fetch(TARGET, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MenuReader/1.0)' },
        cf: { cacheTtl: 300, cacheEverything: true }
      });
      if (!upstream.ok) return new Response('Web školky vrátil HTTP ' + upstream.status, { status: 502, headers });
      const html = await upstream.text();
      if (!html || html.length < 500) return new Response('Web školky vrátil prázdný nebo neúplný obsah.', { status: 502, headers });
      return new Response(html, { status: 200, headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8' } });
    } catch (error) {
      return new Response('Chyba při načítání webu školky: ' + error.message, { status: 502, headers });
    }
  }
};
