# Proactive AI Messaging System - Architecture Synthesis

## Executive Summary

This document synthesizes findings from a comprehensive 12-agent analysis of the Medical Spa Platform codebase and Vertex AI research. The goal is to implement a **proactive AI messaging system** where responses are pre-generated when messages arrive, achieving an 80% hit rate for one-click staff approval.

---

## Part 1: Current System Architecture

### 1.1 Tech Stack Overview

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | Next.js 14 App Router, React, TypeScript, Tailwind CSS | Production |
| Backend | Next.js API Routes (71 endpoints across 18 domains) | Production |
| Database | Prisma schema (PostgreSQL), in-memory mocks for dev | Schema Ready |
| Real-time | Firebase Firestore onSnapshot listeners | Configured |
| SMS | Twilio (Messaging Service) | Production |
| AI (Current) | OpenAI GPT-4 (stubbed) | Placeholder |
| Caching | Redis (stubbed) | Placeholder |
| Cloud | Google Cloud Platform (Firebase, intended for full stack) | Partial |

### 1.2 Current Message Processing Flow

```
CURRENT (Reactive) - ~2-3 second delay for suggestions

Twilio SMS Webhook
       │
       ▼
POST /api/sms/webhook/route.ts (975 lines)
       │
       ├── Parse incoming SMS (handleIncomingSMS)
       ├── Check for "HERE" (waiting room check-in)
       ├── Check for waitlist responses (YES/NO/REMOVE/STATUS)
       ├── Check for reschedule conversation (1-5 selection)
       ├── Parse appointment response (C/R/CANCEL)
       │
       ▼
Staff opens conversation in UI
       │
       ▼
AI suggestions generated ON DEMAND (aiEngine.analyzeMessage)
       │
       ▼
Staff reviews → edits → sends
```

### 1.3 Existing AI Infrastructure

**AIConversationEngine** (`/src/services/messaging/ai-engine.ts`):
- 27 intent categories (APPOINTMENT_BOOKING, TREATMENT_QUESTION, EMERGENCY_MEDICAL, etc.)
- 5 urgency levels (CRITICAL, HIGH, MEDIUM, LOW, NONE)
- 6 sentiment levels
- Emergency keyword detection
- Complication keyword detection
- Information extraction (dates, times, services, providers)
- Suggested response generation (3 suggestions)
- Human escalation logic

**Current Limitations:**
1. AI analysis happens when staff opens conversation (reactive)
2. OpenAI integration is stubbed - falls back to mock responses
3. No pre-caching of responses
4. No background processing queue
5. No hit rate tracking

---

## Part 2: Patient Context Available for AI

### 2.1 Rich Patient Data (from `/src/types/patient.ts` and `/src/lib/data/`)

| Context Category | Available Fields | AI Relevance |
|-----------------|------------------|--------------|
| **Identity** | name, preferredName, pronouns, age | Personalization |
| **Medical** | allergies, medications, contraindications, skinType | Safety checks |
| **Treatment History** | previousTreatments, botoxUnits, fillerVolumes, lastTreatmentDates | Aftercare context |
| **Appointments** | upcomingAppointments, lastVisit, preferredProvider | Scheduling help |
| **Financial** | balance, credits, membershipTier, lifetimeValue | VIP handling |
| **Preferences** | communicationPreferences, preferredTimes, preferredDays | Personalization |
| **Compliance** | smsOptIn, consentForms, photoConsent | Legal safety |

### 2.2 Conversation Context

From `useConversations` hook and messaging types:
- Last 5 messages in thread
- Conversation status (open/snoozed/closed)
- Assigned staff member
- Tags (VIP, urgent, etc.)
- Unread count

### 2.3 Treatment Context (from `/src/lib/data/treatmentLookup.ts`)

- Recent treatments within 30 days
- Critical period check (48-72 hours post-treatment)
- Monitoring period check (14 days)
- Treatment-specific aftercare instructions
- Complication history

---

## Part 3: Vertex AI Integration Plan

### 3.1 Why Vertex AI / Gemini

| Factor | OpenAI | Vertex AI (Gemini) |
|--------|--------|-------------------|
| HIPAA Compliance | BAA available | BAA available via Google Cloud |
| Your Infrastructure | Separate | Already using Firebase |
| Cost (per 1M tokens) | GPT-4: ~$30 input | Gemini 2.0 Flash: $0.15 input |
| Context Window | 128K (GPT-4) | 200K+ (Gemini) |
| Latency | ~1-2s | ~0.5-1s |
| Context Caching | No | Yes (90% cost reduction) |
| Batch Discount | No | 50% off |

**Recommendation:** Use Gemini 2.0 Flash for real-time messaging, Gemini 2.5 Pro for complex analysis.

### 3.2 SDK Installation

```bash
npm install @google/genai @google-cloud/pubsub @google-cloud/tasks
```

### 3.3 Environment Configuration

```env
GOOGLE_CLOUD_PROJECT=your-medspa-project
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=true
```

