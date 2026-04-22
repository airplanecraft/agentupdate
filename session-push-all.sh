#!/bin/bash
# Sync all independent modules and root repository to GitHub

# Define independent git repositories inside the workspace
MODULES=("admin" "crawler" "database" "docs" "spike" "website")

echo "======================================"
echo "🚀 Starting session-push-all sync..."
echo "======================================"

# 1. Sync Root Repository (which includes website/)
echo ""
echo "📦 1. Syncing Root & Website Workspace..."
git add -A
if ! git diff-index --quiet HEAD; then
    git commit -m "chore: archive session and sync root/website"
    git push
    echo "✅ Root workspace pushed successfully."
else
    echo "⏭️  Root workspace is clean, skipping commit."
    git push
fi

# 2. Sync Independent Modules
echo ""
echo "📦 2. Syncing Sub-Modules..."
for MOD in "${MODULES[@]}"; do
    if [ -d "$MOD" ] && [ -d "$MOD/.git" ]; then
        echo "   -> Processing $MOD..."
        cd "$MOD" || continue

        # Specific automation for database module: dump SQL snapshot before adding
        if [ "$MOD" = "database" ]; then
            echo "      [Database] Creating fresh SQL dump snapshot..."
            if [ -x "/opt/homebrew/opt/postgresql@17/bin/pg_dump" ]; then
                /opt/homebrew/opt/postgresql@17/bin/pg_dump postgresql://openclaweco:openclaweco@localhost:5432/openclaweco -f openclaweco_backup.sql
            else
                pg_dump postgresql://openclaweco:openclaweco@localhost:5432/openclaweco -f openclaweco_backup.sql
            fi
        fi

        git add -A
        if ! git diff-index --quiet HEAD; then
            git commit -m "chore: archive session mapped from root"
            git push
            echo "   ✅ $MOD synced."
        else
            echo "   ⏭️  $MOD is clean, skipping commit."
            git push
        fi
        cd ..
    else
        echo "   ⚠️  $MOD module or its .git directory not found, skipping."
    fi
done

echo ""
echo "🎉 All code synced to GitHub successfully!"
