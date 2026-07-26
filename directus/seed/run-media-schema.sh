#!/usr/bin/env bash
# מקים את סכמת המדיה — העלאת תמונות דרך ה-CMS (ראה setup-media.mjs):
# globals (תמונת ההירו), שדות image_file, articles.publishedAt והרשאות.
# הרצה מתוך תיקיית directus/ על השרת:  bash seed/run-media-schema.sh
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "✗ חסר .env (הרץ קודם את setup.sh)"; exit 1; }

# מאתר את ה-container הרץ של Directus (עובד גם ל-compose רגיל וגם ל-HTTPS).
CID=$(docker ps -q --filter "label=com.docker.compose.service=directus" | head -n1)
[ -n "$CID" ] || CID=$(docker ps -q --filter "ancestor=directus/directus:11" | head -n1)
if [ -z "$CID" ]; then
  echo "✗ לא נמצא container רץ של Directus. הפעל אותו קודם (docker compose up -d)."
  exit 1
fi

# ממתין שה-API של Directus יענה — אחרי restart הוא לוקח כמה שניות לעלות.
echo "▶ ממתין ש-Directus יענה…"
for i in $(seq 1 45); do
  if docker run --rm --network "container:$CID" curlimages/curl:latest \
       -fsS -m 3 http://localhost:8055/server/health >/dev/null 2>&1; then
    break
  fi
  [ "$i" = 45 ] && { echo "✗ Directus לא ענה תוך 90 שניות. בדוק: docker compose logs --tail 40"; exit 1; }
  sleep 2
done

# חולק את מרחב הרשת של container ה-Directus, כך ש-localhost:8055 תמיד מגיע אליו.
docker run --rm --network "container:$CID" \
  --env-file .env \
  -e DIRECTUS_URL="http://localhost:8055" \
  -v "$PWD/seed:/seed" -w /seed \
  node:22-alpine node setup-media.mjs
