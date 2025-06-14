#!/bin/bash

# Load environment variables from .env file
set -a
source backend/.env
set +a

# Build the Docker image with environment variables
docker build -t linksphere \
  --build-arg DATABASE_URL="postgresql://linksphere_db_user:EV3jGK4U0A3cKdi4GpLfoQ70N5Fzil8b@dpg-d1597ejuibrs73bnhq70-a.frankfurt-postgres.render.com/linksphere_db" \
  --build-arg VITE_API_URL="http://localhost:5173" \
  --build-arg RUST_API_URL="http://localhost:8080" \
  --build-arg PORT="8080" \
  --build-arg HOST="0.0.0.0" \
  --build-arg JWT_SECRET="Jx9F+31gLTvPz7aP2uAVN4q8K9dM1eBzK3yZ7CxN9uWq0pHsL1x6FzRx8s3vXqRZ" \
  --build-arg SMTP_USERNAME="severiannkwenti@gmail.com" \
  --build-arg SMTP_PASSWORD="qogs avbg qdxj gfuh" \
  --build-arg SMTP_SERVER="smtp.gmail.com" \
  --build-arg UPSTASH_REDIS_REST_URL="$" \
  --build-arg UPSTASH_REDIS_REST_TOKEN="${UPSTASH_REDIS_REST_TOKEN}" \
  . 