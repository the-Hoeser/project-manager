export default async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { client_id, device_code, grant_type } = await request.json();
    if (!client_id || !device_code) return Response.json({ error: 'Missing client_id or device_code' }, { status: 400 });
    const params = new URLSearchParams({
      client_id,
      device_code,
      grant_type: grant_type || 'urn:ietf:params:oauth:grant-type:device_code'
    });
    const upstream = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    const data = await upstream.json();
    return Response.json(data, { status: upstream.status });
  } catch (error) {
    return Response.json({ error: 'Token polling request failed', detail: String(error) }, { status: 502 });
  }
};
