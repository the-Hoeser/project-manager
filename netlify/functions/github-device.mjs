export default async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { client_id, scope } = await request.json();
    if (!client_id) return Response.json({ error: 'Missing client_id' }, { status: 400 });
    const params = new URLSearchParams({ client_id, scope: scope || 'gist,read:user' });
    const upstream = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await upstream.json();
    return Response.json(data, { status: upstream.status });
  } catch (error) {
    return Response.json({ error: 'Device authorization request failed', detail: String(error) }, { status: 502 });
  }
};
