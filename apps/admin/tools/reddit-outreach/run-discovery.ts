#!/usr/bin/env ts-node

import { ProspectDiscoveryService } from './discovery-service';

/**
 * CLI tool to discover prospects from Reddit
 *
 * Usage:
 *   ts-node run-discovery.ts [limit]
 *
 * Example:
 *   ts-node run-discovery.ts 50
 */

async function main() {
  const limit = parseInt(process.argv[2]) || 50;

  console.log('🚀 Reddit Prospect Discovery Tool');
  console.log('================================\n');

  const service = new ProspectDiscoveryService();

  try {
    // Load existing prospects
    console.log('📂 Loading existing prospects...');
    const existingProspects = service.loadSavedProspects();
    console.log(`Found ${existingProspects.length} existing prospects\n`);

    // Discover new prospects
    const newProspects = await service.discoverProspects(limit);

    // Merge with existing (remove duplicates)
    const allProspects = [...existingProspects];
    const existingIds = new Set(existingProspects.map(p => p.id));

    for (const prospect of newProspects) {
      if (!existingIds.has(prospect.id)) {
        allProspects.push(prospect);
      }
    }

    // Sort all prospects by relevance
    allProspects.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Save merged prospects
    service.saveProspects(allProspects);

    // Display summary
    console.log('\n📊 Summary');
    console.log('================================');
    console.log(`Total prospects: ${allProspects.length}`);
    console.log(`New prospects: ${allProspects.length - existingProspects.length}`);
    console.log(`\nTop 10 prospects by relevance:`);
    console.log('--------------------------------');

    allProspects.slice(0, 10).forEach((p, i) => {
      console.log(`${i + 1}. [${p.relevanceScore}] r/${p.subreddit} - u/${p.author}`);
      console.log(`   ${p.type === 'post' ? p.title : p.content.substring(0, 80)}...`);
      console.log(`   Signals: ${p.frustrationSignals.join(', ') || 'none'}`);
      console.log(`   ${p.url}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
