export async function handleRequest(request, query) {
  const send = (body, status = 200) => Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
  if (request.method !== 'GET') return send({ error: 'Método não permitido.' }, 405);

  const params = new URL(request.url).searchParams;
  const action = params.get('acao');
  const term = params.get('termo')?.trim() ?? '';
  const stop = params.get('ponto') ?? '';
  let args;

  if (action === 'buscar' && term.length >= 2 && term.length <= 100) {
    args = ['/Parada/Buscar', 'termosBusca', term];
  } else if (action === 'previsao' && /^[1-9]\d{0,9}$/.test(stop)) {
    args = ['/Previsao/Parada', 'codigoParada', stop];
  } else {
    return send({ error: 'Informe uma busca ou um código de ponto válido.' }, 400);
  }

  if (!query) return send({ error: 'A integração com a SPTrans aguarda configuração.' }, 503);

  try {
    const data = await query(...args);
    if (action === 'buscar' && !Array.isArray(data)) throw new Error();
    if (action === 'previsao' && (!data || typeof data.hr !== 'string' || !('p' in data))) {
      throw new Error();
    }
    return send(data);
  } catch {
    return send({ error: 'Falha na consulta ao Olho Vivo. Tente novamente em instantes.' }, 502);
  }
}
