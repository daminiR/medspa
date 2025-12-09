# Admin Portal - Provider Integration Guide

## Overview
This document outlines the modifications needed in the Admin Web App to properly integrate with the Provider Tablet App. The admin portal should complement, not duplicate, provider documentation.

---

## 🚨 Critical Changes Required

### 1. Features to REMOVE or DISABLE

#### Injectable Billing Calculator
- **Current:** Full editing capability at front desk
- **Change to:** View-only display of provider documentation
- **Why:** Providers document in real-time during treatment

#### Photo Capture
- **Current:** Photo upload in billing flow
- **Remove:** Entire photo capture functionality
- **Replace with:** Photo viewer for provider-captured images

#### Treatment Documentation
- **Current:** Face charts, unit entry, lot tracking
- **Remove:** All editing capabilities
- **Replace with:** Read-only treatment summary

---

## ✅ Features to KEEP & ENHANCE

### 1. Live Treatment Status Dashboard ✨
**Current Implementation:** Good foundation with room status cards

**Enhancements Needed:**
```typescript
// Enhanced status states
type TreatmentStatus = 
  | 'waiting'          // Checked in, not in room
  | 'in-room'         // Provider opened chart
  | 'preparing'       // Setting up treatment
  | 'documenting'     // Active documentation
  | 'photos-before'   // Taking before photos
  | 'treating'        // Performing treatment
  | 'photos-after'    // Taking after photos
  | 'reviewing'       // Provider final review
  | 'ready-payment'   // Complete, ready for checkout
  | 'processing'      // Payment in progress
  | 'complete'        // Checked out

// Real-time updates to show
- Current injection zones being documented
- Number of photos taken
- Products being used
- Estimated completion time
```

### 2. Payment Processing 💳
**Keep:** All current payment features
- Enhanced Payment Form ✅
- Customer Payment View ✅
- Tips & HSA/FSA ✅
- Multiple payment methods ✅

**Add:**
- Auto-populated invoice from provider documentation
- Lock treatment details during payment
- Show provider notes in read-only format

### 3. Daily Cash Reconciliation 📊
**Keep:** Everything as built
- This correctly belongs in admin
- No changes needed

### 4. Inventory Management 📦
**Modify:** 
- Keep viewing stock levels
- Remove manual deduction
- Show auto-deductions from provider app
- Add restock notifications

---

## 🆕 New Features to BUILD

### 1. Provider Activity Monitor
```typescript
interface ProviderActivity {
  providerId: string
  providerName: string
  currentRoom: string | null
  currentPatient: string | null
  status: 'available' | 'with-patient' | 'documenting' | 'break'
  activeMinutes: number
  patientsSeenToday: number
  lastActivityTime: Date
}

// Display as dashboard widget
<ProviderActivityWidget providers={activeProviders} />
```

### 2. Documentation Viewer (Read-Only)
```typescript
interface TreatmentDocumentationView {
  // From provider tablet
  injectionMap: ReadonlyArray<InjectionPoint>
  photos: ReadonlyArray<{
    type: 'before' | 'after'
    url: string
    timestamp: Date
  }>
  products: ReadonlyArray<{
    name: string
    lotNumber: string
    quantity: number
  }>
  soapNotes: string
  providerSignature: string
  completedAt: Date
}

// View-only component
<TreatmentSummary documentation={treatment} readOnly={true} />
```

### 3. Sync Status Indicators
```typescript
// WebSocket connection status
<SyncStatus 
  connected={wsConnected}
  lastSync={lastSyncTime}
  pendingUpdates={queueLength}
/>

// Per-treatment sync status
<TreatmentCard>
  <SyncBadge status="syncing" /> // syncing | synced | error | offline
</TreatmentCard>
```

### 4. Smart Notifications
```typescript
// Desktop notifications for key events
notificationService.subscribe([
  'treatment.ready_for_payment',
  'treatment.documentation_complete',
  'provider.needs_assistance',
  'inventory.low_stock'
])

// Toast notifications
<Toast 
  title="Treatment Complete"
  message="Emma Wilson is ready for checkout"
  action="View Invoice"
/>
```

---

