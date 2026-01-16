/**
 * AI Hit Rate Tracking Service
 *
 * Tracks when AI suggestions are used, edited, or ignored
 * to measure and improve AI performance over time.
 */

import { getFirebaseApp } from '@/lib/firebase';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';

// ============ Types ============

export type HitAction = 'used' | 'edited' | 'ignored' | 'regenerated';

export interface HitRecord {
  conversationId: string;
  messageId: string;
  responseId: string;
  action: HitAction;
  originalText: string;
  finalText?: string;
  confidence: number;
  intent: string;
  urgency: string;
  staffId?: string;
  timestamp: Date;
  editDistance?: number; // Levenshtein distance if edited
}

export interface HitRateStats {
  total: number;
  used: number;
  edited: number;
  ignored: number;
  regenerated: number;
  hitRate: number;           // % used without editing
  acceptanceRate: number;    // % used or edited (not ignored)
  avgConfidenceUsed: number;
  avgConfidenceIgnored: number;
  byIntent: Record<string, { total: number; used: number; hitRate: number }>;
  byUrgency: Record<string, { total: number; used: number; hitRate: number }>;
}

// ============ Helper Functions ============

function getDb() {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  return getFirestore(app);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

// ============ Main Functions ============

/**
 * Track an AI response action
 */
export async function trackHit(record: Omit<HitRecord, 'timestamp' | 'editDistance'>): Promise<void> {
  const db = getDb();
  if (!db) {
    console.warn('Hit tracking: Firebase not configured');
    return;
  }

  // Calculate edit distance if edited
  let editDistance: number | undefined;
  if (record.action === 'edited' && record.finalText) {
    editDistance = levenshteinDistance(record.originalText, record.finalText);
  }

  try {
    await addDoc(collection(db, 'ai_hit_tracking'), {
      ...record,
      editDistance,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to track hit:', error);
  }
}

/**
 * Track when an AI suggestion is used as-is
 */
export async function trackUsed(
  conversationId: string,
  messageId: string,
  responseId: string,
  text: string,
  confidence: number,
  intent: string,
  urgency: string,
  staffId?: string
): Promise<void> {
  await trackHit({
    conversationId,
    messageId,
    responseId,
    action: 'used',
    originalText: text,
    confidence,
    intent,
    urgency,
    staffId,
  });
}

/**
 * Track when an AI suggestion is edited before sending
 */
export async function trackEdited(
  conversationId: string,
  messageId: string,
  responseId: string,
  originalText: string,
  finalText: string,
  confidence: number,
  intent: string,
  urgency: string,
  staffId?: string
): Promise<void> {
  await trackHit({
    conversationId,
    messageId,
    responseId,
    action: 'edited',
    originalText,
    finalText,
    confidence,
    intent,
    urgency,
    staffId,
  });
}

/**
 * Track when AI suggestions are ignored (staff writes own response)
 */
export async function trackIgnored(
  conversationId: string,
  messageId: string,
  topSuggestion: string,
  confidence: number,
  intent: string,
  urgency: string,
  staffId?: string
): Promise<void> {
  await trackHit({
    conversationId,
    messageId,
    responseId: 'none',
    action: 'ignored',
    originalText: topSuggestion,
    confidence,
    intent,
    urgency,
    staffId,
  });
}

/**
 * Get hit rate statistics for a time range
 */
export async function getHitRateStats(
  startDate: Date,
  endDate: Date
): Promise<HitRateStats> {
  const db = getDb();

  // Return empty stats if Firebase not configured
  if (!db) {
    return createEmptyStats();
  }

  try {
    const q = query(
      collection(db, 'ai_hit_tracking'),
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(endDate)),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(doc => doc.data() as HitRecord);

    if (records.length === 0) {
      return createEmptyStats();
    }

    // Calculate stats
    const total = records.length;
    const used = records.filter(r => r.action === 'used').length;
    const edited = records.filter(r => r.action === 'edited').length;
    const ignored = records.filter(r => r.action === 'ignored').length;
    const regenerated = records.filter(r => r.action === 'regenerated').length;

    const hitRate = total > 0 ? (used / total) * 100 : 0;
    const acceptanceRate = total > 0 ? ((used + edited) / total) * 100 : 0;

    // Average confidence for used vs ignored
    const usedRecords = records.filter(r => r.action === 'used');
    const ignoredRecords = records.filter(r => r.action === 'ignored');

    const avgConfidenceUsed = usedRecords.length > 0
      ? usedRecords.reduce((sum, r) => sum + r.confidence, 0) / usedRecords.length
      : 0;

    const avgConfidenceIgnored = ignoredRecords.length > 0
      ? ignoredRecords.reduce((sum, r) => sum + r.confidence, 0) / ignoredRecords.length
      : 0;

    // Stats by intent
    const byIntent: Record<string, { total: number; used: number; hitRate: number }> = {};
    for (const record of records) {
      if (!byIntent[record.intent]) {
        byIntent[record.intent] = { total: 0, used: 0, hitRate: 0 };
      }
      byIntent[record.intent].total++;
      if (record.action === 'used') {
        byIntent[record.intent].used++;
      }
    }
    for (const intent in byIntent) {
      byIntent[intent].hitRate = byIntent[intent].total > 0
        ? (byIntent[intent].used / byIntent[intent].total) * 100
        : 0;
    }

    // Stats by urgency
    const byUrgency: Record<string, { total: number; used: number; hitRate: number }> = {};
    for (const record of records) {
      if (!byUrgency[record.urgency]) {
        byUrgency[record.urgency] = { total: 0, used: 0, hitRate: 0 };
      }
      byUrgency[record.urgency].total++;
      if (record.action === 'used') {
        byUrgency[record.urgency].used++;
      }
    }
    for (const urgency in byUrgency) {
      byUrgency[urgency].hitRate = byUrgency[urgency].total > 0
        ? (byUrgency[urgency].used / byUrgency[urgency].total) * 100
        : 0;
    }

    return {
      total,
      used,
      edited,
      ignored,
      regenerated,
      hitRate,
      acceptanceRate,
      avgConfidenceUsed,
      avgConfidenceIgnored,
      byIntent,
      byUrgency,
    };

  } catch (error) {
    console.error('Failed to get hit rate stats:', error);
    return createEmptyStats();
  }
}

/**
 * Get recent hit records for debugging/monitoring
 */
export async function getRecentHits(count: number = 100): Promise<HitRecord[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, 'ai_hit_tracking'),
      orderBy('timestamp', 'desc'),
      limit(count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp?.toDate() || new Date(),
      } as HitRecord;
    });
  } catch (error) {
    console.error('Failed to get recent hits:', error);
    return [];
  }
}

// ============ Helpers ============

function createEmptyStats(): HitRateStats {
  return {
    total: 0,
    used: 0,
    edited: 0,
    ignored: 0,
    regenerated: 0,
    hitRate: 0,
    acceptanceRate: 0,
    avgConfidenceUsed: 0,
    avgConfidenceIgnored: 0,
    byIntent: {},
    byUrgency: {},
  };
}

// ============ Export ============

export const hitTracker = {
  trackUsed,
  trackEdited,
  trackIgnored,
  getHitRateStats,
  getRecentHits,
};
