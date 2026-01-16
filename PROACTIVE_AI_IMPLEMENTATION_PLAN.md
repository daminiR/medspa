# Proactive AI Messaging - Implementation Plan

## Quick Start Guide

This document provides step-by-step implementation instructions with working code examples for the proactive AI messaging system using Vertex AI and Gemini.

---

## Phase 1: Vertex AI Setup (Day 1-2)

### Step 1.1: Install Dependencies

```bash
cd apps/admin
npm install @google/genai @google-cloud/pubsub
```

### Step 1.2: Add Environment Variables

Add to `.env.local`:

```env
# Vertex AI Configuration
GOOGLE_CLOUD_PROJECT=your-medspa-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true

# For local development, use service account key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### Step 1.3: Create Gemini Client

Create `/src/lib/vertex-ai/client.ts`:

```typescript
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

interface GeminiConfig {
  project?: string;
  location?: string;
  model?: string;
}

class GeminiClient {
  private client: GoogleGenAI;
  private defaultModel: string;

  constructor(config: GeminiConfig = {}) {
    const project = config.project || process.env.GOOGLE_CLOUD_PROJECT;
    const location = config.location || process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    if (!project) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable is required');
    }

    this.client = new GoogleGenAI({
      vertexai: true,
      project,
      location,
    });

    this.defaultModel = config.model || 'gemini-2.0-flash';
  }

  async generateContent(
    prompt: string,
    options: {
      systemInstruction?: string;
      temperature?: number;
      maxOutputTokens?: number;
      model?: string;
    } = {}
  ): Promise<string> {
    const response = await this.client.models.generateContent({
      model: options.model || this.defaultModel,
      contents: prompt,
      config: {
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.maxOutputTokens ?? 1024,
      },
    });

    return response.text || '';
  }

  async generateStructured<T>(
    prompt: string,
    schema: object,
    options: {
      systemInstruction?: string;
      model?: string;
    } = {}
  ): Promise<T> {
    const response = await this.client.models.generateContent({
      model: options.model || this.defaultModel,
      contents: prompt,
      config: {
        systemInstruction: options.systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    return JSON.parse(response.text || '{}') as T;
  }

  async countTokens(content: string): Promise<number> {
    const response = await this.client.models.countTokens({
      model: this.defaultModel,
      contents: content,
    });
    return response.totalTokens || 0;
  }
}

// Export singleton instance
let clientInstance: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!clientInstance) {
    clientInstance = new GeminiClient();
  }
  return clientInstance;
}

export { GeminiClient };
```

### Step 1.4: Create System Instructions

Create `/src/services/ai/system-instructions.ts`:

```typescript
export const MEDSPA_SYSTEM_INSTRUCTION = `You are an AI assistant for a premium medical spa. Your role is to analyze patient messages and generate helpful, professional response suggestions.

## Guidelines:

1. **Patient Safety First**
   - Flag any mention of complications, adverse reactions, or emergencies
   - Never downplay medical concerns
   - Default to human review for medical questions

2. **Professional Tone**
   - Warm, professional, appropriate for healthcare
   - Use "we" and "our team" not "I"
   - Be concise - SMS responses should be under 160 characters

3. **HIPAA Awareness**
   - Never repeat specific medical details in responses
   - Keep responses general when discussing treatments
   - Don't confirm diagnosis or treatment details

4. **Scope**
   DO provide: appointment help, general service info, post-care reminders
   DO NOT provide: medical advice, diagnosis, specific pricing
   ALWAYS escalate: complications, emergencies, complaints

## Response Format:
Generate 2-3 response options, ranked by confidence.
Each response should be:
- Under 160 characters (SMS limit)
- Actionable and helpful
- Appropriate for the detected intent and urgency`;

export const ANALYSIS_SYSTEM_INSTRUCTION = `Analyze the patient message and return a JSON object with:
- intent: The primary purpose (booking, confirmation, cancellation, treatment_question, complication, emergency, pricing, general)
- urgency: CRITICAL, HIGH, MEDIUM, or LOW
- sentiment: POSITIVE, NEUTRAL, NEGATIVE, or ANGRY
- requiresHuman: true if a staff member should review before sending
- riskFactors: Array of any concerning elements detected`;
```

### Step 1.5: Create Context Builder

Create `/src/services/ai/context-builder.ts`:

```typescript
import { patients, appointments } from '@/lib/data';
import { findRecentTreatment, findPatientIdByPhone } from '@/lib/data/treatmentLookup';

