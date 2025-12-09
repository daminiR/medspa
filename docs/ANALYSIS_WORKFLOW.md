# Analysis Workflow

**How to analyze competitors and create build queue for any category**

---

## Quick Start

### 1. Pick a Category

Available categories (19 total):
```
01-getting-started
02-calendar-and-appointments ✅ (DONE)
03-sales-and-checkout
04-clients
05-memberships
06-gift-cards-and-packages
07-products-and-inventory
08-services
09-staff-and-payroll
10-email-marketing
11-automated-flows-and-messages
12-forms-and-waivers
13-online-booking
14-business-setup
15-offers
16-reports
17-integrations
18-payments
19-account-management
```

**Most Important for Med Spas:**
- 03-sales-and-checkout (charting, billing, invoicing)
- 04-clients (patient records, before/after photos)
- 12-forms-and-waivers (consent, HIPAA)
- 18-payments (payment processing)
- 05-memberships (packages, memberships)

---

## 2. Run Workflow Comparison

### Setup (one time)
```bash
# Activate conda environment
source /usr/local/Caskroom/miniconda/base/etc/profile.d/conda.sh
conda activate medical-spa-ai

# Verify API key is set
echo $ANTHROPIC_API_KEY
# Should show: sk-ant-...
```

### Run Analysis for One Category

**Edit the script:**
```bash
cd /Users/daminirijhwani/medical-spa-platform/docs/analysis_tools
nano 05_workflow_comparison.py
```

**Change line 206-207 from:**
```python
# Focus on Calendar & Appointments first (most critical)
category_file = MANGOMINT_CONSOLIDATED / "02-calendar-and-appointments.md"
```

**To your desired category:**
```python
# Example: Analyze Sales & Checkout
category_file = MANGOMINT_CONSOLIDATED / "03-sales-and-checkout.md"
```

**Run it:**
```bash
python 05_workflow_comparison.py
```

**Output:** Creates `workflow_comparisons/[category]_workflow_comparison.json`

---

## 3. Generate Visual Dashboards

After running workflow comparison, you'll have JSON data. Now create visual dashboards:

### Option A: Manual (Quick)
Open the WHO_WINS.html template and update:
1. Read the JSON file for your category
2. Copy WHO_WINS.html → WHO_WINS_[category].html
3. Update the comparison cards with your data

### Option B: Automated Script (Better)

**Create `06_generate_dashboards.py`:**
```bash
cd /Users/daminirijhwani/medical-spa-platform/docs/analysis_tools
# Create script to auto-generate WHO_WINS.html from JSON
```

*(TODO: Create this script)*

---

## 4. Update BUILD_QUEUE.html

After analyzing all categories:

1. **Read all JSON files** in `workflow_comparisons/`
2. **Extract P0/P1/P2 features** from each category
3. **Update BUILD_QUEUE.html** with:
   - New features from each category
   - Priority rankings
   - Implementation instructions

---

## Full Analysis (All 19 Categories)

### Batch Run (30-45 min)

**Create batch script:**
```bash
cd /Users/daminirijhwani/medical-spa-platform/docs/analysis_tools
nano run_all_categories.sh
```

```bash
#!/bin/bash
source /usr/local/Caskroom/miniconda/base/etc/profile.d/conda.sh
conda activate medical-spa-ai

categories=(
  "03-sales-and-checkout"
  "04-clients"
  "05-memberships"
  "12-forms-and-waivers"
  "18-payments"
  "13-online-booking"
  "09-staff-and-payroll"
  "16-reports"
  "07-products-and-inventory"
)

for category in "${categories[@]}"; do
  echo "Analyzing $category..."
  # Edit 05_workflow_comparison.py to use this category
  sed -i '' "s/category_file = .*/category_file = MANGOMINT_CONSOLIDATED \/ \"$category.md\"/" 05_workflow_comparison.py
  python 05_workflow_comparison.py
  echo "✅ $category complete"
  sleep 5  # Avoid rate limits
done

echo "🎉 All categories analyzed!"
```

