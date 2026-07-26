#!/usr/bin/env bash
# מריץ את media-setup.mjs בתוך container של Node (בלי להתקין Node על השרת).
# מעלה את public/images אל Directus, מגדיר קריאה ציבורית לקבצים ומקשר לתוכן.
# הרצה מתוך תיקיית directus/:  bash seed/run-media-setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "✗ חסר .env (הרץ קודם את setup.sh)"; exit 1; }
[ -d ../public/images ] || { echo "✗ לא נמצאה התיקייה ../public/images"; exit 1; }

# מאתר את ה-container הרץ של Directus (עובד גם ל-compose רגיל וגם ל-HTTPS).
CID=$(docker ps -q --filter "label=com.docker.compose.service=directus" | head -n1)
[ -n "$CID" ] || CID=$(docker ps -q --filter "ancestor=directus/directus:11" | head -n1)
if [ -z "$CID" ]; then
  echo "✗ לא נמצא container רץ של Directus. הפעל אותו קודם (docker compose up -d)."
  exit 1
fi

# חולק את מרחב הרשת של container ה-Directus, כך ש-localhost:8055 תמיד מגיע אליו —
# בלי תלות בכך שהפורט חשוף החוצה ל-host (חשוב לגרסת ה-HTTPS שלא מפרסמת פורט).
docker run --rm --network "container:$CID" \
  --env-file .env \
  -e DIRECTUS_URL="http://localhost:8055" \
  -e MEDIA_DIR="/media" \
  -v "$PWD/seed:/seed" \
  -v "$PWD/../public/images:/media:ro" \
  -w /seed \
  node:22-alpine node media-setup.mjs
