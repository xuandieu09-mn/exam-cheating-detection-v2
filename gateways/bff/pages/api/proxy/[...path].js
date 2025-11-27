import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth-options';

const userServiceUrl = process.env.UPSTREAM_API_BASE_URL ?? 'http://localhost:8100';
const sessionServiceUrl = process.env.SESSION_SERVICE_URL ?? 'http://localhost:8081';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'not_authenticated' });
  }

  const pathParts = req.query.path || [];
  const targetPath = pathParts.join('/');

  // Determine upstream service based on path prefix
  let upstreamUrl = userServiceUrl;
  const firstSegment = pathParts[0];

  if (['sessions', 'ingest', 'incidents'].includes(firstSegment)) {
    upstreamUrl = sessionServiceUrl;
  } else if (firstSegment === 'api' && ['exams', 'sessions'].includes(pathParts[1])) {
    // Route api/exams and api/sessions to session service
    upstreamUrl = sessionServiceUrl;
  } else if (firstSegment === 'admin' && ['exams', 'stats'].includes(pathParts[1])) {
    // Route admin/exams and admin/stats to session service
    upstreamUrl = sessionServiceUrl;
  }

  const searchParams = { ...req.query };
  delete searchParams.path;
  const qs = new URLSearchParams(searchParams).toString();
  const url = `${upstreamUrl}/${targetPath}${qs ? `?${qs}` : ''}`;

  const headers = new Headers();
  headers.set('Authorization', `Bearer ${session.accessToken}`);
  if (req.headers['content-type']) {
    headers.set('Content-Type', req.headers['content-type']);
  }

  const body = ['GET', 'HEAD'].includes(req.method)
    ? undefined
    : typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  try {
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
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({ error: 'bad_gateway' });
  }
}

