const base = 'https://api.olhovivo.sptrans.com.br/v2.1';

export function createOlhoVivo(token, fetcher = fetch) {
  let session;
  let authenticating;

  async function authenticate() {
    const url = new URL(base + '/Login/Autenticar');
    url.searchParams.set('token', token);
    const response = await fetcher(url, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok || await response.json() !== true) {
      throw new Error('Autenticação recusada pela SPTrans.');
    }
    const cookies = response.headers.getSetCookie()
      .map(cookie => cookie.split(';', 1)[0]).join('; ');
    if (!cookies) throw new Error('A SPTrans não retornou um cookie de sessão.');
    session = cookies;
    return cookies;
  }

  function getSession() {
    if (session) return session;
    authenticating ??= authenticate().finally(() => { authenticating = undefined; });
    return authenticating;
  }

  return async function query(path, parameter, value) {
    const url = new URL(base + path);
    url.searchParams.set(parameter, value);
    const request = cookie => fetcher(url, {
      headers: { Cookie: cookie, Accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(8000)
    });

    const cookie = await getSession();
    let response = await request(cookie);
    if (response.status === 401 || response.status === 403) {
      if (session === cookie) session = undefined;
      response = await request(await getSession());
    }
    if (!response.ok) throw new Error('Falha na consulta à SPTrans.');
    return response.json();
  };
}
