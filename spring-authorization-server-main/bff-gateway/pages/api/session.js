import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth-options';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(200).json({ status: 'anonymous' });
  }
  return res.status(200).json({
    status: 'authenticated',
    user: session.user,
    error: session.error
  });
}

