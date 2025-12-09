#!/usr/bin/env python3
"""
Master Orchestrator: Runs the complete competitive analysis pipeline
"""

import subprocess
import sys
from pathlib import Path
import time

TOOLS_DIR = Path(__file__).parent

def run_stage(stage_number, script_name, description):
    """Run a single stage of the analysis"""
    print("\n" + "="*70)
    print(f"STAGE {stage_number}: {description}")
    print("="*70 + "\n")

    script_path = TOOLS_DIR / script_name

    if not script_path.exists():
        print(f"Error: Script not found: {script_path}")
        return False

    try:
        result = subprocess.run(
            [sys.executable, str(script_path)],
            check=True,
            capture_output=False
        )
        print(f"\n✓ Stage {stage_number} completed successfully!")
        return True

    except subprocess.CalledProcessError as e:
        print(f"\n✗ Stage {stage_number} failed with error code {e.returncode}")
        return False

def main():
    """Run the complete analysis pipeline"""
    print("""
╔═══════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        COMPETITIVE ANALYSIS AUTOMATION SYSTEM                      ║
║        Luke's Medical Spa vs Competitors                          ║
║                                                                    ║
╚═══════════════════════════════════════════════════════════════════╝
    """)

    start_time = time.time()

    stages = [
        (1, "01_consolidate_categories.py", "Category Consolidation"),
        (2, "02_extract_features.py", "Feature Extraction (AI-Powered)"),
        (3, "03_analyze_codebase.py", "Codebase Analysis"),
        (4, "04_generate_gap_analysis.py", "Gap Analysis & Recommendations")
    ]

    print("\nThis will run all 4 stages of competitive analysis:")
    for stage_num, _, desc in stages:
        print(f"  {stage_num}. {desc}")

    print("\nEstimated time: 10-20 minutes (depending on API speed)")
    response = input("\nProceed? (y/n): ")

    if response.lower() != 'y':
        print("Analysis cancelled.")
        return

    # Run all stages
    for stage_num, script, description in stages:
        success = run_stage(stage_num, script, description)

        if not success:
            print(f"\n⚠️  Pipeline stopped at Stage {stage_num}")
            print("Fix the error and rerun this script to continue.")
            return

        # Small delay between stages
        time.sleep(2)

    # All stages complete!
    elapsed_time = time.time() - start_time
    minutes = int(elapsed_time // 60)
    seconds = int(elapsed_time % 60)

    print("\n" + "="*70)
    print("🎉 COMPETITIVE ANALYSIS COMPLETE!")
    print("="*70)
    print(f"\nTotal time: {minutes}m {seconds}s")
    print("\n📊 Your analysis outputs:")
    print("  - Consolidated categories: docs/competitor_analysis/consolidated_categories/")
    print("  - Feature database: docs/competitor_analysis/feature_database.json")
    print("  - Current platform inventory: docs/competitor_analysis/current_platform_inventory.json")
    print("  - Gap analysis report: docs/competitor_analysis/reports/GAP_ANALYSIS_REPORT.md")
    print("\n✨ Next steps:")
    print("  1. Review the Gap Analysis Report (markdown file)")
    print("  2. Prioritize P0 and P1 features with your team")
    print("  3. Create detailed specs for high-priority items")
    print("  4. Update your product roadmap")
    print("\n💡 To analyze another competitor:")
    print("  1. Scrape their documentation (use scrape_mangomint.py as template)")
    print("  2. Run this script again")
    print("  3. Compare results across multiple competitors")

if __name__ == "__main__":
    main()
