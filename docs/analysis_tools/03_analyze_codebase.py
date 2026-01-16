#!/usr/bin/env python3
"""
Stage 3: Codebase Analysis Scanner
Analyzes the Luxe Medical Spa EMR codebase to inventory existing features
"""

import os
import json
from pathlib import Path
import re
from anthropic import Anthropic

PROJECT_ROOT = Path("/Users/daminirijhwani/medical-spa-platform")
OUTPUT_DIR = PROJECT_ROOT / "docs/competitor_analysis"
CODEBASE_DIR = OUTPUT_DIR / "codebase_analysis"

# Initialize Anthropic client
client = Anthropic()

def find_code_files(directory, extensions=['.ts', '.tsx', '.js', '.jsx', '.py']):
    """Find all code files in directory"""
    code_files = []
    for ext in extensions:
        code_files.extend(directory.rglob(f"*{ext}"))
    return code_files

def analyze_directory_structure():
    """Analyze the project structure to identify feature areas"""

    print("Analyzing project structure...")

    structure = {
        'frontend_pages': [],
        'backend_routes': [],
        'components': [],
        'models': [],
        'services': []
    }

    # Scan common directory patterns
    patterns = {
        'frontend_pages': ['**/app/**/*.tsx', '**/pages/**/*.tsx', '**/app/**/page.tsx'],
        'components': ['**/components/**/*.tsx', '**/components/**/*.ts'],
        'backend_routes': ['**/api/**/*.ts', '**/routes/**/*.ts', '**/api/**/route.ts'],
        'models': ['**/models/**/*.ts', '**/schemas/**/*.ts'],
        'services': ['**/services/**/*.ts', '**/lib/**/*.ts']
    }

    for category, glob_patterns in patterns.items():
        files = []
        for pattern in glob_patterns:
            files.extend(PROJECT_ROOT.glob(pattern))
        structure[category] = [str(f.relative_to(PROJECT_ROOT)) for f in files]
        print(f"  Found {len(structure[category])} {category}")

    return structure

def extract_features_from_structure(structure):
    """Use AI to extract features from codebase structure"""

    print("\nExtracting features from codebase structure...")

    prompt = f"""Analyze this codebase structure for Luxe Medical Spa EMR platform and identify all features.

Frontend Pages:
{json.dumps(structure['frontend_pages'], indent=2)}

Backend Routes:
{json.dumps(structure['backend_routes'], indent=2)}

Components:
{json.dumps(structure['components'][:50], indent=2)}

Models:
{json.dumps(structure['models'], indent=2)}

Based on these file paths and directory structure, identify all features in this medical spa platform.

Provide a JSON structure:

{{
  "platform_name": "Luxe Medical Spa EMR",
  "feature_categories": {{
    "Dashboard": {{
      "features": ["feature 1", "feature 2"],
      "file_indicators": ["path1", "path2"]
    }},
    "Calendar": {{
      "features": [],
      "file_indicators": []
    }},
    "Patient Management": {{
      "features": [],
      "file_indicators": []
    }},
    "Billing": {{
      "features": [],
      "file_indicators": []
    }},
    "Staff": {{
      "features": [],
      "file_indicators": []
    }},
    "Reports": {{
      "features": [],
      "file_indicators": []
    }},
    "Messages": {{
      "features": [],
      "file_indicators": []
    }},
    "Settings": {{
      "features": [],
      "file_indicators": []
    }}
  }},
  "additional_capabilities": []
}}

Be thorough in inferring features from file paths. Return ONLY JSON."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8000,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text
        json_match = re.search(r'```json\s*\n(.*?)\n```', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(1)
        else:
            json_text = response_text

        features = json.loads(json_text)
        print("  ✓ Features extracted successfully")
        return features

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def read_key_files_for_deep_analysis():
    """Read key configuration and route files for detailed feature analysis"""

    print("\nReading key files for deep analysis...")

    key_files = []

    # Look for main config files
    config_patterns = [
        '**/package.json',
        '**/tsconfig.json',
        '**/next.config.js',
        '**/app/**/layout.tsx',
        '**/app/page.tsx'
    ]

    for pattern in config_patterns:
        for file_path in PROJECT_ROOT.glob(pattern):
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    key_files.append({
                        'path': str(file_path.relative_to(PROJECT_ROOT)),
                        'content': content[:5000]  # Truncate for API limits
                    })
            except Exception as e:
                print(f"  Could not read {file_path}: {e}")

    return key_files

def deep_feature_analysis(key_files):
    """Perform deep analysis on key source files"""

    print("\nPerforming deep feature analysis...")

    files_content = "\n\n".join([
        f"File: {f['path']}\n```\n{f['content']}\n```"
        for f in key_files[:10]  # Limit to prevent token overflow
    ])

    prompt = f"""Analyze these key files from Luxe Medical Spa EMR platform and provide detailed feature inventory.

{files_content}

Provide detailed JSON with:
{{
  "core_features": [
    {{
      "name": "Feature name",
      "category": "Dashboard|Calendar|Patient|Billing|Staff|Reports|Messages|Settings",
      "capabilities": ["cap1", "cap2"],
      "implementation_status": "full|partial|basic",
      "files_involved": ["file1", "file2"]
    }}
  ],
  "tech_stack": {{
    "frontend": [],
    "backend": [],
    "database": [],
    "third_party": []
  }},
  "integrations": []
}}

Return ONLY JSON."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8000,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text
        json_match = re.search(r'```json\s*\n(.*?)\n```', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(1)
        else:
            json_text = response_text

        analysis = json.loads(json_text)
        print(f"  ✓ Analyzed {len(analysis.get('core_features', []))} core features")
        return analysis

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def main():
    """Main codebase analysis process"""
    print("="*60)
    print("Stage 3: Codebase Analysis")
    print("="*60)

    # Create output directory
    CODEBASE_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Analyze directory structure
    structure = analyze_directory_structure()

    # Save structure
    structure_file = CODEBASE_DIR / "project_structure.json"
    with open(structure_file, 'w') as f:
        json.dump(structure, f, indent=2)

    # Step 2: Extract features from structure
    structural_features = extract_features_from_structure(structure)

    if structural_features:
        structure_features_file = CODEBASE_DIR / "features_from_structure.json"
        with open(structure_features_file, 'w') as f:
            json.dump(structural_features, f, indent=2)

    # Step 3: Read key files
    key_files = read_key_files_for_deep_analysis()

    # Step 4: Deep analysis
    if key_files:
        deep_analysis = deep_feature_analysis(key_files)

        if deep_analysis:
            deep_analysis_file = CODEBASE_DIR / "deep_feature_analysis.json"
            with open(deep_analysis_file, 'w') as f:
                json.dump(deep_analysis, f, indent=2)

    # Step 5: Combine analyses into master inventory
    master_inventory = {
        'platform': 'Luxe Medical Spa EMR',
        'analysis_date': '2025-10-16',
        'structural_analysis': structural_features,
        'deep_analysis': deep_analysis if 'deep_analysis' in locals() else None,
        'file_structure': structure
    }

    master_file = OUTPUT_DIR / "current_platform_inventory.json"
    with open(master_file, 'w') as f:
        json.dump(master_inventory, f, indent=2)

    print("\n" + "="*60)
    print("CODEBASE ANALYSIS COMPLETE!")
    print("="*60)
    print(f"Project structure saved: {structure_file}")
    print(f"Master inventory saved: {master_file}")
    print(f"Detailed analysis in: {CODEBASE_DIR}")

if __name__ == "__main__":
    main()
