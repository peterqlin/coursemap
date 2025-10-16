# syntax=docker/dockerfile:1

# Use lightweight Python base
FROM python:3.13-slim AS base

# Install system dependencies and UV package manager
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency files first for build caching
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies (frozen for reproducible builds)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Copy the backend source
COPY backend/ .

# Ensure Python output isn't buffered (for Fly logs)
ENV PYTHONUNBUFFERED=1 \
    PORT=8080 \
    UVICORN_WORKERS=2

EXPOSE 8080

# Start the FastAPI app
CMD ["uv", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
