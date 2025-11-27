# React Client - BFF Mode

## Overview

This React client uses **BFF (Backend-for-Frontend)** pattern for secure authentication.

### Architecture

```
React Client (Port 5173)
    ↓ (Session API calls)
BFF Gateway (Port 8080) 
    ↓ (OAuth2 with client_secret)
Authorization Server (Port 9000)
```

### Security Benefits

- ✅ **Access tokens stored server-side** - Not exposed to browser
- ✅ **Refresh tokens handled by BFF** - Automatic token refresh
- ✅ **Better security** - HTTPOnly cookies, no XSS token exposure
- ✅ **Confidential client** - Uses client_secret for token exchange

---

## Quick Start

### 1. Prerequisites

Ensure all services are running:

```bash
# From project root
docker-compose up -d
```

### 2. Setup BFF Gateway

```bash
cd ../bff-gateway
cp env.sample .env
# Edit .env and set NEXTAUTH_SECRET (min 32 chars)
npm install
npm run dev
```

### 3. Setup React Client

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Access Application

Open <http://localhost:5173>

---

## Environment Variables

Create `.env` file:

```env
VITE_BFF_URL=http://localhost:8080
VITE_USER_SERVICE_URL=http://localhost:8100
```

---

## Features

### Authentication Flow

1. **Register**: Click "Register New Account" → Fill form
2. **Login**: Click "Login with BFF Gateway" → Redirected to Authorization Server
3. **Authenticate**: Login at AS → Redirected back
4. **Dashboard**: View "Hello World" with user info
5. **Logout**: Click "Logout" → Session cleared

### Security Verification

Open DevTools:

- **Application → Local Storage**: Should be **empty** (no tokens!)
- **Application → Cookies**: See `SESSION_ID` cookie (HTTPOnly ✓)

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/session` | Fetch current session |
| `GET /api/auth/signin` | Initiate login flow |
| `GET /api/auth/signout` | Logout |
| `POST /api/register` | Register new user |

---

## Project Structure

```
src/
├── App.jsx              # Main page with BFF session management
├── main.jsx             # Router configuration
└── pages/
    ├── Register.jsx     # Registration via BFF proxy
    ├── Dashboard.jsx    # Post-login dashboard
    └── AuthCallback.jsx # OAuth callback handler
```

---

## Build for Production

```bash
npm run build
```

Serve with:

```bash
npm run preview
```

---

## Troubleshooting

### BFF Gateway Not Running

```bash
cd ../bff-gateway
npm install
npm run dev
```

### CORS Issues

Ensure BFF `.env` has:

```env
REACT_CLIENT_URL=http://localhost:5173
```

### Session Not Persisting

Check BFF `NEXTAUTH_SECRET` is set:

```bash
cd ../bff-gateway
# Edit .env and add NEXTAUTH_SECRET
```

---

## Additional Resources

- **BFF Pattern**: [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)
- **NextAuth.js**: [Documentation](https://next-auth.js.org/)
