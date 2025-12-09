# Quick Start Guide

Get your competitive analysis up and running in 5 minutes!

## Prerequisites (One-Time Setup)

```bash
# 1. Install dependencies
cd /Users/daminirijhwani/medical-spa-platform/docs/analysis_tools
pip install -r requirements.txt

# 2. Set API key (get from https://console.anthropic.com/)
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

## Run Analysis (After Scraping is Complete)

```bash
# Just run this one command:
python3 run_full_analysis.py
```

**That's it!** The system will:
- ✅ Consolidate 359 articles into 19 category summaries
- ✅ Extract features using AI
- ✅ Analyze your codebase
- ✅ Generate gap analysis report

**Time**: 10-20 minutes
**Output**: `docs/competitor_analysis/reports/GAP_ANALYSIS_REPORT.md`

---

## What You Get

### Main Deliverable
**`GAP_ANALYSIS_REPORT.md`** - Comprehensive report with:
- Executive summary
- Missing features by category
- Priority recommendations (P0, P1, P2)
- Effort estimates
- Your competitive advantages

### Supporting Data
- `feature_database.json` - All competitor features
- `current_platform_inventory.json` - Your features
- Category summaries with full documentation

---

## Next Steps After Analysis

1. **Review the report**:
   ```bash
   open docs/competitor_analysis/reports/GAP_ANALYSIS_REPORT.md
   ```

2. **Focus on P0 features**: Critical gaps to address immediately

3. **Plan P1 features**: High-priority items for next 2-3 sprints

4. **Update roadmap**: Incorporate recommendations into product plan

---

## Analyzing Another Competitor

1. **Create scraper** (adapt from `scrape_mangomint.py`):
   ```bash
   cp ../scrape_mangomint.py ../scrape_competitor_name.py
   # Edit URLs and selectors
   ```

2. **Run scraper**:
   ```bash
   cd ..
   python3 scrape_competitor_name.py
   ```

3. **Run analysis**:
   ```bash
   cd analysis_tools
   python3 run_full_analysis.py
   ```

---

## Troubleshooting

**"API key not found"**
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

**"No data found"**
- Ensure scraping completed successfully
- Check `mangomint-analysis/` has populated markdown files

**"Script failed"**
- Check logs in terminal
- Run stages individually to isolate issue
- See full README.md for details

---

## Manual Stage Execution

If you need to run stages individually:

```bash
# Stage 1: Consolidate
python3 01_consolidate_categories.py

# Stage 2: Extract features (requires API key)
python3 02_extract_features.py

# Stage 3: Analyze codebase (requires API key)
python3 03_analyze_codebase.py

# Stage 4: Generate gap analysis (requires API key)
python3 04_generate_gap_analysis.py
```

---

**Questions?** See `README.md` for comprehensive documentation.
