# Development Dockerfile for React application
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Create vite cache directory with proper permissions
RUN mkdir -p node_modules/.vite && chown -R node:node node_modules/.vite

# Set proper ownership for the entire app directory
RUN chown -R node:node /app

# Switch to node user
USER node

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]