export interface PatientContext {
  patientId: string;
  firstName: string;
  isVIP: boolean;
  membershipTier?: string;
  recentTreatment?: {
    name: string;
    date: string;
    daysAgo: number;
    inCriticalPeriod: boolean;
  };
  upcomingAppointment?: {
    date: string;
    time: string;
    service: string;
    provider: string;
  };
  conversationHistory: Array<{
    sender: 'patient' | 'staff';
    message: string;
  }>;
}

export async function buildPatientContext(
  phoneNumber: string,
  recentMessages: Array<{ sender: string; text: string }> = []
): Promise<PatientContext | null> {
  // Find patient by phone
  const patientId = findPatientIdByPhone(phoneNumber);
  if (!patientId) return null;

  const patient = patients.find(p => p.id === patientId);
  if (!patient) return null;

  // Get recent treatment
  const recentTreatment = findRecentTreatment(patientId);

  // Get upcoming appointment
  const now = new Date();
  const upcomingAppt = appointments.find(
    a => a.patientId === patientId &&
        new Date(a.startTime) > now &&
        a.status !== 'cancelled'
  );

  // Build context
  const context: PatientContext = {
    patientId,
    firstName: patient.firstName,
    isVIP: patient.tags?.includes('VIP') || false,
    membershipTier: patient.membershipTier,
    conversationHistory: recentMessages.slice(-5).map(m => ({
      sender: m.sender === 'clinic' ? 'staff' : 'patient',
      message: m.text,
    })),
  };

  if (recentTreatment) {
    const treatmentDate = new Date(recentTreatment.date);
    const daysAgo = Math.floor((now.getTime() - treatmentDate.getTime()) / (1000 * 60 * 60 * 24));
    context.recentTreatment = {
      name: recentTreatment.serviceName,
      date: recentTreatment.date,
      daysAgo,
      inCriticalPeriod: daysAgo <= 3,
    };
  }

  if (upcomingAppt) {
    context.upcomingAppointment = {
      date: new Date(upcomingAppt.startTime).toLocaleDateString(),
      time: new Date(upcomingAppt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      service: upcomingAppt.serviceName,
      provider: upcomingAppt.practitionerName || 'Your provider',
    };
  }

  return context;
}

export function formatContextForPrompt(context: PatientContext): string {
  const lines: string[] = [
    `## Patient Context`,
    `- Name: ${context.firstName}`,
    `- VIP: ${context.isVIP ? 'Yes' : 'No'}`,
  ];

  if (context.membershipTier) {
    lines.push(`- Membership: ${context.membershipTier}`);
  }

  if (context.recentTreatment) {
    lines.push(`\n### Recent Treatment:`);
    lines.push(`- ${context.recentTreatment.name} (${context.recentTreatment.daysAgo} days ago)`);
    if (context.recentTreatment.inCriticalPeriod) {
      lines.push(`- ⚠️ In critical monitoring period (48-72 hours post-treatment)`);
    }
  }

  if (context.upcomingAppointment) {
    lines.push(`\n### Upcoming Appointment:`);
    lines.push(`- ${context.upcomingAppointment.service} on ${context.upcomingAppointment.date} at ${context.upcomingAppointment.time}`);
    lines.push(`- Provider: ${context.upcomingAppointment.provider}`);
  }

  if (context.conversationHistory.length > 0) {
    lines.push(`\n### Recent Conversation:`);
    context.conversationHistory.forEach(msg => {
      lines.push(`${msg.sender.toUpperCase()}: ${msg.message}`);
    });
  }

  return lines.join('\n');
}
```

---

## Phase 2: AI Message Processor (Day 3-4)

### Step 2.1: Create Main AI Service

Create `/src/services/ai/gemini-messaging-service.ts`:

```typescript
import { getGeminiClient } from '@/lib/vertex-ai/client';
import { buildPatientContext, formatContextForPrompt, PatientContext } from './context-builder';
import { MEDSPA_SYSTEM_INSTRUCTION, ANALYSIS_SYSTEM_INSTRUCTION } from './system-instructions';

export interface MessageAnalysis {
  intent: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ANGRY';
  requiresHuman: boolean;
  riskFactors: string[];
}

export interface GeneratedResponse {
  id: string;
  text: string;
  confidence: number;
  characterCount: number;
}

export interface AIProcessingResult {
  messageId: string;
  patientId: string;
  analysis: MessageAnalysis;
  responses: GeneratedResponse[];
  context: PatientContext | null;
  generatedAt: Date;
  processingTimeMs: number;
}

// Emergency keywords - always flag
const EMERGENCY_KEYWORDS = [
  'emergency', '911', 'urgent', 'help', 'severe pain', 'bleeding',
  'allergic reaction', 'cant breathe', 'chest pain', 'infection',
  'swelling face', 'vision', 'numbness', 'fever'
];

// Complication keywords - high urgency
const COMPLICATION_KEYWORDS = [
  'bruising', 'swelling', 'pain', 'redness', 'bump', 'lump',
  'asymmetry', 'drooping', 'hard spot', 'itching', 'burning'
];

export async function processIncomingMessage(
  messageId: string,
  phoneNumber: string,
  messageText: string,
  recentMessages: Array<{ sender: string; text: string }> = []
): Promise<AIProcessingResult> {
  const startTime = Date.now();
  const client = getGeminiClient();

  // Build patient context
  const context = await buildPatientContext(phoneNumber, recentMessages);
  const contextPrompt = context ? formatContextForPrompt(context) : '## No patient context available';

  // Quick emergency check (before AI call)
  const lowerMessage = messageText.toLowerCase();
  const isEmergency = EMERGENCY_KEYWORDS.some(kw => lowerMessage.includes(kw));
  const hasComplication = COMPLICATION_KEYWORDS.some(kw => lowerMessage.includes(kw));

  if (isEmergency) {
    return createEmergencyResult(messageId, context, startTime);
  }

  // Analyze message with AI
  const analysisPrompt = `${contextPrompt}

## Message to Analyze:
"${messageText}"

Analyze this message and return JSON with: intent, urgency, sentiment, requiresHuman, riskFactors`;

  let analysis: MessageAnalysis;
  try {
    analysis = await client.generateStructured<MessageAnalysis>(
      analysisPrompt,
      {
        type: 'object',
        properties: {
          intent: { type: 'string' },
          urgency: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
          sentiment: { type: 'string', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'ANGRY'] },
          requiresHuman: { type: 'boolean' },
          riskFactors: { type: 'array', items: { type: 'string' } },
        },
        required: ['intent', 'urgency', 'sentiment', 'requiresHuman', 'riskFactors'],
      },
      { systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    analysis = {
      intent: 'general',
      urgency: 'MEDIUM',
      sentiment: 'NEUTRAL',
      requiresHuman: true,
      riskFactors: ['ai_analysis_failed'],
    };
  }

  // Override urgency if complication detected
  if (hasComplication && analysis.urgency !== 'CRITICAL') {
    analysis.urgency = 'HIGH';
    analysis.requiresHuman = true;
    analysis.riskFactors.push('complication_keywords_detected');
  }

  // Generate response suggestions
  const responsePrompt = `${contextPrompt}

## Patient Message:
"${messageText}"

## Analysis:
- Intent: ${analysis.intent}
- Urgency: ${analysis.urgency}

Generate 3 professional SMS response options (under 160 characters each).
${context?.recentTreatment?.inCriticalPeriod ? 'Patient had recent treatment - be extra careful about aftercare.' : ''}
${analysis.urgency === 'HIGH' ? 'Acknowledge the concern and offer to connect them with staff.' : ''}

Return JSON with array of responses, each having: text, confidence (0-1)`;

  let responses: GeneratedResponse[];
  try {
    const responseData = await client.generateStructured<{ responses: Array<{ text: string; confidence: number }> }>(
      responsePrompt,
      {
        type: 'object',
        properties: {
          responses: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                confidence: { type: 'number' },
              },
              required: ['text', 'confidence'],
            },
          },
        },
        required: ['responses'],
      },
      { systemInstruction: MEDSPA_SYSTEM_INSTRUCTION }
    );

    responses = responseData.responses.map((r, i) => ({
      id: `resp-${messageId}-${i}`,
      text: r.text.slice(0, 160), // Ensure SMS limit
      confidence: r.confidence,
      characterCount: r.text.length,
    }));
  } catch (error) {
    console.error('Response generation error:', error);
    responses = [{
      id: `resp-${messageId}-0`,
      text: 'Thank you for your message. A team member will respond shortly.',
      confidence: 0.5,
      characterCount: 59,
    }];
  }

  // Sort by confidence
  responses.sort((a, b) => b.confidence - a.confidence);

  return {
    messageId,
    patientId: context?.patientId || 'unknown',
    analysis,
    responses,
    context,
    generatedAt: new Date(),
    processingTimeMs: Date.now() - startTime,
  };
}

