# Charting Feature - API Costs & Workflow

## Overview
The charting feature uses several third-party APIs to provide advanced functionality. This document outlines the costs, usage patterns, and pricing implications.

---

## API Services & Costs

### 1. **Voice Dictation - OpenAI Whisper API**

**Purpose:** Convert voice to text for SOAP notes dictation

**Pricing:**
- $0.006 per minute of audio
- Average SOAP note dictation: 2-5 minutes
- **Cost per dictation: $0.012 - $0.030**

**Usage Pattern:**
- Users enable voice dictation in Settings → SOAP Notes
- Click microphone button in SOAP form
- Audio streams to Whisper API
- Transcribed text appears in real-time

**Monthly Volume Estimates:**
| Clinic Size | Notes/Month | Voice % | API Calls/Month | Monthly Cost |
|------------|-------------|---------|-----------------|--------------|
| Small (1-2 providers) | 200 | 30% | 60 | $0.72 - $1.80 |
| Medium (3-5 providers) | 800 | 40% | 320 | $3.84 - $9.60 |
| Large (6-10 providers) | 2000 | 50% | 1000 | $12 - $30 |
| Multi-location (10+ providers) | 5000+ | 50% | 2500+ | $30 - $75+ |

**Implementation Notes:**
- Use WebSocket for streaming audio
- Implement chunked uploads for long recordings
- Add retry logic for API failures
- Cache common medical terms for fallback

**Whisper API Endpoint:**
```bash
POST https://api.openai.com/v1/audio/transcriptions
Content-Type: multipart/form-data

{
  "file": audio_blob,
  "model": "whisper-1",
  "language": "en",
  "response_format": "verbose_json",
  "timestamp_granularities": ["word"]
}
```

---

### 2. **AI SOAP Note Suggestions (Future)**

**Purpose:** Auto-generate clinical note suggestions based on treatment data

**Pricing:**
- GPT-4o: $2.50 / 1M input tokens, $10.00 / 1M output tokens
- Average prompt: ~500 tokens input, ~300 tokens output
- **Cost per suggestion: ~$0.004**

**Usage Pattern:**
- Trigger: User completes injection charting
- Input: Injection points, products, units, zones
- Output: Draft SOAP note sections (S/O/A/P)
- User reviews and edits suggestions

**Monthly Volume Estimates:**
| Clinic Size | Treatments/Month | AI Usage % | API Calls/Month | Monthly Cost |
|------------|------------------|------------|-----------------|--------------|
| Small | 200 | 40% | 80 | $0.32 |
| Medium | 800 | 50% | 400 | $1.60 |
| Large | 2000 | 60% | 1200 | $4.80 |
| Multi-location | 5000+ | 60% | 3000+ | $12+ |

**Status:** Not yet implemented (toggle exists but disabled)

---

### 3. **Photo Storage - Cloud Storage (S3/Cloudinary)**

**Purpose:** Store before/after treatment photos

**Pricing (AWS S3):**
- Storage: $0.023 per GB/month
- Upload: $0.005 per 1,000 PUT requests
- Download: $0.09 per GB transferred

**Pricing (Cloudinary):**
- Free tier: 25 GB storage, 25 GB bandwidth
- Plus plan: $89/month - 100 GB storage, 100 GB bandwidth
- Advanced plan: $249/month - 250 GB storage, 250 GB bandwidth

**Average Photo Sizes:**
- Before/After photos: 1-3 MB each
- Per treatment: 4-8 photos = 4-24 MB
- Compression: ~50% reduction = 2-12 MB per treatment

**Monthly Volume Estimates:**
| Clinic Size | Treatments/Month | Photos/Treatment | Storage/Month | S3 Cost/Month |
|------------|------------------|------------------|---------------|---------------|
| Small | 200 | 6 | 1.2 GB | $0.03 |
| Medium | 800 | 6 | 4.8 GB | $0.11 |
| Large | 2000 | 6 | 12 GB | $0.28 |
| Multi-location | 5000+ | 6 | 30+ GB | $0.69+ |

**Recommendation:** Start with Cloudinary free tier, migrate to S3 when needed

---

### 4. **3D Model Hosting**

