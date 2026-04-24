#!/usr/bin/env bash
set -e

if [ -f package-lock.json ]; then
  npm ci
elif [ -f pnpm-lock.yaml ]; then
  corepack enable
  pnpm install --frozen-lockfile
elif [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
else
  npm install
fi

if [ -f prisma/schema.prisma ]; then
  npx prisma generate
fi

npm run build || true
