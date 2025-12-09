# Docs Cleanup Guide

**What to keep, what to delete**

---

## ✅ Keep These (Core System)

```
docs/
├── BUILD_QUEUE.html              # Master build queue
├── WHO_WINS.html                 # Workflow comparisons
├── ANALYSIS_WORKFLOW.md          # How to run analysis
├── FEATURE_GAP_ANALYSIS.md       # Gap analysis (IMPORTANT)
│
├── analysis_tools/               # Analysis scripts
├── competitor_analysis/          # NEW structure with consolidated data
├── product_roadmap/              # Roadmap system
├── mangomint-analysis/           # Scraped source data
│
├── architecture/                 # System design docs
├── backend-requirements/         # Backend specs
├── features/                     # Feature specs
└── testing/                      # Test docs
```

---

## ❌ Delete These (Redundant/Old)

### Old Implementation Docs (replaced by product_roadmap/)
```bash
rm -rf implementation-roadmap/
rm -rf implementation-summary/
rm IMPLEMENTATION_PRIORITY_ROADMAP.md
rm SCRAPER_INSTRUCTIONS.md
```

### Reasoning:
- `product_roadmap/` now has all implementation planning
- `BUILD_QUEUE.html` has prioritized features
- `ANALYSIS_WORKFLOW.md` documents scraper usage

---

## ⚠️ Special Case: competitor-analysis/

**Structure:**
```
competitor-analysis/
├── jane-app/          # Keep this (has GAP comparisons)
└── mangomint/         # Empty folder, delete
```

**Options:**

**Option 1: Keep structure, just delete mangomint/**
```bash
rm -rf competitor-analysis/mangomint/
```

**Option 2: Move jane-app up, delete folder**
```bash
mv competitor-analysis/jane-app competitor_analysis/jane-app
rm -rf competitor-analysis/
```

**Recommendation:** Option 1 (simpler)

---

## Manual Cleanup Commands

Run these to clean up:

```bash
cd /Users/daminirijhwani/medical-spa-platform/docs

# Delete old implementation docs
rm -rf implementation-roadmap/
rm -rf implementation-summary/
rm IMPLEMENTATION_PRIORITY_ROADMAP.md
rm SCRAPER_INSTRUCTIONS.md

# Delete empty mangomint folder
rm -rf competitor-analysis/mangomint/

echo "✅ Cleanup complete!"
```

---

## Before/After

### Before (27 items)
```
docs/
├── implementation-roadmap/          ❌
├── implementation-summary/          ❌
├── competitor-analysis/             ⚠️
├── competitor_analysis/             ✅
├── IMPLEMENTATION_PRIORITY_ROADMAP.md ❌
├── SCRAPER_INSTRUCTIONS.md          ❌
└── ... (21 others)
```

### After (23 items)
```
docs/
├── competitor-analysis/jane-app/    ✅ (kept)
├── competitor_analysis/             ✅
├── BUILD_QUEUE.html                 ✅
├── WHO_WINS.html                    ✅
├── ANALYSIS_WORKFLOW.md             ✅
└── ... (18 others)
```

**Space saved:** ~2-3 MB
**Clarity gained:** Much cleaner structure

---

## Safe to Delete?

Not sure if you need a file? Check:

1. **Is it in competitor_analysis/ (new)?** → Keep
2. **Is it a .html dashboard?** → Keep
3. **Is it FEATURE_GAP_ANALYSIS.md?** → Keep (you mentioned this)
4. **Is it in implementation-*/? → Delete (replaced by product_roadmap/)
5. **Is it a standalone .md in root?** → Probably old, delete

---

## Run Cleanup

```bash
cd /Users/daminirijhwani/medical-spa-platform/docs
bash CLEANUP.sh
```

(I can create the cleanup script if you want)
