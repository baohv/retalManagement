#!/bin/bash
# Vercel Postgres setup — run after first deploy
# This script creates tables and seeds data

echo "🗄️ Running Prisma migrations..."
npx prisma generate
npx prisma db push

echo "🌱 Seeding data..."
DATABASE_URL="$DATABASE_URL" node prisma/seed.js

echo "✅ Vercel setup complete!"
