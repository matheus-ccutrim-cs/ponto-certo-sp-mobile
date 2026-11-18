import { flattenArrivals } from './previsoes.js';

const get = id => document.getElementById(id);
const searchForm = get('search');
const termInput = get('term');
const resultsList = get('results');
const favoritesList = get('favorites');
const title = get('arrivals-title');
const stopAddress = get('stop-address');
const favoriteButton = get('favorite');
const refreshButton = get('refresh');
const accessFilter = get('accessible');
const arrivalStatus = get('arrival-status');
const arrivalsList = get('arrivals');
const demo = document.body.dataset.demo === 'true';
const favoritesKey = demo ? 'ponto-certo-demo' : 'ponto-certo-favoritos';
const refreshMs = 30_000;

let results = [];
let favorites = readFavorites();
let selected;
let prediction;
let searchRequest;
let predictionRequest;
let refreshTimer;

get('demo').hidden = !demo;

function readFavorites() {
  try {
    const stored = JSON.parse(localStorage.getItem(favoritesKey));
    return Array.isArray(stored) ? stored.filter(stop => stop?.cp && stop?.np) : [];
  } catch {
    return [];
  }
}

async function api(params, signal) {
  const response = await fetch('/api/olho-vivo?' + new URLSearchParams(params), { signal });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function renderStops(list, stops) {
  list.replaceChildren(...stops.map(stop => {
    const item = document.createElement('li');
    const button = element('button', stop.np, 'stop');
    button.type = 'button';
    button.setAttribute('aria-current', String(stop.cp === selected?.cp));
    button.append(element('small', [stop.ed, 'Ponto ' + stop.cp].filter(Boolean).join(' · ')));
    button.addEventListener('click', () => selectStop(stop));
    item.append(button);
    return item;
  }));
}

function renderFavorites(message) {
  renderStops(favoritesList, favorites);
  get('favorites-status').textContent = message ??
    (favorites.length ? '' : 'Salve os pontos que você consulta com frequência.');
  const saved = favorites.some(stop => stop.cp === selected?.cp);
  favoriteButton.textContent = saved ? 'Remover dos salvos' : 'Salvar ponto';
  favoriteButton.setAttribute('aria-pressed', String(saved));
}

function selectStop(stop) {
  selected = stop;
  prediction = undefined;
  title.textContent = stop.np;
  title.focus();
  stopAddress.textContent = [stop.ed, 'Ponto ' + stop.cp].filter(Boolean).join(' · ');
  stopAddress.hidden = false;
  favoriteButton.hidden = false;
  get('controls').hidden = false;
  renderStops(resultsList, results);
  renderFavorites();
  arrivalsList.replaceChildren();
  updateArrivals();
}

searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  const term = termInput.value.trim();
  if (term.length < 2) {
    get('search-status').textContent = 'Digite pelo menos dois caracteres.';
    termInput.focus();
    return;
  }
  searchRequest?.abort();
  const controller = new AbortController();
  searchRequest = controller;
  results = [];
  renderStops(resultsList, results);
  get('search-status').textContent = 'Buscando pontos…';
  try {
    const stops = await api({ acao: 'buscar', termo: term }, controller.signal);
    if (controller !== searchRequest) return;
    results = stops;
    renderStops(resultsList, results);
    get('search-status').textContent = results.length
      ? `${results.length} ${results.length === 1 ? 'ponto encontrado' : 'pontos encontrados'}. Selecione um.`
      : 'Nenhum ponto encontrado. Tente outro nome ou endereço.';
  } catch (error) {
    if (!controller.signal.aborted) get('search-status').textContent = error.message;
  }
});

favoriteButton.addEventListener('click', () => {
  const saved = favorites.some(stop => stop.cp === selected.cp);
  const next = saved ? favorites.filter(stop => stop.cp !== selected.cp) : [...favorites, selected];
  try {
    localStorage.setItem(favoritesKey, JSON.stringify(next));
    favorites = next;
    renderFavorites(saved ? 'Ponto removido.' : 'Ponto salvo.');
  } catch {
    renderFavorites('O navegador impediu a gravação dos pontos salvos.');
  }
});

function renderArrivals() {
  if (!prediction) return;
  const all = flattenArrivals(prediction);
  const arrivals = accessFilter.checked ? all.filter(row => row.accessible) : all;
  const reference = `Referência SPTrans: ${prediction.hr} · atualização a cada 30 s.`;
  arrivalStatus.textContent = arrivals.length ? reference
    : `${all.length ? 'Nenhum veículo acessível previsto.' : 'Sem chegadas previstas para este ponto.'} ${reference}`;
  arrivalsList.replaceChildren(...arrivals.map(row => {
    const item = element('li', '', 'arrival');
    const bus = document.createElement('div');
    bus.append(element('strong', row.line + ' · ' + row.destination));
    bus.append(element('small', row.accessible ? 'Veículo acessível' : 'Acessibilidade não indicada'));
    const eta = element('div', '', 'eta');
    eta.append(element('strong', row.minutes ? `${row.minutes} min` : 'Agora'));
    eta.append(element('small', row.time));
    item.append(bus, eta);
    return item;
  }));
}

async function updateArrivals() {
  clearTimeout(refreshTimer);
  predictionRequest?.abort();
  const controller = new AbortController();
  predictionRequest = controller;
  refreshButton.disabled = true;
  if (!prediction) arrivalStatus.textContent = 'Consultando as próximas chegadas…';
  try {
    const data = await api({ acao: 'previsao', ponto: selected.cp }, controller.signal);
    if (controller !== predictionRequest) return;
    prediction = data;
    renderArrivals();
  } catch (error) {
    if (controller.signal.aborted) return;
    prediction = undefined;
    arrivalsList.replaceChildren();
    arrivalStatus.textContent = error.message + ' Nova tentativa em 30 s.';
  } finally {
    if (controller === predictionRequest) {
      refreshButton.disabled = false;
      refreshTimer = setTimeout(updateArrivals, refreshMs);
    }
  }
}

refreshButton.addEventListener('click', updateArrivals);
accessFilter.addEventListener('change', renderArrivals);
renderFavorites();
