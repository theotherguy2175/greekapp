#!/bin/sh
set -e

DB_PATH="/app/data/db/prod.db"

# Initialize database from seed if it doesn't exist
if [ ! -f "$DB_PATH" ]; then
  echo "Initializing database..."
  cp /app/seed.db "$DB_PATH"
  echo "Database initialized."
fi

echo "Starting server..."
exec node server.js
