#!/usr/bin/env python3
"""
Stage 4: Gap Analysis Generator
Compares competitor features with current platform and generates gap analysis
"""

import os
import json
from pathlib import Path
from anthropic import Anthropic
import re

OUTPUT_DIR = Path("/Users/daminirijhwani/medical-spa-platform/docs/competitor_analysis")
REPORTS_DIR = OUTPUT_DIR / "reports"

# Initialize Anthropic client
client = Anthropic()

def load_competitor_features():
    """Load extracted competitor features"""
    feature_db_file = OUTPUT_DIR / "feature_database.json"

    if not feature_db_file.exists():
        print("Error: Competitor feature database not found!")
        print(f"Please run Stage 2 first to generate: {feature_db_file}")
        return None

    with open(feature_db_file, 'r') as f:
        return json.load(f)

def load_current_platform_features():
    """Load current platform inventory"""
    inventory_file = OUTPUT_DIR / "current_platform_inventory.json"

    if not inventory_file.exists():
        print("Error: Current platform inventory not found!")
        print(f"Please run Stage 3 first to generate: {inventory_file}")
        return None

    with open(inventory_file, 'r') as f:
        return json.load(f)

def perform_gap_analysis(competitor_data, current_platform_data):
    """Use AI to perform comprehensive gap analysis"""

    print("Performing gap analysis with AI...")

    prompt = f"""You are a product analyst comparing two medical spa management platforms.

COMPETITOR (Mango Mint):
{json.dumps(competitor_data, indent=2)[:50000]}

CURRENT PLATFORM (Luxe Medical Spa EMR):
{json.dumps(current_platform_data, indent=2)[:20000]}

Perform a comprehensive gap analysis and provide detailed JSON:

{{
  "executive_summary": {{
    "total_competitor_features": 0,
    "total_current_features": 0,
    "feature_parity_percentage": 0,
    "critical_gaps": [],
    "competitive_advantages": []
  }},
  "category_analysis": {{
    "Dashboard": {{
      "missing_features": [
        {{
          "feature": "Feature name",
          "importance": "critical|high|medium|low",
          "effort_estimate": "low|medium|high",
          "description": "What it does",
          "why_important": "Business value"
        }}
      ],
      "parity_features": ["Features both platforms have"],
      "unique_advantages": ["Features we have that they don't"]
    }}
  }},
  "priority_recommendations": [
    {{
      "feature": "Feature name",
      "category": "Category",
      "priority": "P0|P1|P2|P3",
      "rationale": "Why this should be prioritized",
      "estimated_effort": "1-2 weeks|2-4 weeks|1-2 months|3+ months",
      "dependencies": []
    }}
  ],
  "integration_gaps": [],
  "workflow_gaps": []
}}

Be thorough and strategic. Focus on features that provide real business value.
Return ONLY JSON."""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=16000,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text
        json_match = re.search(r'```json\s*\n(.*?)\n```', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group(1)
        else:
            json_text = response_text

        analysis = json.loads(json_text)
        print("  ✓ Gap analysis completed")
        return analysis

    except Exception as e:
        print(f"  ✗ Error: {e}")
        return None

def generate_markdown_report(gap_analysis):
    """Generate a comprehensive markdown report"""

    exec_summary = gap_analysis.get('executive_summary', {})
    category_analysis = gap_analysis.get('category_analysis', {})
    recommendations = gap_analysis.get('priority_recommendations', [])

    md_content = f"""# Competitive Gap Analysis: Mango Mint vs Luxe Medical Spa EMR

**Analysis Date**: 2025-10-16
**Competitor**: Mango Mint
**Current Platform**: Luxe Medical Spa EMR

---

## Executive Summary

- **Total Competitor Features Analyzed**: {exec_summary.get('total_competitor_features', 'N/A')}
- **Total Current Platform Features**: {exec_summary.get('total_current_features', 'N/A')}
- **Feature Parity**: {exec_summary.get('feature_parity_percentage', 0)}%

### Critical Gaps

"""

    for gap in exec_summary.get('critical_gaps', []):
        md_content += f"- **{gap}**\n"

    md_content += "\n### Our Competitive Advantages\n\n"

    for advantage in exec_summary.get('competitive_advantages', []):
        md_content += f"- {advantage}\n"

    md_content += "\n---\n\n## Detailed Category Analysis\n\n"

    # Category-by-category analysis
    for category, details in category_analysis.items():
        md_content += f"### {category}\n\n"

        # Missing features
        missing = details.get('missing_features', [])
        if missing:
            md_content += f"#### Missing Features ({len(missing)})\n\n"
            for feature in missing:
                importance_emoji = {
                    'critical': '🔴',
                    'high': '🟠',
                    'medium': '🟡',
                    'low': '🟢'
                }.get(feature.get('importance', 'medium'), '⚪')

                md_content += f"{importance_emoji} **{feature.get('feature', 'Unknown')}** "
                md_content += f"({feature.get('importance', 'medium')} priority, "
                md_content += f"{feature.get('effort_estimate', 'unknown')} effort)\n"
                md_content += f"   - {feature.get('description', 'No description')}\n"
                md_content += f"   - *Why important*: {feature.get('why_important', 'Not specified')}\n\n"

        # Parity features
        parity = details.get('parity_features', [])
        if parity:
            md_content += f"#### ✅ Feature Parity ({len(parity)} features)\n\n"
            for feature in parity:
                md_content += f"- {feature}\n"
            md_content += "\n"

        # Unique advantages
        unique = details.get('unique_advantages', [])
        if unique:
            md_content += f"#### 🌟 Our Unique Advantages ({len(unique)} features)\n\n"
            for feature in unique:
                md_content += f"- {feature}\n"
            md_content += "\n"

        md_content += "---\n\n"

    # Priority recommendations
    md_content += "## Priority Recommendations\n\n"

    # Group by priority
    p0_features = [r for r in recommendations if r.get('priority') == 'P0']
    p1_features = [r for r in recommendations if r.get('priority') == 'P1']
    p2_features = [r for r in recommendations if r.get('priority') == 'P2']

    if p0_features:
        md_content += "### 🔴 P0 - Critical (Ship Next Sprint)\n\n"
        for rec in p0_features:
            md_content += f"**{rec.get('feature')}** ({rec.get('category')})\n"
            md_content += f"- Effort: {rec.get('estimated_effort')}\n"
            md_content += f"- Rationale: {rec.get('rationale')}\n"
            if rec.get('dependencies'):
                md_content += f"- Dependencies: {', '.join(rec['dependencies'])}\n"
            md_content += "\n"

    if p1_features:
        md_content += "### 🟠 P1 - High Priority (Next 2-3 Sprints)\n\n"
        for rec in p1_features:
            md_content += f"**{rec.get('feature')}** ({rec.get('category')})\n"
            md_content += f"- Effort: {rec.get('estimated_effort')}\n"
            md_content += f"- Rationale: {rec.get('rationale')}\n\n"

    if p2_features:
        md_content += "### 🟡 P2 - Medium Priority (Backlog)\n\n"
        for rec in p2_features:
            md_content += f"- **{rec.get('feature')}** ({rec.get('category')}) - {rec.get('estimated_effort')}\n"

    # Integration gaps
    integration_gaps = gap_analysis.get('integration_gaps', [])
    if integration_gaps:
        md_content += "\n---\n\n## Integration Gaps\n\n"
        for integration in integration_gaps:
            md_content += f"- {integration}\n"

    # Workflow gaps
    workflow_gaps = gap_analysis.get('workflow_gaps', [])
    if workflow_gaps:
        md_content += "\n---\n\n## Workflow Gaps\n\n"
        for workflow in workflow_gaps:
            md_content += f"- {workflow}\n"

    md_content += "\n---\n\n## Next Steps\n\n"
    md_content += "1. Review P0 and P1 recommendations with product team\n"
    md_content += "2. Validate effort estimates with engineering\n"
    md_content += "3. Prioritize features based on business impact\n"
    md_content += "4. Create detailed specifications for top priority items\n"
    md_content += "5. Schedule regular competitive analysis updates\n"

    return md_content

def main():
    """Main gap analysis process"""
    print("="*60)
    print("Stage 4: Gap Analysis")
    print("="*60)

    # Create reports directory
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # Load data
    print("\nLoading data...")
    competitor_data = load_competitor_features()
    current_platform_data = load_current_platform_features()

    if not competitor_data or not current_platform_data:
        print("\nCannot proceed without both datasets.")
        return

    print("  ✓ Competitor data loaded")
    print("  ✓ Current platform data loaded\n")

    # Perform analysis
    gap_analysis = perform_gap_analysis(competitor_data, current_platform_data)

    if not gap_analysis:
        print("\nGap analysis failed.")
        return

    # Save JSON
    json_report_file = REPORTS_DIR / "gap_analysis.json"
    with open(json_report_file, 'w') as f:
        json.dump(gap_analysis, f, indent=2)

    print(f"  ✓ JSON report saved: {json_report_file}")

    # Generate markdown report
    print("\nGenerating markdown report...")
    md_report = generate_markdown_report(gap_analysis)

    md_report_file = REPORTS_DIR / "GAP_ANALYSIS_REPORT.md"
    with open(md_report_file, 'w') as f:
        f.write(md_report)

    print(f"  ✓ Markdown report saved: {md_report_file}")

    print("\n" + "="*60)
    print("GAP ANALYSIS COMPLETE!")
    print("="*60)
    print(f"\nKey outputs:")
    print(f"  - Detailed JSON: {json_report_file}")
    print(f"  - Executive Report: {md_report_file}")
    print(f"\nOpen the markdown report to see prioritized recommendations!")

if __name__ == "__main__":
    main()
