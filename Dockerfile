# Multi-stage production Docker build
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests
COPY package.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies
RUN npm run install:all

# Copy source files
COPY server ./server
COPY client ./client

# Build server and client
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY server/package.json ./server/
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/server/node_modules ./server/node_modules
COPY --from=build /app/client/dist ./client/dist

EXPOSE 5000

CMD ["node", "server/dist/index.js"]
