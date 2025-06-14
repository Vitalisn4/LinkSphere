### Builder stage
FROM rust:slim AS builder

# Set the working directory
WORKDIR /usr/src/backend

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Define build arguments
ARG DATABASE_URL
ARG FRONTEND_REQUEST_URL
ARG VITE_API_URL
ARG PORT
ARG HOST
ARG JWT_SECRET
ARG SMTP_USERNAME
ARG SMTP_PASSWORD
ARG SMTP_SERVER
ARG UPSTASH_REDIS_REST_URL
ARG UPSTASH_REDIS_REST_TOKEN

# Copy the entire backend directory
COPY backend .

# Build the application
RUN cargo build --release

### Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 && \
    rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -U -s /bin/false app

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /usr/src/backend/target/release/backend /app/backend

# Define runtime arguments
ARG DATABASE_URL
ARG FRONTEND_REQUEST_URL
ARG VITE_API_URL
ARG PORT
ARG HOST
ARG JWT_SECRET
ARG SMTP_USERNAME
ARG SMTP_PASSWORD
ARG SMTP_SERVER
ARG UPSTASH_REDIS_REST_URL
ARG UPSTASH_REDIS_REST_TOKEN

# Set runtime environment variables
ENV DATABASE_URL=${DATABASE_URL}
ENV FRONTEND_REQUEST_URL=${FRONTEND_REQUEST_URL}
ENV VITE_API_URL=${VITE_API_URL}
ENV PORT=${PORT}
ENV HOST=${HOST}
ENV JWT_SECRET=${JWT_SECRET}
ENV SMTP_USERNAME=${SMTP_USERNAME}
ENV SMTP_PASSWORD=${SMTP_PASSWORD}
ENV SMTP_SERVER=${SMTP_SERVER}
ENV UPSTASH_REDIS_REST_URL=${UPSTASH_REDIS_REST_URL}
ENV UPSTASH_REDIS_REST_TOKEN=${UPSTASH_REDIS_REST_TOKEN}

# Change ownership to non-root user
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Run the app
CMD ["./backend"]
