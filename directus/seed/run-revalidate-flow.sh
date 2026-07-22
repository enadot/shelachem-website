#!/usr/bin/env bash
# מקים את ה-Flow שמרענן את האתר בכל שינוי תוכן ב-Directus.
# הרצה מתוך תיקיית directus/ על השרת:  bash seed/run-revalidate-flow.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "✗ חסר .env (הרץ קודם את setup.sh)"; exit 1; }

# אם עוד אין REVALIDATE_SECRET ב-.env — מייצרים אחד ושומרים.
if ! grep -q '^REVALIDATE_SECRET=' .env; then
  echo "REVALIDATE_SECRET=$(openssl rand -hex 32)" >> .env
  echo "▶ נוצר REVALIDATE_SECRET חדש ונשמר ב-.env"
fi

# --network host כדי שה-container יגיע ל-Directus שרץ על localhost:8055 של השרת.
docker run --rm --network host \
  --env-file .env \
  -e DIRECTUS_URL="http://localhost:8055" \
  -v "$PWD/seed:/seed" -w /seed \
  node:22-alpine node setup-revalidate-flow.mjs

echo
echo "▶ הסוד לרענון (להגדרה כ-REVALIDATE_SECRET בפאנל של Vercel):"
grep '^REVALIDATE_SECRET=' .env | cut -d= -f2-
