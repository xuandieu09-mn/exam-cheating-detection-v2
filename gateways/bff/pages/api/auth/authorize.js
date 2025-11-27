/**
 * BFF Endpoint: Initiate OAuth2 Authorization Code Flow
 * Route: GET /api/auth/authorize
 * Purpose: Redirect to Authorization Server with PKCE parameters
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authServerExternalUrl = process.env.AUTH_SERVER_EXTERNAL_URL || 'http://localhost:9000';
  const clientId = process.env.OAUTH2_CLIENT_ID || 'react-test-client';

  const { state, code_challenge, redirect_uri } = req.query;

  if (!state || !code_challenge || !redirect_uri) {
    return res.status(400).json({
      error: 'Missing required parameters: state, code_challenge, redirect_uri'
    });
  }

  const scope = encodeURIComponent('openid profile exam.read exam.write');
  const authUrl = `${authServerExternalUrl}/oauth2/authorize?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `state=${state}&` +
    `code_challenge=${code_challenge}&` +
    `code_challenge_method=S256`;

  res.redirect(302, authUrl);
}
