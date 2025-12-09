#!/usr/bin/env python3
"""
Stage 2: Feature Extraction Engine
Uses AI to extract structured features from consolidated categories
"""

import os
import json
from pathlib import Path
import re
from anthropic import Anthropic

OUTPUT_DIR = Path("/Users/daminirijhwani/medical-spa-platform/docs/competitor_analysis")
CONSOLIDATED_DIR = OUTPUT_DIR / "consolidated_categories"
FEATURES_DIR = OUTPUT_DIR / "extracted_features"

# Initialize Anthropic client (will use API key from environment)
client = Anthropic()

def extract_features_from_category(category_file):
    """Use Claude to extract features from a consolidated category file"""

    category_name = category_file.stem
    print(f"Extracting features from: {category_name}")

    # Read the consolidated markdown
    with open(category_file, 'r') as f:
        content = f.read()

    # Truncate if too long (Claude has context limits)
    if len(content) > 150000:
        print(f"  Warning: Content truncated (original: {len(content)} chars)")
        content = content[:150000] + "\n\n[Content truncated...]"

    # Prompt for feature extraction
    prompt = f"""Analyze this help center documentation for {category_name} and extract all features in a structured format.

Documentation:
{content}

Please provide a comprehensive JSON structure with the following format:

{{
  "category": "{category_name}",
  "features": [
    {{
      "feature_name": "Name of the feature",
      "description": "Clear description of what it does",
      "capabilities": ["capability 1", "capability 2"],
      "user_benefits": ["benefit 1", "benefit 2"],
      "complexity": "basic|intermediate|advanced",
      "integrations": ["any third-party integrations mentioned"],
      "screenshots_available": true/false,
      "keywords": ["searchable", "keywords"]
    }}
  ],
  "key_workflows": [
    {{
      "workflow_name": "Name of workflow",
      "steps": ["step 1", "step 2"],
      "features_involved": ["feature A", "feature B"]
    }}
  ],
  "integrations": [
    {{
      "name": "Integration name",
      "purpose": "What it integrates with and why"
    }}
  ],
  "competitive_advantages": [
    "Unique or notable capabilities that stand out"
  ]
}}

Be thorough and extract ALL features mentioned. Group related capabilities together.
Return ONLY the JSON, no additional text."""

    try:
        # Call Claude API
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=16000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        # Extract JSON from response
        response_text = message.content[0].text

        # Try to parse JSON
        # Sometimes Claude wraps it in markdown code blocks
        json_match = re.search(r'```json\s*\n(.*?)\n```', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(1)
        else:
            json_text = response_text

        features_data = json.loads(json_text)

        print(f"  ✓ Extracted {len(features_data.get('features', []))} features")
        return features_data

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def main():
    """Main feature extraction process"""
    print("="*60)
    print("Stage 2: Feature Extraction")
    print("="*60)

    # Create output directory
    FEATURES_DIR.mkdir(parents=True, exist_ok=True)

    # Get all consolidated category files
    category_files = sorted(CONSOLIDATED_DIR.glob("*.md"))

    if not category_files:
        print("\nError: No consolidated category files found!")
        print(f"Please run Stage 1 first to generate files in: {CONSOLIDATED_DIR}")
        return

    print(f"\nFound {len(category_files)} categories to analyze\n")

    all_features = []
    feature_database = {
        'competitor': 'Mango Mint',
        'total_categories': len(category_files),
        'categories': {}
    }

    for category_file in category_files:
        features_data = extract_features_from_category(category_file)

        if features_data:
            # Save individual category features
            output_file = FEATURES_DIR / f"{category_file.stem}_features.json"
            with open(output_file, 'w') as f:
                json.dump(features_data, f, indent=2)

            # Add to master database
            feature_database['categories'][category_file.stem] = features_data

            all_features.extend(features_data.get('features', []))

        print()

    # Save master feature database
    master_file = OUTPUT_DIR / "feature_database.json"
    with open(master_file, 'w') as f:
        json.dump(feature_database, f, indent=2)

    # Create searchable feature index
    feature_index = []
    for cat_name, cat_data in feature_database['categories'].items():
        for feature in cat_data.get('features', []):
            feature_index.append({
                'category': cat_name,
                'name': feature['feature_name'],
                'description': feature['description'],
                'complexity': feature.get('complexity', 'unknown'),
                'keywords': feature.get('keywords', [])
            })

    index_file = OUTPUT_DIR / "feature_index.json"
    with open(index_file, 'w') as f:
        json.dump(feature_index, f, indent=2)

    print("\n" + "="*60)
    print("FEATURE EXTRACTION COMPLETE!")
    print("="*60)
    print(f"Total features extracted: {len(all_features)}")
    print(f"Categories analyzed: {len(feature_database['categories'])}")
    print(f"\nMaster database: {master_file}")
    print(f"Feature index: {index_file}")
    print(f"Individual category features: {FEATURES_DIR}")

if __name__ == "__main__":
    main()
