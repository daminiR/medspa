#!/bin/bash
# Script to apply mobile-first touch optimizations to InteractiveFaceChart.tsx

FILE="src/components/charting/InteractiveFaceChart.tsx"

echo "Applying touch optimizations to $FILE..."

# 1. Add chart-area class to zone overlay container
sed -i '' 's|<div className="absolute inset-0" style={{ pointerEvents: drawingMode === '\''zones'\'' ? '\''auto'\'' : '\''none'\'' }}>|<div className="absolute inset-0 chart-area" style={{ pointerEvents: drawingMode === '\''zones'\'' ? '\''auto'\'' : '\''none'\'' }}>|g' "$FILE"

# 2. Add touch-zone class and touchAction to zone containers
sed -i '' 's|className={`absolute transform -translate-x-1/2 -translate-y-1/2 group ${|className={`absolute transform -translate-x-1/2 -translate-y-1/2 group touch-zone ${|g' "$FILE"

# 3. Update zone touch target size
sed -i '' 's|{/\* Larger clickable area \*/}|{/* Larger touch-friendly clickable area - minimum 56px on mobile, 48px on tablet+ */}|g' "$FILE"
sed -i '' 's|<div className="absolute w-12 h-12 -left-6 -top-6" />|<div className="absolute w-14 h-14 sm:w-12 sm:h-12 -left-7 sm:-left-6 -top-7 sm:-top-6 touch-manipulation" />|g' "$FILE"

# 4. Add chart-container class to main chart wrapper
sed -i '' 's|className={`relative w-full max-w-lg mx-auto transition-all duration-300 ${|className={`relative w-full max-w-lg mx-auto transition-all duration-300 chart-container ${|g' "$FILE"

echo "Touch optimizations applied successfully!"
echo "Note: Button optimizations require manual editing due to complex className patterns."
