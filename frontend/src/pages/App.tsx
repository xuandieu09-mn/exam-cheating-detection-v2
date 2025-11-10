import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import StartSessionPage from './StartSessionPage';
import IngestDemoPage from './IngestDemoPage';
import IncidentsPage from './IncidentsPage';
import ReviewPage from './ReviewPage';

const App: React.FC = () => {
  return (
    <div style={{ fontFamily: 'system-ui', margin: '0 auto', maxWidth: 1000, padding: 24 }}>
      <h1>Exam Cheating Detection (Frontend MVP)</h1>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Link to="/">Start Session</Link>
        <Link to="/ingest">Ingest Demo</Link>
        <Link to="/incidents">Incidents</Link>
        <Link to="/review">Review</Link>
      </nav>
      <Routes>
        <Route path="/" element={<StartSessionPage />} />
        <Route path="/ingest" element={<IngestDemoPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </div>
  );
};

export default App;
