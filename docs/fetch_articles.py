#!/usr/bin/env python3

import os
import glob
import re

base_dir = "/Users/daminirijhwani/medical-spa-platform/docs/mangomint-analysis"

# Find all markdown files and extract their URLs
def get_all_urls_and_files():
    """Get all markdown files and their URLs"""
    results = []

    for md_file in glob.glob(f"{base_dir}/**/*.md", recursive=True):
        if "README.md" in md_file:
            continue

        with open(md_file, 'r') as f:
            content = f.read()
            # Extract URL from the file
            url_match = re.search(r'\*\*URL:\*\* (https://[^\s]+)', content)
            if url_match:
                url = url_match.group(1)
                # Get category from path
                rel_path = md_file.replace(base_dir + "/", "")
                category = rel_path.split("/")[0]
                results.append({
                    'file': md_file,
                    'url': url,
                    'category': category,
                    'filename': os.path.basename(md_file)
                })

    return results

# Group by category
def organize_by_category(results):
    """Organize results by category"""
    categories = {}
    for item in results:
        cat = item['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    return categories

# Generate a fetch list
urls_and_files = get_all_urls_and_files()
categories = organize_by_category(urls_and_files)

# Print organized list
print(f"Total files to fetch: {len(urls_and_files)}\n")

# Write to a JSON-like format for easy processing
import json
output_file = f"{base_dir}/fetch_queue.json"
with open(output_file, 'w') as f:
    json.dump({
        'total': len(urls_and_files),
        'categories': categories
    }, f, indent=2)

print(f"Fetch queue saved to: {output_file}")

# Print summary
for cat in sorted(categories.keys()):
    print(f"{cat}: {len(categories[cat])} articles")
