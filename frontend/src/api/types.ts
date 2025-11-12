// Shared DTO and enum types mirroring backend Java DTOs/models

export type UUID = string;

// Sessions
export interface StartSessionRequest {
  examId: UUID;
  userId: UUID;
}

export type SessionStatus = 'ACTIVE' | 'ENDED';

export interface SessionResponse {
  id: UUID;
  userId: UUID;
  examId: UUID;
  startedAt: string; // ISO instant
  endedAt?: string | null; // ISO instant
  status: SessionStatus;
}

// Incidents
export type IncidentStatus = 'OPEN' | 'CONFIRMED' | 'REJECTED';
export type IncidentType = 'NO_FACE' | 'MULTI_FACE' | 'TAB_ABUSE' | 'PASTE';

export interface IncidentResponse {
  id: UUID;
  sessionId: UUID;
  ts: number; // epoch millis
  type: IncidentType;
  score?: number;
  reason?: string;
  evidenceUrl?: string;
  status: IncidentStatus;
  createdAt: string; // ISO instant
}

// Reviews
export type ReviewStatus = 'CONFIRMED' | 'REJECTED';

export interface CreateReviewRequest {
  incidentId: UUID;
  reviewerId?: UUID;
  status: ReviewStatus;
  note?: string;
}

export interface ReviewResponse {
  id: UUID;
  incidentId: UUID;
  reviewerId?: UUID;
  status: ReviewStatus;
  note?: string;
  reviewedAt: string; // ISO instant
}

// Ingest
export type EventType = 'TAB_SWITCH' | 'PASTE' | 'FOCUS' | 'BLUR';

export interface EventIngestItem {
  sessionId: UUID;
  ts: number;
  eventType: EventType;
  details?: string; // JSON string
  idempotencyKey: string;
}

export interface EventIngestRequest { items: EventIngestItem[] }
export interface EventIngestResult { created: number; duplicates: number; ids: UUID[] }

export interface SnapshotIngestItem {
  sessionId: UUID;
  ts: number;
  objectKey: string;
  fileSize?: number;
  mimeType?: string;
  faceCount?: number;
  idempotencyKey: string;
}
export interface SnapshotIngestRequest { items: SnapshotIngestItem[] }
export interface SnapshotIngestResult { created: number; duplicates: number; ids: UUID[] }

export interface SnapshotUploadItem {
  sessionId: UUID;
  ts: number;
  imageBase64: string; // data URL preferred
  faceCount?: number;
  idempotencyKey: string;
}
export interface SnapshotUploadRequest { items: SnapshotUploadItem[] }
export interface SnapshotUploadResult { created: number; duplicates: number; ids: UUID[] }

// Exams (backend doesn’t expose DTO yet; keep simple)
export interface ExamDto {
  id: UUID;
  name: string;
  description?: string;
  startTime?: string | null;
  endTime?: string | null;
  retentionDays: number;
  createdBy?: UUID;
  createdAt: string;
  updatedAt: string;
}

// Spring Page type
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page index
}
