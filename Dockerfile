# ──────────────────────────────────────────────────────────
# Stage 1: Build React Frontend
# ──────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent && chmod -R +x node_modules/.bin/

COPY frontend/ ./
RUN npm run build

# ──────────────────────────────────────────────────────────
# Stage 2: Python Backend + Serve Frontend
# ──────────────────────────────────────────────────────────
FROM python:3.11-slim

# System dependencies for PyMuPDF
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libmupdf-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy built frontend into static/
COPY --from=frontend-builder /app/frontend/dist ./static

# Create uploads directory
RUN mkdir -p /tmp/lexguard_uploads

# Non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Cloud Run port
ENV PORT=8080
EXPOSE 8080

# Start with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