**Run:**
```bash
chmod +x run_all_categories.sh
./run_all_categories.sh
```

---

## Directory Structure

```
docs/
├── BUILD_QUEUE.html              ← What to build (all categories)
├── WHO_WINS.html                 ← Calendar comparison
├── WHO_WINS_sales.html           ← Sales comparison (create these)
├── WHO_WINS_clients.html         ← Clients comparison
│
├── analysis_tools/
│   ├── 05_workflow_comparison.py ← Run this per category
│   └── run_all_categories.sh     ← Batch process all
│
├── competitor_analysis/
│   ├── consolidated_categories/  ← Input (Mango Mint docs)
│   ├── workflow_comparisons/     ← Output (JSON)
│   │   ├── calendar_workflow_comparison.json
│   │   ├── sales_workflow_comparison.json
│   │   └── ...
│   └── reports/
│       └── GAP_ANALYSIS_REPORT.md ← Keep this!
│
└── product_roadmap/
    ├── master_roadmap.md
    └── components/
        ├── calendar.md
        └── ...
```

---

## Output Files

After full analysis, you'll have:

1. **WHO_WINS_[category].html** (8-10 files)
   - Visual comparison per category
   - Scores, workflows, how to beat them

2. **BUILD_QUEUE.html** (1 master file)
   - All P0/P1/P2 features across categories
   - Prioritized by business impact
   - Implementation specs embedded

3. **JSON data** (19 files)
   - Raw comparison data
   - Machine-readable for future updates

---

## Cleanup Recommendations

**Delete these (no longer needed):**
```bash
# Old competitor structure (replaced by competitor_analysis/)
rm -rf /Users/daminirijhwani/medical-spa-platform/docs/competitor-analysis/

# Old implementation docs (replaced by product_roadmap/)
rm -rf /Users/daminirijhwani/medical-spa-platform/docs/implementation-roadmap/
rm -rf /Users/daminirijhwani/medical-spa-platform/docs/implementation-summary/

# Redundant markdown files (replaced by HTML dashboards)
rm /Users/daminirijhwani/medical-spa-platform/docs/IMPLEMENTATION_PRIORITY_ROADMAP.md
rm /Users/daminirijhwani/medical-spa-platform/docs/SCRAPER_INSTRUCTIONS.md
```

**Keep these:**
```bash
# Core analysis
docs/competitor_analysis/          # New structure
docs/analysis_tools/               # Scripts
docs/product_roadmap/              # Roadmap system
docs/BUILD_QUEUE.html              # Master build queue
docs/WHO_WINS.html                 # Comparisons
docs/FEATURE_GAP_ANALYSIS.md       # Gap analysis (DON'T DELETE)
docs/ANALYSIS_WORKFLOW.md          # This file

# Other important
docs/architecture/                 # System design
docs/backend-requirements/         # Backend specs
docs/mangomint-analysis/          # Scraped articles (source data)
```

---

## Tips

**Cost optimization:**
- Each category analysis = ~$0.50-1.00 in API calls
- Full analysis (19 categories) = ~$10-15
- Run top 5 categories first, then expand

**Time optimization:**
- Per category: 3-5 minutes
- Full run: 30-45 minutes
- Run overnight for all categories

**Rate limits:**
- Add 5-second delay between categories
- Batch API calls efficiently
- Use Haiku model for cheaper analysis (if quality is acceptable)

---

## Next Steps

1. **Immediate:** Run sales-and-checkout analysis
2. **Today:** Run top 5 categories
3. **This week:** Complete all 19 categories
4. **Then:** Update BUILD_QUEUE.html with all findings
5. **Finally:** Start building P0 features!

---

**Questions?** Check:
- `/docs/competitor_analysis/reports/GAP_ANALYSIS_REPORT.md`
- `/docs/product_roadmap/README.md`
- `/docs/BUILD_QUEUE.html`
