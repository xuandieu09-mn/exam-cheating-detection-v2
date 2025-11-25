/**
 * BFF Endpoint: Revoke OAuth2 Token
 * Route: POST /api/auth/revoke
 * Purpose: Revoke access or refresh tokens
 */
import { TokenRepository } from '../../../lib/token-repository';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authServerUrl = process.env.AUTH_SERVER_URL || 'http://authorization-server:9000';
  const clientId = process.env.OAUTH2_CLIENT_ID || 'react-test-client';

  try {
    const { token, token_type_hint } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Missing token' });
    }

    const params = new URLSearchParams();
    params.append('token', token);
    params.append('client_id', clientId);

    if (token_type_hint) {
      params.append('token_type_hint', token_type_hint);
    }

    const response = await fetch(`${authServerUrl}/oauth2/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (response.ok || response.status === 200) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          if (payload && payload.sub) {
            await TokenRepository.deleteRefreshToken(payload.sub).catch(err => {
              console.warn('[Revoke] Failed to delete refresh token for user', payload.sub, err);
            });
            console.log('[Revoke] Deleted stored refresh token for user', payload.sub);
          }
        }
      } catch (e) {
      }

      return res.status(200).json({ success: true });
    }

    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Token revoke error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
