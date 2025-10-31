# Use Node.js 14.x as base image
FROM node:14.21.3-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Remove dev dependencies to reduce image size
RUN yarn install --frozen-lockfile --production=true && \
    yarn cache clean

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Create uploads directory and ensure proper permissions
RUN mkdir -p /app/uploads && \
    chown -R nextjs:nodejs /app/uploads && \
    chmod 755 /app/uploads

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/server/app.server.js"]

# Add environment variables
