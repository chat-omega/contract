FROM python:3.12-slim-bullseye

ENV PYTHONUNBUFFERED=1

# Install uv.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

RUN mkdir -p /app

# Copy the application into the container.
COPY main.py uv.lock pyproject.toml /app/

# Install the application dependencies.
WORKDIR /app
RUN uv sync --frozen --no-cache
EXPOSE 8000

RUN mkdir -p /app/backend
COPY . /app/backend
# Run the application.
CMD ["uv", "run", "fastapi", "dev", "--host", "0.0.0.0", "--port", "8000"]