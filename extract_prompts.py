#!/usr/bin/env python3
import re
import os

# Read the HTML file
with open('/Users/daminirijhwani/medical-spa-platform/docs/SYSTEM_WORKFLOWS.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all queue-item sections with prompts
# Pattern: Find sections that contain priority-number, queue-item-title, and COPY THIS PROMPT
pattern = r'<div class="queue-item"[^>]*>.*?</div>\s*</div>\s*</div>'

# Split by queue-item divs to process each one
sections = re.split(r'<div class="queue-item"', content)

prompts_found = []

for i, section in enumerate(sections[1:], 1):  # Skip first split (header)
    # Check if this section has a prompt
    if 'COPY THIS PROMPT TO CLAUDE CODE:' not in section:
        continue

    # Extract priority number
    priority_match = re.search(r'<div class="priority-number">(\d+)</div>', section)
    if not priority_match:
        continue
    priority = priority_match.group(1)

    # Extract title
    title_match = re.search(r'<div class="queue-item-title">([^<]+)</div>', section)
    if not title_match:
        continue
    title = title_match.group(1).strip()

    # Extract the prompt (everything in the <pre> tag after the COPY THIS PROMPT header)
    prompt_match = re.search(r'COPY THIS PROMPT TO CLAUDE CODE:</h4>\s*<pre[^>]*>(.*?)</pre>', section, re.DOTALL)
    if not prompt_match:
        continue

    prompt_text = prompt_match.group(1).strip()

    # Clean up HTML entities and tags
    prompt_text = re.sub(r'<b>', '**', prompt_text)
    prompt_text = re.sub(r'</b>', '**', prompt_text)
    prompt_text = re.sub(r'<span[^>]*>', '', prompt_text)
    prompt_text = re.sub(r'</span>', '', prompt_text)

    prompts_found.append({
        'priority': int(priority),
        'title': title,
        'prompt': prompt_text
    })

    print(f"Found: Priority {priority} - {title}")

# Sort by priority
prompts_found.sort(key=lambda x: x['priority'])

# Create output directory
os.makedirs('/Users/daminirijhwani/medical-spa-platform/roadmap_rebuild', exist_ok=True)

# Save each prompt to a separate file
for item in prompts_found:
    filename = f"/Users/daminirijhwani/medical-spa-platform/roadmap_rebuild/item_{item['priority']:02d}_extracted.md"

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"# Priority {item['priority']}: {item['title']}\n\n")
        f.write(f"## Prompt\n\n")
        f.write(item['prompt'])

    print(f"Saved: {filename}")

# Create summary file
with open('/Users/daminirijhwani/medical-spa-platform/roadmap_rebuild/EXTRACTION_SUMMARY.md', 'w', encoding='utf-8') as f:
    f.write("# Roadmap Item Extraction Summary\n\n")
    f.write(f"## Total Items Found: {len(prompts_found)}\n\n")

    f.write("## Extracted Items\n\n")
    for item in prompts_found:
        f.write(f"- **Priority {item['priority']:02d}**: {item['title']}\n")

    # Find missing priorities (1-26)
    found_priorities = set(item['priority'] for item in prompts_found)
    all_priorities = set(range(1, 27))
    missing = sorted(all_priorities - found_priorities)

    if missing:
        f.write(f"\n## Missing Items ({len(missing)} items)\n\n")
        f.write("The following priority numbers do not have extractable prompts:\n\n")
        for p in missing:
            f.write(f"- Priority {p:02d}\n")
    else:
        f.write("\n## All items (1-26) successfully extracted!\n")

print(f"\n✅ Extraction complete!")
print(f"   - Found {len(prompts_found)} items with prompts")
print(f"   - Files saved to: /Users/daminirijhwani/medical-spa-platform/roadmap_rebuild/")
print(f"   - Summary: /Users/daminirijhwani/medical-spa-platform/roadmap_rebuild/EXTRACTION_SUMMARY.md")
