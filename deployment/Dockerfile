# Multi-stage build: client then server
FROM node:20-alpine AS client
WORKDIR /app
COPY package.json ./
RUN npm i --silent || true
COPY . .
RUN npm run build || echo "Skipping client build on skeleton"

FROM python:3.11-slim
WORKDIR /app
COPY server/requirements.txt ./server/requirements.txt
RUN pip install --no-cache-dir -r server/requirements.txt
COPY server/ ./server/
COPY --from=client /app/dist/ /app/server/static/
ENV PORT=8000
EXPOSE 8000
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]

