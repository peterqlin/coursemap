FROM python:3.11-slim AS base

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir uv

WORKDIR /app

COPY backend/pyproject.toml backend/uv.lock ./

RUN uv sync --frozen --no-cache

COPY backend/ .

ENV PYTHONUNBUFFERED=1 \
    PORT=8080 \
    UVICORN_WORKERS=2

EXPOSE 8080

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
