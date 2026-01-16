#!/usr/bin/env python3
"""
Workflow Comparison Analysis
Compares Mango Mint workflows vs Luxe Medical Spa EMR workflows
Shows WHO WINS on UX/seamlessness for each feature
"""

import os
import json
import anthropic
from pathlib import Path

# Paths
DOCS_ROOT = Path(__file__).parent.parent
MANGOMINT_CONSOLIDATED = DOCS_ROOT / "competitor_analysis/consolidated_categories"
CURRENT_CODEBASE_ROOT = DOCS_ROOT.parent / "apps/admin/src/components"
OUTPUT_DIR = DOCS_ROOT / "competitor_analysis/workflow_comparisons"

# Anthropic API
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def read_file(filepath):
    """Read file contents"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return ""

def analyze_mangomint_workflow(category_name, content):
    """Use Claude to extract Mango Mint workflows"""

    prompt = f"""Analyze this Mango Mint documentation for **{category_name}** and extract detailed workflows.

For EACH feature mentioned, describe:
1. The user workflow (step-by-step)
2. UX highlights (what makes it smooth/seamless)
3. Key interactions (clicks, forms, automations)
4. Mobile vs desktop experience
5. Pain points solved

Focus on HOW THEY DO IT, not just WHAT they do.

Documentation:
{content[:30000]}

Return JSON:
{{
  "features": [
    {{
      "feature_name": "Feature name",
      "workflow_steps": ["Step 1", "Step 2", ...],
      "ux_highlights": ["Highlight 1", ...],
      "key_interactions": ["Interaction 1", ...],
      "mobile_support": "Yes/No/Partial",
      "pain_points_solved": ["Pain point 1", ...]
    }}
  ]
}}
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}]
    )

    content_text = response.content[0].text

    # Extract JSON from response
    try:
        json_start = content_text.find('{')
        json_end = content_text.rfind('}') + 1
        json_str = content_text[json_start:json_end]
        return json.loads(json_str)
    except:
        return {"features": []}

def analyze_current_platform_feature(feature_name, codebase_components):
    """Analyze how Luxe platform currently implements a feature"""

    # Find relevant components
    relevant_files = []
    search_terms = feature_name.lower().replace(" ", "").replace("-", "")

    for root, dirs, files in os.walk(CURRENT_CODEBASE_ROOT):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                filename_lower = file.lower()

                # Check if filename is relevant
                if any(term in filename_lower for term in [search_terms[:6], 'calendar', 'appointment', 'waitlist', 'resource']):
                    relevant_files.append(filepath)

    # Read relevant files (limit to 3 most relevant)
    component_code = ""
    for filepath in relevant_files[:3]:
        code = read_file(filepath)
        component_code += f"\n\n// {os.path.basename(filepath)}\n{code[:1000]}"

    if not component_code:
        return {"implemented": False, "workflow": "Not implemented"}

    # Analyze with Claude
    prompt = f"""Analyze how Luxe Medical Spa EMR currently implements "{feature_name}".

Code snippets:
{component_code[:10000]}

Describe:
1. Is this feature implemented? (Yes/Partial/No)
2. Current workflow (step-by-step)
3. UX strengths
4. UX weaknesses
5. Missing compared to best practices

Return JSON:
{{
  "implemented": "Yes/Partial/No",
  "workflow_steps": ["Step 1", ...],
  "ux_strengths": ["Strength 1", ...],
  "ux_weaknesses": ["Weakness 1", ...],
  "missing_features": ["Missing 1", ...]
}}
"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )

        content_text = response.content[0].text
        json_start = content_text.find('{')
        json_end = content_text.rfind('}') + 1
        json_str = content_text[json_start:json_end]
        return json.loads(json_str)
    except Exception as e:
        print(f"Error analyzing current platform: {e}")
        return {"implemented": "Unknown", "workflow_steps": []}

def compare_workflows(feature_name, mangomint_workflow, current_workflow):
    """Compare workflows and determine winner"""

    prompt = f"""Compare these two implementations of "{feature_name}" and determine WHO WINS.

