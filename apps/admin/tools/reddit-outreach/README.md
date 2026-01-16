# Reddit Outreach Tool

A powerful, AI-assisted tool for medical spa professionals to engage with potential clients on Reddit in an authentic, helpful, and compliant way.

## What This Tool Does

The Reddit Outreach Tool helps you:

1. **Find Relevant Conversations**: Automatically discovers Reddit posts and comments where people are asking about cosmetic procedures, skincare, anti-aging, and other med spa services
2. **Discover Prospects**: NEW - Automated prospect discovery targeting MedSpa owners frustrated with their current booking/scheduling software
3. **Generate Smart Replies**: Uses AI to draft helpful, personalized responses that provide value without being spammy
4. **Track Engagement**: Monitors which posts you've replied to, response rates, and engagement metrics
5. **Stay Compliant**: Ensures your outreach follows Reddit's guidelines and maintains a helpful, educational tone
6. **Manage Multiple Accounts**: (Optional) Coordinate outreach across team members

---

## NEW: Prospect Discovery Service

### Overview

The Prospect Discovery Service automatically finds MedSpa owners on Reddit who are frustrated with their current software solutions. Perfect for B2B outreach to potential customers.

### Quick Start

```bash
# Run the discovery tool
ts-node tools/reddit-outreach/run-discovery.ts 50
```

### How It Works

**Target Subreddits:**
- r/Esthetics
- r/MedicalSpa
- r/smallbusiness
- r/Entrepreneur

**Pain Point Keywords:**
- "medspa software"
- "scheduling nightmare"
- "booking system"
- "mindbody frustrated"
- "vagaro"
- "boulevard software"
- "looking for spa software"
- "hate my booking"
- "switching from"

**Relevance Scoring:**
Each prospect is scored based on:
- Reddit engagement (upvotes/comments)
- Recency (last 30 days only)
- Frustration signals detected in content
- Keywords matched

**Output:**
Prospects are saved to `data/prospects.json` with full details:
- Post/comment content
- Author and subreddit
- Relevance score
- Frustration signals detected
- Direct link to engage

### Programmatic Usage

```typescript
import { ProspectDiscoveryService } from './discovery-service';

const service = new ProspectDiscoveryService();

// Discover new prospects
const prospects = await service.discoverProspects(50);

// Load saved prospects
const saved = service.loadSavedProspects();

// Save prospects
service.saveProspects(prospects);

// Example: Filter by subreddit
const estheticsProspects = prospects.filter(p => p.subreddit === 'Esthetics');
```

### Files Structure

```
reddit-outreach/
├── types.ts              # TypeScript interfaces
├── reddit-client.ts      # Reddit API client (public JSON API)
├── discovery-service.ts  # NEW - Prospect discovery service
├── run-discovery.ts      # NEW - CLI tool for discovery
├── data/
│   └── prospects.json    # NEW - Saved prospects database
└── README.md            # This file
```

## Key Features

- **CLI Interface**: Search, draft, and post replies directly from the command line
- **Web Dashboard**: Visual interface to review posts, manage drafts, and track analytics
- **AI-Powered Drafts**: Leverages GPT-4 to generate contextual, helpful responses
- **Rate Limiting**: Built-in protections to prevent appearing spammy
- **Sentiment Analysis**: Identifies the right tone for each conversation
- **Subreddit Targeting**: Focuses on relevant communities (r/30PlusSkinCare, r/SkincareAddiction, etc.)

---

## Setup Instructions

### 1. Create a Reddit Application

To use the Reddit API, you need to register your application:

1. **Log in to Reddit** with the account you want to use for outreach
2. **Visit**: https://www.reddit.com/prefs/apps
3. **Click**: "create another app..." at the bottom
4. **Fill out the form**:
   - **name**: `MedSpaOutreach` (or your business name)
   - **App type**: Select **"script"** (for personal use)
   - **description**: "Medical spa outreach and engagement tool"
   - **about url**: (optional) Your business website
   - **redirect uri**: `http://localhost:8080` (required but not used)
5. **Click**: "create app"

You'll see your app details with:
- **Client ID**: A short string under the app name (looks like: `xxxxxxxxxxx`)
- **Secret**: A longer string labeled "secret"

**Important**: Keep these credentials private! Never commit them to version control.

### 2. Set Up Environment Variables

Copy the example environment file if you haven't already:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Reddit credentials:

