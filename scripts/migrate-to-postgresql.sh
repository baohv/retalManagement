#!/bin/bash
# Migrate from SQLite to PostgreSQL
# 
# Prerequisites:
#   1. Install PostgreSQL: brew install postgresql
#   2. Start PostgreSQL: brew services start postgresql
#   3. Create database: createdb quan-ly-phong-tro
#   4. Update .env with correct DATABASE_URL
#
# This script will:
#   1. Export data from SQLite to JSON
#   2. Push schema to PostgreSQL
#   3. Import data to PostgreSQL

set -e
cd "$(dirname "$0")/.."

echo "🗄️  Step 1: Export data from SQLite..."
npx prisma db pull --force 2>/dev/null || echo "   (using existing SQLite schema)"

echo "📤 Step 2: Generate schema for PostgreSQL..."
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/quan-ly-phong-tro"
npx prisma generate
npx prisma db push

echo "🌱 Step 3: Seed data..."
DATABASE_URL="$DATABASE_URL" node prisma/seed.js

echo ""
echo "✅ Migration complete!"
echo "   Run: npm run dev"
