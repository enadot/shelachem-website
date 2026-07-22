#!/usr/bin/env bash
# הקמת Directus לאתר שלכם על VPS — סקריפט חד-פעמי.
# הרצה מתוך תיקיית directus/ בריפו:  bash setup.sh
set -euo pipefail

say() { echo -e "\n\033[1;34m▶ $1\033[0m"; }
die() { echo -e "\033[1;31m✗ $1\033[0m" >&2; exit 1; }

cd "$(dirname "$0")"
[ -f docker-compose.yml ] || die "docker-compose.yml לא נמצא — הרץ את הסקריפט מתוך תיקיית directus/ בריפו."

say "בודק ש-Docker מותקן…"
if ! command -v docker >/dev/null 2>&1; then
  say "Docker לא מותקן — מתקין (זה לוקח כדקה)…"
  curl -fsSL https://get.docker.com | sh
fi
docker compose version >/dev/null 2>&1 || die "docker compose לא זמין. התקן Docker ונסה שוב."

if [ -f .env ]; then
  say "קובץ .env קיים — משתמש בו כמו שהוא."
else
  say "יוצר קובץ .env…"
  read -rp "  מייל אדמין ל-Directus: " ADMIN_EMAIL
  while :; do
    read -rsp "  סיסמת אדמין (לא תוצג בהקלדה): " ADMIN_PASSWORD; echo
    read -rsp "  שוב, לאימות: " ADMIN_PASSWORD2; echo
    [ "$ADMIN_PASSWORD" = "$ADMIN_PASSWORD2" ] && [ -n "$ADMIN_PASSWORD" ] && break
    echo "  הסיסמאות לא תואמות, נסה שוב."
  done
  PUBLIC_IP=$(curl -fsS https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
  SECRET=$(openssl rand -hex 32)
  cat > .env <<EOF
DIRECTUS_SECRET=$SECRET
DIRECTUS_ADMIN_EMAIL=$ADMIN_EMAIL
DIRECTUS_ADMIN_PASSWORD=$ADMIN_PASSWORD
DIRECTUS_PUBLIC_URL=http://$PUBLIC_IP:8055
SITE_ORIGIN=https://www.shelachem.co.il
EOF
  chmod 600 .env
  echo "  נוצר .env (secret הופק אוטומטית)."
fi

say "מפעיל את Directus…"
docker compose up -d

say "ממתין שהשרת יעלה…"
for i in $(seq 1 60); do
  if curl -fsS http://localhost:8055/server/health >/dev/null 2>&1; then
    PUBLIC_URL=$(grep '^DIRECTUS_PUBLIC_URL=' .env | cut -d= -f2-)
    echo
    echo -e "\033[1;32m✓ Directus באוויר!\033[0m"
    echo "  ממשק הניהול: $PUBLIC_URL"
    echo "  התחבר עם המייל והסיסמה שהגדרת."
    echo
    echo "  פקודות שימושיות (מתוך התיקייה הזו):"
    echo "    docker compose logs -f      # צפייה בלוגים"
    echo "    docker compose restart      # הפעלה מחדש"
    echo "    docker compose down         # כיבוי"
    exit 0
  fi
  sleep 2
done

echo -e "\033[1;31m✗ השרת לא הגיב תוך 2 דקות. בדוק לוגים:\033[0m"
docker compose logs --tail 40
exit 1
