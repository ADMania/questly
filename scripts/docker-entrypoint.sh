#!/bin/sh
set -e

if [ "${SKIP_DRIZZLE_MIGRATIONS}" = "1" ]; then
  echo "[entrypoint] Skipping database migrations (SKIP_DRIZZLE_MIGRATIONS=1)"
else
  echo "[entrypoint] Running database migrations via drizzle-kit..."
  DRIZZLE_DIALECT=${DRIZZLE_DIALECT:-postgres} npx drizzle-kit push
fi

exec node server.js
