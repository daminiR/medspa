# Mango Mint Competitor Analysis

This folder contains a comprehensive analysis of Mango Mint's help center documentation, organized by feature category.

**Total URLs Analyzed:** 363 help articles

## Folder Structure

```
mangomint-analysis/
├── 01-getting-started/              (23 files)
├── 02-calendar-and-appointments/    (62 files total)
│   ├── appointments-and-time-blocks/
│   ├── calendar-basics/
│   ├── express-booking/
│   ├── group-booking/
│   ├── intelligent-waitlist/
│   ├── resources/
│   ├── time-blocks/
│   └── waiting-room/
├── 03-sales-and-checkout/           (33 files)
├── 04-clients/                      (37 files)
├── 05-memberships/                  (14 files)
├── 06-gift-cards-and-packages/      (21 files)
├── 07-products-and-inventory/       (12 files)
├── 08-services/                     (14 files)
├── 09-staff-and-payroll/            (38 files)
├── 10-email-marketing/              (7 files)
├── 11-automated-flows-and-messages/ (19 files)
├── 12-forms-and-waivers/            (13 files)
├── 13-online-booking/               (18 files)
├── 14-business-setup/               (10 files)
├── 15-offers/                       (5 files)
├── 16-reports/                      (6 files)
├── 17-integrations/                 (4 files)
├── 18-payments/                     (32 files)
└── 19-account-management/           (3 files)
```

## How to Use This Analysis

Each markdown file represents one help article from Mango Mint's documentation. Every file contains:

1. **Title** - The article title
2. **URL** - Direct link to the Mango Mint help article
3. **Category & Subcategory** - Organizational structure
4. **Analysis Notes** - Space for detailed analysis (to be filled in)
5. **Key Features Identified** - List of features discussed
6. **Competitor Insights** - Strategic insights about their capabilities

## Top Categories by Volume

1. **Calendar & Appointments** (62 files) - Most documented area
   - Shows heavy focus on scheduling features
   - Multiple sub-categories indicate depth of features

2. **Staff & Payroll** (38 files) - Second largest
   - Full payroll integration
   - Advanced staff management

3. **Clients** (37 files) - Third largest
   - Comprehensive client management
   - Portal and self-service features

4. **Sales & Checkout** (33 files)
   - Detailed payment processing
   - Multiple payment methods

5. **Payments** (32 files)
   - Separate from checkout, showing depth
   - Hardware integration focus

## Next Steps

To perform deep analysis:

1. **Fetch Article Content** - Use WebFetch to read individual articles
2. **Identify Key Features** - Document specific capabilities
3. **Find Gaps** - Compare to your platform's features
4. **Prioritize Development** - Use insights to guide roadmap

## Analysis Strategy

Suggested approach:
1. Start with your core features (e.g., calendar, clients)
2. Fetch 5-10 articles per category
3. Document key features and UX patterns
4. Identify differentiators and gaps
5. Create implementation priorities

## File Naming Convention

Files are named based on their URL slug:
- `calendar-basics-and-views.md` → `/learn/calendar-basics-and-views/`
- `how-to-set-up-express-booking.md` → `/learn/how-to-set-up-express-booking/`

All URLs point to: `https://www.mangomint.com/learn/[slug]/`
