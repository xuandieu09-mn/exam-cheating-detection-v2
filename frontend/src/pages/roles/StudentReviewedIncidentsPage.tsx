import React, { useEffect, useState } from 'react';
import { listIncidents } from '../../api/client';
import type { IncidentResponse } from '../../api/types';
import { useAppState } from '../../state/AppStateContext';
import LoadingSpinner from '../../ui/LoadingSpinner';

const StudentReviewedIncidentsPage: React.FC = () => {
  const [data, setData] = useState<IncidentResponse[]>([]);
  const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
  const { state } = useAppState();

  useEffect(() => {
  const sessionId = state.sessionId;
  if (!sessionId) { setStatus('Chưa có session. Hãy bắt đầu thi.'); return; }
    (async () => {
      try {
          setStatus('');
          setLoading(true);
        const list = await listIncidents(sessionId);
        setData(list.filter(i => i.status === 'CONFIRMED' || i.status === 'REJECTED'));
        setStatus('');
      } catch (e: any) {
        setStatus(e?.response?.data?.detail || e.message);
        } finally {
          setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Incidents đã được duyệt</h2>
      {status && <div style={{ marginBottom: 12, color: '#555' }}>{status}</div>}
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>ID</th>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Thời điểm</th>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Loại</th>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Điểm</th>
              <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Kết quả duyệt</th>
            </tr>
          </thead>
          <tbody>
            {data.map(r => (
              <tr key={r.id}>
                <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.id}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{new Date(r.ts).toLocaleString()}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.type}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.score != null ? (r.score * 100).toFixed(2) + '%' : '-'}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.status}</td>
              </tr>
            ))}
              {loading && (
                <tr>
                  <td colSpan={5} style={{ padding: 12, textAlign: 'center' }}><LoadingSpinner /></td>
                </tr>
              )}
            {data.length === 0 && !status && (
              <tr>
                <td colSpan={5} style={{ padding: 12, color: '#777' }}>Không có bản ghi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentReviewedIncidentsPage;