function createEmergencyResult(
  messageId: string,
  context: PatientContext | null,
  startTime: number
): AIProcessingResult {
  return {
    messageId,
    patientId: context?.patientId || 'unknown',
    analysis: {
      intent: 'emergency',
      urgency: 'CRITICAL',
      sentiment: 'NEGATIVE',
      requiresHuman: true,
      riskFactors: ['emergency_keywords_detected'],
    },
    responses: [{
      id: `resp-${messageId}-emergency`,
      text: 'If this is a medical emergency, please call 911 immediately. Our team has been notified and will contact you right away.',
      confidence: 1.0,
      characterCount: 127,
    }],
    context,
    generatedAt: new Date(),
    processingTimeMs: Date.now() - startTime,
  };
}
```

### Step 2.2: Create API Endpoint for Background Processing

Create `/src/app/api/ai/process-message/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { processIncomingMessage } from '@/services/ai/gemini-messaging-service';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, phoneNumber, messageText, conversationId, recentMessages } = body;

    if (!messageId || !phoneNumber || !messageText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process with AI
    const result = await processIncomingMessage(
      messageId,
      phoneNumber,
      messageText,
      recentMessages || []
    );

    // Store in Firestore for real-time UI updates
    const app = getFirebaseApp();
    if (app) {
      const db = getFirestore(app);
      const docRef = doc(db, 'conversations', conversationId || phoneNumber, 'ai_responses', messageId);

      await setDoc(docRef, {
        ...result,
        generatedAt: Timestamp.fromDate(result.generatedAt),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), // 24 hours
      });
    }

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('AI processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}
```

---

## Phase 3: Webhook Integration (Day 5)

### Step 3.1: Modify SMS Webhook to Trigger AI Processing

Update `/src/app/api/sms/webhook/route.ts` - add this near the end of the existing POST handler:

```typescript
// Add at the top of the file
import { processIncomingMessage } from '@/services/ai/gemini-messaging-service';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';

// Add this function to trigger background AI processing
async function triggerAIProcessing(
  messageId: string,
  phoneNumber: string,
  messageText: string,
  conversationId: string
) {
  try {
    // Process with AI (could also be sent to Pub/Sub for true async)
    const result = await processIncomingMessage(
      messageId,
      phoneNumber,
      messageText,
      [] // Recent messages could be loaded here
    );

    // Store in Firestore
    const app = getFirebaseApp();
    if (app) {
      const db = getFirestore(app);
      const docRef = doc(db, 'conversations', conversationId, 'ai_responses', messageId);

      await setDoc(docRef, {
        ...result,
        generatedAt: Timestamp.fromDate(result.generatedAt),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      });
    }

    console.log(`AI processing complete for ${messageId} in ${result.processingTimeMs}ms`);
    return result;
  } catch (error) {
    console.error('AI processing error:', error);
  }
}

// In the POST handler, after parsing the incoming SMS, add:
// (Don't await - let it run in background)
triggerAIProcessing(
  body.MessageSid || `msg-${Date.now()}`,
  normalizedPhone,
  body.Body,
  `conv-${normalizedPhone}`
).catch(console.error);
```

---

## Phase 4: UI Integration (Day 6-7)

### Step 4.1: Create Real-time AI Suggestions Hook

Create `/src/hooks/useAIResponses.ts`:

```typescript
import { useState, useEffect } from 'react';
import { getFirebaseApp } from '@/lib/firebase';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';

export interface AIResponse {
  id: string;
  text: string;
  confidence: number;
  characterCount: number;
}

export interface AIResponseData {
  messageId: string;
  analysis: {
    intent: string;
    urgency: string;
    sentiment: string;
    requiresHuman: boolean;
    riskFactors: string[];
  };
  responses: AIResponse[];
  generatedAt: Date;
  processingTimeMs: number;
}

export function useAIResponses(conversationId: string | null) {
  const [aiData, setAiData] = useState<AIResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setAiData(null);
      return;
    }

    const app = getFirebaseApp();
    if (!app) {
      setError('Firebase not configured');
      return;
    }

    setIsLoading(true);
    const db = getFirestore(app);

    // Listen to the most recent AI response for this conversation
    const aiResponsesRef = collection(db, 'conversations', conversationId, 'ai_responses');
    const q = query(aiResponsesRef, orderBy('generatedAt', 'desc'), limit(1));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIsLoading(false);
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          setAiData({
            messageId: data.messageId,
            analysis: data.analysis,
            responses: data.responses,
            generatedAt: data.generatedAt?.toDate() || new Date(),
            processingTimeMs: data.processingTimeMs,
          });
        } else {
          setAiData(null);
        }
      },
      (err) => {
        console.error('AI responses subscription error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  return { aiData, isLoading, error };
}
```

### Step 4.2: Create One-Click Send Component

Create `/src/components/messaging/AIQuickResponses.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import { useAIResponses, AIResponse } from '@/hooks/useAIResponses';
import { Check, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';

interface AIQuickResponsesProps {
  conversationId: string;
  onSend: (text: string) => Promise<void>;
  onInsert: (text: string) => void;
}

export function AIQuickResponses({ conversationId, onSend, onInsert }: AIQuickResponsesProps) {
  const { aiData, isLoading, error } = useAIResponses(conversationId);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span>AI generating suggestions...</span>
      </div>
    );
  }

  if (error || !aiData) {
    return null;
  }

  const { analysis, responses } = aiData;

  const handleQuickSend = async (response: AIResponse) => {
    setSendingId(response.id);
    try {
      await onSend(response.text);
      setSentId(response.id);
      setTimeout(() => setSentId(null), 2000);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSendingId(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">AI Suggestions</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${getUrgencyColor(analysis.urgency)}`}>
            {analysis.urgency}
          </span>
        </div>
        {analysis.requiresHuman && (
          <div className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-xs">Review recommended</span>
          </div>
        )}
      </div>

      {/* Response Options */}
      <div className="space-y-2">
        {responses.map((response, index) => (
          <div
            key={response.id}
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
              sentId === response.id
                ? 'bg-green-100 border-green-300'
                : 'bg-white border-gray-200 hover:border-purple-300'
            }`}
          >
            {/* Confidence indicator */}
            <div className="flex-shrink-0 w-8 text-center">
              <span className={`text-xs font-medium ${
                response.confidence >= 0.9 ? 'text-green-600' :
                response.confidence >= 0.7 ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {Math.round(response.confidence * 100)}%
              </span>
            </div>

            {/* Response text */}
            <div
              className="flex-1 text-sm text-gray-700 cursor-pointer"
              onClick={() => onInsert(response.text)}
            >
              {response.text}
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-1">
              <span className="text-xs text-gray-400">{response.characterCount}</span>
              <button
                onClick={() => handleQuickSend(response)}
                disabled={sendingId !== null}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sentId === response.id
                    ? 'bg-green-500 text-white'
                    : sendingId === response.id
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {sentId === response.id ? (
                  <Check className="h-4 w-4" />
                ) : sendingId === response.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Intent info */}
      <div className="mt-2 text-xs text-gray-500">
        Detected: {analysis.intent} • Sentiment: {analysis.sentiment}
      </div>
    </div>
  );
}
```

### Step 4.3: Integrate into Message Composer

Update `/src/components/messaging/MessageComposer.tsx` to include the AI Quick Responses:

```typescript
// Add import at top
import { AIQuickResponses } from './AIQuickResponses';

// In the component, add above the text input:
{selectedConversation && (
  <AIQuickResponses
    conversationId={`conv-${selectedConversation.patient.phone}`}
    onSend={async (text) => {
      await handleSendMessage(text);
    }}
    onInsert={(text) => {
      setMessageText(text);
      textareaRef.current?.focus();
    }}
  />
)}
```

---

## Phase 5: Analytics & Hit Rate Tracking (Day 8)

### Step 5.1: Create Hit Rate Tracker

Create `/src/services/ai/hit-tracker.ts`:

```typescript
import { getFirestore, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';

export type HitAction = 'used' | 'edited' | 'ignored' | 'regenerated';

export interface HitRecord {
  conversationId: string;
  messageId: string;
  responseId: string;
  action: HitAction;
  originalText: string;
  finalText?: string;
  confidence: number;
  staffId: string;
  timestamp: Date;
}

export async function trackHit(record: HitRecord): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;

  const db = getFirestore(app);
  await addDoc(collection(db, 'ai_hit_tracking'), {
    ...record,
    timestamp: Timestamp.fromDate(record.timestamp),
  });
}

export async function getHitRateStats(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number;
  used: number;
  edited: number;
  ignored: number;
  hitRate: number;
}> {
  const app = getFirebaseApp();
  if (!app) return { total: 0, used: 0, edited: 0, ignored: 0, hitRate: 0 };

  const db = getFirestore(app);
  const q = query(
    collection(db, 'ai_hit_tracking'),
    where('timestamp', '>=', Timestamp.fromDate(startDate)),
    where('timestamp', '<=', Timestamp.fromDate(endDate))
  );

  const snapshot = await getDocs(q);
  const records = snapshot.docs.map(d => d.data());

  const used = records.filter(r => r.action === 'used').length;
  const edited = records.filter(r => r.action === 'edited').length;
  const ignored = records.filter(r => r.action === 'ignored').length;
  const total = records.length;

  return {
    total,
    used,
    edited,
    ignored,
    hitRate: total > 0 ? (used / total) * 100 : 0,
  };
}
```

---

## Testing Checklist

### Phase 1 Tests
- [ ] Gemini client connects successfully
- [ ] Token counting works
- [ ] System instructions are applied

### Phase 2 Tests
- [ ] Patient context builds correctly
- [ ] Emergency keywords trigger CRITICAL urgency
- [ ] Complication keywords trigger HIGH urgency
- [ ] Responses are under 160 characters
- [ ] Confidence scores are reasonable

### Phase 3 Tests
- [ ] Webhook triggers AI processing
- [ ] Results stored in Firestore
- [ ] Processing completes in < 3 seconds

### Phase 4 Tests
- [ ] Real-time updates appear in UI
- [ ] One-click send works
- [ ] Insert to composer works
- [ ] Urgency badges display correctly

### Phase 5 Tests
- [ ] Hit tracking records actions
- [ ] Hit rate calculation is accurate
- [ ] Dashboard shows correct metrics

---

## Environment Variables Summary

```env
# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# Firebase (already configured)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Twilio (already configured)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=...
TWILIO_PHONE_NUMBER=...
```

---

## Estimated Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Setup | 2 days | Gemini client working |
| Phase 2: AI Service | 2 days | Message processing working |
| Phase 3: Webhook | 1 day | Background processing integrated |
| Phase 4: UI | 2 days | One-click send working |
| Phase 5: Analytics | 1 day | Hit rate tracking |

**Total: ~8 working days**

---

## Next Steps

1. **Review this plan** - Confirm approach before starting
2. **Set up Google Cloud** - Enable Vertex AI, create service account
3. **Execute BAA** - Required for HIPAA compliance with PHI
4. **Start Phase 1** - Install dependencies, create client
5. **Iterate** - Test each phase before moving to next
