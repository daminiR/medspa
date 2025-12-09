#!/usr/bin/env python3
"""
Reorganize roadmap items according to new phase structure.
"""

import re

# Map old item number to new item number based on user's requirements
ITEM_MAPPING = {
    4: 1,   # Item 4 becomes item 1 (PHASE I)
    7: 2,   # Item 7 becomes item 2 (PHASE I)
    8: 3,   # Item 8 becomes item 3 (PHASE I)
    13: 4,  # Item 13 becomes item 4 (PHASE I)
    18: 5,  # Item 18 becomes item 5 (PHASE I)
    2: 6,   # Item 2 becomes item 6 (PHASE II)
    14: 7,  # Item 14 becomes item 7 (PHASE II)
    5: 8,   # Item 5 becomes item 8 (PHASE II)
    15: 9,  # Item 15 becomes item 9 (PHASE II)
    9: 10,  # Item 9 becomes item 10 (PHASE III)
    17: 11, # Item 17 becomes item 11 (PHASE III)
    10: 12, # Item 10 becomes item 12 (PHASE III)
    11: 13, # Item 11 becomes item 13 (PHASE III)
    12: 14, # Item 12 becomes item 14 (PHASE III)
    20: 15, # Item 20 becomes item 15 (PHASE III)
    16: 16, # Item 16 becomes item 16 (PHASE IV)
    25: 17, # Item 25 becomes item 17 (PHASE IV)
    19: 18, # Item 19 becomes item 18 (PHASE IV)
    1: 19,  # Item 1 becomes item 19 (PHASE V)
    3: 20,  # Item 3 becomes item 20 (PHASE V)
    6: 21,  # Item 6 becomes item 21 (PHASE V)
    21: 22, # Item 21 becomes item 22 (PHASE VI)
    22: 23, # Item 22 becomes item 23 (PHASE VI)
    23: 24, # Item 23 becomes item 24 (PHASE VI)
    24: 25, # Item 25 becomes item 25 (PHASE VI)
    26: 26, # Item 26 stays item 26 (PHASE VI)
}

# Create reverse mapping
NEW_TO_OLD = {v: k for k, v in ITEM_MAPPING.items()}

# Define phases
PHASES = [
    ('🏗️ PHASE I: Foundation - Core Business Operations', [1, 2, 3, 4, 5]),
    ('⚡ PHASE II: Automation & Efficiency', [6, 7, 8, 9]),
    ('💰 PHASE III: Revenue Optimization', [10, 11, 12, 13, 14, 15]),
    ('🤖 PHASE IV: Advanced Optimization', [16, 17, 18]),
    ('📱 PHASE V: Marketing & Communication', [19, 20, 21]),
    ('🚀 PHASE VI: Future Innovations', [22, 23, 24, 25, 26]),
]

def main():
    file_path = '/Users/daminirijhwani/medical-spa-platform/docs/SYSTEM_WORKFLOWS.html'

    print("Reading file...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # First, find the roadmap section bounds
    roadmap_pattern = r'<div class="roadmap-queue">\s*<h2 class="section-title">.*?PHASE I.*?Foundation'
    match = re.search(roadmap_pattern, content, re.DOTALL)

    if not match:
        print("ERROR: Could not find roadmap section start")
        return 1

    section_start = match.start()

    # Find the next roadmap-queue section to know where this section ends
    next_section_pattern = r'<div class="roadmap-queue" style="margin-top: 60px;">'
    next_match = re.search(next_section_pattern, content[section_start+100:])

    if next_match:
        section_end = section_start + 100 + next_match.start()
    else:
        print("ERROR: Could not find roadmap section end")
        return 1

    # Extract only from the roadmap section
    roadmap_content = content[section_start:section_end]

    # Create a mapping of current priority numbers to their HTML blocks
    print("\nExtracting items from roadmap section...")
    items = {}

    for old_num in range(1, 27):
        # Find the queue-item div for this priority number within roadmap section
        priority_pattern = rf'<div class="priority-number">{old_num}</div>'
        matches = list(re.finditer(priority_pattern, roadmap_content))

        if not matches:
            print(f"  WARNING: Item {old_num} not found in roadmap")
            continue

        if len(matches) > 1:
            print(f"  WARNING: Item {old_num} found {len(matches)} times, using last occurrence")

        # Use the last match
        match = matches[-1]

        # Find the start of the queue-item div by searching backwards
        pos = match.start()
        while pos > 0:
            if roadmap_content[pos:pos+100].startswith('<div class="queue-item"'):
                start = pos
                break
            pos -= 1
        else:
            print(f"  WARNING: Could not find queue-item start for item {old_num}")
            continue

        # Find the end by counting divs
        pos = start
        depth = 0
        in_div = False

        while pos < len(roadmap_content):
            if roadmap_content[pos:pos+5] == '<div ':
                depth += 1
                in_div = True
            elif roadmap_content[pos:pos+6] == '</div>':
                depth -= 1
                if in_div and depth == 0:
                    end = pos + 6
                    break
            pos += 1
        else:
            print(f"  WARNING: Could not find queue-item end for item {old_num}")
            continue

        items[old_num] = roadmap_content[start:end]
        print(f"  Extracted item {old_num}")

    print(f"\nExtracted {len(items)} items")
    print(f"Roadmap section: {section_start} to {section_end}")

    # Build new content
    print("\nBuilding new roadmap...")
    new_roadmap_lines = []
    new_roadmap_lines.append('                <div class="roadmap-queue">\n')

    for phase_title, phase_items in PHASES:
        new_roadmap_lines.append(f'                    <h2 class="section-title">{phase_title}</h2>\n')
        new_roadmap_lines.append('                    <p style="color: #666; margin-bottom: 30px; font-size: 1.1em;">Click each item to expand and see exact prompt to give Claude Code.</p>\n\n')

        for new_num in phase_items:
            old_num = NEW_TO_OLD.get(new_num)
            if old_num and old_num in items:
                # Update the item's numbers
                item_html = items[old_num]

                # Update priority-number display
                item_html = re.sub(
                    rf'<div class="priority-number">{old_num}</div>',
                    f'<div class="priority-number">{new_num}</div>',
                    item_html
                )

                # Update toggleSection calls
                item_html = re.sub(
                    rf"toggleSection\('priority-{old_num}'\)",
                    f"toggleSection('priority-{new_num}')",
                    item_html
                )

                # Update id attributes
                item_html = re.sub(
                    rf'id="priority-{old_num}"',
                    f'id="priority-{new_num}"',
                    item_html
                )

                # Update promoteToCurrently calls
                item_html = re.sub(
                    rf'promoteToCurrently\({old_num}\)',
                    f'promoteToCurrently({new_num})',
                    item_html
                )

                new_roadmap_lines.append('                    ')
                new_roadmap_lines.append(item_html)
                new_roadmap_lines.append('\n\n')

                print(f"  Added item {new_num} (was {old_num})")

        new_roadmap_lines.append('\n')

    new_roadmap_lines.append('                </div>')

    # Replace the section
    print("\nReplacing content...")
    new_content = (
        content[:section_start] +
        ''.join(new_roadmap_lines) +
        content[section_end:]
    )

    # Write output
    print(f"\nWriting to {file_path}...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("\n✓ Reorganization complete!")
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
