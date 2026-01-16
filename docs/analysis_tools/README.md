# Competitive Analysis Automation System

A comprehensive, reusable framework for analyzing competitors and identifying feature gaps in your medical spa platform.

## Overview

This system automates the entire competitive analysis process from web scraping to gap analysis reporting.

### What It Does

1. **Scrapes** competitor documentation
2. **Consolidates** content by category
3. **Extracts** features using AI
4. **Analyzes** your codebase
5. **Generates** gap analysis reports with prioritized recommendations

### Key Benefits

- ✅ **Reusable** - Run against any competitor
- ✅ **Automated** - Minimal manual work
- ✅ **AI-Powered** - Smart feature extraction
- ✅ **Actionable** - Prioritized recommendations
- ✅ **Fast** - Complete analysis in 10-20 minutes

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Web Scraping (scrape_mangomint.py)                     │
│ Fetches all competitor help articles using Playwright          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: Consolidation (01_consolidate_categories.py)           │
│ Groups articles by category into comprehensive documents       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: Feature Extraction (02_extract_features.py)            │
│ Uses Claude AI to extract structured feature data              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: Codebase Analysis (03_analyze_codebase.py)             │
│ Scans your platform to inventory existing features             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: Gap Analysis (04_generate_gap_analysis.py)             │
│ Compares features and generates prioritized recommendations     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Prerequisites

```bash
# 1. Install Python dependencies
pip install anthropic playwright

# 2. Install Playwright browsers
playwright install chromium

# 3. Set your Anthropic API key
export ANTHROPIC_API_KEY="your-key-here"
```

### Run Full Analysis

```bash
cd /Users/daminirijhwani/medical-spa-platform/docs/analysis_tools
python3 run_full_analysis.py
```

That's it! The system will:
- Consolidate all scraped data
- Extract features using AI
- Analyze your codebase
- Generate comprehensive gap analysis

**Time**: 10-20 minutes
**Output**: Detailed markdown report with prioritized features

---

## Individual Scripts

You can also run each stage independently:

### Stage 1: Consolidate Categories

```bash
python3 01_consolidate_categories.py
```

**Input**: Raw scraped markdown files
**Output**: Consolidated category summaries

### Stage 2: Extract Features

```bash
python3 02_extract_features.py
```

**Input**: Consolidated categories
**Output**: Structured feature database (JSON)
**Note**: Requires Anthropic API key

### Stage 3: Analyze Codebase

```bash
python3 03_analyze_codebase.py
```

**Input**: Your project code
**Output**: Current platform feature inventory
**Note**: Requires Anthropic API key

### Stage 4: Generate Gap Analysis

```bash
python3 04_generate_gap_analysis.py
```

**Input**: Competitor features + Current platform features
**Output**: Gap analysis report with recommendations
**Note**: Requires Anthropic API key

---

## Output Files

After running the full analysis, you'll have:

```
docs/competitor_analysis/
├── consolidated_categories/         # Category summaries
│   ├── 01-getting-started.md
│   ├── 02-calendar-and-appointments.md
│   └── ...
├── extracted_features/              # Feature JSONs per category
│   ├── 01-getting-started_features.json
│   └── ...
├── codebase_analysis/               # Your platform analysis
│   ├── project_structure.json
│   ├── features_from_structure.json
│   └── deep_feature_analysis.json
├── reports/                         # Final reports
│   ├── GAP_ANALYSIS_REPORT.md      # ⭐ Main deliverable
│   └── gap_analysis.json
├── feature_database.json            # Master feature DB
├── feature_index.json               # Searchable index
├── current_platform_inventory.json  # Your features
└── category_index.json              # Category metadata
```

---

## Analyzing New Competitors

### Option 1: Similar Documentation Structure

If the competitor has a help center like Mango Mint:

1. **Adapt the scraper**:
   ```bash
   cp scrape_mangomint.py scrape_[competitor].py
   # Update BASE_URL and selectors
   ```

2. **Run scraper**:
   ```bash
   python3 scrape_[competitor].py
   ```

3. **Run analysis**:
   ```bash
   python3 run_full_analysis.py
   ```

### Option 2: Different Data Source

If competitor has different documentation format:

1. **Manual collection**: Export/copy their docs to markdown files
2. **Organize** into category folders (like mangomint-analysis/)
3. **Run analysis** starting from Stage 1

### Option 3: Multiple Competitors

Analyze multiple competitors and compare:

1. Run full analysis for each competitor separately
2. Use different output directories
3. Manually compare gap analysis reports
4. Identify features present in multiple competitors

---

## Configuration

### API Keys

The system uses Claude AI (Anthropic) for intelligent analysis.

Set your API key:
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Or add to your shell profile:
```bash
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc
```

### Customization

Edit these files to customize for your needs:

- **01_consolidate_categories.py**: Adjust consolidation logic
- **02_extract_features.py**: Modify AI prompts for better extraction
- **03_analyze_codebase.py**: Add/remove file patterns to scan
- **04_generate_gap_analysis.py**: Customize report format

---

## Troubleshooting

### "Anthropic API key not found"
```bash
export ANTHROPIC_API_KEY="your-key-here"
```

### "No consolidated categories found"
Run stages in order:
```bash
python3 01_consolidate_categories.py
python3 02_extract_features.py
# etc...
```

### "Feature extraction failed"
- Check API key is valid
- Ensure consolidated files exist
- Check API rate limits

### "Codebase analysis incomplete"
- Verify project path in script
- Check file extensions being scanned
- Ensure code files are readable

---

## Best Practices

### 1. Regular Updates
- Run quarterly to track competitor changes
- Compare reports over time
- Adjust priorities based on market shifts

### 2. Cross-Functional Review
- Share gap analysis with product team
- Validate priorities with stakeholders
- Get engineering effort estimates

### 3. Incremental Implementation
- Start with P0 features
- Ship iteratively
- Measure impact before moving to P1

### 4. Documentation
- Document why features were prioritized
- Track implementation status
- Update analysis as you build

---

## Advanced Usage

### Custom Prompts

Edit AI prompts in `02_extract_features.py` and `04_generate_gap_analysis.py` to:
- Focus on specific feature types
- Emphasize certain categories
- Adjust prioritization criteria

### Filtering

Modify scripts to:
- Analyze only specific categories
- Focus on particular feature types
- Exclude low-priority items

### Integration

Connect to your workflow:
- Export to Jira/Linear/etc
- Integrate with product roadmap tools
- Automate recurring analysis

---

## Future Enhancements

Potential additions to the system:

- [ ] Multi-competitor comparison matrix
- [ ] Visual dashboard for gap analysis
- [ ] Automatic Jira ticket creation
- [ ] Historical trend analysis
- [ ] Screenshot comparison
- [ ] Pricing analysis integration
- [ ] Customer review sentiment analysis

---

## Support

For issues or questions:
1. Check this README
2. Review individual script documentation
3. Check error logs in output directories

---

## License

Internal tool for Luxe Medical Spa EMR competitive analysis.

---

**Created**: October 2025
**Version**: 1.0
**Maintained by**: Product Team
