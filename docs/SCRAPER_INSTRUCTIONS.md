# Mango Mint Help Center Scraper - Instructions

This script will fetch all 359 Mango Mint help articles and populate your markdown files with the actual content.

## Prerequisites

You need Python 3.7+ installed on your system.

## Installation

### Step 1: Install Playwright

Open your terminal and run:

```bash
pip install playwright
```

### Step 2: Install Browser

Playwright needs a browser to work. Install Chromium:

```bash
playwright install chromium
```

That's it! You're ready to run the scraper.

## Running the Scraper

### Basic Usage

Navigate to the docs folder and run:

```bash
cd /Users/daminirijhwani/medical-spa-platform/docs
python3 scrape_mangomint.py
```

### What Will Happen

The scraper will:
1. ✅ Read the fetch queue (359 articles)
2. ✅ Launch a headless browser
3. ✅ Visit each article URL one by one
4. ✅ Wait for JavaScript to render the content
5. ✅ Extract the article text and images
6. ✅ Update the corresponding markdown file
7. ✅ Save progress after each article
8. ✅ Log everything to `scrape_log.txt`

### Expected Runtime

- **Total articles**: 359
- **Delay between requests**: 2 seconds (to be respectful)
- **Estimated time**: ~30-45 minutes

The script will show real-time progress in your terminal.

## Features

### Progress Tracking
- Progress is saved after each article in `scrape_progress.json`
- If interrupted, you can rerun the script and it will **resume** where it left off
- Already-fetched articles are automatically skipped

### Error Handling
- Failed articles are logged and you can retry them later
- The script continues even if individual articles fail
- All errors are saved to `scrape_log.txt`

### Output
Each markdown file will be updated with:
- **Article Content** - Full text of the help article
- **Images and Screenshots** - List of images with alt text and URLs
- **Analysis sections** - Empty sections for your notes

## Monitoring Progress

### Watch in Real-Time
The terminal will show:
```
[2025-10-16 16:42:00] Processing category: 01-getting-started (23 articles)
[1/23] introduction-to-mangomint.md
[2025-10-16 16:42:03] ✓ Success: introduction-to-mangomint.md
[2/23] hipaa-compliance.md
...
```

### Check the Log File
```bash
tail -f /Users/daminirijhwani/medical-spa-platform/docs/mangomint-analysis/scrape_log.txt
```

### View Progress Summary
The scraper prints progress after each category:
```
Progress: 23/359 completed, 0 failed, 0 skipped
```

## After Completion

Once the scraper finishes:

1. **Check the summary** in terminal
2. **Review the log** at `mangomint-analysis/scrape_log.txt`
3. **Browse your files** - all markdown files will now have full content
4. **Analyze competitors** - you have complete documentation to review

## Troubleshooting

### "playwright not found"
```bash
pip install playwright
playwright install chromium
```

### "Permission denied"
```bash
chmod +x scrape_mangomint.py
```

### Script fails partway through
Just rerun it! The script will resume from where it stopped.

### Too many failures
Check `scrape_log.txt` for error details. Most common issues:
- Network timeout (increase TIMEOUT in script)
- Changed website structure (may need to update selectors)

## Customization

You can modify the script settings at the top:

```python
TIMEOUT = 30000  # Increase if pages load slowly
DELAY_BETWEEN_REQUESTS = 2  # Adjust delay (be respectful!)
```

## Files Created

- `scrape_progress.json` - Tracks completed/failed articles
- `scrape_log.txt` - Complete log of all operations
- `mangomint-analysis/**/*.md` - Updated markdown files with content

## Need Help?

Check the log file first:
```bash
cat /Users/daminirijhwani/medical-spa-platform/docs/mangomint-analysis/scrape_log.txt
```

The log contains detailed information about any errors encountered.

---

## Quick Start Commands

```bash
# Install dependencies
pip install playwright
playwright install chromium

# Run the scraper
cd /Users/daminirijhwani/medical-spa-platform/docs
python3 scrape_mangomint.py

# Monitor progress
tail -f mangomint-analysis/scrape_log.txt
```

Good luck! The scraper will handle everything automatically. Grab a coffee and let it run!
