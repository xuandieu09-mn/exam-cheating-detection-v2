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

const StudentReviewedIncidentsPage: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      // In production, filter by userId on backend
      const res = await api.get(`/incidents?userId=${user?.id}`);
      setIncidents(res.data);
    } catch (e: any) {
      toastBus.error('Failed to load incidents: ' + (e.response?.data?.title || e.message));
    } finally {
      setLoading(false);
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
    <div>
      <div style={{ background: '#fff', padding: 30, borderRadius: 8 }}>
        <h2>My Incidents</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>
          Review incidents flagged during your exam sessions
        </p>

        {incidents.length === 0 ? (
          <div style={{ 
            padding: 40, 
            textAlign: 'center', 
            background: '#f8f9fa',
            borderRadius: 4 
          }}>
            <p style={{ color: '#666' }}>No incidents found. Great job!</p>
          </div>
        ) : (
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: 14 
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Type</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Timestamp</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Score</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Reason</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(incident => (
                <tr key={incident.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: 12 }}>{incident.type}</td>
                  <td style={{ padding: 12 }}>
                    {new Date(incident.ts).toLocaleString()}
                  </td>
                  <td style={{ padding: 12 }}>{incident.score ?? '-'}</td>
                  <td style={{ padding: 12 }}>{incident.reason || '-'}</td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      background: incident.status === 'CONFIRMED' ? '#dc3545' : 
                                 incident.status === 'DISMISSED' ? '#28a745' : '#ffc107',
                      color: '#fff'
                    }}>
                      {incident.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StudentReviewedIncidentsPage;
