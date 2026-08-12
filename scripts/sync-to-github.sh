#!/bin/bash
# ============================================================
# sync-to-github.sh — Bezpieczna synchronizacja n8n node do publicznego repo
# ============================================================
#
# Ten skrypt BEZPIECZNIE publikuje TYLKO pliki n8n-nodes-gapli
# do publicznego repozytorium GitHub.
#
# NIGDY nie pushuj bezpośrednio z monorepo gapli-dashboard!
# To spowoduje wyciek całego kodu źródłowego.
#
# Użycie:
#   cd integrations/n8n-nodes-gapli
#   ./scripts/sync-to-github.sh "commit message"
#
# ============================================================

set -euo pipefail

# Konfiguracja
GITHUB_REPO="https://github.com/Gapli-Full-Dropshipping/n8n-nodes-gapli.git"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
N8N_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMP_DIR=$(mktemp -d)
COMMIT_MSG="${1:-"chore: sync n8n node files"}"

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔄 n8n-nodes-gapli → GitHub Sync${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ============================================================
# SAFETY CHECK: Upewnij się, że jesteśmy w katalogu n8n node
# ============================================================
if [ ! -f "$N8N_DIR/package.json" ]; then
  echo -e "${RED}❌ Nie znaleziono package.json w $N8N_DIR${NC}"
  exit 1
fi

PACKAGE_NAME=$(grep '"name"' "$N8N_DIR/package.json" | head -1 | sed 's/.*: *"\(.*\)".*/\1/')
if [ "$PACKAGE_NAME" != "n8n-nodes-gapli" ]; then
  echo -e "${RED}❌ To nie jest katalog n8n-nodes-gapli! (package name: $PACKAGE_NAME)${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Katalog źródłowy: $N8N_DIR${NC}"

# ============================================================
# SAFETY CHECK: Sprawdź, czy nie ma plików monorepo
# ============================================================
FORBIDDEN_FILES=("src/lib/db.ts" "src/app/layout.tsx" "Dockerfile" "docker-compose.prod.yml" "middleware.ts")
for f in "${FORBIDDEN_FILES[@]}"; do
  if [ -f "$N8N_DIR/$f" ]; then
    echo -e "${RED}❌ NIEBEZPIECZEŃSTWO: Znaleziono plik monorepo: $f${NC}"
    echo -e "${RED}   Prawdopodobnie jesteś w głównym katalogu gapli-dashboard!${NC}"
    echo -e "${RED}   Przerwano synchronizację.${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✅ Safety check passed — brak plików monorepo${NC}"

# ============================================================
# Kopiuj pliki do tymczasowego katalogu
# ============================================================
echo -e "${YELLOW}📦 Kopiowanie plików n8n do $TEMP_DIR...${NC}"

rsync -av \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='scripts/sync-to-github.sh' \
  "$N8N_DIR/" "$TEMP_DIR/" \
  --quiet

# Kopiuj sam skrypt sync (ale nie wynikowy .git)
mkdir -p "$TEMP_DIR/scripts"
cp "$SCRIPT_DIR/sync-to-github.sh" "$TEMP_DIR/scripts/"

echo -e "${GREEN}✅ Skopiowano pliki${NC}"

# ============================================================
# SAFETY CHECK: Sprawdź liczbę plików (n8n node ma ~20-30 plików)
# ============================================================
FILE_COUNT=$(find "$TEMP_DIR" -type f | wc -l | tr -d ' ')
if [ "$FILE_COUNT" -gt 100 ]; then
  echo -e "${RED}❌ NIEBEZPIECZEŃSTWO: Za dużo plików ($FILE_COUNT)!${NC}"
  echo -e "${RED}   n8n node powinien mieć ~20-30 plików.${NC}"
  echo -e "${RED}   Prawdopodobnie kopiujesz więcej niż trzeba.${NC}"
  rm -rf "$TEMP_DIR"
  exit 1
fi

echo -e "${GREEN}✅ Liczba plików: $FILE_COUNT (OK)${NC}"

# ============================================================
# Git init, commit, push
# ============================================================
cd "$TEMP_DIR"
git init --quiet
git remote add origin "$GITHUB_REPO"

# Pobierz istniejącą historię, żeby zachować ciągłość commitów
echo -e "${YELLOW}📥 Pobieranie istniejącej historii...${NC}"
if git fetch origin main 2>/dev/null; then
  git checkout -b main origin/main --quiet 2>/dev/null || git checkout -b main --quiet
  # Usuń stare pliki i zastąp nowymi
  git rm -rf . --quiet 2>/dev/null || true
  rsync -av \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    "$N8N_DIR/" "$TEMP_DIR/" \
    --quiet
else
  git checkout -b main --quiet
fi

git add -A

# Sprawdź, czy są zmiany
if git diff --cached --quiet 2>/dev/null; then
  echo -e "${YELLOW}ℹ️  Brak zmian do zsynchronizowania.${NC}"
  rm -rf "$TEMP_DIR"
  exit 0
fi

git commit -m "$COMMIT_MSG" --quiet

echo -e "${YELLOW}🚀 Pushowanie do GitHub...${NC}"
git push origin main --force-with-lease 2>&1 || git push origin main --force 2>&1

echo ""
echo -e "${GREEN}✅ Synchronizacja zakończona!${NC}"
echo -e "${GREEN}   Repo: $GITHUB_REPO${NC}"
echo -e "${GREEN}   Commit: $COMMIT_MSG${NC}"

# Sprzątanie
rm -rf "$TEMP_DIR"

echo ""
echo -e "${YELLOW}💡 Pamiętaj: Jeśli zmieniłeś wersję, nie zapomnij:${NC}"
echo "   npm publish   # Publikacja na npm"
echo "   git tag vX.Y.Z && git push origin --tags  # Tag na GitHub"
