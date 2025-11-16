import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
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

const AdminIncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadIncidents();
  }, [statusFilter]);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/incidents${params}`);
      setIncidents(res.data);
    } catch (e: any) {
      toastBus.error('Failed to load incidents: ' + (e.response?.data?.title || e.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return '#dc3545';
      case 'DISMISSED': return '#28a745';
      case 'PENDING': return '#ffc107';
      default: return '#6c757d';
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
    <div style={{ background: '#fff', padding: 30, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>All Incidents</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <label>Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #dee2e6',
              borderRadius: 4,
              fontSize: 14
            }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      <p style={{ color: '#666', marginBottom: 20 }}>
        {incidents.length} incident(s) found
      </p>

      {incidents.length === 0 ? (
        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          background: '#f8f9fa',
          borderRadius: 4 
        }}>
          <p style={{ color: '#666' }}>No incidents found</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: 14 
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Type</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Session ID</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Timestamp</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Score</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Reason</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(incident => (
                <tr key={incident.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: 12, fontWeight: 'bold' }}>{incident.type}</td>
                  <td style={{ padding: 12 }}>
                    <code style={{ fontSize: 12 }}>{incident.sessionId.substring(0, 8)}...</code>
                  </td>
                  <td style={{ padding: 12 }}>
                    {new Date(incident.ts).toLocaleString()}
                  </td>
                  <td style={{ padding: 12 }}>{incident.score ?? '-'}</td>
                  <td style={{ padding: 12, maxWidth: 200 }}>
                    {incident.reason || '-'}
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      background: getStatusColor(incident.status),
                      color: '#fff'
                    }}>
                      {incident.status}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminIncidentsPage;