---

## Part 4: Proactive AI System Design

### 4.1 Target Architecture

```
NEW (Proactive) - Responses ready when staff opens conversation

Twilio SMS Webhook (< 200ms response)
       │
       ▼
POST /api/sms/webhook
       │
       ├── Parse & validate SMS
       ├── Quick response to Twilio (200 OK)
       │
       ▼
Publish to Pub/Sub: "incoming-messages" topic
       │
       ▼
Cloud Tasks subscriber (async)
       │
       ├── Load patient context
       ├── Build AI prompt with context
       ├── Call Gemini 2.0 Flash
       ├── Generate 2-3 response options
       ├── Score confidence
       │
       ▼
Store in Firestore: conversations/{id}/ai_responses
       │
       ▼
Real-time update to UI (onSnapshot)
       │
       ▼
Staff sees pre-generated responses INSTANTLY
       │
       ▼
Staff clicks [✓ Send] → Message sent (< 200ms)
```

### 4.2 Data Flow Sequence

```
1. SMS arrives from Sarah: "Is it normal for my skin to feel tight?"

2. Webhook receives (< 100ms):
   - Parse message
   - Return 200 to Twilio
   - Publish to Pub/Sub with {messageId, from, body}

3. Background processor receives (< 500ms):
   - Look up patient by phone
   - Load context: Sarah, VIP, had chemical peel 2 days ago
   - Build prompt with context + system instruction
   - Call Gemini 2.0 Flash

4. AI generates (< 1s):
   Response 1: "Hi Sarah! Tightness is completely normal after your peel. Keep using the moisturizer we recommended. If it persists beyond 3 days, let us know!" (Confidence: 94%)
   Response 2: "That's expected after your peel! Apply moisturizer frequently. Call us if you notice any unusual redness or peeling." (Confidence: 88%)
   Response 3: "Tightness is a normal part of the healing process. Stay hydrated and keep moisturizing!" (Confidence: 82%)

5. Store in Firestore:
   conversations/sarah-123/ai_responses: {
     responses: [...],
     generatedAt: timestamp,
     context: { recentTreatment: "Chemical Peel", daysAgo: 2 },
     intent: "POST_TREATMENT_FOLLOWUP",
     urgency: "LOW",
     confidence: 0.94
   }

6. UI receives real-time update:
   - Notification badge appears
   - AI suggestions pre-populated when staff clicks conversation

7. Staff clicks first suggestion:
   - Message sent immediately via /api/sms/send
   - Hit tracked: "AI suggestion used without edit"
```

### 4.3 Key Components to Build

| Component | File | Purpose |
|-----------|------|---------|
| Gemini Client | `/src/lib/vertex-ai/client.ts` | Vertex AI SDK wrapper |
| Context Builder | `/src/services/ai/context-builder.ts` | Build patient context for prompts |
| System Instructions | `/src/services/ai/system-instructions.ts` | Medical spa AI guidelines |
| Pub/Sub Publisher | `/src/lib/pubsub/publisher.ts` | Queue incoming messages |
| Background Processor | `/src/services/ai/message-processor.ts` | Async AI processing |
| Response Cache | `/src/lib/firestore/ai-responses.ts` | Store pre-generated responses |
| Analytics Tracker | `/src/services/ai/hit-tracker.ts` | Track approval rates |

---

## Part 5: Implementation Priorities

### Phase 1: Foundation (Week 1)
1. Set up Vertex AI credentials and test connection
2. Create Gemini client wrapper with HIPAA-safe logging
3. Build patient context aggregation service
4. Create system instructions for medical spa

### Phase 2: Background Processing (Week 2)
1. Set up Pub/Sub topic "incoming-messages"
2. Create Cloud Tasks queue for AI processing
3. Modify webhook to publish to Pub/Sub instead of inline processing
4. Create background processor service

### Phase 3: Storage & Real-time (Week 3)
1. Add Firestore collection schema for AI responses
2. Create real-time subscription in UI for AI updates
3. Build AI suggestions display component with one-click send
4. Implement undo functionality

### Phase 4: Analytics & Optimization (Week 4)
1. Track hit rate (used vs edited vs ignored)
2. Implement confidence scoring
3. Add model selection based on complexity
4. Set up context caching for frequent patients

---

## Part 6: Firestore Schema for AI Responses

### Collection: `conversations/{conversationId}/ai_responses`

