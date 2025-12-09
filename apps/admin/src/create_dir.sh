#!/bin/bash

# Create shifts components directory
mkdir -p components/shifts

# Create shift component files
touch components/shifts/ShiftEditPanel.tsx
touch components/shifts/ShiftBlock.tsx
touch components/shifts/ShiftDeleteModal.tsx

# Create shift helpers
touch utils/shiftHelpers.ts

# Create shift types
touch types/shifts.ts

echo "✅ All shift-related files created successfully!"
