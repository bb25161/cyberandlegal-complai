FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    git \
    xz-utils \
    && rm -rf /var/lib/apt/lists/*

# Node.js 22 — doğrudan binary (nodesource'dan daha hızlı)
RUN curl -fsSL https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz \
    | tar -xJ -C /usr/local --strip-components=1

# COMPL-AI kurulumu
RUN pip install uv
RUN git clone https://github.com/compl-ai/compl-ai.git /app/compl-ai
RUN cd /app/compl-ai && uv sync
ENV COMPLAI_PATH=/app/compl-ai


RUN npm install -g promptfoo

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app
ENV PORT=8080

EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
