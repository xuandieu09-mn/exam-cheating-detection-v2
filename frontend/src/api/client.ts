import { api } from '../lib/api';
import type {
  StartSessionRequest,
  SessionResponse,
  IncidentResponse,
  ReviewResponse,
  CreateReviewRequest,
  EventIngestRequest,
  EventIngestResult,
  SnapshotUploadRequest,
  SnapshotUploadResult,
  SnapshotIngestRequest,
  SnapshotIngestResult,
  ExamDto,
  Page
} from './types';

// Sessions
export async function startSession(payload: StartSessionRequest) {
  const res = await api.post<SessionResponse>('/sessions/start', payload);
  return res.data;
}

export async function endSession(id: string) {
  const res = await api.post<SessionResponse>(`/sessions/${id}/end`);
  return res.data;
}

export async function getSession(id: string) {
  const res = await api.get<SessionResponse>(`/sessions/${id}`);
  return res.data;
}

// Incidents
export async function listIncidents(sessionId?: string) {
  const q = sessionId ? `?sessionId=${sessionId}` : '';
  const res = await api.get<IncidentResponse[]>(`/incidents${q}`);
  return res.data;
}

export async function listIncidentsPaged(options: { sessionId?: string; page?: number; size?: number; sort?: string }) {
  const params = new URLSearchParams();
  if (options.sessionId) params.append('sessionId', options.sessionId);
  if (options.page != null) params.append('page', String(options.page));
  if (options.size != null) params.append('size', String(options.size));
  if (options.sort) params.append('sort', options.sort);
  const qs = params.toString();
  const res = await api.get<Page<IncidentResponse>>(`/incidents${qs ? `?${qs}` : ''}`);
  return res.data;
}

// Reviews
export async function getReviewByIncident(incidentId: string) {
  const res = await api.get<ReviewResponse>(`/admin/reviews?incidentId=${incidentId}`);
  return res.data;
}

export async function createReview(payload: CreateReviewRequest) {
  const res = await api.post<ReviewResponse>('/admin/reviews', payload);
  return res.data;
}

// Ingest
export async function ingestEvents(payload: EventIngestRequest) {
  const res = await api.post<EventIngestResult>('/ingest/events', payload);
  return res.data;
}

export async function ingestSnapshots(payload: SnapshotIngestRequest) {
  const res = await api.post<SnapshotIngestResult>('/ingest/snapshots', payload);
  return res.data;
}

export async function uploadSnapshots(payload: SnapshotUploadRequest) {
  const res = await api.post<SnapshotUploadResult>('/ingest/snapshots/upload', payload);
  return res.data;
}

// Exams (placeholder until backend endpoints added)
export async function listExams(): Promise<ExamDto[]> {
  const res = await api.get<ExamDto[]>('/admin/exams');
  return res.data;
}

export async function createExam(payload: {
  name: string;
  description?: string;
  startTime?: string | null;
  durationMinutes?: number | null;
  endTime?: string | null;
  retentionDays: number;
  createdBy?: string | null;
}) {
  const res = await api.post<ExamDto>('/admin/exams', payload);
  return res.data;
}

export async function getAdminStats(): Promise<{ total: number; open: number; confirmed: number; rejected: number }>{
  const res = await api.get('/admin/stats');
  return res.data;
}