**Purpose:** Serve 3D GLB files for face/body charting

**Current Approach:**
- Models stored in `/public/models/`
- Served statically by Next.js
- Total size: ~30 MB (5 models)

**CDN Option (Cloudflare):**
- Free tier: Unlimited bandwidth
- Caching reduces load times
- **Cost: $0** (use Cloudflare free tier)

---

## Total Cost Analysis

### Per-Treatment API Costs

| Feature | Cost per Use | Usage Rate | Weighted Cost |
|---------|-------------|------------|---------------|
| Voice Dictation | $0.012 - $0.030 | 40% | $0.005 - $0.012 |
| AI Suggestions | $0.004 | 50% | $0.002 |
| Photo Storage (upload) | $0.0001 | 100% | $0.0001 |
| **Total per Treatment** | | | **$0.007 - $0.014** |

### Monthly Cost by Clinic Size

| Clinic Size | Treatments/Month | API Costs | Storage | **Total/Month** |
|------------|------------------|-----------|---------|----------------|
| Small (1-2 providers) | 200 | $1.40 - $2.80 | $0.03 | **$1.43 - $2.83** |
| Medium (3-5 providers) | 800 | $5.60 - $11.20 | $0.11 | **$5.71 - $11.31** |
| Large (6-10 providers) | 2000 | $14 - $28 | $0.28 | **$14.28 - $28.28** |
| Multi-location (10+ providers) | 5000 | $35 - $70 | $0.69 | **$35.69 - $70.69** |

---

## Pricing Strategy

### Option 1: Include in Base Price (Loss Leader)
- Market positioning: "Advanced charting included"
- Absorb API costs as customer acquisition
- Profitable through other revenue streams (payments, SMS, inventory)

### Option 2: Tiered Add-On Pricing
- **Basic Charting:** Free (manual entry only)
- **Voice Charting:** +$15/month (includes Whisper API)
- **AI-Assisted Charting:** +$25/month (includes AI suggestions + voice)

### Option 3: Usage-Based Pricing
- $0.05 per voice-dictated note
- $0.02 per AI-generated suggestion
- Transparent, pay-as-you-grow model

### **Recommended:** Option 2 (Tiered Add-On)
**Rationale:**
- Clear value proposition for each tier
- Predictable costs for clinics
- 40-60% gross margin on add-ons
- Upsell path: Basic → Voice → AI-Assisted

---

## Charting Workflow

### 1. **Standard Charting Flow**
```
Patient Check-In
  ↓
Provider selects Face/Body tab
  ↓
2D Chart (free-hand marking) OR 3D Chart (model-based)
  ↓
Select product type (Neurotoxin/Filler)
  ↓
Add injection points:
  - Click to add point
  - Set units/volume
  - Set depth/technique/gauge
  ↓
Review Treatment Summary (total units/volume)
  ↓
Add SOAP Notes (manual OR voice dictation)
  ↓
Upload Before/After Photos
  ↓
Export/Print Chart
  ↓
Save to Patient Record
```

### 2. **Voice Dictation Flow** (if enabled)
```
User clicks 🎤 Microphone button in SOAP form
  ↓
Browser requests microphone permission
  ↓
Audio recording starts
  ↓
Audio chunks stream to backend API
  ↓
Backend forwards to Whisper API
  ↓
Whisper returns transcription (JSON)
  ↓
Text appears in SOAP field in real-time
  ↓
User can edit transcription
  ↓
Click "Stop" to end recording
  ↓
Final text saved to SOAP notes
```

### 3. **AI Suggestions Flow** (future)
```
User completes injection charting
  ↓
User navigates to SOAP Notes tab
  ↓
System detects completed chart data
  ↓
"✨ Generate AI Suggestion" button appears
  ↓
User clicks button
  ↓
Backend sends prompt to GPT-4:
  - Injection zones & units
  - Product types
  - Patient demographics
  - Previous treatment notes
  ↓
GPT-4 generates SOAP sections:
  - Subjective: Patient request summary
  - Objective: Anatomical findings
  - Assessment: Treatment rationale
  - Plan: Post-care & follow-up
  ↓
AI-generated text populates form (highlighted)
  ↓
User reviews, edits, approves
  ↓
Save final notes
```

