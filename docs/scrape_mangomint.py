#!/usr/bin/env python3
"""
Mango Mint Help Center Scraper
Fetches all help articles using Playwright to handle JavaScript rendering
"""

import json
import os
import time
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

# Configuration
BASE_DIR = Path("/Users/daminirijhwani/medical-spa-platform/docs/mangomint-analysis")
FETCH_QUEUE = BASE_DIR / "fetch_queue.json"
PROGRESS_FILE = BASE_DIR / "scrape_progress.json"
LOG_FILE = BASE_DIR / "scrape_log.txt"

# Scraping settings
TIMEOUT = 60000  # 60 seconds - increased timeout
DELAY_BETWEEN_REQUESTS = 2  # seconds (be respectful to their server)

class MangoMintScraper:
    def __init__(self):
        self.total = 0
        self.completed = 0
        self.failed = 0
        self.skipped = 0
        self.progress = self.load_progress()

    def load_progress(self):
        """Load previous progress if exists"""
        if PROGRESS_FILE.exists():
            with open(PROGRESS_FILE, 'r') as f:
                return json.load(f)
        return {"completed": [], "failed": []}

    def save_progress(self):
        """Save current progress"""
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(self.progress, f, indent=2)

    def log(self, message):
        """Log message to file and console"""
        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
        log_msg = f"[{timestamp}] {message}"
        print(log_msg)
        with open(LOG_FILE, 'a') as f:
            f.write(log_msg + "\n")

    def extract_article_content(self, page):
        """Extract the main article content from the page"""
        try:
            # Wait for page to be fully loaded
            page.wait_for_load_state('networkidle', timeout=TIMEOUT)

            # Give JavaScript extra time to render
            time.sleep(3)

            # Method 1: Try to get content from specific container
            content = None

            # Try multiple strategies to find content
            strategies = [
                # Strategy 1: Look for common article/content containers
                lambda: page.evaluate("""
                    () => {
                        const selectors = [
                            '[class*="article"]',
                            '[class*="content"]',
                            '[class*="body"]',
                            'main',
                            '[role="main"]'
                        ];
                        for (const selector of selectors) {
                            const el = document.querySelector(selector);
                            if (el && el.innerText.length > 200) {
                                return el.innerText;
                            }
                        }
                        return null;
                    }
                """),

                # Strategy 2: Get all text and filter
                lambda: page.evaluate("""
                    () => {
                        // Remove script, style, nav, footer
                        const clone = document.body.cloneNode(true);
                        ['script', 'style', 'nav', 'footer', 'header'].forEach(tag => {
                            clone.querySelectorAll(tag).forEach(el => el.remove());
                        });
                        return clone.innerText;
                    }
                """),

                # Strategy 3: Just get body text
                lambda: page.locator('body').inner_text()
            ]

            # Try each strategy
            for strategy in strategies:
                try:
                    content = strategy()
                    if content and len(content) > 100:
                        break
                except Exception as e:
                    self.log(f"Strategy failed: {str(e)}")
                    continue

            if not content or len(content) < 100:
                raise Exception("No substantial content found")

            # Extract images info
            images = []
            try:
                img_data = page.evaluate("""
                    () => {
                        const imgs = Array.from(document.querySelectorAll('img'));
                        return imgs
                            .filter(img => img.src && !img.src.includes('logo'))
                            .map(img => ({
                                alt: img.alt || '',
                                src: img.src
                            }));
                    }
                """)
                images = img_data
            except Exception as e:
                self.log(f"Warning: Could not extract images: {str(e)}")

            # Get title
            title = page.title()

            return {
                'content': content.strip(),
                'images': images,
                'title': title
            }

        except Exception as e:
            self.log(f"Error extracting content: {str(e)}")
            return None

    def update_markdown_file(self, file_path, url, article_data):
        """Update markdown file with fetched content"""
        try:
            # Read existing file
            with open(file_path, 'r') as f:
                existing_content = f.read()

            # Extract the header (everything before "## Analysis Notes")
            header_match = re.search(r'^(.*?)(?=## Analysis Notes)', existing_content, re.DOTALL)
            if header_match:
                header = header_match.group(1).strip()
            else:
                # Fallback if format is different
                lines = existing_content.split('\n')
                header = '\n'.join(lines[:10])  # Keep first 10 lines as header

            # Build new content
            new_content = f"""{header}

## Article Content

{article_data['content']}

## Images and Screenshots
"""

            if article_data['images']:
                new_content += "\nThis article contains the following images:\n\n"
                for idx, img in enumerate(article_data['images'], 1):
                    new_content += f"{idx}. **{img['alt'] or 'Untitled image'}**\n"
                    new_content += f"   - Source: {img['src']}\n\n"
            else:
                new_content += "\nNo images found in this article.\n\n"

            new_content += """
## Analysis Notes
<!-- Add your analysis notes here -->

## Key Features Identified
<!-- List key features mentioned in this article -->

## Competitor Insights
<!-- Note what this reveals about Mango Mint's capabilities -->
"""

            # Write updated content
            with open(file_path, 'w') as f:
                f.write(new_content)

            return True

        except Exception as e:
            self.log(f"Error updating markdown file {file_path}: {str(e)}")
            return False

    def fetch_article(self, browser, article_info):
        """Fetch a single article"""
        url = article_info['url']
        file_path = article_info['file']

        # Check if already completed
        if url in self.progress['completed']:
            self.skipped += 1
            return True

        self.log(f"Fetching: {url}")

        page = None
        try:
            # Create new page
            page = browser.new_page()

            # Set a reasonable viewport
            page.set_viewport_size({"width": 1920, "height": 1080})

            # Navigate to URL with extended timeout
            page.goto(url, timeout=TIMEOUT, wait_until='domcontentloaded')

            # Extract content
            article_data = self.extract_article_content(page)

            if not article_data:
                raise Exception("Failed to extract article content")

            # Update markdown file
            success = self.update_markdown_file(file_path, url, article_data)

            if success:
                self.progress['completed'].append(url)
                self.completed += 1
                self.log(f"✓ Success: {article_info['filename']}")
                return True
            else:
                raise Exception("Failed to update markdown file")

        except PlaywrightTimeout as e:
            self.log(f"✗ Timeout: {article_info['filename']} - Page took too long to load")
            self.progress['failed'].append({
                'url': url,
                'file': file_path,
                'error': 'Timeout'
            })
            self.failed += 1
            return False

        except Exception as e:
            self.log(f"✗ Failed: {article_info['filename']} - {str(e)}")
            self.progress['failed'].append({
                'url': url,
                'file': file_path,
                'error': str(e)
            })
            self.failed += 1
            return False

        finally:
            # Always close page
            if page:
                try:
                    page.close()
                except:
                    pass
            # Save progress after each article
            self.save_progress()

    def run(self):
        """Main scraping function"""
        self.log("=" * 60)
        self.log("Starting Mango Mint Help Center Scraper")
        self.log("=" * 60)

        # Load fetch queue
        with open(FETCH_QUEUE, 'r') as f:
            queue_data = json.load(f)

        self.total = queue_data['total']
        categories = queue_data['categories']

        self.log(f"Total articles to fetch: {self.total}")
        self.log(f"Already completed: {len(self.progress['completed'])}")
        self.log(f"Starting scraper...\n")

        # Start Playwright
        with sync_playwright() as p:
            # Launch browser (headless mode for faster scraping)
            self.log("Launching browser...")
            browser = p.chromium.launch(
                headless=True,
                args=['--disable-blink-features=AutomationControlled']  # Avoid detection
            )

            # Create a browser context with realistic settings
            context = browser.new_context(
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            )

            try:
                # Process each category
                for category_name in sorted(categories.keys()):
                    articles = categories[category_name]
                    self.log(f"\n{'='*60}")
                    self.log(f"Processing category: {category_name} ({len(articles)} articles)")
                    self.log(f"{'='*60}")

                    for idx, article in enumerate(articles, 1):
                        self.log(f"[{idx}/{len(articles)}] {article['filename']}")

                        # Use context instead of browser
                        page = context.new_page()
                        try:
                            # Inline the fetch logic to use context
                            url = article['url']
                            file_path = article['file']

                            if url not in self.progress['completed']:
                                self.log(f"Fetching: {url}")
                                page.set_viewport_size({"width": 1920, "height": 1080})
                                page.goto(url, timeout=TIMEOUT, wait_until='domcontentloaded')

                                article_data = self.extract_article_content(page)
                                if article_data:
                                    success = self.update_markdown_file(file_path, url, article_data)
                                    if success:
                                        self.progress['completed'].append(url)
                                        self.completed += 1
                                        self.log(f"✓ Success: {article['filename']}")
                                    else:
                                        raise Exception("Failed to update markdown")
                                else:
                                    raise Exception("No content extracted")
                            else:
                                self.skipped += 1

                        except Exception as e:
                            self.log(f"✗ Failed: {article['filename']} - {str(e)}")
                            self.progress['failed'].append({
                                'url': article['url'],
                                'file': article['file'],
                                'error': str(e)
                            })
                            self.failed += 1
                        finally:
                            page.close()
                            self.save_progress()

                        # Be respectful - delay between requests
                        time.sleep(DELAY_BETWEEN_REQUESTS)

                    # Progress update after each category
                    self.log(f"\nCategory {category_name} completed!")
                    self.log(f"Progress: {self.completed}/{self.total} completed, {self.failed} failed, {self.skipped} skipped\n")

            finally:
                context.close()
                browser.close()

        # Final summary
        self.log("\n" + "=" * 60)
        self.log("SCRAPING COMPLETE!")
        self.log("=" * 60)
        self.log(f"Total articles: {self.total}")
        self.log(f"Successfully fetched: {self.completed}")
        self.log(f"Skipped (already done): {self.skipped}")
        self.log(f"Failed: {self.failed}")

        if self.failed > 0:
            self.log(f"\nFailed URLs saved in: {PROGRESS_FILE}")
            self.log("You can review failures and retry if needed.")

        self.log(f"\nAll content saved to: {BASE_DIR}")
        self.log(f"Full log available at: {LOG_FILE}")

if __name__ == "__main__":
    scraper = MangoMintScraper()
    scraper.run()