**Mango Mint Implementation:**
Workflow: {json.dumps(mangomint_workflow.get('workflow_steps', []))}
UX Highlights: {json.dumps(mangomint_workflow.get('ux_highlights', []))}
Pain Points Solved: {json.dumps(mangomint_workflow.get('pain_points_solved', []))}

**Luxe Medical Spa EMR Implementation:**
Status: {current_workflow.get('implemented')}
Workflow: {json.dumps(current_workflow.get('workflow_steps', []))}
Strengths: {json.dumps(current_workflow.get('ux_strengths', []))}
Weaknesses: {json.dumps(current_workflow.get('ux_weaknesses', []))}

Return JSON:
{{
  "winner": "Mango Mint / Luxe Platform / Tie / Luxe Not Implemented",
  "winner_reasoning": "Why they win (1-2 sentences)",
  "mangomint_score": 0-10,
  "luxe_score": 0-10,
  "key_differentiators": ["What makes winner better", ...],
  "how_to_beat_them": ["What Luxe needs to do to win", ...]
}}
"""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=3000,
            messages=[{"role": "user", "content": prompt}]
        )

        content_text = response.content[0].text
        json_start = content_text.find('{')
        json_end = content_text.rfind('}') + 1
        json_str = content_text[json_start:json_end]
        return json.loads(json_str)
    except Exception as e:
        print(f"Error comparing workflows: {e}")
        return {
            "winner": "Error",
            "winner_reasoning": str(e)
        }

def run_workflow_comparison():
    """Main workflow comparison analysis"""

    print("🔬 Starting Workflow Comparison Analysis...")
    print("=" * 60)

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Focus on Calendar & Appointments first (most critical)
    category_file = MANGOMINT_CONSOLIDATED / "02-calendar-and-appointments.md"

    print(f"\n📋 Analyzing: Calendar & Appointments")
    print("-" * 60)

    # Read Mango Mint docs
    content = read_file(category_file)

    # Extract Mango Mint workflows
    print("1️⃣  Extracting Mango Mint workflows...")
    mangomint_analysis = analyze_mangomint_workflow("Calendar & Appointments", content)

    print(f"   Found {len(mangomint_analysis.get('features', []))} features")

    # Compare each feature
    comparisons = []

    for idx, feature in enumerate(mangomint_analysis.get('features', [])[:10], 1):  # Limit to 10 features
        feature_name = feature['feature_name']
        print(f"\n2️⃣  Analyzing feature {idx}: {feature_name}")

        # Analyze current platform
        print(f"   → Checking Luxe implementation...")
        current_analysis = analyze_current_platform_feature(feature_name, CURRENT_CODEBASE_ROOT)

        # Compare workflows
        print(f"   → Comparing workflows...")
        comparison = compare_workflows(feature_name, feature, current_analysis)

        # Combine results
        full_comparison = {
            "feature_name": feature_name,
            "mangomint": feature,
            "luxe_platform": current_analysis,
            "comparison": comparison
        }

        comparisons.append(full_comparison)

        winner = comparison.get('winner', 'Unknown')
        print(f"   ✅ Winner: {winner}")

    # Save results
    output_file = OUTPUT_DIR / "calendar_workflow_comparison.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "category": "Calendar & Appointments",
            "total_features_compared": len(comparisons),
            "comparisons": comparisons
        }, f, indent=2)

    print(f"\n✅ Workflow comparison saved to: {output_file}")
    print(f"\n📊 Summary:")
    print(f"   Total features compared: {len(comparisons)}")

    # Count winners
    mango_wins = sum(1 for c in comparisons if 'Mango Mint' in c['comparison'].get('winner', ''))
    luxe_wins = sum(1 for c in comparisons if "Luxe" in c['comparison'].get('winner', ''))

    print(f"   Mango Mint wins: {mango_wins}")
    print(f"   Luxe wins: {luxe_wins}")
    print(f"   Not implemented: {len(comparisons) - mango_wins - luxe_wins}")

    return output_file

if __name__ == "__main__":
    run_workflow_comparison()
