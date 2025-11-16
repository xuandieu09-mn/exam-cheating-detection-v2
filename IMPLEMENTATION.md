# Online Exam Cheating Detection System - Implementation Guide

## Overview

This document describes the implementation of the comprehensive online exam cheating detection system with frontend interface and backend API integration.

## Architecture

### Frontend (React + TypeScript + Vite)

#### Authentication & Authorization
- **AuthContext**: JWT-based authentication with localStorage persistence
- **Role-based routing**: Different interfaces for ADMIN, PROCTOR, REVIEWER, and CANDIDATE roles
- **Protected routes**: Automatic redirect to login for unauthenticated users

#### Core Components

1. **LoginPage** (`/login`)
   - Mock authentication for MVP (accepts any username/password)
   - Role assignment based on username (admin, proctor, reviewer, student)
   - Redirects to appropriate dashboard based on role

2. **AppLayout**
   - Main layout with header, sidebar, and content area
   - Displays user info and logout button
   - Role-based navigation menu

3. **Sidebar**
   - Dynamic menu items based on user role
   - Active route highlighting

#### Student Interface

1. **StudentStartExamPage** (`/student/exam`)
   - Select and start exam sessions
   - Webcam monitoring with periodic snapshots (every 5 seconds)
   - Real-time telemetry tracking (focus, blur, tab switch, paste, copy)
   - Mock exam questions interface
   - Warning about monitoring features

2. **StudentReviewedIncidentsPage** (`/student/incidents`)
   - View own incidents
   - Filter by status (PENDING, CONFIRMED, DISMISSED)

#### Proctor/Reviewer Interface

1. **ProctorReviewIncidentsPage** (`/proctor/review`)
   - Two-panel interface: incident list and review details
   - Review pending incidents
   - View evidence (snapshots)
   - Confirm or dismiss incidents with notes
   - Real-time incident count

#### Admin Interface

1. **AdminIncidentsPage** (`/admin/incidents`)
   - View all incidents across all sessions
   - Filter by status (ALL, PENDING, CONFIRMED, DISMISSED)
   - Comprehensive table with all incident details

2. **AdminCreateExamPage** (`/admin/create-exam`)
   - Create new exams
   - Configure duration and evidence retention
   - Display monitoring features

#### Monitoring Components

1. **WebcamCapture**
   - Access user's webcam (640x480)
   - Capture frames every 5 seconds (configurable)
   - Convert to base64 and send to backend
   - Display live preview and capture status

2. **useExamTelemetry** Hook
   - Track window focus/blur events
   - Detect tab switching and visibility changes
   - Monitor paste/copy operations
   - Track fullscreen exit
   - Debounce events (1 second)
   - Send events to backend with idempotency keys

#### UI Components

1. **LoadingSpinner**: Reusable loading indicator
2. **ToastProvider** & **toastBus**: Global notification system
   - Success, error, info, warning types
   - Auto-dismiss after 5 seconds
   - Click to dismiss

#### State Management

1. **AppStateContext**: Global exam session state
2. **AuthContext**: User authentication and role management

### Backend Integration

The frontend integrates with existing Spring Boot backend APIs:

#### Endpoints Used

1. **Sessions**
   - `POST /api/sessions/start` - Start exam session
   - `POST /api/sessions/{id}/end` - End exam session

2. **Ingest**
   - `POST /api/ingest/events` - Send telemetry events
   - `POST /api/ingest/snapshots/upload` - Upload webcam snapshots

3. **Incidents**
   - `GET /api/incidents` - List incidents (with filters)
   - `GET /api/incidents/{id}` - Get incident details

4. **Reviews**
   - `POST /api/admin/reviews` - Submit incident review
   - `GET /api/admin/reviews` - List reviews

5. **Exams** (for future implementation)
   - `POST /api/exams` - Create exam
   - `GET /api/exams` - List exams

### Type Safety

All API interactions are typed using TypeScript interfaces:
- User, Exam, Session, Incident, Review types
- Request/Response types for all API calls
- Typed API client with methods for each endpoint

## User Flows

### Student Flow

1. Login with student credentials
2. Navigate to "Start Exam"
3. Select exam from dropdown
4. Review monitoring warnings
5. Start exam
   - Webcam activates automatically
   - Telemetry tracking begins
   - Complete exam questions
6. End exam
7. View flagged incidents in "My Incidents"

### Proctor Flow

1. Login with proctor credentials
2. Navigate to "Review Incidents"
3. View list of pending incidents
4. Select incident to review
5. View evidence (snapshot)
6. Add review note
7. Confirm violation or dismiss
8. Incident removed from pending list

### Admin Flow

1. Login with admin credentials
2. Create new exams
3. Monitor all incidents across sessions
4. Filter by status
5. View comprehensive incident details

## Security Features

