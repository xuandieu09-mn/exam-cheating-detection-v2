import React, { useState } from 'react';
import { api } from '../../lib/api';
import { toastBus } from '../../ui/toastBus';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

const AdminCreateExamPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [retentionDays, setRetentionDays] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toastBus.error('Please enter exam title');
      return;
    }

    setSubmitting(true);
    try {
      // In production, call POST /exams API
      await api.post('/exams', {
        title,
        description,
        durationMinutes: duration,
        retentionDays
      });

      toastBus.success('Exam created successfully');
      
      // Reset form
      setTitle('');
      setDescription('');
      setDuration(60);
      setRetentionDays(30);
    } catch (e: any) {
      toastBus.error('Failed to create exam: ' + (e.response?.data?.title || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: 30, borderRadius: 8, maxWidth: 800 }}>
      <h2>Create New Exam</h2>
      <p style={{ color: '#666', marginBottom: 30 }}>
        Configure a new exam session with monitoring settings
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Exam Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Mathematics Final Exam 2025"
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #dee2e6',
              borderRadius: 4,
              fontSize: 14
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter exam description and instructions"
            style={{
              width: '100%',
              minHeight: 100,
              padding: 12,
              border: '1px solid #dee2e6',
              borderRadius: 4,
              fontSize: 14
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min={1}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #dee2e6',
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Evidence Retention (days)
            </label>
            <input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value))}
              min={1}
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #dee2e6',
                borderRadius: 4,
                fontSize: 14
              }}
            />
          </div>
        </div>

        <div style={{ 
          padding: 15, 
          background: '#e7f3ff', 
          border: '1px solid #b3d9ff',
          borderRadius: 4,
          marginBottom: 20
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: 14 }}>Monitoring Features (Enabled by default)</h4>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#666' }}>
            <li>Webcam snapshots every 5 seconds</li>
            <li>Face detection and multi-face alerts</li>
            <li>Tab switch and window blur tracking</li>
            <li>Copy/paste detection</li>
            <li>Incident generation based on rules</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '12px 24px',
            background: submitting ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}
        >
          {submitting && <LoadingSpinner size={20} />}
          {submitting ? 'Creating...' : 'Create Exam'}
        </button>
      </form>
    </div>
  );
};

export default AdminCreateExamPage;
