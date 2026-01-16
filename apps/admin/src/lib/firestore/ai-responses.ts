/**
 * Firestore AI Responses Module
 *
 * Handles storage and retrieval of AI-generated response suggestions.
 * Uses Firestore for real-time updates to the UI.
 */

import { getFirebaseApp } from '@/lib/firebase';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { AIProcessingResult, MessageAnalysis, GeneratedResponse, TenantContext } from '@/services/ai/gemini-messaging-service';

// ============ Types ============

export interface TenantPath {
  medSpaId: string;
  locationId: string;
}

/**
 * Get tenant path from environment or explicit params
 */
function getTenantPath(tenant?: Partial<TenantPath>): TenantPath {
  return {
    medSpaId: tenant?.medSpaId || process.env.DEFAULT_MEDSPA_ID || 'default',
    locationId: tenant?.locationId || process.env.DEFAULT_LOCATION_ID || 'default',
  };
}

/**
 * Build the Firestore path for tenant-isolated conversations
 * Path: medspas/{medSpaId}/locations/{locationId}/conversations/{conversationId}/ai_responses
 */
function buildConversationPath(conversationId: string, tenant: TenantPath): string {
  return `medspas/${tenant.medSpaId}/locations/${tenant.locationId}/conversations/${conversationId}/ai_responses`;
}

export interface StoredAIResponse {
  messageId: string;
  patientId: string;
  patientName: string;
  analysis: MessageAnalysis;
  responses: GeneratedResponse[];
  contextSummary: {
    hasRecentTreatment: boolean;
    inCriticalPeriod: boolean;
    isVIP: boolean;
    hasUpcomingAppointment: boolean;
  };
  generatedAt: Date;
  expiresAt: Date;
  processingTimeMs: number;
  // Multi-tenant info
  tenant: TenantPath;
  outcome?: {
    action: 'used' | 'edited' | 'ignored' | 'regenerated';
    selectedResponseId?: string;
    editedText?: string;
    staffId?: string;
    actionAt: Date;
  };
}

export interface AIResponseUpdate {
  outcome: StoredAIResponse['outcome'];
}

// ============ Helper Functions ============

function getDb() {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error('Firebase not initialized');
  }
  return getFirestore(app);
}

function getAIResponsesCollection(conversationId: string, tenant?: Partial<TenantPath>) {
  const db = getDb();
  const t = getTenantPath(tenant);
  // Tenant-isolated path: medspas/{medSpaId}/locations/{locationId}/conversations/{conversationId}/ai_responses
  return collection(db, 'medspas', t.medSpaId, 'locations', t.locationId, 'conversations', conversationId, 'ai_responses');
}

/**
 * Convert Firestore document to StoredAIResponse
 */
function docToStoredResponse(docData: any): StoredAIResponse {
  return {
    ...docData,
    generatedAt: docData.generatedAt?.toDate() || new Date(),
    expiresAt: docData.expiresAt?.toDate() || new Date(),
    tenant: docData.tenant || { medSpaId: 'default', locationId: 'default' },
    outcome: docData.outcome ? {
      ...docData.outcome,
      actionAt: docData.outcome.actionAt?.toDate() || new Date(),
    } : undefined,
  };
}

// ============ CRUD Operations ============

/**
 * Store AI processing result in Firestore
 * Uses tenant-isolated path: medspas/{medSpaId}/locations/{locationId}/conversations/{conversationId}/ai_responses
 */
export async function storeAIResponse(
  conversationId: string,
  result: AIProcessingResult,
  tenant?: Partial<TenantPath>
): Promise<void> {
  const db = getDb();
  const t = getTenantPath(tenant || result.tenant);
  const docRef = doc(
    db,
    'medspas', t.medSpaId,
    'locations', t.locationId,
    'conversations', conversationId,
    'ai_responses', result.messageId
  );

  const stored: any = {
    messageId: result.messageId,
    patientId: result.patientId,
    patientName: result.patientName,
    analysis: result.analysis,
    responses: result.responses,
    contextSummary: {
      hasRecentTreatment: (result.context?.recentTreatments?.length || 0) > 0,
      inCriticalPeriod: result.context?.recentTreatments?.some(tx => tx.inCriticalPeriod) || false,
      isVIP: result.context?.isVIP || false,
      hasUpcomingAppointment: !!result.context?.upcomingAppointment,
    },
    generatedAt: Timestamp.fromDate(result.generatedAt),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
    processingTimeMs: result.processingTimeMs,
    tenant: t,
  };

  await setDoc(docRef, stored);
}

/**
 * Get the latest AI response for a conversation
 */
export async function getLatestAIResponse(
  conversationId: string,
  tenant?: Partial<TenantPath>
): Promise<StoredAIResponse | null> {
  const colRef = getAIResponsesCollection(conversationId, tenant);
  const q = query(colRef, orderBy('generatedAt', 'desc'), limit(1));

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }

  return docToStoredResponse(snapshot.docs[0].data());
}

/**
 * Get AI response by message ID
 */
export async function getAIResponseByMessageId(
  conversationId: string,
  messageId: string,
  tenant?: Partial<TenantPath>
): Promise<StoredAIResponse | null> {
  const db = getDb();
  const t = getTenantPath(tenant);
  const docRef = doc(
    db,
    'medspas', t.medSpaId,
    'locations', t.locationId,
    'conversations', conversationId,
    'ai_responses', messageId
  );

  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return null;
  }

  return docToStoredResponse(docSnap.data());
}

/**
 * Update AI response outcome (when staff takes action)
 */
