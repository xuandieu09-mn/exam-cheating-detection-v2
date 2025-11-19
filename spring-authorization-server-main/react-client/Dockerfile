FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG VITE_OIDC_ISSUER=http://localhost:9000
ARG VITE_OIDC_CLIENT_ID=react-test-client
ARG VITE_OIDC_REDIRECT_URI=http://localhost:5173/auth/callback
ARG VITE_OIDC_SCOPE="openid profile exam.read"

ENV VITE_OIDC_ISSUER=${VITE_OIDC_ISSUER}
ENV VITE_OIDC_CLIENT_ID=${VITE_OIDC_CLIENT_ID}
ENV VITE_OIDC_REDIRECT_URI=${VITE_OIDC_REDIRECT_URI}
ENV VITE_OIDC_SCOPE=${VITE_OIDC_SCOPE}

RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

