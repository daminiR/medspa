#!/usr/bin/env python3
"""
Stage 1: Category Consolidation
Consolidates all articles within each category into comprehensive summaries
"""

import os
import json
from pathlib import Path
import re

BASE_DIR = Path("/Users/daminirijhwani/medical-spa-platform/docs/mangomint-analysis")
OUTPUT_DIR = Path("/Users/daminirijhwani/medical-spa-platform/docs/competitor_analysis")
CONSOLIDATED_DIR = OUTPUT_DIR / "consolidated_categories"

def extract_content_from_markdown(file_path):
    """Extract article content from markdown file"""
    with open(file_path, 'r') as f:
        content = f.read()

    # Extract title
    title_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else "Untitled"

    # Extract URL
    url_match = re.search(r'\*\*URL:\*\* (.+)$', content, re.MULTILINE)
    url = url_match.group(1) if url_match else ""

    # Extract article content section
    article_section = re.search(r'## Article Content\s*\n\n(.*?)\n\n## Images', content, re.DOTALL)
    article_text = article_section.group(1).strip() if article_section else ""

    # Extract images
    images = []
    image_section = re.search(r'## Images and Screenshots\s*\n(.*?)(?=\n## |$)', content, re.DOTALL)
    if image_section:
        image_text = image_section.group(1)
        # Parse image entries
        image_entries = re.findall(r'\d+\.\s+\*\*(.+?)\*\*\s+- Source: (.+)', image_text)
        images = [{'alt': alt, 'src': src} for alt, src in image_entries]

    return {
        'title': title,
        'url': url,
        'content': article_text,
        'images': images,
        'file_path': str(file_path)
    }

def consolidate_category(category_path, category_name):
    """Consolidate all articles in a category"""
    print(f"Consolidating: {category_name}")

    articles = []

    # Recursively find all markdown files
    for md_file in category_path.rglob("*.md"):
        if md_file.name == "README.md":
            continue

        try:
            article_data = extract_content_from_markdown(md_file)
            articles.append(article_data)
        except Exception as e:
            print(f"  Error processing {md_file.name}: {e}")

    return {
        'category_name': category_name,
        'total_articles': len(articles),
        'articles': articles
    }

def generate_consolidated_markdown(category_data, output_path):
    """Generate a comprehensive markdown summary for the category"""

    category_name = category_data['category_name']
    articles = category_data['articles']

    # Build markdown
    md_content = f"""# {category_name} - Comprehensive Analysis

**Total Articles**: {len(articles)}
**Competitor**: Mango Mint

---

## Executive Summary

This category contains {len(articles)} articles covering various aspects of {category_name.replace('-', ' ').title()}.

---

## Detailed Features

"""

    # Add each article
    for idx, article in enumerate(articles, 1):
        md_content += f"""
### {idx}. {article['title']}

**Source**: [{article['url']}]({article['url']})

#### Content

{article['content']}

"""

        # Add images if any
        if article['images']:
            md_content += f"\n#### Screenshots ({len(article['images'])} images)\n\n"
            for img_idx, img in enumerate(article['images'], 1):
                if 'http' in img['src']:  # Only include actual image URLs, not base64
                    md_content += f"{img_idx}. **{img['alt']}**: {img['src']}\n"

        md_content += "\n---\n"

    # Add summary section
    md_content += f"""

## Category Summary

### Key Capabilities Identified

<!-- This section will be filled by the feature extraction engine -->

### Notable Features

<!-- This section will be filled by the feature extraction engine -->

### Integration Points

<!-- This section will be filled by the feature extraction engine -->

"""

    # Write to file
    with open(output_path, 'w') as f:
        f.write(md_content)

    print(f"  ✓ Generated: {output_path.name}")

def main():
    """Main consolidation process"""
    print("="*60)
    print("Stage 1: Category Consolidation")
    print("="*60)

    # Create output directories
    CONSOLIDATED_DIR.mkdir(parents=True, exist_ok=True)

    # Get all category directories
    categories = [d for d in BASE_DIR.iterdir() if d.is_dir() and not d.name.startswith('.')]
    categories.sort()

    print(f"\nFound {len(categories)} categories to process\n")

    all_category_data = []

    for category_path in categories:
        category_name = category_path.name

        # Consolidate category
        category_data = consolidate_category(category_path, category_name)
        all_category_data.append(category_data)

        # Generate markdown
        output_file = CONSOLIDATED_DIR / f"{category_name}.md"
        generate_consolidated_markdown(category_data, output_file)

        print(f"  Articles processed: {category_data['total_articles']}\n")

    # Save JSON index
    index_file = OUTPUT_DIR / "category_index.json"
    with open(index_file, 'w') as f:
        json.dump({
            'total_categories': len(all_category_data),
            'categories': [
                {
                    'name': cat['category_name'],
                    'article_count': cat['total_articles']
                }
                for cat in all_category_data
            ]
        }, f, indent=2)

    print("\n" + "="*60)
    print("CONSOLIDATION COMPLETE!")
    print("="*60)
    print(f"Total categories: {len(all_category_data)}")
    print(f"Total articles: {sum(cat['total_articles'] for cat in all_category_data)}")
    print(f"\nOutput directory: {CONSOLIDATED_DIR}")
    print(f"Index file: {index_file}")

if __name__ == "__main__":
    main()
