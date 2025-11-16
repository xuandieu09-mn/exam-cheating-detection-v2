import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { toastBus } from '../../ui/toastBus';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

interface Incident {
  id: string;
  sessionId: string;
  ts: number;
  type: string;
  score?: number;
  reason?: string;
  evidenceUrl?: string;
  status: string;
  createdAt: string;
}

const ProctorReviewIncidentsPage: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/incidents?status=PENDING');
      setIncidents(res.data);
    } catch (e: any) {
      toastBus.error('Failed to load incidents: ' + (e.response?.data?.title || e.message));
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (status: 'CONFIRMED' | 'DISMISSED') => {
    if (!selectedIncident) return;

    setSubmitting(true);
    try {
      await api.post('/admin/reviews', {
        incidentId: selectedIncident.id,
        reviewerId: user?.id,
        status,
        note: reviewNote
      });

      toastBus.success(`Incident ${status.toLowerCase()}`);
      setSelectedIncident(null);
      setReviewNote('');
      loadIncidents(); // Reload list
    } catch (e: any) {
      toastBus.error('Failed to submit review: ' + (e.response?.data?.title || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Incidents List */}
      <div style={{ flex: 1, background: '#fff', padding: 20, borderRadius: 8 }}>
        <h2>Pending Incidents</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>
          {incidents.length} incident(s) awaiting review
        </p>

        {incidents.length === 0 ? (
          <div style={{ 
            padding: 40, 
            textAlign: 'center', 
            background: '#f8f9fa',
            borderRadius: 4 
          }}>
            <p style={{ color: '#666' }}>No pending incidents</p>
          </div>
        ) : (
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {incidents.map(incident => (
              <div
                key={incident.id}
                onClick={() => setSelectedIncident(incident)}
                style={{
                  padding: 15,
                  marginBottom: 10,
                  border: selectedIncident?.id === incident.id ? '2px solid #007bff' : '1px solid #dee2e6',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: selectedIncident?.id === incident.id ? '#e7f3ff' : '#fff'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{incident.type}</div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {new Date(incident.ts).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 5 }}>
                  Score: {incident.score ?? 'N/A'} | Session: {incident.sessionId.substring(0, 8)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Panel */}
      <div style={{ flex: 1, background: '#fff', padding: 20, borderRadius: 8 }}>
        <h2>Review Details</h2>
        
        {selectedIncident ? (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{selectedIncident.type}</h3>
              <p style={{ margin: '5px 0', fontSize: 14 }}>
                <strong>Timestamp:</strong> {new Date(selectedIncident.ts).toLocaleString()}
              </p>
              <p style={{ margin: '5px 0', fontSize: 14 }}>
                <strong>Score:</strong> {selectedIncident.score ?? 'N/A'}
              </p>
              <p style={{ margin: '5px 0', fontSize: 14 }}>
                <strong>Reason:</strong> {selectedIncident.reason || 'No reason provided'}
              </p>
              <p style={{ margin: '5px 0', fontSize: 14 }}>
                <strong>Session ID:</strong> <code>{selectedIncident.sessionId}</code>
              </p>
            </div>

            {selectedIncident.evidenceUrl && (
              <div style={{ marginBottom: 20 }}>
                <strong>Evidence:</strong>
                <div style={{ marginTop: 10, border: '1px solid #dee2e6', borderRadius: 4, padding: 10 }}>
                  <img 
                    src={selectedIncident.evidenceUrl} 
                    alt="Evidence" 
                    style={{ maxWidth: '100%', borderRadius: 4 }}
                  />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                Review Note
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add your review comments..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 10,
                  border: '1px solid #dee2e6',
                  borderRadius: 4,
                  fontSize: 14
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => submitReview('CONFIRMED')}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 12,
                  background: submitting ? '#ccc' : '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: 14
                }}
              >
                {submitting ? <LoadingSpinner size={16} /> : 'Confirm Violation'}
              </button>
              <button
                onClick={() => submitReview('DISMISSED')}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: 12,
                  background: submitting ? '#ccc' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: 14
                }}
              >
                {submitting ? <LoadingSpinner size={16} /> : 'Dismiss'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            padding: 40, 
            textAlign: 'center', 
            background: '#f8f9fa',
            borderRadius: 4 
          }}>
            <p style={{ color: '#666' }}>Select an incident to review</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctorReviewIncidentsPage;
