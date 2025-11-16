// API Type Definitions

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'PROCTOR' | 'REVIEWER' | 'CANDIDATE';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  start_time?: string;
  end_time?: string;
  retention_days: number;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  exam_id: string;
  started_at: string;
  ended_at?: string;
  status: 'ACTIVE' | 'ENDED' | 'SUSPENDED';
  ip_address?: string;
  user_agent?: string;
}

export interface StartSessionRequest {
  exam_id: string;
}

export interface StartSessionResponse {
  session: Session;
}

export interface MediaSnapshot {
  id: string;
  session_id: string;
  ts: number;
  object_key: string;
  face_count?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SnapshotUploadItem {
  sessionId: string;
  ts: number;
  imageBase64: string;
  faceCount?: number;
  idempotencyKey: string;
}

export interface SnapshotUploadRequest {
  items: SnapshotUploadItem[];
}

export interface EventType {
  type: 'FOCUS' | 'BLUR' | 'TAB_SWITCH' | 'PASTE' | 'COPY' | 'CUSTOM';
  payload?: Record<string, any>;
}

export interface IngestEventItem {
  sessionId: string;
  ts: number;
  eventType: string;
  payload?: Record<string, any>;
  idempotencyKey: string;
}

export interface IngestEventsRequest {
  events: IngestEventItem[];
}

export interface Incident {
  id: string;
  session_id: string;
  incident_type: 'NO_FACE' | 'MULTI_FACE' | 'TAB_ABUSE' | 'PASTE' | 'CUSTOM';
  score: number;
  reason: string;
  evidence_url?: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  detected_at: string;
  created_at: string;
}

export interface IncidentListResponse {
  incidents: Incident[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Review {
  id: string;
  incident_id: string;
  reviewer_id: string;
  decision: 'CONFIRM' | 'REJECT';
  note?: string;
  reviewed_at: string;
}

export interface ReviewIncidentRequest {
  decision: 'CONFIRM' | 'REJECT';
  note?: string;
}

export interface ExamStats {
  exam_id: string;
  total_incidents: number;
  confirmed_incidents: number;
  rejected_incidents: number;
  pending_incidents: number;
  confirmation_rate: number;
  incident_by_type: Record<string, number>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
