import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth-options';
import { TokenRepository } from '../../../lib/token-repository';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (session?.user?.id) {
      console.log(`[Logout] Revoking tokens for user ${session.user.id}`);
      await TokenRepository.deleteRefreshToken(session.user.id);
    }

    const sessionCookieName = process.env.BFF_SESSION_COOKIE || 'next-auth.session-token';

    res.setHeader('Set-Cookie', [
      `${sessionCookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
      `${sessionCookieName}.sig=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
    ]);

    const reactClientUrl = process.env.REACT_CLIENT_URL || 'http://localhost:5174';
    const authServerUrl = process.env.AUTH_SERVER_ISSUER || 'http://localhost:9000';
    const postLogoutRedirectUri = `${reactClientUrl}/login`;

    const authServerLogoutUrl = `${authServerUrl}/logout?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`;

    console.log(`[Logout] Redirecting to Authorization Server logout: ${authServerLogoutUrl}`);

    return res.status(200).json({
      success: true,
      redirectUrl: authServerLogoutUrl
    });
  } catch (error) {
    console.error('[Logout] Error during logout:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
}
