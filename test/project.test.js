import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createOlhoVivo } from '../lib/olho-vivo.js';
import { handleRequest } from '../lib/request.js';
import { flattenArrivals } from '../public/previsoes.js';

test('encaminha apenas operações válidas e informa configuração ausente', async () => {
  const route = 'http://localhost/api/olho-vivo?';
  const invalid = await handleRequest(new Request(route + 'acao=previsao&ponto=abc'), null);
  assert.equal(invalid.status, 400);
  const missing = await handleRequest(new Request(route + 'acao=previsao&ponto=123'), null);
  assert.equal(missing.status, 503);
  const valid = await handleRequest(new Request(route + 'acao=buscar&termo=Pra%C3%A7a'), async (...args) => {
    assert.deepEqual(args, ['/Parada/Buscar', 'termosBusca', 'Praça']);
    return [{ cp: 103, np: 'Praça da Sé' }];
  });
  assert.equal(valid.status, 200);
  assert.deepEqual(await valid.json(), [{ cp: 103, np: 'Praça da Sé' }]);
});

test('envia os cookies e autentica novamente após expiração', async () => {
  let authentications = 0;
  let calls = 0;
  const query = createOlhoVivo('token de teste', async (url, options) => {
    if (options.method === 'POST') {
      authentications += 1;
      assert.equal(url.searchParams.get('token'), 'token de teste');
      const headers = new Headers();
      headers.append('Set-Cookie', 'session=' + authentications + '; Path=/');
      headers.append('Set-Cookie', 'route=upstream; Path=/');
      return Response.json(true, { headers });
    }
    calls += 1;
    assert.equal(url.searchParams.get('codigoParada'), '100');
    assert.equal(options.headers.Cookie, 'session=' + authentications + '; route=upstream');
    return calls === 2 ? new Response(null, { status: 401 }) : Response.json({ hr: '10:15', p: null });
  });
  await query('/Previsao/Parada', 'codigoParada', '100');
  await query('/Previsao/Parada', 'codigoParada', '100');
  assert.equal(authentications, 2);
  assert.equal(calls, 3);
});

test('ordena por chegada, interpreta meia-noite e mantém acessibilidade', () => {
  const arrivals = flattenArrivals({ hr: '23:58', p: { l: [
    { c: '1234-10', lt0: 'Destino', vs: [
      { t: '00:05', a: false }, { t: '23:59', a: true }, { t: '99:00', a: true }
    ] }
  ] } });
  assert.deepEqual(arrivals.map(row => row.minutes), [1, 7]);
  assert.deepEqual(arrivals.map(row => row.accessible), [true, false]);
  assert.deepEqual(flattenArrivals({ hr: '12:00', p: null }), []);
});
