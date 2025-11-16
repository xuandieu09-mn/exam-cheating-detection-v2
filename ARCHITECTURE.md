# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                    http://localhost:5173                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Student    │  │   Proctor    │  │    Admin     │          │
│  │  Interface   │  │  Interface   │  │  Interface   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│  ┌──────▼──────────────────▼──────────────────▼────────┐        │
│  │          Authentication & Authorization              │        │
│  │         (JWT, Role-based Access Control)            │        │
│  └──────────────────────┬────────────────────────────┘         │
│                         │                                         │
│  ┌──────────────────────▼────────────────────────────┐          │
│  │            API Client (Axios + Types)             │          │
│  └──────────────────────┬────────────────────────────┘          │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP/REST
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                     BACKEND (Spring Boot)                        │
│                    http://localhost:8080                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │              Security Layer (JWT RS256)            │         │
│  └─────────────────┬──────────────────────────────────┘         │
│                    │                                             │
│  ┌─────────────────▼──────────────────────────────────┐         │
│  │                 Controllers                         │         │
│  │  • SessionController    • IngestController         │         │
│  │  • IncidentController   • ReviewController         │         │
│  │  • AdminController      • ExamController           │         │
│  └─────────────────┬──────────────────────────────────┘         │
│                    │                                             │
│  ┌─────────────────▼──────────────────────────────────┐         │
│  │                  Services                           │         │
│  │  • IngestService  • MediaStorageService            │         │
│  │  • Rule Engine (NO_FACE, MULTI_FACE, TAB_SWITCH)  │         │
│  └─────────────────┬──────────────────────────────────┘         │
│                    │                                             │
│  ┌─────────────────▼──────────────────────────────────┐         │
│  │              Repositories (JPA)                     │         │
│  │  • SessionRepository    • IncidentRepository       │         │
│  │  • EventRepository      • ReviewRepository         │         │
│  │  • MediaSnapshotRepository                         │         │
│  └─────────────────┬──────────────────────────────────┘         │
└────────────────────┼─────────────────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                          │
│                    localhost:55432/examdb                         │
├──────────────────────────────────────────────────────────────────┤
│  Tables:                                                          │
│  • users          • exams           • sessions                   │
│  • events         • media_snapshots • incidents                  │
│  • reviews                                                       │
└──────────────────────────────────────────────────────────────────┘
```

## Student Exam Flow

```
┌────────────┐
│  Student   │
│   Login    │
└─────┬──────┘
      │
      ▼
┌────────────────┐
│ Select Exam    │
└─────┬──────────┘
      │
      ▼
┌────────────────┐     POST /api/sessions/start
│  Start Exam    ├──────────────────────────────────┐
└─────┬──────────┘                                   │
      │                                              ▼
      │                                   ┌──────────────────┐
      │                                   │ Create Session   │
      │                                   │  Record in DB    │
      │                                   └──────────────────┘
      │
      ├─────────────────────────────────────────┐
      │                                         │
      ▼                                         ▼
┌──────────────────┐                  ┌──────────────────┐
│ Webcam Capture   │                  │   Telemetry      │
│  Every 5 sec     │                  │   Tracking       │
└─────┬────────────┘                  └─────┬────────────┘
      │                                     │
      │ POST /api/ingest/snapshots/upload  │ POST /api/ingest/events
      │ {imageBase64, ts, faceCount}       │ {eventType, ts, details}
      │                                     │
      ▼                                     ▼
┌─────────────────────────────────────────────────────┐
│              Backend Ingest Service                  │
│  • Store snapshot metadata                          │
│  • Save base64 image to file system                 │
│  • Record telemetry events                          │
│  • Run rule engine (detect violations)              │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │ Create Incident? │
            │ (if rule violated)│
            └──────────────────┘
```

## Incident Review Flow

```
┌────────────┐
│  Proctor   │
│   Login    │
└─────┬──────┘
      │
      ▼
┌────────────────────┐
│ View Pending       │  GET /api/incidents?status=PENDING
│ Incidents          ├────────────────────────────────┐
└─────┬──────────────┘                                │
      │                                               ▼
      │                                    ┌──────────────────┐
      │                                    │ Load Incidents   │
      │                                    │  from Database   │
      │                                    └──────────────────┘
      ▼
┌────────────────────┐
│ Select Incident    │
│ View Evidence      │
└─────┬──────────────┘
      │
      ▼
┌────────────────────┐
│ Add Review Note    │
└─────┬──────────────┘
      │
      ├────────────────────┐
      │                    │
      ▼                    ▼