1. **JWT Authentication**: Token-based auth with local storage
2. **Authorization Interceptor**: Automatic token injection in API requests
3. **Role-based Access**: Different interfaces per role
4. **Protected Routes**: Redirect to login if not authenticated
5. **Idempotency Keys**: Prevent duplicate event/snapshot submissions
6. **Evidence Privacy**: Evidence URLs handled by backend

## Monitoring Features

### Active Monitoring

1. **Webcam Snapshots**
   - Frequency: Every 5 seconds
   - Resolution: 640x480
   - Format: JPEG (base64 encoded)
   - Metadata: timestamp, face count

2. **Telemetry Events**
   - Window focus/blur
   - Tab switching (document.hidden)
   - Paste operations (with target and preview)
   - Copy operations
   - Fullscreen exit

### Incident Detection

Backend analyzes telemetry and snapshots to detect:
- NO_FACE: No face detected for extended period
- MULTI_FACE: Multiple faces in frame
- TAB_SWITCH: Excessive tab switching
- PASTE: Copy-paste in answer fields
- Other rule-based violations

## Development

### Setup

```bash
# Frontend
cd frontend
npm install
npm run dev  # Development server at http://localhost:5173

# Backend
cd backend
mvn spring-boot:run  # API server at http://localhost:8080
```

### Build

```bash
# Frontend
cd frontend
npm run build  # Output to dist/

# Backend
cd backend
mvn clean package  # Output to target/
```

### Environment

- Node.js 20+
- Java 17+
- Maven 3.6+

## Testing

### Manual Testing

1. Start backend: `cd backend && mvn spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:5173`
4. Login with different roles:
   - Username: `admin` → Admin role
   - Username: `proctor` → Proctor role
   - Username: `student` → Student role
5. Test each user flow

### Test Credentials

For MVP, any username/password works. Role is determined by username:
- Contains "admin" → ADMIN
- Contains "proctor" → PROCTOR
- Contains "reviewer" → REVIEWER
- Anything else → CANDIDATE

## Production Considerations

### Security

1. Replace mock authentication with real JWT from backend
2. Use HTTPS for all communications
3. Implement CSRF protection
4. Add rate limiting
5. Secure evidence URLs with presigned URLs
6. Implement session timeout

### Performance

1. Optimize webcam capture frequency
2. Implement batch sending for telemetry
3. Add caching for exam data
4. Use WebSocket for real-time updates
5. Compress snapshot images

### Scalability

1. Use CDN for static assets
2. Implement backend load balancing
3. Add Redis for session storage
4. Use message queue for incident processing
5. Optimize database queries

## Known Limitations (MVP)

1. Mock authentication (no real JWT validation)
2. Exam list is hardcoded
3. No real-time notifications
4. Limited error recovery
5. No offline support
6. Basic UI styling (no design system)
7. No analytics dashboard
8. No exam content management

## Future Enhancements

1. Real-time incident alerts for proctors
2. Advanced ML-based cheating detection
3. Voice/audio monitoring
4. Screen sharing detection
5. Browser lockdown features
6. Detailed analytics and reporting
7. Exam content editor
8. Student identity verification
9. Multi-language support
10. Mobile app support

## File Structure

```
frontend/src/
├── api/
│   ├── client.ts          # Typed API client
│   └── types.ts           # API type definitions
├── auth/
│   └── AuthContext.tsx    # Authentication context
├── components/
│   ├── Sidebar.tsx        # Navigation sidebar
│   └── WebcamCapture.tsx  # Webcam monitoring
├── layouts/
│   └── AppLayout.tsx      # Main app layout
├── pages/
│   ├── roles/
│   │   ├── StudentStartExamPage.tsx
│   │   ├── StudentReviewedIncidentsPage.tsx
│   │   ├── ProctorReviewIncidentsPage.tsx
│   │   ├── AdminIncidentsPage.tsx
│   │   └── AdminCreateExamPage.tsx
│   ├── LoginPage.tsx
│   └── App.tsx            # Main app with routing
├── state/
│   ├── AppStateContext.tsx    # Global state
│   └── useExamTelemetry.ts    # Telemetry hook
├── ui/
│   ├── LoadingSpinner.tsx     # Loading component
│   ├── ToastProvider.tsx      # Toast notifications
│   └── toastBus.ts            # Toast event bus
├── lib/
│   └── api.ts                 # Axios instance
└── main.tsx                   # App entry point
```

## Summary

The implementation provides a complete online exam detection system with:
- ✅ Role-based authentication and authorization
- ✅ Real-time webcam monitoring
- ✅ Comprehensive telemetry tracking
- ✅ Incident review workflow
- ✅ Admin exam management
- ✅ Type-safe API integration
- ✅ Responsive UI with feedback
- ✅ Modular, maintainable code structure

All features build successfully and are ready for integration testing with the backend services.