```typescript
interface AIResponseDocument {
  // Metadata
  messageId: string;          // Original SMS message ID
  patientId: string;
  generatedAt: Timestamp;
  expiresAt: Timestamp;       // Auto-delete after 24 hours

  // Analysis
  intent: {
    primary: IntentCategory;
    secondary?: IntentCategory;
    confidence: number;       // 0-1
  };
  urgency: UrgencyLevel;
  sentiment: Sentiment;
  requiresHumanReview: boolean;

  // Context used
  context: {
    patientName: string;
    isVIP: boolean;
    membershipTier?: string;
    recentTreatment?: {
      name: string;
      daysAgo: number;
      inCriticalPeriod: boolean;
    };
    upcomingAppointment?: {
      date: string;
      service: string;
      provider: string;
    };
  };

  // Pre-generated responses
  responses: Array<{
    id: string;
    text: string;
    confidence: number;       // 0-1, sorted by confidence
    tone: 'warm' | 'professional' | 'urgent';
    characterCount: number;
  }>;

  // Outcome tracking
  outcome?: {
    action: 'used' | 'edited' | 'ignored' | 'regenerated';
    selectedResponseId?: string;
    editedText?: string;
    staffId: string;
    actionAt: Timestamp;
  };

  // Risk flags
  riskFactors: string[];
  complicationKeywordsDetected: boolean;
  emergencyKeywordsDetected: boolean;
}
```

---

## Part 7: Cost Estimates

### Monthly Cost Projection (based on message volume)

| Tier | Messages/Month | AI Calls | Estimated Cost |
|------|---------------|----------|----------------|
| Small Spa | 5,000 | 5,000 | ~$10-15/month |
| Medium Spa | 25,000 | 25,000 | ~$50-75/month |
| Large Spa | 100,000 | 100,000 | ~$200-300/month |

**Cost Optimizations:**
1. Context caching for VIP/frequent patients (90% reduction)
2. Batch processing during low-volume hours (50% discount)
3. Model tiering (Flash-Lite for simple confirmations)
4. Skip AI for automated responses (confirmations, opt-outs)

---

## Part 8: Success Metrics

### Primary: Hit Rate Target 80%

```
Hit Rate = (Messages sent using AI suggestion without edit) / (Total messages sent) * 100
```

### Secondary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Response Generation Time | < 2 seconds | Time from message arrival to AI responses ready |
| Staff Time Saved | 30 seconds/message | Before/after comparison |
| Patient Response Time | < 5 minutes (during business hours) | Time to first reply |
| AI Confidence Accuracy | > 85% | High-confidence suggestions that were used |
| Emergency Detection | 100% | All emergencies flagged |
| Complication Detection | 100% | All complications flagged |

---

## Part 9: Safety & Compliance

### HIPAA Requirements

1. **BAA**: Execute Google Cloud BAA before processing PHI
2. **Data Minimization**: Only send necessary context to AI
3. **Audit Logging**: Log all AI interactions (without PHI in logs)
4. **No PHI in Prompts**: Use first names only, no DOB, no medical record numbers
5. **Encryption**: TLS in transit, encryption at rest (default in GCP)

### Safety Rules

1. **Never auto-send** without human approval
2. **Always flag** emergency keywords → CRITICAL urgency
3. **Always flag** complication keywords → HIGH urgency + provider notification
4. **VIP handling**: Lower threshold for human review
5. **Sentiment check**: NEGATIVE or ANGRY → human review required

---

## Part 10: Files to Create/Modify

### New Files

```
/src/lib/vertex-ai/
├── client.ts              # Gemini client wrapper
├── token-counter.ts       # Token counting and cost estimation
└── context-cache.ts       # Context caching manager

/src/services/ai/
├── gemini-messaging-service.ts  # Main AI service
├── context-builder.ts           # Patient context aggregation
├── system-instructions.ts       # Medical spa AI guidelines
├── structured-output.ts         # Function calling for typed responses
├── hit-tracker.ts               # Analytics tracking
└── model-selector.ts            # Select model based on task

/src/lib/pubsub/
├── publisher.ts           # Publish to Pub/Sub
└── message-processor.ts   # Background message processor

/src/lib/firestore/
└── ai-responses.ts        # AI response CRUD

/src/app/api/ai/
├── process/route.ts       # Background processing endpoint
└── regenerate/route.ts    # Manual regeneration endpoint
```

### Files to Modify

```
/src/app/api/sms/webhook/route.ts
  → Add Pub/Sub publish after initial processing

/src/components/messaging/MessageComposer.tsx
  → Add one-click send buttons for AI suggestions

/src/components/messaging/AISuggestions.tsx
  → Fetch from Firestore instead of generating on demand

/src/services/websocket.ts
  → Add subscription for AI responses

/src/hooks/useConversations.ts
  → Include AI response data in conversation state
```

---

## Conclusion

This synthesis document provides a complete blueprint for transforming the current reactive AI messaging system into a proactive one using Vertex AI and Gemini 2.0. The target is **80% hit rate** where staff simply approve pre-generated responses with a single click.

**Key Decisions Made:**
1. Use Gemini 2.0 Flash as primary model (cost-effective, fast)
2. Use Pub/Sub + Cloud Tasks for async processing (decoupled, scalable)
3. Store AI responses in Firestore (real-time UI updates)
4. Track hit rate to optimize system over time

**Next Steps:**
1. Review this document and confirm approach
2. Set up Google Cloud project with Vertex AI enabled
3. Execute BAA for HIPAA compliance
4. Begin Phase 1 implementation
