import { api } from '../lib/api';
import {
  Session,
  Incident,
  Review,
  Exam,
  StartSessionRequest,
  CreateReviewRequest,
  CreateExamRequest,
  EventIngestItem,
  SnapshotUploadItem,
  IngestResponse
} from './types';

export const apiClient = {
  // Session endpoints
  sessions: {
    start: (data: StartSessionRequest) => 
      api.post<Session>('/sessions/start', data),
    
    end: (sessionId: string) => 
      api.post(`/sessions/${sessionId}/end`),
  },

  // Ingest endpoints
  ingest: {
    events: (items: EventIngestItem[]) => 
      api.post<IngestResponse>('/ingest/events', { items }),
    
    snapshots: (items: SnapshotUploadItem[]) => 
      api.post<IngestResponse>('/ingest/snapshots/upload', { items }),
  },

  // Incident endpoints
  incidents: {
    list: (params?: { sessionId?: string; status?: string; userId?: string }) => 
      api.get<Incident[]>('/incidents', { params }),
    
    get: (id: string) => 
      api.get<Incident>(`/incidents/${id}`),
  },

  // Review endpoints
  reviews: {
    create: (data: CreateReviewRequest) => 
      api.post<Review>('/admin/reviews', data),
    
    list: (params?: { incidentId?: string }) => 
      api.get<Review[]>('/admin/reviews', { params }),
  },

  // Exam endpoints
  exams: {
    create: (data: CreateExamRequest) => 
      api.post<Exam>('/exams', data),
    
    list: () => 
      api.get<Exam[]>('/exams'),
    
    get: (id: string) => 
      api.get<Exam>(`/exams/${id}`),
  },

  // Admin stats
  admin: {
    stats: (examId?: string) => 
      api.get('/admin/stats', { params: { examId } }),
  },
};
