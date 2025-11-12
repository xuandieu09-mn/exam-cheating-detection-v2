import React, { useEffect, useMemo, useState } from 'react';
import { getAdminStats, listIncidentsPaged } from '../../api/client';
import type { IncidentResponse, Page } from '../../api/types';
import LoadingSpinner from '../../ui/LoadingSpinner';

const AdminIncidentsPage: React.FC = () => {
  const [rows, setRows] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState('ts,desc');
  const [pageMeta, setPageMeta] = useState<{ totalPages: number; totalElements: number }>({ totalPages: 0, totalElements: 0 });

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const data: Page<IncidentResponse> = await listIncidentsPaged({ page, size, sort });
        setRows(data.content);
        setPageMeta({ totalPages: data.totalPages, totalElements: data.totalElements });
      } catch (e: any) {
        setError(e?.response?.data?.detail || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, size, sort]);

  const [serverStats, setServerStats] = useState<{ total: number; open: number; confirmed: number; rejected: number }|null>(null);

  useEffect(() => {
    (async () => { try { setServerStats(await getAdminStats()); } catch {} })();
  }, []);

  const stats = useMemo(() => {
    if (serverStats) return serverStats;
    return {
      total: rows.length,
      open: rows.filter(r => r.status === 'OPEN').length,
      confirmed: rows.filter(r => r.status === 'CONFIRMED').length,
      rejected: rows.filter(r => r.status === 'REJECTED').length,
    };
  }, [rows, serverStats]);

  return (
    <div>
      <h2>Quản lý incidents</h2>
      {error && <div style={{ color: '#c00', marginBottom: 12 }}>Lỗi: {error}</div>}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>Tổng: <b>{stats.total}</b></div>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>OPEN: <b>{stats.open}</b></div>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>CONFIRMED: <b>{stats.confirmed}</b></div>
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, padding: 12 }}>REJECTED: <b>{stats.rejected}</b></div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        <label style={{ fontSize: 14 }}>Sort
          <select value={sort} onChange={e => { setPage(0); setSort(e.target.value); }} style={{ marginLeft: 6 }}>
            <option value="ts,desc">Thời điểm ↓</option>
            <option value="ts,asc">Thời điểm ↑</option>
          </select>
        </label>
        <label style={{ fontSize: 14 }}>Size
          <select value={size} onChange={e => { setPage(0); setSize(parseInt(e.target.value)); }} style={{ marginLeft: 6 }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>
        <div style={{ marginLeft: 'auto', fontSize: 14 }}>Tổng: {pageMeta.totalElements}</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8 }}>
        {loading && rows.length === 0 ? (
          <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}><LoadingSpinner /></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>ID</th>
                <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Thời điểm</th>
                <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Loại</th>
                <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Điểm</th>
                <th style={{ textAlign: 'left', padding: 10, borderBottom: '1px solid #eee' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.id}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{new Date(r.ts).toLocaleString()}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.type}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.score ?? '-'}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #f2f2f2' }}>{r.status}</td>
                </tr>
              ))}
              {loading && rows.length > 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 12, textAlign: 'center' }}><LoadingSpinner /></td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <button disabled={page === 0 || loading} onClick={() => setPage(p => Math.max(0, p - 1))}>← Trước</button>
        <span style={{ fontSize: 14 }}>Trang {page + 1} / {Math.max(1, pageMeta.totalPages)}</span>
        <button disabled={page + 1 >= pageMeta.totalPages || loading} onClick={() => setPage(p => p + 1)}>Tiếp →</button>
      </div>
    </div>
  );
};

export default AdminIncidentsPage;