## 🔄 Modified User Flows

### Current Flow (WRONG)
```
1. Patient arrives
2. Check in at front desk
3. Treatment performed
4. Patient comes to front desk
5. Front desk creates documentation ❌
6. Process payment
```

### New Flow (CORRECT)
```
1. Patient arrives
2. Check in at front desk
3. Status: "Waiting" → "In Room"
4. Provider documents in real-time
5. Admin sees live updates
6. Status: "Ready for Payment"
7. Invoice auto-populated
8. Process payment only
```

---

## 💻 Implementation Plan

### Phase 1: Remove Incorrect Features (Day 1)
- [ ] Disable Injectable Billing Calculator button
- [ ] Remove photo capture from billing
- [ ] Convert face charts to view-only
- [ ] Remove lot number entry at checkout

### Phase 2: Enhance Status System (Day 2-3)
- [ ] Expand status states
- [ ] Add real-time update display
- [ ] Create provider activity cards
- [ ] Implement sync indicators

### Phase 3: Build Integration (Week 1)
- [ ] WebSocket connection setup
- [ ] Event subscription system
- [ ] Documentation viewer component
- [ ] Notification service

### Phase 4: Polish & Test (Week 2)
- [ ] Auto-refresh optimization
- [ ] Error handling
- [ ] Offline scenarios
- [ ] Performance testing

---

## 🎯 Admin Portal's New Focus

### Primary Responsibilities:
1. **Business Operations**
   - Scheduling appointments
   - Managing patient records
   - Processing payments
   - Running reports

2. **Financial Management**
   - Payment processing
   - Refunds & credits
   - Package sales
   - Membership management

3. **Analytics & Reporting**
   - Daily reconciliation
   - Revenue analytics
   - Provider performance
   - Inventory reports

### What it NO LONGER Does:
- Clinical documentation
- Treatment charting
- Photo capture
- Real-time treatment recording
- Lot number entry during treatment

---

## 📊 Success Metrics

### Efficiency Gains
- **Checkout time:** From 5 min → 1 min
- **Documentation accuracy:** From 85% → 99%
- **Double entry:** Eliminated
- **Provider efficiency:** +30% more patients/day

### Quality Improvements
- **Real-time documentation:** 100%
- **Photo compliance:** From 60% → 95%
- **Inventory accuracy:** From 90% → 99%
- **Legal compliance:** Full audit trail

---

## 🔗 API Endpoints Needed

### WebSocket Subscriptions
```javascript
// Subscribe to treatment updates
ws.subscribe(`/treatments/room/*`)
ws.subscribe(`/providers/*/activity`)
ws.subscribe(`/inventory/deductions`)

// Receive events
ws.on('treatment.status_changed', updateTreatmentCard)
ws.on('treatment.documentation_received', populateInvoice)
ws.on('treatment.ready_for_payment', showNotification)
```

### REST Endpoints
```typescript
// Get provider activity
GET /api/providers/activity

// Get treatment documentation (read-only)
GET /api/treatments/:id/documentation

// Get sync status
GET /api/sync/status
```

---

## 🎨 UI Components to Build

### 1. Status Pills
```jsx
<StatusPill status="documenting" pulse={true} />
<StatusPill status="ready-payment" highlight={true} />
```

### 2. Provider Avatar with Status
```jsx
<ProviderAvatar 
  provider={provider}
  status="with-patient"
  room="Room 2"
/>
```

### 3. Documentation Preview Card
```jsx
<DocumentationPreview
  photos={[...]}
  products={[...]}
  zones={[...]}
  expandable={true}
/>
```

### 4. Sync Status Bar
```jsx
<SyncStatusBar
  connected={true}
  lastSync="2 seconds ago"
  pending={0}
/>
```

---

## 🚀 Next Steps

1. **Immediate:** Remove/disable incorrect features
2. **This Week:** Enhance status system
3. **Next Week:** Build WebSocket integration
4. **Following Week:** Add advanced features

The admin portal becomes a powerful business operations center that complements, rather than duplicates, the provider's clinical documentation system.

---

*Created: August 2025*
*Purpose: Guide admin portal modifications for provider tablet integration*