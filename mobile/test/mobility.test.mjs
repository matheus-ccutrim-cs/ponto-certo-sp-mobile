import assert from 'node:assert/strict';
import test from 'node:test';
import { flattenArrivals, qualifyingArrival, rankStops } from '../src/mobility.mjs';

test('ordena somente os pontos da busca por distância e mantém pontos sem coordenadas', () => {
  const position = { latitude: -23.56, longitude: -46.65 };
  const stops = [
    { cp: 1, py: -23.57, px: -46.65 },
    { cp: 2 },
    { cp: 3, py: -23.56, px: -46.65 }
  ];
  assert.deepEqual(rankStops(stops, null).map(item => item.cp), [1, 2, 3]);
  const ranked = rankStops(stops, position);
  assert.deepEqual(ranked.map(item => item.cp), [3, 1, 2]);
  assert.equal(ranked[0].distance, 0);
  assert.equal(ranked[2].distance, null);
});

test('avisa somente para a linha e o destino selecionados no limite escolhido', () => {
  const arrivals = flattenArrivals({ hr: '23:59', p: { l: [
    { c: '875A-10', lt0: 'Outro sentido', vs: [{ t: '00:01' }] },
    { c: '875A-10', lt0: 'Perdizes', vs: [{ t: '00:04' }] }
  ] } });
  const config = { line: '875A-10', destination: 'Perdizes', minutes: 5 };
  assert.equal(qualifyingArrival(arrivals, config).minutes, 5);
  assert.equal(qualifyingArrival(arrivals, { ...config, minutes: 3 }), undefined);
});
