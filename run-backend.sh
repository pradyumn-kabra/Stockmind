#!/bin/sh
cd "$(dirname "$0")/backend" || exit 1

if [ -f .env.local ]; then
  set -a
  . ./.env.local
  set +a
fi

./mvnw spring-boot:run
