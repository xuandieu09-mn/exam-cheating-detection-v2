import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { useAppState } from '../../state/AppStateContext';
import { useExamTelemetry } from '../../state/useExamTelemetry';
import { toastBus } from '../../ui/toastBus';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { WebcamCapture } from '../../components/WebcamCapture';

const StudentStartExamPage: React.FC = () => {
  const { user } = useAuth();
  const { currentSession, setCurrentSession } = useAppState();
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExamActive, setIsExamActive] = useState(false);

  // Enable telemetry when exam is active
  useExamTelemetry({ 
    sessionId: currentSession?.id || '', 
    enabled: isExamActive && !!currentSession 
  });

  useEffect(() => {
    // Load available exams (in production, fetch from backend)
    setExams([
      { id: '11111111-1111-1111-1111-111111111111', title: 'Math Final Exam', duration: 120 },
      { id: '33333333-3333-3333-3333-333333333333', title: 'Physics Midterm', duration: 90 },
    ]);
  }, []);

  const startExam = async () => {
    if (!selectedExamId) {
      toastBus.error('Please select an exam');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/sessions/start', {
        examId: selectedExamId,
        userId: user?.id
      });
      
      const session = {
        id: res.data.id,
        examId: selectedExamId,
        userId: user?.id || '',
        startedAt: res.data.startedAt,
        status: 'IN_PROGRESS' as const
      };
      
      setCurrentSession(session);
      setIsExamActive(true);
      toastBus.success('Exam session started successfully');
    } catch (e: any) {
      toastBus.error('Failed to start exam: ' + (e.response?.data?.title || e.message));
    } finally {
      setLoading(false);
    }
  };

  const endExam = async () => {
    if (!currentSession) return;

    setLoading(true);
    try {
      await api.post(`/sessions/${currentSession.id}/end`);
      setCurrentSession(null);
      setIsExamActive(false);
      toastBus.success('Exam session ended');
    } catch (e: any) {
      toastBus.error('Failed to end exam: ' + (e.response?.data?.title || e.message));
    } finally {
      setLoading(false);
    }
  };

  if (isExamActive && currentSession) {
    return (
      <div>
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 8,
          marginBottom: 20 
        }}>
          <h2>Exam in Progress</h2>
          <p>Session ID: <code>{currentSession.id}</code></p>
          <p>Please complete your exam. Your webcam and activity are being monitored.</p>
          <button
            onClick={endExam}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 10
            }}
          >
            {loading ? 'Ending...' : 'End Exam'}
          </button>
        </div>
        
        <WebcamCapture sessionId={currentSession.id} />
        
        <div style={{ 
          background: '#fff', 
          padding: 20, 
          borderRadius: 8,
          marginTop: 20 
        }}>
          <h3>Exam Questions</h3>
          <p style={{ color: '#666' }}>This is a mock exam interface. In production, actual exam questions would be displayed here.</p>
          
          <div style={{ marginTop: 20 }}>
            <h4>Question 1: What is 2 + 2?</h4>
            <textarea
              style={{ 
                width: '100%', 
                minHeight: 100, 
                padding: 10,
                border: '1px solid #ddd',
                borderRadius: 4
              }}
              placeholder="Type your answer here..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', padding: 30, borderRadius: 8 }}>
      <h2>Start Exam</h2>
      <p>Select an exam to begin</p>
      
      <div style={{ marginTop: 20, maxWidth: 600 }}>
        <label style={{ display: 'block', marginBottom: 10 }}>
          Available Exams
        </label>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 4,
            marginBottom: 20
          }}
        >
          <option value="">-- Select an exam --</option>
          {exams.map(exam => (
            <option key={exam.id} value={exam.id}>
              {exam.title} ({exam.duration} minutes)
            </option>
          ))}
        </select>
        
        <button
          onClick={startExam}
          disabled={loading || !selectedExamId}
          style={{
            padding: '12px 24px',
            background: loading || !selectedExamId ? '#ccc' : '#28a745',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: loading || !selectedExamId ? 'not-allowed' : 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          {loading && <LoadingSpinner size={20} />}
          {loading ? 'Starting...' : 'Start Exam'}
        </button>
        
        <div style={{ 
          marginTop: 20, 
          padding: 15, 
          background: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: 4 
        }}>
          <strong>⚠️ Important:</strong>
          <ul style={{ marginTop: 10, marginBottom: 0 }}>
            <li>Your webcam will be activated and monitored</li>
            <li>Tab switching and window focus changes are tracked</li>
            <li>Copy/paste actions are logged</li>
            <li>Any suspicious activity will be flagged for review</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentStartExamPage;
