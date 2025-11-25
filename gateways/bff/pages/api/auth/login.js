export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Prefer callbackUrl passed from the client (so SPA origin/port is accurate).
  // If not provided, try the request `Origin` or `Referer` header before falling back
  // to environment configuration. This helps when the SPA is running on 5174.
  const fromClient = req.query && req.query.callbackUrl;
  const headerOrigin = req.headers && (req.headers.origin || req.headers.referer);
  const reactClientUrl = fromClient || headerOrigin || process.env.REACT_CLIENT_URL || 'http://localhost:5174';

  const callbackUrl = typeof reactClientUrl === 'string' ? reactClientUrl : `${reactClientUrl}/`;
  res.redirect(302, `/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}