┌──────────┐        ┌──────────┐
│ Confirm  │        │ Dismiss  │
└─────┬────┘        └─────┬────┘
      │                   │
      │ POST /api/admin/reviews
      │ {incidentId, status: "CONFIRMED", note}
      │                   │
      ▼                   ▼
┌─────────────────────────────────┐
│   Update Incident Status        │
│   Create Review Record          │
└─────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Student    │
│   Browser    │
└──────┬───────┘
       │
       │ 1. Webcam Stream
       │ 2. User Events (focus, blur, paste)
       │
       ▼
┌──────────────────────────────┐
│   React Components           │
│  • WebcamCapture             │
│  • useExamTelemetry          │
└──────┬───────────────────────┘
       │
       │ 3. HTTP POST (JSON)
       │    - Snapshots (base64)
       │    - Events (JSON)
       │
       ▼
┌──────────────────────────────┐
│   Spring Boot Backend        │
│  • IngestController          │
│  • IngestService             │
└──────┬───────────────────────┘
       │
       ├─────────────────────────┐
       │                         │
       ▼                         ▼
┌──────────────┐      ┌──────────────────┐
│  File System │      │   PostgreSQL     │
│  /uploads/   │      │  • events        │
│  *.jpg       │      │  • snapshots     │
└──────────────┘      │  • incidents     │
                      └────────┬─────────┘
                               │
                               │ 4. Read
                               │
                               ▼
                      ┌──────────────────┐
                      │  Proctor/Admin   │
                      │  Review UI       │
                      └──────────────────┘
```

## Component Hierarchy

```
App (Router)
│
├── LoginPage
│
└── AppLayout (Protected)
    ├── Sidebar (Navigation)
    │   └── Role-based Menu Items
    │
    └── Content Area (Outlet)
        │
        ├── Student Routes
        │   ├── StudentStartExamPage
        │   │   ├── WebcamCapture
        │   │   └── useExamTelemetry (hook)
        │   └── StudentReviewedIncidentsPage
        │
        ├── Proctor Routes
        │   └── ProctorReviewIncidentsPage
        │       ├── Incident List
        │       └── Review Panel
        │
        └── Admin Routes
            ├── AdminIncidentsPage
            └── AdminCreateExamPage
```

## State Management

```
┌─────────────────────────────────────────────────┐
│             Application State                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │         AuthContext                      │   │
│  │  • user: User | null                     │   │
│  │  • token: string | null                  │   │
│  │  • isAuthenticated: boolean              │   │
│  │  • login(token, user)                    │   │
│  │  • logout()                              │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │       AppStateContext                    │   │
│  │  • currentSession: Session | null        │   │
│  │  • setCurrentSession(session)            │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │        ToastBus (Global)                 │   │
│  │  • toasts: Toast[]                       │   │
│  │  • show(message, type)                   │   │
│  │  • remove(id)                            │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Technology Stack

```
┌────────────────────────────────────────────────┐
│               Frontend Stack                    │
├────────────────────────────────────────────────┤
│  • React 18.3.1                                │
│  • TypeScript 5.6.2                            │
│  • Vite 5.4.10                                 │
│  • Axios 1.7.7                                 │
│  • React Router DOM 6.26.2                     │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│               Backend Stack                     │
├────────────────────────────────────────────────┤
│  • Java 17                                     │
│  • Spring Boot 3.2.12                          │
│  • Spring Security (OAuth2 Resource Server)    │
│  • Spring Data JPA                             │
│  • PostgreSQL Driver                           │
│  • Maven                                       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│              Database & Storage                 │
├────────────────────────────────────────────────┤
│  • PostgreSQL 14+                              │
│  • File System (/uploads)                      │
└────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Setup                      │
└─────────────────────────────────────────────────────────┘

         ┌──────────────┐
         │   Internet   │
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │ Load Balancer│
         │  (nginx)     │
         └──────┬───────┘
                │
        ┌───────┴────────┐
        │                │
   ┌────▼────┐    ┌──────▼──────┐
   │Frontend │    │   Backend   │
   │ (Static)│    │  (Spring)   │
   │  Vite   │    │    Boot)    │
   └─────────┘    └──────┬──────┘
                         │
                  ┌──────▼──────┐
                  │ PostgreSQL  │
                  │  Database   │
                  └─────────────┘

┌─────────────────────────────────────────────────────────┐
│              Docker Compose Setup                        │
└─────────────────────────────────────────────────────────┘

   docker-compose.yml
          │
          ├── frontend (port 5173)
          │      └── Vite dev server
          │
          ├── backend (port 8080)
          │      └── Spring Boot app
          │
          └── db (port 55432)
                 └── PostgreSQL
```
