# Charting Development Workflow

## Session Startup Checklist

### 1. Run the App First
```bash
# Kill any existing process and start fresh on port 3003
lsof -ti :3003 | xargs kill -9 2>/dev/null
npm run dev -- -p 3003
```
- Access at: **http://192.168.1.8:3003/charting**
- Always verify the app is running before making changes

### 2. Reference Files
- **CHARTING_FEATURES_TODO.md** - Main task list for charting features
- **PRACTITIONER_CONTEXT.md** - Context about the practitioner workflow

---

## Agent Deployment Rules

### CRITICAL: Every Agent Must Read These Files First
Before ANY work, every spawned agent MUST read:
1. `CHARTING_WORKFLOW.md` - This file (deployment rules)
2. `PRACTITIONER_CONTEXT.md` - User context and philosophy

Include this in EVERY agent prompt: "Read CHARTING_WORKFLOW.md and PRACTITIONER_CONTEXT.md first."

### DO NOT Read Directly from Parent
- **NEVER use Read tool from parent conversation** - waste of tokens
- **NEVER use Bash tail/grep from parent** - deploy an agent instead
- When agent outputs are ready, deploy a synthesis agent to read and summarize
- Parent ONLY coordinates - agents do ALL reading

### Model Selection
- **Use Opus ONLY** - NEVER use Haiku or Sonnet
- Haiku fails on complex tasks and can't find files
- Sonnet is not sufficient - Opus for ALL work

### Deploy Opus Models for Everything
- We have access to 30-40 Opus models - USE THEM
- Deploy multiple agents in parallel whenever possible
- Each Opus model can spawn its own subagents

### Agent Types to Use
| Task | Agent Type | Notes |
|------|------------|-------|
| Code exploration | `Explore` | Quick/medium/very thorough |
| Understanding codebase | `Explore` | Always use for "where is X?" questions |
| Multi-step implementation | `general-purpose` | Can read, write, search |
| Git operations | `Bash` | Commits, branches, etc. |
| Planning implementation | `Plan` | For architecture decisions |

### Parallel Deployment (Breadth-First)
```
GOOD: Deploy 3-5 agents simultaneously to investigate different aspects
BAD: Reading files one by one in the parent conversation
```

### When to Use What
| Situation | Approach |
|-----------|----------|
| Single bug/issue | **Depth only** - one lead agent going 3-4 levels deep |
| 3-5 related issues | **Breadth** - parallel agents, maybe 1-2 depth each |
| 10-15 problems | **Hybrid Breadth+Depth** - 15 leads, each going 3 deep |

### Depth Spawning (Depth-First)
When user says "depth spawn" or needs deep investigation:

**Structure: 3-4 levels deep**
```
Parent (you)
└── Lead Agent (spawns sub-agents)
    ├── Sub-Agent 1 (spawns its own agents)
    │   ├── Sub-Sub-Agent A
    │   └── Sub-Sub-Agent B
    ├── Sub-Agent 2 (spawns its own agents)
    │   └── Sub-Sub-Agent C
    └── Sub-Agent 3
```

**CRITICAL: Every prompt must cascade the instruction:**
1. Tell Lead Agent: "You MUST spawn your own sub-agents for specific aspects"
2. Tell Lead Agent to tell its agents: "Instruct your sub-agents to spawn further agents if needed"
3. Each level passes the depth-spawn instruction to the next

**Example Lead Agent Prompt:**
```
Investigate [X]. You MUST spawn your own sub-agents to investigate specific aspects.
Instruct each sub-agent to spawn further agents for detailed analysis.
Target depth: 3-4 levels. Report synthesized findings.
```

### Hybrid Breadth+Depth (Maximum Resource Usage)
When user gives 10-15 problems at once, deploy BOTH breadth AND depth:

**Structure: 15 parallel leads, each going 3 levels deep**
```
Parent (you)
├── Lead Agent 1 (Problem A) ──→ spawns 3 sub-agents ──→ each spawns 2 more
├── Lead Agent 2 (Problem B) ──→ spawns 3 sub-agents ──→ each spawns 2 more
├── Lead Agent 3 (Problem C) ──→ spawns 3 sub-agents ──→ each spawns 2 more
├── Lead Agent 4 (Problem D) ──→ spawns 3 sub-agents ──→ each spawns 2 more
├── ... (up to 15 leads)
└── Lead Agent 15 (Problem O) ──→ spawns 3 sub-agents ──→ each spawns 2 more
```

