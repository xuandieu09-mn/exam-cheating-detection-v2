import React from 'react';
import { useAuth } from '../../auth/AuthContext';

const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ 
        background: 'white', 
        padding: 24, 
        borderRadius: 8, 
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: 24, color: '#1a202c' }}>
          Xin chào, {user?.username}! 👋
        </h2>
        <p style={{ margin: 0, color: '#718096', fontSize: 14 }}>
          Chào mừng bạn đến với hệ thống thi trực tuyến
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3182ce'
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#3182ce', marginBottom: 4 }}>
            3
          </div>
          <div style={{ fontSize: 13, color: '#718096' }}>Kỳ thi khả dụng</div>
        </div>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #38a169'
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#38a169', marginBottom: 4 }}>
            2
          </div>
          <div style={{ fontSize: 13, color: '#718096' }}>Đã hoàn thành</div>
        </div>
        <div style={{
          background: 'white',
          padding: 20,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #e53e3e'
        }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#e53e3e', marginBottom: 4 }}>
            0
          </div>
          <div style={{ fontSize: 13, color: '#718096' }}>Vi phạm</div>
        </div>
      </div>

      {/* Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#1a202c' }}>Xem kỳ thi</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#718096' }}>
            Danh sách các kỳ thi bạn có thể tham gia
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#1a202c' }}>Kết quả của tôi</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#718096' }}>
            Xem điểm số và kết quả các kỳ thi đã tham gia
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#1a202c' }}>Vi phạm của tôi</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#718096' }}>
            Xem các cảnh báo vi phạm (nếu có)
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: 24,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, color: '#1a202c' }}>Hướng dẫn</h3>
          <p style={{ margin: 0, fontSize: 14, color: '#718096' }}>
            Cách sử dụng hệ thống và quy định thi
          </p>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
