# Multi-stage build for production React app
# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build like Tailwind)
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL (can be overridden in docker-compose)
# Empty default - nginx proxy handles /api routing
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build for production
RUN npm run build

# Stage 2: Production - Serve with Nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (container internal)
EXPOSE 80

# Health check - verify nginx is serving content
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f -s http://localhost:80/ > /dev/null || exit 1

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
