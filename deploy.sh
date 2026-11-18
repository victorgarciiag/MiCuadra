#!/usr/bin/env bash
# Sube el código al servidor y reconstruye. Uso: ./deploy.sh [servidor|servidor-fuera]
set -euo pipefail
HOST="${1:-servidor}"
DEST="~/server/micuadra"

rsync -az --delete \
  --exclude '.env' --exclude '.DS_Store' \
  --exclude 'micuadra-backend/target' \
  --exclude 'micuadra-frontend/node_modules' \
  --exclude 'micuadra-frontend/dist' \
  --exclude 'micuadra-frontend/.angular' \
  ./ "$HOST:$DEST/"

ssh "$HOST" "cd $DEST && docker compose up -d --build && docker image prune -f"
