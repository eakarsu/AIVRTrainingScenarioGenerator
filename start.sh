#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo -e "${PURPLE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          AI VR Training Scenario Generator                  ║"
echo "║          Starting Application...                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Clean up ports ──────────────────────────────────────────────────
echo -e "${YELLOW}[1/6] Cleaning up ports...${NC}"
kill_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${RED}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is free${NC}"
  fi
}

kill_port 3001
kill_port 5173
echo -e "${GREEN}  Ports cleaned.${NC}"

# ── Check PostgreSQL ───────────────────────────────────────────────
echo -e "${YELLOW}[2/6] Checking PostgreSQL...${NC}"
if ! command -v psql &>/dev/null; then
  echo -e "${RED}  PostgreSQL is not installed. Please install it first.${NC}"
  exit 1
fi

# Try to start PostgreSQL if not running
if ! pg_isready -q 2>/dev/null; then
  echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
  sleep 2
fi

if pg_isready -q 2>/dev/null; then
  echo -e "  ${GREEN}PostgreSQL is running.${NC}"
else
  echo -e "  ${RED}PostgreSQL is not running. Please start it manually.${NC}"
  exit 1
fi

# ── Create database ───────────────────────────────────────────────
echo -e "${YELLOW}[3/6] Setting up database...${NC}"
DB_NAME="vr_training_db"

if psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "  ${GREEN}Database '$DB_NAME' already exists.${NC}"
else
  echo -e "  ${CYAN}Creating database '$DB_NAME'...${NC}"
  createdb "$DB_NAME" 2>/dev/null || psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
  echo -e "  ${GREEN}Database created.${NC}"
fi

# ── Install dependencies ──────────────────────────────────────────
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"
echo -e "  ${CYAN}Backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install --silent 2>&1 | tail -1
echo -e "  ${CYAN}Frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install --silent 2>&1 | tail -1
echo -e "  ${GREEN}Dependencies installed.${NC}"

# ── Seed database ─────────────────────────────────────────────────
echo -e "${YELLOW}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node seeds/seed.js
echo -e "${GREEN}  Database seeded successfully.${NC}"

# ── Start servers ─────────────────────────────────────────────────
echo -e "${YELLOW}[6/6] Starting servers with hot reload...${NC}"

# Start backend with nodemon for hot reload
cd "$PROJECT_DIR/backend"
npx nodemon --watch . --ext js,json --ignore node_modules server.js &
BACKEND_PID=$!

# Start frontend with Vite (built-in hot reload)
cd "$PROJECT_DIR/frontend"
npx vite --host &
FRONTEND_PID=$!

# Trap to clean up on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo -e "${GREEN}Application stopped.${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Application is running!                                    ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  Frontend:  ${CYAN}http://localhost:5173${GREEN}                          ║${NC}"
echo -e "${GREEN}║  Backend:   ${CYAN}http://localhost:3001${GREEN}                          ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  Login:     ${YELLOW}admin@vrtraining.com / password123${GREEN}            ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  Hot reload is enabled - changes auto-refresh              ║${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop                                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Wait for any process to exit
wait
