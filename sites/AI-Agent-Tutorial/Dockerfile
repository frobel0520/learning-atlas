FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/src

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src ./src
COPY docs ./docs
COPY static ./static

RUN useradd --create-home --uid 10001 appuser \
    && mkdir -p /app/data /app/data/chroma \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

# Local Docker uses PORT when provided; default to 8000.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='127.0.0.1'"]