---

## Cost Monitoring & Controls

### 1. **Usage Tracking**
- Log every API call with:
  - Timestamp
  - User ID
  - Feature (voice/AI/photo)
  - Input size (audio minutes, tokens, MB)
  - Cost estimate

### 2. **Rate Limiting**
- Max 10 voice dictations per user per day
- Max 20 AI suggestions per user per day
- Prevents abuse and runaway costs

### 3. **Cost Alerts**
- Email admin when monthly API costs exceed:
  - $50 (small clinic warning)
  - $200 (medium clinic warning)
  - $500 (large clinic warning)

### 4. **Optimization Strategies**
- Cache common medical phrases for autocomplete
- Batch API calls when possible
- Use cheaper models for simple tasks
- Compress audio before sending to Whisper
- Lazy-load 3D models only when tab is active

---

## Implementation Checklist

### Phase 1: Voice Dictation ✅
- [x] Add voice dictation toggle to settings
- [ ] Integrate Web Speech API (fallback)
- [ ] Integrate Whisper API (primary)
- [ ] Add microphone button to SOAP form
- [ ] Implement audio recording & streaming
- [ ] Add transcription display with editing
- [ ] Log usage for cost tracking

### Phase 2: Photo Storage ✅
- [ ] Set up Cloudinary account (free tier)
- [ ] Integrate Cloudinary SDK
- [ ] Update photo upload to use Cloudinary
- [ ] Store Cloudinary URLs in database
- [ ] Implement image optimization/compression

### Phase 3: AI Suggestions 🔮
- [ ] Enable AI suggestions toggle in settings
- [ ] Design prompt template for SOAP generation
- [ ] Integrate GPT-4o API
- [ ] Build suggestion review UI
- [ ] Add edit history for AI-generated content
- [ ] Log usage for cost tracking

### Phase 4: Cost Monitoring 📊
- [ ] Create usage analytics dashboard
- [ ] Implement rate limiting middleware
- [ ] Set up cost alert emails
- [ ] Build admin cost reports

---

## Revenue Projections

### Scenario: 100 Clinics on "AI-Assisted Charting" ($25/mo tier)

**Monthly Revenue:**
- 100 clinics × $25/month = $2,500/month

**Monthly API Costs:**
- Small clinics (60): 60 × $2.50 = $150
- Medium clinics (30): 30 × $10 = $300
- Large clinics (10): 10 × $25 = $250
- **Total costs:** $700/month

**Gross Profit:**
- Revenue: $2,500
- Costs: $700
- **Profit: $1,800/month (72% margin)**

**Annual:**
- $21,600 profit from charting add-on alone
- Scales with customer count
- Higher-volume clinics pay more, subsidizing smaller clinics

---

## Competitive Positioning

### Current Market State:
| Platform | Voice Dictation | AI Suggestions | 3D Charting |
|----------|----------------|----------------|-------------|
| Mangomint | ❌ | ❌ | ❌ |
| Boulevard | ❌ | ❌ | ❌ |
| Jane | ❌ | ❌ | ❌ |
| Zenoti | ⚠️ (basic) | ❌ | ❌ |
| AestheticsPro | ⚠️ (addon) | ❌ | ⚠️ (2.5D) |
| **Luxe MedSpa** | ✅ Whisper | ✅ GPT-4 | ✅ Full 3D |

**Market Differentiator:**
> "The only platform with AI-powered charting - speak your notes, auto-generate SOAP documentation, and chart in full 3D."

---

## Next Steps

1. ✅ **Complete Voice Dictation Toggle** - Settings UI ready
2. **Implement Whisper Integration** - Backend API + audio streaming
3. **Set Up Photo Storage** - Cloudinary account + SDK
4. **Build Cost Dashboard** - Track API usage per clinic
5. **Launch Beta** - Test with 5-10 pilot clinics
6. **Refine Pricing** - Based on real usage data
7. **Marketing Campaign** - "AI Charting" as key differentiator

---

**Document Version:** 1.0
**Last Updated:** December 14, 2024
**Owner:** Product & Engineering Team
