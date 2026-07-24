#!/usr/bin/env bash
# מקים את שכבת המדיה (העלאת תמונות דרך ה-CMS) — ראה setup-media.mjs.
# הרצה מתוך תיקיית directus/ על השרת:  bash seed/run-media-setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "✗ חסר .env (הרץ קודם את setup.sh)"; exit 1; }

# --network host כדי שה-container יגיע ל-Directus שרץ על localhost:8055 של השרת.
docker run --rm --network host \
  --env-file .env \
  -e DIRECTUS_URL="http://localhost:8055" \
  -v "$PWD/seed:/seed" -w /seed \
  node:22-alpine node setup-media.mjs