```bash
# Reddit API Configuration
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password
REDDIT_USER_AGENT=MedSpaOutreach/1.0 by /u/your_username

# OpenAI API Key (for AI-powered drafts)
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**User Agent Format**: Reddit requires a descriptive user agent. Use the format:
```
AppName/Version by /u/YourRedditUsername
```

Example: `MedSpaOutreach/1.0 by /u/YourMedSpa`

### 3. Get an OpenAI API Key

The tool uses OpenAI's GPT-4 to generate intelligent reply drafts:

1. **Visit**: https://platform.openai.com/api-keys
2. **Sign in** or create an account
3. **Click**: "Create new secret key"
4. **Copy** the key (starts with `sk-`) and add it to your `.env.local`

**Cost**: Typical usage is $0.01-0.05 per AI-generated reply draft. Set up usage limits in your OpenAI account.

### 4. Install Dependencies

From the admin app directory:

```bash
npm install
```

### 5. Verify Setup

Test that your credentials work:

```bash
npm run reddit:test
```

This will attempt to authenticate with Reddit and verify your OpenAI key is valid.

---

## How to Use

### CLI Commands

#### Search for Relevant Posts

Find posts mentioning specific topics:

```bash
npm run reddit:search "botox"
npm run reddit:search "lip filler" --limit 20
npm run reddit:search "anti-aging" --subreddit SkincareAddiction
```

Options:
- `--limit <n>`: Number of results to fetch (default: 10)
- `--subreddit <name>`: Search within a specific subreddit
- `--time <period>`: Time filter (day, week, month, year, all)

#### Generate an AI Reply Draft

Create a helpful response to a specific post:

```bash
npm run reddit:draft <post_url>
```

Example:
```bash
npm run reddit:draft https://www.reddit.com/r/30PlusSkinCare/comments/abc123/question_about_botox
```

The AI will analyze the post and generate a helpful, non-promotional response.

#### Review and Post a Reply

Review the generated draft and post it:

```bash
npm run reddit:reply <post_url> --review
```

Options:
- `--review`: Review and edit the draft before posting
- `--auto`: Post without review (use cautiously!)
- `--tone <style>`: Adjust tone (professional, friendly, educational)

#### Track Engagement

View analytics on your Reddit outreach:

```bash
npm run reddit:stats
npm run reddit:stats --days 30
```

Shows:
- Total posts/comments made
- Average upvotes and replies
- Best performing posts
- Subreddit breakdown

### Web Dashboard

Start the development server:

```bash
npm run dev
```

Then visit: `http://localhost:3000/tools/reddit-outreach`

The dashboard provides:
- **Search Interface**: Visual search with filters
- **Draft Queue**: Review and approve AI-generated drafts
- **Analytics**: Charts and metrics on your outreach
- **Templates**: Save and reuse successful response patterns
- **Safety Checks**: Warnings if you're posting too frequently

---

## Best Practices (How NOT to Get Banned)

### Reddit's Rules

Reddit takes spam very seriously. Follow these guidelines:

#### DO:
- ✅ **Provide genuine value**: Answer questions thoroughly and helpfully
- ✅ **Be transparent**: Mention your profession when relevant ("As a med spa professional...")
- ✅ **Engage authentically**: Upvote, comment on other posts, build karma
- ✅ **Follow subreddit rules**: Read each subreddit's sidebar before posting
- ✅ **Space out posts**: Don't reply to 10 posts in one hour
- ✅ **Vary your responses**: Don't copy-paste the same answer

#### DON'T:
- ❌ **Spam**: Never post the same content repeatedly
- ❌ **Self-promote excessively**: Mentioning your business once subtly is okay, constantly plugging it is not
- ❌ **Vote manipulate**: Don't use multiple accounts to upvote yourself
- ❌ **Ignore DMs**: If someone asks you to stop, respect that
- ❌ **Circumvent bans**: If a subreddit bans you, don't create a new account
- ❌ **Give medical advice**: Always recommend consulting a licensed professional

### Tool Safety Features

This tool includes protections:

1. **Rate Limiting**: Maximum 5 posts per hour, 20 per day (configurable)
2. **Cooldown Periods**: Enforced delays between posts to the same subreddit
3. **Duplicate Detection**: Warns if you're about to post similar content
4. **Karma Threshold**: Suggests building karma before heavy outreach
5. **Tone Analysis**: Flags overly promotional language

### Recommended Strategy

**Week 1-2**: Build Credibility
- Join relevant subreddits (r/SkincareAddiction, r/30PlusSkinCare, etc.)
- Comment on 5-10 posts daily with helpful advice
- Don't mention your business yet
- Build karma and account age

**Week 3-4**: Begin Subtle Outreach
- Use the tool to find 2-3 highly relevant posts per day
- Provide detailed, helpful answers
- Mention your profession naturally ("In my work as a medical aesthetician...")
- Include business info only if directly asked

**Month 2+**: Sustained Engagement
- Maintain regular, helpful presence
- Track which responses get the best engagement
- Refine your approach based on analytics
- Continue non-promotional engagement too

### Subreddit Guidelines

Different subreddits have different rules:

