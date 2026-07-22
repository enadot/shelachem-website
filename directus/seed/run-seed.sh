#!/usr/bin/env bash
# מריץ את seed.mjs בתוך container של Node (בלי להתקין Node על השרת).
# הרצה מתוך תיקיית directus/:  bash seed/run-seed.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "✗ חסר .env (הרץ קודם את setup.sh)"; exit 1; }
[ -f seed/seed-data.json ] || { echo "✗ חסר seed/seed-data.json"; exit 1; }

# --network host כדי שה-container יגיע ל-Directus שרץ על localhost:8055 של השרת.
docker run --rm --network host \
  --env-file .env \
  -e DIRECTUS_URL="http://localhost:8055" \
  -v "$PWD/seed:/seed" -w /seed \
  node:22-alpine node seed.mjs
