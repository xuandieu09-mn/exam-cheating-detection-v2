import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth-options";
import { TokenRepository } from "../../lib/token-repository";
import { encode } from "next-auth/jwt";

export default async function handler(req, res) {
  // Disable caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  const session = await getServerSession(req, res, authOptions);
  
  const reactClientUrl = process.env.REACT_CLIENT_URL || "http://localhost:5173";
  
  if (session?.user?.id) {
    console.log("[Logout] Revoking refresh token for user:", session.user.id);
    await TokenRepository.deleteRefreshToken(session.user.id);
  } else {
    console.log("[Logout] No active session found");
  }

  const cookieOptions = 'Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax';
  const cookiesList = [
    `next-auth.session-token=; ${cookieOptions}`,
    `next-auth.csrf-token=; ${cookieOptions}`,
    `next-auth.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`,
  ];

  if (process.env.NODE_ENV === 'production') {
    cookiesList.push(`__Secure-next-auth.session-token=; ${cookieOptions}; Secure`);
    cookiesList.push(`__Host-next-auth.csrf-token=; ${cookieOptions}; Secure`);
  }
  
  res.setHeader('Set-Cookie', cookiesList);

  console.log("[Logout] Session cleared, redirecting to Authorization Server logout");

  const authServerIssuer = process.env.AUTH_SERVER_ISSUER || "http://localhost:9000";
  const logoutUrl = `${authServerIssuer}/custom-logout?redirect_uri=${encodeURIComponent(reactClientUrl)}`;
  
  console.log("[Logout] Redirecting to:", logoutUrl);
  res.redirect(302, logoutUrl);
}