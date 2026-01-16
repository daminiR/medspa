# Medical Spa Admin Platform - Claude Code Instructions

## REQUIRED: Read Documentation First

**Before doing ANY work, you MUST thoroughly read the project documentation.**

### Step 1: Read SYSTEM_WORKFLOWS.html Completely

The file `../../docs/SYSTEM_WORKFLOWS.html` is the master documentation (~1MB, 17+ tabs). Deploy multiple sub-agents (Opus models) to read the ENTIRE file word-by-word.

**Deploy these agents to read different sections:**

1. **BUILD ORDER Agent** - Read the BUILD ORDER section showing priorities #1-20+
2. **Feature Checklist Agent** - Read the Feature Checklist tab (Admin App, Charting Web App, Patient Portal sections)
3. **Calendar Agent** - Read Calendar & Scheduling tabs completely
4. **Patient & Billing Agent** - Read Patient Management and Billing tabs
5. **Messaging Agent** - Read Messaging, SMS, and Reminders tabs
6. **Inventory & Waitlist Agent** - Read Inventory and Waitlist Management tabs
7. **Extras Agent** - Read NOT STARTED features, QUICK WINS, and any remaining tabs

**IMPORTANT:**
- DO NOT grep or search for keywords - READ EVERYTHING
- DO NOT skip sections thinking they're not relevant
- Every tab contains critical implementation details
- Report back what you learned before starting implementation

### Step 2: Explore the Codebase

After reading documentation, explore existing code:

```
/src/app/           - All pages and routes
/src/components/    - All existing components
/src/types/         - TypeScript type definitions
/src/lib/           - Utilities, data, and helpers
/src/hooks/         - Custom React hooks
/src/services/      - Service layer code
/src/utils/         - Utility functions
```

### Step 3: Understand What Exists

Before implementing anything:
1. Search for existing similar components
2. Check existing patterns and styling
3. Look at how mock data is structured in `/src/lib/data.ts`
4. Understand the TypeScript types in `/src/types/`

---

## Project Context

### Architecture
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS only (no additional UI libraries)
- **State:** React hooks, Context where needed
- **Data:** In-memory mock data (no backend yet)

### Monorepo Structure
```
medical-spa-platform/
├── apps/
│   ├── admin/           # THIS APP - Main admin dashboard
│   ├── tablet-charting/ # Practitioner charting app (3D models)
│   ├── patient-mobile/  # React Native mobile app
│   ├── patient-portal/  # Next.js patient web portal
│   └── docs/            # Documentation app
├── packages/
│   ├── types/           # Shared TypeScript types
│   ├── ui/              # Shared UI components
│   └── api-client/      # Shared API client
└── docs/
    └── SYSTEM_WORKFLOWS.html  # Master documentation
```

### Current Status (December 2024)
- **Admin App:** ~81% frontend complete
- **Charting App:** ~95% frontend complete
- **Patient Portal:** ~78% frontend complete

---

## Implementation Rules

### DO:
- Follow existing patterns in the codebase
- Use Tailwind CSS for all styling
- Use TypeScript with proper types
- Use mock data (in-memory) like other features
- Match existing component structure and naming
- Keep components in appropriate folders

### DO NOT:
- Implement backend/API routes (frontend only for now)
- Install new npm packages without explicit permission
- Modify unrelated files
- Create new patterns when existing ones work
- Add authentication logic (not implemented yet)
- Over-engineer - keep it simple

### Code Style:
- Functional components with hooks
- Named exports preferred
- Props interfaces defined inline or in types folder
- Tailwind classes, no inline styles
- Comments only where logic is complex

---

## Feature Completion Reference

Check the Feature Checklist tab in SYSTEM_WORKFLOWS.html for current status:

**Admin App Features:**
- Calendar/Scheduling: 85%
- Patient Management: 80%
- Messaging/SMS: 85%
- Waitlist Management: 75%
- Billing & Payments: 85%
- Group Bookings: 90%
- Reports/Analytics: 70%
- Settings: 75%
- Check-In System: 85%
- Referrals: 0%
- Inventory: 30%

**Focus Areas:** Reports Export, Settings User Management, Patient Management Polish, Inventory UI

---

## Before You Start Any Task

1. Confirm you've read SYSTEM_WORKFLOWS.html completely
2. List what existing code you found related to your task
3. Describe what patterns you'll follow
4. List files you plan to create/modify
5. Ask clarifying questions if needed

**Only after completing these steps should you begin implementation.**
