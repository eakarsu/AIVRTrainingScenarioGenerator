#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[[ -f "$project_dir/.env" ]] || { echo 'Missing .env; copy .env.example and provide real secrets.' >&2; exit 1; }
set -a
# shellcheck disable=SC1091
source "$project_dir/.env"
set +a
[[ -d "$project_dir/backend/node_modules" && -d "$project_dir/frontend/node_modules" ]] || { echo 'Dependencies are missing; install them explicitly before starting.' >&2; exit 1; }
BACKEND_PORT="${BACKEND_PORT:?BACKEND_PORT is required}"; FRONTEND_PORT="${FRONTEND_PORT:?FRONTEND_PORT is required}"
[[ -n "${DATABASE_URL:-}" ]] || { echo 'DATABASE_URL is required.' >&2; exit 1; }
JWT_SECRET_VALUE="${JWT_SECRET:-}"; [[ "${#JWT_SECRET_VALUE}" -ge 32 ]] || { echo 'JWT_SECRET must contain at least 32 characters.' >&2; exit 1; }
if [[ -z "${CLIENT_URL:-}" ]]; then if [[ "${NODE_ENV:-}" == test ]]; then export CLIENT_URL="http://127.0.0.1:$FRONTEND_PORT"; else echo 'CLIENT_URL is required.' >&2; exit 1; fi; fi
for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then echo "Port $port is occupied; no process was terminated." >&2; exit 1; fi; done
if [[ "${MIGRATE_ON_START:-false}" == "true" || "${ALLOW_SCHEMA_MIGRATION:-false}" == "true" ]]; then
  (cd "$project_dir/backend" && node scripts/migrate.js && node scripts/runtime-bootstrap.js)
fi
if [[ "${BOOTSTRAP_ACKNOWLEDGEMENT:-}" == "create-initial-admin" ]]; then
  (cd "$project_dir/backend" && node scripts/create-admin.js)
fi
(cd "$project_dir/backend" && exec node server.js) & backend_pid=$!
(cd "$project_dir/frontend" && VITE_API_PROXY_TARGET="http://127.0.0.1:$BACKEND_PORT" exec ./node_modules/.bin/vite --host "${FRONTEND_HOST:-127.0.0.1}" --port "$FRONTEND_PORT" --strictPort) & frontend_pid=$!
cleanup(){ kill "$backend_pid" "$frontend_pid" 2>/dev/null || true; wait "$backend_pid" "$frontend_pid" 2>/dev/null || true; }
trap cleanup INT TERM EXIT
wait "$backend_pid" "$frontend_pid"