export async function updateAIResponseOutcome(
  conversationId: string,
  messageId: string,
  outcome: StoredAIResponse['outcome'],
  tenant?: Partial<TenantPath>
): Promise<void> {
  const db = getDb();
  const t = getTenantPath(tenant);
  const docRef = doc(
    db,
    'medspas', t.medSpaId,
    'locations', t.locationId,
    'conversations', conversationId,
    'ai_responses', messageId
  );

  await setDoc(docRef, {
    outcome: {
      ...outcome,
      actionAt: Timestamp.fromDate(outcome?.actionAt || new Date()),
    },
  }, { merge: true });
}

/**
 * Delete expired AI responses
 */
export async function cleanupExpiredResponses(
  conversationId: string,
  tenant?: Partial<TenantPath>
): Promise<number> {
  const colRef = getAIResponsesCollection(conversationId, tenant);
  const now = Timestamp.now();

  const q = query(colRef, where('expiresAt', '<', now));
  const snapshot = await getDocs(q);

  let deleted = 0;
  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref);
    deleted++;
  }

  return deleted;
}

// ============ Real-time Subscriptions ============

/**
 * Subscribe to AI responses for a conversation
 * Returns unsubscribe function
 */
export function subscribeToAIResponses(
  conversationId: string,
  callback: (responses: StoredAIResponse[]) => void,
  onError?: (error: Error) => void,
  tenant?: Partial<TenantPath>
): Unsubscribe {
  try {
    const colRef = getAIResponsesCollection(conversationId, tenant);
    const q = query(colRef, orderBy('generatedAt', 'desc'), limit(5));

    return onSnapshot(
      q,
      (snapshot) => {
        const responses = snapshot.docs.map(docSnap => docToStoredResponse(docSnap.data()));
        callback(responses);
      },
      (error) => {
        console.error('AI responses subscription error:', error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to AI responses:', error);
    onError?.(error as Error);
    return () => {}; // Return no-op unsubscribe
  }
}

/**
 * Subscribe to the latest AI response only
 */
export function subscribeToLatestAIResponse(
  conversationId: string,
  callback: (response: StoredAIResponse | null) => void,
  onError?: (error: Error) => void,
  tenant?: Partial<TenantPath>
): Unsubscribe {
  try {
    const colRef = getAIResponsesCollection(conversationId, tenant);
    const q = query(colRef, orderBy('generatedAt', 'desc'), limit(1));

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(null);
        } else {
          callback(docToStoredResponse(snapshot.docs[0].data()));
        }
      },
      (error) => {
        console.error('AI response subscription error:', error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error('Failed to subscribe to AI response:', error);
    onError?.(error as Error);
    return () => {};
  }
}

// ============ Analytics Helpers ============

export interface AIResponseStats {
  total: number;
  used: number;
  edited: number;
  ignored: number;
  avgConfidence: number;
  avgProcessingTime: number;
  hitRate: number; // percentage of suggestions used without editing
}

/**
 * Get AI response usage statistics for a time range
 * Queries per-tenant analytics collection
 */
export async function getAIResponseStats(
  startDate: Date,
  endDate: Date,
  tenant?: Partial<TenantPath>
): Promise<AIResponseStats> {
  const db = getDb();
  const t = getTenantPath(tenant);

  // Analytics are stored per-tenant at: medspas/{medSpaId}/locations/{locationId}/analytics/ai_responses
  // For MVP, we query aggregated data. In production, use BigQuery or Cloud Functions for heavy analytics.
  try {
    const analyticsRef = doc(
      db,
      'medspas', t.medSpaId,
      'locations', t.locationId,
      'analytics', 'ai_responses_summary'
    );

    const docSnap = await getDoc(analyticsRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        total: data.total || 0,
        used: data.used || 0,
        edited: data.edited || 0,
        ignored: data.ignored || 0,
        avgConfidence: data.avgConfidence || 0,
        avgProcessingTime: data.avgProcessingTime || 0,
        hitRate: data.total > 0 ? ((data.used || 0) / data.total) * 100 : 0,
      };
    }
  } catch (error) {
    console.error('Failed to fetch AI response stats:', error);
  }

  // Return empty stats if not found
  return {
    total: 0,
    used: 0,
    edited: 0,
    ignored: 0,
    avgConfidence: 0,
    avgProcessingTime: 0,
    hitRate: 0,
  };
}

/**
 * Increment analytics counters when staff takes action
 * Called from updateAIResponseOutcome
 */
export async function incrementAnalyticsCounter(
  action: 'used' | 'edited' | 'ignored',
  confidence: number,
  processingTimeMs: number,
  tenant?: Partial<TenantPath>
): Promise<void> {
  const db = getDb();
  const t = getTenantPath(tenant);

  const analyticsRef = doc(
    db,
    'medspas', t.medSpaId,
    'locations', t.locationId,
    'analytics', 'ai_responses_summary'
  );

  try {
    const docSnap = await getDoc(analyticsRef);
    const current = docSnap.exists() ? docSnap.data() : {
      total: 0,
      used: 0,
      edited: 0,
      ignored: 0,
      totalConfidence: 0,
      totalProcessingTime: 0,
    };

    const updated = {
      ...current,
      total: (current.total || 0) + 1,
      [action]: (current[action] || 0) + 1,
      totalConfidence: (current.totalConfidence || 0) + confidence,
      totalProcessingTime: (current.totalProcessingTime || 0) + processingTimeMs,
      avgConfidence: ((current.totalConfidence || 0) + confidence) / ((current.total || 0) + 1),
      avgProcessingTime: ((current.totalProcessingTime || 0) + processingTimeMs) / ((current.total || 0) + 1),
      lastUpdated: Timestamp.now(),
    };

    await setDoc(analyticsRef, updated, { merge: true });
  } catch (error) {
    console.error('Failed to update analytics:', error);
  }
}
