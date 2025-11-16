# Deployment Guide

## Quick Start with Docker Compose

The easiest way to run the complete system is using Docker Compose:

```bash
# Start all services (backend, database, frontend)
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui/index.html
```

## Manual Deployment

### Prerequisites

- Java 17+
- Node.js 20+
- PostgreSQL 14+
- Maven 3.6+

### Backend Setup

1. **Configure Database**

Edit `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:55432/examdb
    username: postgres
    password: postgres
```

2. **Build Backend**

```bash
cd backend
mvn clean package
```

3. **Run Backend**

```bash
# Using Maven
mvn spring-boot:run

# Or using JAR
java -jar target/exam-backend-0.0.1-SNAPSHOT.jar
```

Backend will run on http://localhost:8080

### Frontend Setup

1. **Install Dependencies**

```bash
cd frontend
npm install
```

2. **Configure API Endpoint** (if needed)

Edit `frontend/src/lib/api.ts`:

```typescript
export const api = axios.create({
  baseURL: '/api',  // Use proxy in development
  // Or set to full URL: 'http://localhost:8080/api'
});
```

3. **Development Server**

```bash
npm run dev
```

Frontend will run on http://localhost:5173

4. **Production Build**

```bash
npm run build
# Output in dist/ directory
```

### Database Setup

1. **Create Database**

```sql
CREATE DATABASE examdb;
```

2. **Run Migrations**

The backend will automatically create tables on first run using JPA.

Alternatively, run the SQL scripts manually:
```bash
psql -U postgres -d examdb < sql/schema.sql
psql -U postgres -d examdb < sql/seed.sql
```

## Production Deployment

### Backend (Spring Boot)

1. **Build Production JAR**

```bash
cd backend
mvn clean package -Pproduction
```

2. **Configure Production Settings**

Create `application-prod.yml`:

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USER}
    password: ${DATABASE_PASS}
  
  security:
    oauth2:
      resourceserver:
        jwt:
          public-key-location: ${JWT_PUBLIC_KEY_PATH}

server:
  port: ${PORT:8080}

logging:
  level:
    com.example.exam: INFO
```

3. **Run with Production Profile**

```bash
java -jar target/exam-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

### Frontend (React)

1. **Build for Production**

```bash
cd frontend
npm run build
```

2. **Serve Static Files**

Option 1: Using Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Option 2: Using Apache

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/frontend/dist
    
    <Directory /path/to/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # React Router support
        FallbackResource /index.html
    </Directory>
    
    # Proxy API requests to backend
    ProxyPass /api http://localhost:8080/api
    ProxyPassReverse /api http://localhost:8080/api
</VirtualHost>
```

## Docker Deployment

### Build Docker Images

Backend:
```bash
cd backend
docker build -t exam-backend:latest .
```

Frontend:
```bash
cd frontend
docker build -t exam-frontend:latest .
```

### Run with Docker Compose

```yaml
version: '3.8'

services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: examdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "55432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/examdb
      SPRING_DATASOURCE_USERNAME: postgres
      SPRING_DATASOURCE_PASSWORD: postgres
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run:
```bash
docker-compose up -d
```

## Cloud Deployment

### AWS

1. **Backend on Elastic Beanstalk**

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p java-17 exam-backend

# Create environment
eb create exam-backend-env

# Deploy
eb deploy
```

2. **Frontend on S3 + CloudFront**

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

3. **Database on RDS**
- Create PostgreSQL RDS instance
- Update backend configuration with RDS endpoint

### Google Cloud Platform

1. **Backend on Cloud Run**

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/exam-backend

# Deploy
gcloud run deploy exam-backend \
  --image gcr.io/PROJECT_ID/exam-backend \
  --platform managed \
  --region us-central1
```

2. **Frontend on Firebase Hosting**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Azure

1. **Backend on App Service**

```bash
# Create App Service
az webapp create --resource-group myResourceGroup \
  --name exam-backend --runtime "JAVA:17-java17"

# Deploy
mvn azure-webapp:deploy
```

2. **Frontend on Static Web Apps**

```bash
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist --env production
```

## Environment Variables

### Backend

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:55432/examdb
DATABASE_USER=postgres
DATABASE_PASS=postgres

# Security
JWT_PUBLIC_KEY_PATH=/path/to/public.pem
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com

# Storage
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE=10MB

# Server
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=prod
```

### Frontend

```bash
# API endpoint (if not using proxy)
VITE_API_URL=http://localhost:8080/api
```

## Monitoring

### Application Monitoring

1. **Enable Actuator** (Backend)

Add to `application.yml`:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,metrics,info,prometheus
```

2. **Prometheus Metrics**

Backend exposes metrics at `/actuator/prometheus`

3. **Health Checks**

- Backend: http://localhost:8080/actuator/health
- Frontend: Check if index.html loads

### Logging

Backend logs to:
- Console (development)
- File: `/var/log/exam-backend/application.log` (production)

Configure in `application.yml`:
```yaml
logging:
  file:
    name: /var/log/exam-backend/application.log
  level:
    root: INFO
    com.example.exam: DEBUG
```

## Security Considerations

1. **Use HTTPS in production**
2. **Enable CORS only for trusted origins**
3. **Set secure JWT configuration**
4. **Use environment variables for secrets**
5. **Enable rate limiting**
6. **Set up WAF (Web Application Firewall)**
7. **Regular security updates**
8. **Database encryption at rest**
9. **Secure file uploads directory**

## Troubleshooting

### Backend won't start

1. Check database connection
2. Verify Java version (17+)
3. Check port 8080 is not in use
4. Review logs in `backend/logs/`

### Frontend can't connect to backend

1. Check CORS configuration
2. Verify API URL in `api.ts`
3. Check browser console for errors
4. Verify backend is running

### Database connection issues

1. Verify PostgreSQL is running
2. Check connection string
3. Verify credentials
4. Check firewall rules

## Backup and Recovery

### Database Backup

```bash
# Backup
pg_dump -U postgres examdb > backup.sql

# Restore
psql -U postgres examdb < backup.sql
```

### File Storage Backup

```bash
# Backup uploads directory
tar -czf uploads-backup.tar.gz /app/uploads

# Restore
tar -xzf uploads-backup.tar.gz -C /
```

## Scaling

### Horizontal Scaling

1. **Backend**: Deploy multiple instances behind load balancer
2. **Database**: Use read replicas for read-heavy operations
3. **File Storage**: Use S3/MinIO for distributed storage
4. **Cache**: Add Redis for session storage

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Add database indexes
4. Enable query caching

## Support

For issues or questions:
1. Check logs first
2. Review documentation
3. Open GitHub issue
4. Contact support team
