import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  StartSessionRequest,
  StartSessionResponse,
  Session,
  SnapshotUploadRequest,
  IngestEventsRequest,
  IncidentListResponse,
  Incident,
  ReviewIncidentRequest,
  ExamStats,
  Exam,
  ApiError,
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      this.token = storedToken;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', credentials);
    this.setToken(response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    this.clearToken();
  }

  // Session endpoints
  async startSession(request: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await this.client.post<StartSessionResponse>('/sessions/start', request);
    return response.data;
  }

  async endSession(sessionId: string): Promise<void> {
    await this.client.post(`/sessions/${sessionId}/end`);
  }

  async getSession(sessionId: string): Promise<Session> {
    const response = await this.client.get<Session>(`/sessions/${sessionId}`);
    return response.data;
  }

  // Ingest endpoints
  async uploadSnapshots(request: SnapshotUploadRequest): Promise<void> {
    await this.client.post('/ingest/snapshots/upload', request);
  }

  async ingestEvents(request: IngestEventsRequest): Promise<void> {
    await this.client.post('/ingest/events', request);
  }

  // Incidents endpoints
  async getIncidents(params?: {
    examId?: string;
    sessionId?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<IncidentListResponse> {
    const response = await this.client.get<IncidentListResponse>('/incidents', { params });
    return response.data;
  }

  async getIncident(incidentId: string): Promise<Incident> {
    const response = await this.client.get<Incident>(`/incidents/${incidentId}`);
    return response.data;
  }

  async reviewIncident(incidentId: string, request: ReviewIncidentRequest): Promise<void> {
    await this.client.post(`/incidents/${incidentId}/review`, request);
  }

  // Admin endpoints
  async getExamStats(examId: string): Promise<ExamStats> {
    const response = await this.client.get<ExamStats>('/admin/stats', {
      params: { examId },
    });
    return response.data;
  }

  async getExams(): Promise<Exam[]> {
    const response = await this.client.get<Exam[]>('/admin/exams');
    return response.data;
  }

  async createExam(exam: Partial<Exam>): Promise<Exam> {
    const response = await this.client.post<Exam>('/admin/exams', exam);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
