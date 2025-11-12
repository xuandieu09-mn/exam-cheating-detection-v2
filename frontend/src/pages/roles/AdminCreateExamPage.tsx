import React, { useEffect, useState } from 'react';
import { createExam, listExams } from '../../api/client';
import type { ExamDto } from '../../api/types';

const AdminCreateExamPage: React.FC = () => {
  const [name, setName] = useState('Kỳ thi giữa kỳ');
  const [description, setDescription] = useState('Mô tả ngắn');
  const [start, setStart] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [retentionDays, setRetentionDays] = useState<number>(30);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<ExamDto[]>([]);

  const submit = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        description,
        startTime: start ? new Date(start).toISOString() : undefined,
        durationMinutes: duration || undefined,
        retentionDays,
      };
      const res = await createExam(payload);
      setMessage(`Đã tạo kỳ thi: ${res.name}`);
      setList(prev => [res, ...prev]);
    } catch (e: any) {
      setMessage(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => { try { setList(await listExams()); } catch {} })();
  }, []);

  return (
    <div>
      <h2>Tạo kỳ thi</h2>
      <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
        <label> Tên kỳ thi
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label> Mô tả
          <input value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label> Thời gian bắt đầu
          <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label> Thời lượng (phút)
          <input type="number" value={duration} onChange={e => setDuration(parseInt(e.target.value||'0'))} style={{ width: '100%' }} />
        </label>
        <label> Số ngày lưu trữ snapshot
          <input type="number" value={retentionDays} onChange={e => setRetentionDays(parseInt(e.target.value||'30',10))} style={{ width: '100%' }} />
        </label>
        <button disabled={loading} onClick={submit} style={{ width: 160, padding: '8px 12px' }}>{loading ? 'Đang tạo...' : 'Tạo'}</button>
        {message && <div style={{ color: message.startsWith('Đã') ? '#4caf50' : '#d32f2f' }}>{message}</div>}
      </div>
      <h3 style={{ marginTop: 24 }}>Danh sách kỳ thi</h3>
      <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>ID</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Tên</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Bắt đầu</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Kết thúc</th>
              <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #eee' }}>Retention</th>
            </tr>
          </thead>
          <tbody>
            {list.map(x => (
              <tr key={x.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f2f2f2' }}>{x.id}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f2f2f2' }}>{x.name}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f2f2f2' }}>{x.startTime ? new Date(x.startTime).toLocaleString() : '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f2f2f2' }}>{x.endTime ? new Date(x.endTime).toLocaleString() : '-'}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f2f2f2' }}>{x.retentionDays} ngày</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 12, color: '#777' }}>Chưa có kỳ thi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCreateExamPage;
