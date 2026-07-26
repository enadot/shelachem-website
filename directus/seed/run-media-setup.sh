#!/usr/bin/env bash
# מריץ את media-setup.mjs בתוך container של Node (בלי להתקין Node על השרת).
# מעלה את public/images אל Directus, מגדיר קריאה ציבורית לקבצים ומקשר לתוכן.
# הרצה מתוך תיקיית directus/:  bash seed/run-media-setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "✗ חסר .env (הרץ קודם את setup.sh)"; exit 1; }
[ -d ../public/images ] || { echo "✗ לא נמצאה התיקייה ../public/images"; exit 1; }

# --network host כדי שה-container יגיע ל-Directus שרץ על localhost:8055 של השרת.
docker run --rm --network host \
  --env-file .env \
  -e DIRECTUS_URL="http://localhost:8055" \
  -e MEDIA_DIR="/media" \
  -v "$PWD/seed:/seed" \
  -v "$PWD/../public/images:/media:ro" \
  -w /seed \
  node:22-alpine node media-setup.mjs
