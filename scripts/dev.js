import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import api from '../api/olho-vivo.js';
import { handleRequest } from '../lib/request.js';

const demo = process.argv.includes('--demo');
const port = Number(process.env.PORT || 3000);
const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/style.css', ['style.css', 'text/css']],
  ['/app.js', ['app.js', 'text/javascript']],
  ['/previsoes.js', ['previsoes.js', 'text/javascript']]
]);

const stops = [
  { cp: 101, py: -23.5613, px: -46.6561, np: 'Avenida Paulista', ed: 'Altura do nº 1578 · sentido Consolação' },
  { cp: 102, py: -23.5615, px: -46.6565, np: 'Avenida Paulista', ed: 'Altura do nº 1600 · sentido Paraíso' },
  { cp: 103, py: -23.5504, px: -46.6339, np: 'Praça da Sé', ed: 'Lado da Catedral' }
];

async function demoQuery(path, _, value) {
  if (path === '/Parada/Buscar') {
    return stops.filter(stop => (stop.np + ' ' + stop.ed).toLowerCase().includes(value.toLowerCase()));
  }
  const stop = stops.find(item => String(item.cp) === value);
  const lines = [
    { c: '875A-10', lt0: 'Perdizes', vs: [{ p: '11433', t: '10:21', a: true }] },
    { c: '107T-10', lt0: 'Metrô Tucuruvi', vs: [
      { p: '24578', t: '10:18', a: true },
      { p: '24579', t: '10:31', a: false }
    ] }
  ];
  return { hr: '10:15', p: stop ? { ...stop, l: stop.cp === 103 ? [] : lines } : null };
}

createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, 'http://localhost');
    if (url.pathname === '/api/olho-vivo') {
      const request = new Request(url, { method: incoming.method });
      const response = demo ? await handleRequest(request, demoQuery) : await api.fetch(request);
      const headers = Object.fromEntries(response.headers);
      if (demo) headers['X-Ponto-Certo-Demo'] = '1';
      outgoing.writeHead(response.status, headers).end(await response.text());
      return;
    }

    const asset = assets.get(url.pathname);
    if (!asset) {
      outgoing.writeHead(404).end('Arquivo não encontrado');
      return;
    }
    const [file, type] = asset;
    const html = await readFile(new URL('../public/' + file, import.meta.url));
    const body = demo && file === 'index.html'
      ? html.toString().replace('<body>', '<body data-demo="true">')
      : html;
    outgoing.writeHead(200, { 'Content-Type': type + '; charset=utf-8' }).end(body);
  } catch {
    outgoing.writeHead(500).end('Erro interno');
  }
}).listen(port, () => {
  console.log(`Ponto Certo SP${demo ? ' (simulação)' : ''} · http://localhost:${port}`);
});
