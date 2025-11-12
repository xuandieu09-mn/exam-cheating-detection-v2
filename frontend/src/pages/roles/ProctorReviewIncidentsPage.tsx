import React, { useEffect, useState } from 'react';
import { listIncidents, createReview } from '../../api/client';
import type { IncidentResponse, ReviewStatus } from '../../api/types';
import LoadingSpinner from '../../ui/LoadingSpinner';

const adminReviewer: string = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const ProctorReviewIncidentsPage: React.FC = () => {
  const [rows, setRows] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const list = await listIncidents(); // all incidents
      setRows(list.filter(i => i.status === 'OPEN'));
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, status: ReviewStatus) => {
    try {
      await createReview({ incidentId: id, reviewerId: adminReviewer, status, note: status === 'CONFIRMED' ? 'Valid' : 'False positive' });
      setRows(prev => prev.filter(i => i.id !== id)); // optimistic remove from OPEN list
    } catch (e: any) {
      alert(e?.response?.data?.detail || e.message);
    }
  };

  return (
    <div>
      <h2>Duyệt incidents</h2>
      {error && <div style={{ color: '#c00', marginBottom: 12 }}>Lỗi: {error}</div>}
      <table style={{ width: '100%', background: '#fff', border: '1px solid #eee', borderRadius: 8, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>ID</th>
            <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Thời điểm</th>
            <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Loại</th>
            <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Điểm</th>
            <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.id}</td>
              <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{new Date(r.ts).toLocaleString()}</td>
              <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.type}</td>
              <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.score ?? '-'}</td>
              <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>
                <button disabled={loading} onClick={() => act(r.id, 'CONFIRMED')} style={{ marginRight: 8 }}>Xác nhận</button>
                <button disabled={loading} onClick={() => act(r.id, 'REJECTED')}>Từ chối</button>
              </td>
            </tr>
          ))}
          {loading && (
            <tr>
              <td colSpan={5} style={{ padding: 12, textAlign: 'center' }}><LoadingSpinner /></td>
            </tr>
          )}
          {rows.length === 0 && !loading && (
            <tr>
              <td colSpan={5} style={{ padding: 12, color: '#777' }}>Không có sự cố đang mở.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProctorReviewIncidentsPage;
