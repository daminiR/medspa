#!/usr/bin/env python3

import os
import re

base_url = "https://www.mangomint.com"
base_dir = "/Users/daminirijhwani/medical-spa-platform/docs/mangomint-analysis"

# Read all paths
with open("/Users/daminirijhwani/medical-spa-platform/docs/mangomint-paths-extracted.txt", "r") as f:
    paths = [line.strip() for line in f if line.strip()]

# Category mapping based on keywords in URLs
category_mapping = {
    # Getting Started
    "01-getting-started": [
        "introduction-to-mangomint", "hipaa-compliance", "transitioning-to-booth-renter",
        "switching-to-mangomint", "guide-for-admin", "guide-for-non-admin",
        "learning-the-basics", "adding-notes-in-mangomint", "marketing-options-in-mangomint",
        "getting-started-with-mangomint", "about-mangomint", "mangomint-basics", "setting-up-your-account"
    ],

    # Calendar & Appointments
    "02-calendar-and-appointments/calendar-basics": [
        "calendar-basics", "calendar-color", "calendar-settings", "scheduling-options",
        "cancellations-and-rescheduling", "ical-calendar"
    ],
    "02-calendar-and-appointments/appointments-and-time-blocks": [
        "create-a-new-appointment", "edit-an-appointment", "cancel-or-delete-an-appointment",
        "enforce-my-cancellation-policy", "repeating-appointments", "print-appointment-details",
        "processing-finishing-and-buffer", "adding-a-form-to-an-existing-appointment"
    ],
    "02-calendar-and-appointments/express-booking": [
        "express-booking", "faq-express-booking"
    ],
    "02-calendar-and-appointments/group-booking": [
        "group-booking", "faq-group-booking"
    ],
    "02-calendar-and-appointments/resources": [
        "resources", "resource-groups", "resource-requirements", "faq-resources"
    ],
    "02-calendar-and-appointments/intelligent-waitlist": [
        "waitlist", "intelligent-waitlist"
    ],
    "02-calendar-and-appointments/waiting-room": [
        "waiting-room", "client-self-check"
    ],
    "02-calendar-and-appointments/time-blocks": [
        "time-block"
    ],

    # Sales & Checkout
    "03-sales-and-checkout": [
        "checkout", "sales", "receipt", "voiding", "refund", "tips", "gratuity",
        "barcode-scanner", "surcharge", "product-return", "product-exchange"
    ],

    # Clients
    "04-clients": [
        "client", "merge-duplicate", "block-a-client", "client-export",
        "client-portal", "client-ownership", "navigating-the-client-list"
    ],

    # Memberships
    "05-memberships": [
        "membership"
    ],

    # Gift Cards & Packages
    "06-gift-cards-and-packages": [
        "gift-card", "gift-up", "package", "giftcards"
    ],

    # Products & Inventory
    "07-products-and-inventory": [
        "product", "inventory", "purchase-order", "suppliers", "manage-suppliers"
    ],

    # Services
    "08-services": [
        "categories-and-services", "service", "couples-services", "link-services-to-staff"
    ],

    # Staff & Payroll
    "09-staff-and-payroll": [
        "staff", "payroll", "compensation", "work-hours", "days-off", "time-clock",
        "time-card", "archiving-staff", "paystub", "worker-onboarding", "employer-onboarding"
    ],

    # Email Marketing
    "10-email-marketing": [
        "marketing-email", "email-campaign", "mailchimp", "custom-email-address",
        "faq-email-marketing"
    ],

    # Automated Flows & Messages
    "11-automated-flows-and-messages": [
        "flow", "automated-messages", "web-chat"
    ],

    # Forms & Waivers
    "12-forms-and-waivers": [
        "form", "waiver", "waiverforever", "image-markup"
    ],

    # Online Booking
    "13-online-booking": [
        "online-booking", "booking-link", "google-business-profile", "dns-records",
        "wix-website", "squarespace-website", "wordpress-website", "shopify-website",
        "direct-booking-links"
    ],

    # Business Setup
    "14-business-setup": [
        "business-details", "business-setup", "logo-and-branding", "locations",
        "phone-numbers", "desktop-notifications", "update-your-mangomint-app",
        "ipad-on-kiosk-mode"
    ],

    # Offers
    "15-offers": [
        "offer", "discount-during-checkout", "groupon"
    ],

    # Reports
    "16-reports": [
        "reports", "daily-and-weekly-totals"
    ],

    # Integrations
    "17-integrations": [
        "integration", "apps-and-integrations", "webhooks", "shopify-integration"
    ],

    # Payments
    "18-payments": [
        "payment", "card-reader", "front-desk-display", "cash-drawer",
        "deposit", "mangomint-pay", "cards-on-file", "payment-disputes",
        "payment-processing", "payment-types", "split-payments"
    ],

    # Account Management
    "19-account-management": [
        "mangomint-subscription", "viewing-invoices", "updating-your-mangomint-subscription"
    ],
}

def get_category_for_path(path):
    """Determine which category a path belongs to based on keywords"""
    path_lower = path.lower()

    # Check each category's keywords
    for category, keywords in category_mapping.items():
        for keyword in keywords:
            if keyword in path_lower:
                return category

    # Check if it's a help-articles path - these are category pages, not articles
    if "/help-articles/" in path_lower and path_lower.count("/") <= 4:
        return None  # Skip category index pages

    # Default to getting started if we can't categorize
    return "01-getting-started"

def create_markdown_file(path, category):
    """Create a markdown file for a given path"""
    if not category:
        return

    # Extract title from path
    title = path.split("/")[-2] if path.endswith("/") else path.split("/")[-1]
    title = title.replace("-", " ").title()

    # Create filename
    filename = path.split("/")[-2] if path.endswith("/") else path.split("/")[-1]
    filename = filename.replace("/", "") + ".md"

    # Full path for the file
    category_dir = os.path.join(base_dir, category)
    os.makedirs(category_dir, exist_ok=True)
    filepath = os.path.join(category_dir, filename)

    # Create markdown content
    full_url = base_url + path
    content = f"""# {title}

**URL:** {full_url}

## Category
{category.split('/')[0].replace('-', ' ').title()}

## Subcategory
{category.split('/')[1].replace('-', ' ').title() if '/' in category else 'N/A'}

## Analysis Notes
<!-- Add your analysis notes here after fetching the content -->

## Key Features Identified
<!-- List key features mentioned in this article -->

## Competitor Insights
<!-- Note what this reveals about Mango Mint's capabilities -->
"""

    # Write the file
    with open(filepath, "w") as f:
        f.write(content)

    return filepath

# Process all paths
created_files = {}
skipped = []

for path in paths:
    category = get_category_for_path(path)
    if category:
        try:
            filepath = create_markdown_file(path, category)
            if filepath:
                if category not in created_files:
                    created_files[category] = []
                created_files[category].append(filepath)
        except Exception as e:
            print(f"Error processing {path}: {e}")
            skipped.append(path)
    else:
        skipped.append(path)

# Print summary
print(f"\n=== SUMMARY ===")
print(f"Total paths processed: {len(paths)}")
print(f"Files created: {sum(len(files) for files in created_files.values())}")
print(f"Skipped: {len(skipped)}\n")

print("Files created per category:")
for category in sorted(created_files.keys()):
    print(f"  {category}: {len(created_files[category])} files")

if skipped:
    print(f"\nSkipped paths (likely category index pages):")
    for path in skipped[:10]:
        print(f"  {path}")
    if len(skipped) > 10:
        print(f"  ... and {len(skipped) - 10} more")