**Math: 15 leads × 3 sub-agents × 2 sub-sub-agents = ~40+ Opus models**

**When to use:**
- User gives batch of 10-15 problems
- We have 40 Opus models available - USE THEM ALL
- Goal: hit the resource limit, not waste the subscription

**Example prompt for each lead:**
```
**DEPTH SPAWN AGENT - MAXIMUM DEPTH**
Read CHARTING_WORKFLOW.md and PRACTITIONER_CONTEXT.md first.

Problem: [specific issue]

You MUST spawn 3 sub-agents minimum. Each sub-agent MUST spawn 2+ agents.
We have 40 Opus models - use the resources. Go 3 levels deep.
Report synthesized findings and implement fixes.
```

---

## Synthesis & Distillation Pattern

### What Are These?

**Distillation Agents** - Extract and condense information
- Read large files, codebases, documentation
- Extract only the relevant parts
- Report back condensed findings
- Parent never reads directly - distillation agents do

**Synthesis Agents** - Combine and analyze findings
- Take outputs from multiple distillation agents
- Find patterns, conflicts, connections
- Produce unified understanding
- Can spawn more agents if gaps found

### The Flow
```
Parent (coordinator - minimal context)
├── Distillation Agent 1 → reads File A → reports key points
├── Distillation Agent 2 → reads File B → reports key points
├── Distillation Agent 3 → reads File C → reports key points
└── Synthesis Agent → combines all findings → unified report
```

### For Investigation
1. Deploy **distillation agents** to read different files/areas
2. Each reports back condensed findings (not raw file contents)
3. Deploy **synthesis agent** if needed to combine findings
4. Parent makes decisions based on synthesized info
5. Make targeted edits based on synthesis

### For Implementation
1. Deploy Plan agent first if architecture decisions needed
2. Deploy **distillation agents** to understand current code
3. Deploy **general-purpose agents** for actual implementation
4. Each agent handles one focused task
5. Parent coordinates and verifies

### Key Rules
- **Parent NEVER reads large files directly** - waste of tokens
- **Distillation agents read** - they have fresh context
- **Synthesis agents combine** - when multiple sources needed
- **Parent coordinates** - deploys agents, makes decisions

---

## Token Conservation

### Parent Conversation
- Keep context minimal
- Don't read large files directly
- Summarize agent findings briefly
- Use agents for all heavy lifting

### Agent Conversations
- Agents have fresh context each time
- Give them specific, focused tasks
- They can read as much as needed
- Their token usage is separate

---

## Common Commands

### Check server status
```bash
lsof -i :3003
```

### Restart server
```bash
lsof -ti :3003 | xargs kill -9; npm run dev -- -p 3003
```

### Check for errors
```bash
tail -50 [output_file_path]
```

---

## Common Bugs & Troubleshooting

### Clicks Not Working on Face Chart (pointer-events issue)

**Symptom**: Clicking on the 2D face chart does nothing. Tools like Draw, Zone, etc. don't respond to clicks.

**Root Cause**: Overlay tool components (SmoothBrushTool, ShapeTool, ArrowTool, CannulaPathTool, TextLabelTool, FreehandCanvas) have inline styles with `pointer-events: auto` that override the CSS class `pointer-events-none` when the tool is NOT active.

**How to Debug**:
1. Open browser DevTools (Safari: Develop > Show Web Inspector)
2. Use the element selector to click on the face chart area
3. Look for elements with `pointer-events: auto` in their inline `style` attribute
4. If an SVG or canvas has `pointer-events: auto` but isn't the active tool, that's the bug

**The Fix**: In each overlay tool component, change:
```jsx
// BAD - always captures events even when not active
pointerEvents: isMultiTouchActive ? 'none' : 'auto'
```
To:
```jsx
// GOOD - only captures events when tool is active
pointerEvents: !isActive ? 'none' : (isMultiTouchActive ? 'none' : 'auto')
```

**Files that commonly have this bug**:
- `src/components/charting/SmoothBrushTool.tsx`
- `src/components/charting/ShapeTool.tsx`
- `src/components/charting/ArrowTool.tsx`
- `src/components/charting/CannulaPathTool.tsx`
- `src/components/charting/TextLabelTool.tsx`
- `src/components/charting/FreehandCanvas.tsx`

**Why This Happens**: When adding two-finger zoom support, developers add `pointer-events: auto` to allow touch events, but forget to check if the tool `isActive` first. The inline style overrides the CSS class.
