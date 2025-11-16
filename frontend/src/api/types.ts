// API Type Definitions for Exam Cheating Detection System

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'ADMIN' | 'PROCTOR' | 'REVIEWER' | 'CANDIDATE';
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  retentionDays: number;
  createdAt: string;
}

export interface Session {
  id: string;
  examId: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
}

export interface Incident {
  id: string;
  sessionId: string;
  ts: number;
  type: 'NO_FACE' | 'MULTI_FACE' | 'TAB_SWITCH' | 'PASTE' | 'COPY' | 'OTHER';
  score?: number;
  reason?: string;
  evidenceUrl?: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISMISSED';
  createdAt: string;
}

export interface Review {
  id: string;
  incidentId: string;
  reviewerId: string;
  status: 'CONFIRMED' | 'DISMISSED';
  note?: string;
  createdAt: string;
}

export interface EventIngestItem {
  sessionId: string;
  ts: number;
  eventType: 'FOCUS' | 'BLUR' | 'TAB_SWITCH' | 'TAB_VISIBLE' | 'PASTE' | 'COPY' | 'FULLSCREEN_EXIT';
  details?: string;
  idempotencyKey: string;
}

export interface SnapshotUploadItem {
  sessionId: string;
  ts: number;
  imageBase64: string;
  faceCount?: number;
  idempotencyKey: string;
}

export interface IngestResponse {
  created: number;
  duplicates: number;
}

// API Request/Response types
export interface StartSessionRequest {
  examId: string;
  userId: string;
}

export interface CreateReviewRequest {
  incidentId: string;
  reviewerId: string;
  status: 'CONFIRMED' | 'DISMISSED';
  note?: string;
}

export interface CreateExamRequest {
  title: string;
  description?: string;
  durationMinutes: number;
  retentionDays: number;
}
