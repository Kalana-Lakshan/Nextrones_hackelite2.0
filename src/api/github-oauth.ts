// Serverless API route for exchanging GitHub OAuth code for access token
// Place your GitHub client ID and client secret in environment variables

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  const client_id = process.env.VITE_GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    return res.status(500).json({ error: 'Missing GitHub client credentials' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });
    const data = await response.json();
    if (data.error) {
      return res.status(400).json({ error: data.error_description });
    }
    return res.status(200).json({ access_token: data.access_token });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch access token' });
  }
}
