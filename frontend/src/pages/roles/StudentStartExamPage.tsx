import React, { useState } from 'react';
import { startSession } from '../../api/client';
import type { UUID, SessionResponse } from '../../api/types';
import { useAuth } from '../../auth/AuthContext';
import { useAppState } from '../../state/AppStateContext';
import WebcamCapture from '../../components/WebcamCapture';
import useExamTelemetry from '../../state/useExamTelemetry';

const seededExam: UUID = '11111111-1111-1111-1111-111111111111'; // TODO: load from API when exams implemented
const mockStudentUser: UUID = '22222222-2222-2222-2222-222222222222'; // will come from JWT later

const StudentStartExamPage: React.FC = () => {
  const { state } = useAuth();
  const { setSessionId } = useAppState();
  const [examId, setExamId] = useState<UUID>(seededExam);
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useExamTelemetry(session?.id || null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await startSession({ examId, userId: mockStudentUser });
      setSession(res);
      setSessionId(res.id);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Bắt đầu thi</h2>
      <p>Xin chào {state.displayName || 'Sinh viên'} – chọn kỳ thi và bắt đầu phiên.</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>Exam ID
          <input value={examId} onChange={e => setExamId(e.target.value)} style={{ width: 340 }} />
        </label>
        <button disabled={loading} onClick={handleStart} style={{ padding: '8px 16px' }}>
          {loading ? 'Đang tạo...' : 'Bắt đầu'}
        </button>
      </div>
      {error && <div style={{ color: '#c00', marginBottom: 12 }}>Lỗi: {error}</div>}
      {session && (
        <div style={{ background: '#fff', border: '1px solid #eee', padding: 16, borderRadius: 8 }}>
          <h4>Session hiện tại</h4>
          <div>ID: {session.id}</div>
          <div>Exam: {session.examId}</div>
          <div>Bắt đầu lúc: {new Date(session.startedAt).toLocaleString()}</div>
          <div>Trạng thái: {session.status}</div>
          <div style={{ marginTop: 16 }}>
            <WebcamCapture sessionId={session.id} intervalSec={12} />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentStartExamPage;
