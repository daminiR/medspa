#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import { discover } from './discover';
import { RedditClient } from './reddit-client';
import { Prospect, ProspectsData } from './types';

const execAsync = promisify(exec);
const DATA_FILE = path.join(__dirname, 'data', 'prospects.json');

// Utility to copy to clipboard (macOS)
async function copyToClipboard(text: string): Promise<void> {
  try {
    await execAsync(`echo "${text.replace(/"/g, '\\"')}" | pbcopy`);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
}

// Utility to open URL in browser (macOS)
async function openInBrowser(url: string): Promise<void> {
  try {
    await execAsync(`open "${url}"`);
  } catch (error) {
    console.error('Failed to open browser:', error);
  }
}

// Load prospects data
function loadProspects(): ProspectsData {
  if (!fs.existsSync(DATA_FILE)) {
    return { prospects: [], lastUpdated: new Date().toISOString() };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

// Save prospects data
function saveProspects(data: ProspectsData): void {
  data.lastUpdated = new Date().toISOString();
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Create readline interface
function createInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Prompt user for input
function question(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Command: status
async function commandStatus(): Promise<void> {
  const data = loadProspects();
  const counts = {
    new: data.prospects.filter(p => p.status === 'new').length,
    approved: data.prospects.filter(p => p.status === 'approved').length,
    posted: data.prospects.filter(p => p.status === 'posted').length,
    skipped: data.prospects.filter(p => p.status === 'skipped').length,
  };

  console.log('\n📊 Prospect Status Report');
  console.log('═'.repeat(50));
  console.log(`🆕 New:      ${counts.new.toString().padStart(4)}`);
  console.log(`✅ Approved: ${counts.approved.toString().padStart(4)}`);
  console.log(`📮 Posted:   ${counts.posted.toString().padStart(4)}`);
  console.log(`⏭️  Skipped:  ${counts.skipped.toString().padStart(4)}`);
  console.log('─'.repeat(50));
  console.log(`📈 Total:    ${data.prospects.length.toString().padStart(4)}`);
  console.log(`🕐 Last updated: ${new Date(data.lastUpdated).toLocaleString()}`);
  console.log('═'.repeat(50) + '\n');
}

// Command: review
async function commandReview(): Promise<void> {
  const data = loadProspects();
  const prospectsToReview = data.prospects.filter(p => p.status === 'new');

  if (prospectsToReview.length === 0) {
    console.log('\n✨ No new prospects to review!\n');
    return;
  }

  console.log(`\n📋 Reviewing ${prospectsToReview.length} new prospects...\n`);

  const rl = createInterface();

  // Initialize Reddit client for API posting
  let redditClient: RedditClient | null = null;
  if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET) {
    redditClient = new RedditClient({
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME || '',
      password: process.env.REDDIT_PASSWORD || '',
      userAgent: process.env.REDDIT_USER_AGENT || 'MedSpaOutreach/1.0',
    });
  }

  for (let i = 0; i < prospectsToReview.length; i++) {
    const prospect = prospectsToReview[i];

    console.log('═'.repeat(80));
    console.log(`📍 Prospect ${i + 1}/${prospectsToReview.length}`);
    console.log('═'.repeat(80));
    console.log(`\n🏷️  Subreddit: r/${prospect.subreddit}`);
    console.log(`🔗 URL: ${prospect.url}`);
    console.log('\n📝 Original Post:');
    console.log('─'.repeat(80));
    console.log(prospect.originalText.substring(0, 500));
    if (prospect.originalText.length > 500) {
      console.log('[... truncated ...]');
    }
    console.log('─'.repeat(80));
    console.log('\n💬 AI-Generated Draft:');
    console.log('─'.repeat(80));
    console.log(prospect.aiDraft);
    console.log('─'.repeat(80));
    console.log('');

    let currentDraft = prospect.aiDraft;
    let shouldContinue = true;

    while (shouldContinue) {
      const answer = await question(
        rl,
        '\n👉 Action? [a]pprove | [e]dit | [s]kip | [o]pen in browser | [q]uit: '
      );

      switch (answer.toLowerCase()) {
        case 'a': {
          // Approve
          const postMethod = await question(
            rl,
            '📮 Post via [A]PI or [B]rowser? '
          );

          if (postMethod.toLowerCase() === 'a') {
            // Post via API
            if (!redditClient) {
              console.log('❌ Reddit API credentials not configured. Opening in browser instead...');
              await copyToClipboard(currentDraft);
              await openInBrowser(prospect.url);
              console.log('✅ Draft copied to clipboard and browser opened!');
              prospect.status = 'approved';
              prospect.postMethod = 'browser';
            } else {
              console.log('📡 Posting via Reddit API...');
              const result = await redditClient.postComment(prospect.id, currentDraft);

              if (result.success) {
                console.log('✅ Successfully posted comment!');
                prospect.status = 'posted';
                prospect.postMethod = 'api';
              } else {
                console.log(`❌ Failed to post: ${result.error}`);
                console.log('Opening in browser as fallback...');
                await copyToClipboard(currentDraft);
                await openInBrowser(prospect.url);
                console.log('✅ Draft copied to clipboard and browser opened!');
                prospect.status = 'approved';
                prospect.postMethod = 'browser';
              }
            }
          } else {
            // Post via browser
            await copyToClipboard(currentDraft);
            await openInBrowser(prospect.url);
            console.log('✅ Draft copied to clipboard and browser opened!');
            prospect.status = 'approved';
            prospect.postMethod = 'browser';
          }

          prospect.aiDraft = currentDraft;
          prospect.updatedAt = new Date().toISOString();
          saveProspects(data);
          shouldContinue = false;
          break;
        }

        case 'e': {
          // Edit
          console.log('\n📝 Current draft:');
          console.log(currentDraft);
          console.log('');
          const newDraft = await question(rl, '✏️  Enter new draft (or press Enter to cancel): ');

          if (newDraft.trim()) {
            currentDraft = newDraft.trim();
            console.log('\n✅ Draft updated!');
            console.log('─'.repeat(80));
            console.log(currentDraft);
            console.log('─'.repeat(80));
          }
          break;
        }

        case 's': {
          // Skip
          prospect.status = 'skipped';
          prospect.updatedAt = new Date().toISOString();
          saveProspects(data);
          console.log('⏭️  Skipped');
          shouldContinue = false;
          break;
        }

        case 'o': {
          // Open in browser without posting
          await openInBrowser(prospect.url);
          console.log('🌐 Opened in browser');
          break;
        }

        case 'q': {
          // Quit
          console.log('\n👋 Exiting review...\n');
          rl.close();
          return;
        }

        default: {
          console.log('❌ Invalid option. Please choose a, e, s, o, or q.');
          break;
        }
      }
    }

    console.log('');
  }

  rl.close();
  console.log('\n✅ Review complete!\n');
}

// Main CLI handler
async function main() {
  const command = process.argv[2];

  if (!command) {
    console.log(`
Reddit Outreach Tool

Usage:
  npm run reddit:discover  - Find new prospects
  npm run reddit:review    - Review and approve drafts
  npm run reddit:status    - Show prospect counts

Environment variables required:
  REDDIT_CLIENT_ID      - Reddit API client ID
  REDDIT_CLIENT_SECRET  - Reddit API client secret
  REDDIT_USERNAME       - Reddit username
  REDDIT_PASSWORD       - Reddit password
  GEMINI_API_KEY        - Google Gemini API key
    `);
    process.exit(0);
  }

  try {
    switch (command) {
      case 'discover':
        await discover();
        break;

      case 'review':
        await commandReview();
        break;

      case 'status':
        await commandStatus();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.error('Available commands: discover, review, status');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