| Subreddit | Self-Promotion | Medical Advice | Best Approach |
|-----------|----------------|----------------|---------------|
| r/SkincareAddiction | Moderate tolerance | Allowed with disclaimers | Educational, science-backed |
| r/30PlusSkinCare | Low tolerance | Cautious acceptance | Personal experience focus |
| r/PlasticSurgery | Varies by flair | Welcomed | Professional perspective |
| r/Botox | Moderate tolerance | Welcomed | Practical guidance |
| r/AskDocs | Not allowed | Only from verified MDs | Avoid |

Always read the sidebar rules before posting!

---

## Troubleshooting

### "Missing environment variable" Error

**Problem**: The config.ts file can't find your Reddit or OpenAI credentials.

**Solution**:
1. Verify `.env.local` exists in the admin app root directory
2. Check that all required variables are set (see Setup step 2)
3. Restart your development server after changing `.env.local`

### "Invalid credentials" or "401 Unauthorized"

**Problem**: Reddit API authentication is failing.

**Solution**:
1. Double-check your `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`
2. Verify your Reddit username and password are correct
3. Ensure you created a "script" type app, not "web app"
4. Check that your user agent is in the correct format

### "Rate limit exceeded"

**Problem**: You've made too many API requests.

**Solution**:
1. Reddit allows 60 requests per minute for authenticated apps
2. The tool includes built-in rate limiting - this shouldn't happen often
3. Wait a few minutes and try again
4. If persistent, check for bugs in your search queries

### AI Drafts Are Low Quality

**Problem**: Generated responses are generic or unhelpful.

**Solution**:
1. Verify your `OPENAI_API_KEY` is correct and has credits
2. Try providing more context with the `--context` flag
3. Use the `--tone` option to adjust the response style
4. Review and edit drafts before posting (recommended anyway!)

### Account Suspended or Shadowbanned

**Problem**: Reddit has restricted your account.

**Solution**:
1. Visit https://www.reddit.com/appeal to appeal the decision
2. Review Reddit's Content Policy: https://www.redditinc.com/policies/content-policy
3. Slow down your posting frequency significantly
4. Focus on providing value without any self-promotion for several weeks
5. Consider starting fresh with a new account (but learn from mistakes!)

---

## Advanced Configuration

### Custom Search Keywords

Edit `tools/reddit-outreach/keywords.json` to customize search terms:

```json
{
  "primary": ["botox", "dermal filler", "lip filler"],
  "secondary": ["anti-aging", "wrinkles", "fine lines"],
  "excluded": ["lawsuit", "complication", "botched"]
}
```

### Response Templates

Create saved templates in `tools/reddit-outreach/templates/`:

```typescript
export const educationalTemplate = {
  tone: "professional",
  structure: "problem-solution-disclaimer",
  maxLength: 500,
  includeBusiness: false
};
```

### Subreddit Configuration

Customize behavior per subreddit in `tools/reddit-outreach/subreddits.json`:

```json
{
  "SkincareAddiction": {
    "maxPostsPerDay": 2,
    "cooldownHours": 12,
    "allowBusinessMention": false
  },
  "Botox": {
    "maxPostsPerDay": 5,
    "cooldownHours": 6,
    "allowBusinessMention": true
  }
}
```

---

## Support and Questions

### Resources
- **Reddit API Documentation**: https://www.reddit.com/dev/api
- **Reddit Self-Promotion Guidelines**: https://www.reddit.com/wiki/selfpromotion
- **OpenAI API Reference**: https://platform.openai.com/docs

### Getting Help
If you encounter issues:
1. Check the Troubleshooting section above
2. Review the console logs for specific error messages
3. Ensure all dependencies are up to date: `npm install`
4. Create an issue in the project repository with details

---

## Legal and Ethical Considerations

### Disclaimers

**This tool is for educational and engagement purposes only.**

- Always comply with Reddit's Terms of Service and Content Policy
- Follow all medical advertising regulations in your jurisdiction (FTC, FDA, etc.)
- Never provide medical diagnoses or treatment plans on Reddit
- Always recommend in-person consultations with licensed professionals
- Be transparent about your professional affiliation
- Respect user privacy and don't solicit personal health information publicly

### HIPAA Compliance

- Never discuss specific patient cases or identifiable information
- Don't request photos or personal details in public threads
- Use generic examples and hypothetical scenarios only
- Redirect specific questions to private consultations

### Platform Terms

By using this tool, you agree to:
- Reddit's User Agreement: https://www.redditinc.com/policies/user-agreement
- Reddit's Privacy Policy: https://www.reddit.com/policies/privacy-policy
- OpenAI's Terms of Use: https://openai.com/policies/terms-of-use

---

## Version History

### v1.0.0 (Current)
- Initial release
- Reddit API integration
- OpenAI GPT-4 integration
- CLI interface
- Web dashboard
- Analytics tracking
- Safety features and rate limiting

---

**Remember**: The goal is to be helpful, not to spam. Provide genuine value to Reddit users, and they'll naturally be interested in learning more about your services. Quality over quantity!
