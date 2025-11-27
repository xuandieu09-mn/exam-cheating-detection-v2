/**
 * BFF Endpoint: Exchange Authorization Code for Token
 * Route: POST /api/auth/token
 * Purpose: Proxy token requests to Authorization Server
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authServerUrl = process.env.AUTH_SERVER_URL || 'http://authorization-server:9000';
  const clientId = process.env.OAUTH2_CLIENT_ID || 'react-test-client';
  const { TokenRepository } = require('../../../lib/token-repository');
  if (!global.__tokenExchangeInflight) global.__tokenExchangeInflight = new Map();

  try {
    const { grant_type, code, redirect_uri, code_verifier, refresh_token } = req.body;

    if (!grant_type) {
      return res.status(400).json({ error: 'Missing grant_type' });
    }

    const params = new URLSearchParams();
    params.append('grant_type', grant_type);
    params.append('client_id', clientId);

    if (grant_type === 'authorization_code') {
      if (!code || !redirect_uri || !code_verifier) {
        return res.status(400).json({
          error: 'Missing required parameters for authorization_code grant'
        });
      }
      params.append('code', code);
      params.append('redirect_uri', redirect_uri);
      params.append('code_verifier', code_verifier);
    } else if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({ error: 'Missing refresh_token' });
      }
      params.append('refresh_token', refresh_token);
    } else {
      return res.status(400).json({ error: 'Unsupported grant_type' });
    }

    if (grant_type === 'authorization_code' && code) {
      if (global.__tokenExchangeInflight.has(code)) {
        console.log('[Token] Reusing in-flight token exchange for code', code);
        const cached = await global.__tokenExchangeInflight.get(code);
        return res.status(cached.status).json(cached.data);
      }
    }

    console.log('[Token] Exchanging token, grant_type=', grant_type, 'using clientId=', clientId);
    const response = await fetch(`${authServerUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (grant_type === 'authorization_code' && code) {
      global.__tokenExchangeInflight.set(code, { status: response.status, data });
      setTimeout(() => global.__tokenExchangeInflight.delete(code), 30 * 1000);
    }

    if (!response.ok) {
      console.error('Token exchange failed:', data);
      return res.status(response.status).json(data);
    }

    try {
      const refreshToken = data.refresh_token;
      const tokenToDecode = data.access_token || data.id_token;
      if (refreshToken && tokenToDecode) {
        const parts = tokenToDecode.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          if (payload && payload.sub) {
            await TokenRepository.saveRefreshToken(payload.sub, refreshToken);
            console.log('[Token] Saved refresh token for user', payload.sub);
          } else {
            console.warn('[Token] Could not find sub in token payload; refresh token not saved');
          }
        } else {
          console.warn('[Token] Token to decode is not a JWT; skipping refresh token storage');
        }
      }
    } catch (err) {
      console.error('[Token] Failed to store refresh token server-side:', err);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Token endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
