#!/bin/bash

# Docs Cleanup Script
# Removes redundant/old files, keeps core system

echo "🧹 Starting docs cleanup..."
echo ""

cd /Users/daminirijhwani/medical-spa-platform/docs

# Backup first (optional)
echo "Creating backup..."
timestamp=$(date +%Y%m%d_%H%M%S)
mkdir -p ../docs_backup_$timestamp
cp -r implementation-roadmap/ ../docs_backup_$timestamp/ 2>/dev/null || true
cp -r implementation-summary/ ../docs_backup_$timestamp/ 2>/dev/null || true
cp IMPLEMENTATION_PRIORITY_ROADMAP.md ../docs_backup_$timestamp/ 2>/dev/null || true
cp SCRAPER_INSTRUCTIONS.md ../docs_backup_$timestamp/ 2>/dev/null || true
echo "✅ Backup created at ../docs_backup_$timestamp"
echo ""

# Delete old implementation docs
echo "Deleting old implementation docs..."
rm -rf implementation-roadmap/
rm -rf implementation-summary/
rm -f IMPLEMENTATION_PRIORITY_ROADMAP.md
rm -f SCRAPER_INSTRUCTIONS.md
echo "✅ Old implementation docs deleted"
echo ""

# Delete empty mangomint folder
echo "Deleting empty competitor-analysis/mangomint/..."
rm -rf competitor-analysis/mangomint/
echo "✅ Empty folder deleted"
echo ""

echo "🎉 Cleanup complete!"
echo ""
echo "Kept:"
echo "  ✅ competitor-analysis/jane-app/ (GAP comparisons)"
echo "  ✅ competitor_analysis/ (new structure)"
echo "  ✅ product_roadmap/"
echo "  ✅ BUILD_QUEUE.html & WHO_WINS.html"
echo "  ✅ FEATURE_GAP_ANALYSIS.md"
echo ""
echo "Deleted:"
echo "  ❌ implementation-roadmap/"
echo "  ❌ implementation-summary/"
echo "  ❌ IMPLEMENTATION_PRIORITY_ROADMAP.md"
echo "  ❌ SCRAPER_INSTRUCTIONS.md"
echo "  ❌ competitor-analysis/mangomint/"
echo ""
echo "Backup at: ../docs_backup_$timestamp"
