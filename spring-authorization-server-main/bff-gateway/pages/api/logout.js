import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth-options';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get callback URL
  const callbackUrl = req.query.callbackUrl || process.env.REACT_CLIENT_URL || 'http://localhost:5173';

  // Clear NextAuth session by calling signout
  const signoutUrl = `/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  
  res.redirect(302, signoutUrl);
}
