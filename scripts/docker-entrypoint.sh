#!/bin/sh
set -e

if [ "${SKIP_DRIZZLE_MIGRATIONS}" = "1" ]; then
  echo "[entrypoint] Skipping database migrations (SKIP_DRIZZLE_MIGRATIONS=1)"
else
  DRIZZLE_CONFIG_PATH=${DRIZZLE_CONFIG_PATH:-drizzle.config.ts}
  echo "[entrypoint] Running database migrations via drizzle-kit (config: ${DRIZZLE_CONFIG_PATH})..."
  DRIZZLE_DIALECT=${DRIZZLE_DIALECT:-postgres} node ./node_modules/drizzle-kit/bin.mjs push --config "${DRIZZLE_CONFIG_PATH}" || DRIZZLE_DIALECT=${DRIZZLE_DIALECT:-postgres} node ./node_modules/drizzle-kit/bin.cjs push --config "${DRIZZLE_CONFIG_PATH}"
fi

exec node server.js
