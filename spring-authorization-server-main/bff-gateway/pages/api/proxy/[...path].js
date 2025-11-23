import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth-options';

const upstreamBaseUrl = process.env.UPSTREAM_API_BASE_URL ?? 'http://localhost:8100';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'not_authenticated' });
  }

  const targetPath = req.query.path?.join('/') ?? '';
  const searchParams = { ...req.query };
  delete searchParams.path;
  const qs = new URLSearchParams(searchParams).toString();
  const url = `${upstreamBaseUrl}/${targetPath}${qs ? `?${qs}` : ''}`;

  const headers = new Headers();
  headers.set('Authorization', `Bearer ${session.accessToken}`);
  if (req.headers['content-type']) {
    headers.set('Content-Type', req.headers['content-type']);
  }

  const body = ['GET', 'HEAD'].includes(req.method)
    ? undefined
    : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  const response = await fetch(url, {
    method: req.method,
    headers,
    body
  });

  const buffer = await response.arrayBuffer();
  res.status(response.status);
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'content-length') return;
    res.setHeader(key, value);
  });
  res.send(Buffer.from(buffer));
}

