import useSWR from 'swr';

const fetcher = (url) => fetch(url, { credentials: 'include' }).then((res) => res.json());

export default function HomePage() {
  const { data } = useSWR('/api/session', fetcher, { suspense: false });

  return (
    <main style={{ fontFamily: 'system-ui', padding: '2rem' }}>
      <h1>Exam Platform BFF</h1>
      <p>This Next.js instance provides login + API proxy capabilities via NextAuth.</p>
      <section style={{ marginTop: '2rem' }}>
        <h2>Session Snapshot</h2>
        <pre style={{ background: '#111', color: '#0f0', padding: '1rem', borderRadius: 8 }}>
          {JSON.stringify(data ?? { status: 'anonymous' }, null, 2)}
        </pre>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <a href="/api/auth/signin" style={{ marginRight: '1rem' }}>Sign In</a>
        <a href="/api/auth/signout">Sign Out</a>
      </section>
    </main>
  );
}

