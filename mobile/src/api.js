const endpoint = process.env.EXPO_PUBLIC_API_URL
  || 'https://ponto-certo-sp.vercel.app/api/olho-vivo';

async function query(params) {
  const url = endpoint + '?' + new URLSearchParams(params).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha na consulta.');
    return { data, demo: response.headers.get('X-Ponto-Certo-Demo') === '1' };
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('A consulta demorou. Tente novamente.');
    if (error instanceof SyntaxError || error instanceof TypeError) {
      throw new Error('Sem conexão com o serviço. Confira sua internet e tente novamente.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export const searchStops = term => query({ acao: 'buscar', termo: term });
export const getArrivals = stop => query({ acao: 'previsao', ponto: String(stop) });
