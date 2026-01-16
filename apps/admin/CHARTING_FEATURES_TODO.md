# Charting Features TODO

> ## ⚠️ REQUIRED READING FOR ALL AGENTS
>
> **Before implementing ANY feature in this list, you MUST read BOTH files:**
>
> 1. **`PRACTITIONER_CONTEXT.md`** - Who we're building for (practitioners in the zone during treatments), cognitive friction costs, Mangomint simplicity philosophy, research-backed UX decisions. Every feature must be built through this lens.
>
> 2. **`CHARTING_WORKFLOW.md`** - How to work on this codebase: run the app first, deploy Opus synthesis/distillation agents instead of reading directly, use parallel agent deployment, token conservation practices.
>
> **Do not skip these.** Read both before touching any code.

---

**Total Features: 62**
**Last Updated:** January 15, 2026

---

## 🚨 CRITICAL BUGS - FIX BEFORE ANYTHING ELSE

| Bug | Status | Notes |
|-----|--------|-------|
| Botox point placement not working | ✅ FIXED | Image pointer-events blocking clicks was fixed |
| Brush tool not drawing | 🔴 BROKEN | react-sketch-canvas not rendering strokes (needs verification) |
| Vein drawing tool not working | ✅ FIXED | Refactored to use react-sketch-canvas for smooth drawing |
| Cannula path tool not working | ✅ FIXED | Reduced size, removed pulsating circle |
| Settings not saving | 🔴 BROKEN | Tool settings don't persist |
| Brush sizes too small | 🟡 FIX | S/M/L need significant size difference for laser areas |

## 📋 PENDING ITEMS (Come back to these)

| Item | Priority | Notes |
|------|----------|-------|
| Treatment History Timeline | HIGH | Arrows to navigate past sessions visually |
| Tool Visibility as separate tab | MEDIUM | Organize settings better |
| Apply left/right panel docking | MEDIUM | Left=viewing, Right=actions |
| Laser settings research | MEDIUM | Opacity/intensity/dosage options for laser treatments |
| Each brush stroke as separate layer | MEDIUM | Track treatments individually |

---

## Progress Overview

| Section | Count | Status |
|---------|-------|--------|
| Injection Map | 23 | 7/23 Complete |
| **NEW: History Timeline** | 1 | HIGH PRIORITY |
| Photos | 7 | Not Started |
| SOAP Notes | 7 | Not Started |
| Consent | 3 | Not Started |
| History | 6 | Not Started |
| Patient Context | 4 | Not Started |
| Completion Workflow | 5 | Not Started |
| Chart-Wide UI | 5 | Not Started |
| Smart Dosages | 1 | Not Started |
| Future/AI Features | 1 | Not Started |

---

## ⭐ HIGH PRIORITY: Treatment History Timeline (In-Chart Navigation)

**Why this matters:**
- Practitioners are BUSY - they need instant context when patient walks in
- Reading notes takes brain power; SEEING where treatments were done is instant
- "Where did I do laser last time?" should be ONE CLICK, not digging through records

### Feature: Visual Treatment History Navigation

- [ ] **History Timeline Arrows** ⭐ HIGH PRIORITY
  - Left/right arrows in the charting view (< Previous | Next >)
  - Click to navigate through past treatment sessions
  - Stay in charting - no page navigation needed
  - Each "session" shows that date's treatment layers

- [ ] **Date Header Display**
  - When viewing past session: show date prominently at top
  - "January 5, 2026 - Botox + Laser Session"
  - Quick badge showing what was done that day

- [ ] **Visual Layer Replay**
  - Past treatments appear as semi-transparent overlays
  - See EXACTLY where Botox was injected last time
  - See EXACTLY where laser was applied
  - Color-coded by treatment type (matches current layer colors)

- [ ] **Quick Summary Card**
  - When navigating to past session, show summary:
    - Date + time
    - Treatments performed (Botox 45u, Fractional Laser, etc.)
    - Provider who did it
    - Any notes/complications
  - Dismissible - tap to focus on the visual

- [ ] **Compare Mode**
  - Toggle to overlay past + current
  - "Show me what I did last time while I plan today"
  - Different opacity for past vs current

**User Flow:**
1. Patient walks in for Botox touch-up
2. Practitioner opens chart, sees TODAY (empty)
3. Clicks ← arrow → sees "Jan 5 - Botox Session"
4. Instantly sees WHERE the 45 units were placed
5. Clicks → to return to today, now informed
6. Documents today's treatment with full context

**Implementation Notes:**
- Store treatment layers per session (date-stamped)
- Need session history data structure
- Lightweight - just layer data, not full chart reload
- Works with injection points, brush strokes, all tools

---

## SECTION 1: INJECTION MAP TAB (23 Features)

### Drawing & Annotation Tools

- [x] **1. Arrow/Vector Tool**
  - Thread lift directions, cannula paths, filler flow
  - Draw directional arrows with heads
  - Useful for: Thread lifts, PRF injections, filler placement

- [x] **2. Measurement Lines**
  - Brow height, lip proportions, symmetry measurements
  - Show actual mm/cm values
  - Snap to landmarks option

- [x] **3. Shape Annotations**
  - Circles, rectangles, freeform shapes
  - Highlight treatment areas
  - Different fill/stroke options

- [x] **4. Text Labels**
  - Free-form text anywhere on chart
  - Examples: "Bruise here", "avoid - previous filler", technique notes
  - Font size options

- [x] **5. Danger Zone Overlays**
  - Pre-defined blood vessel paths
  - Nerve locations
  - Toggle on/off caution areas
  - Color-coded by risk level

- [x] **6. Cannula Entry → Path Lines**
  - Mark entry point
  - Draw path to deposit area
  - Show technique (fanning, linear, etc.)

- [x] **7. Vein Drawing Tool**
  - Sclerotherapy vein mapping
  - Leg template support
  - Track spider veins vs varicose

---

### 🧪 TESTING GUIDE: Drawing & Annotation Tools

**Go to:** http://localhost:3001/charting (or your network IP)

#### Test 1: Arrow/Vector Tool
1. Look at the **Tools** panel on the right side
2. Click the **arrow icon** (→) to select Arrow Tool
3. **Draw an arrow:** Click and drag on the face image
   - Start point = where you click
   - End point = where you release
   - Arrow head shows direction
4. **Use case:** Imagine documenting "filler flows this direction" or "thread lift pulls upward"
5. ✅ Success: You see an arrow with a pointed head on the chart

#### Test 2: Measurement Lines Tool
1. Click the **ruler icon** (📏) in the Tools panel
2. **Measure something:** Click point A, then click point B
3. A line appears with **distance in mm** displayed
4. **Use case:** "Brow lifted 3mm" or "Lip is 12mm tall"
5. ✅ Success: You see a line with measurement label

#### Test 3: Shape Annotations Tool
1. Click the **shapes icon** (⬜) in the Tools panel
2. **Draw shapes:**
   - Select circle, rectangle, or freeform
   - Click and drag to create shape
3. **Use case:** Circle a bruise area, highlight treatment zone
4. ✅ Success: Semi-transparent colored shape appears

#### Test 4: Text Labels Tool
1. Click the **T icon** (text) in the Tools panel
2. **Add a label:** Click anywhere on the face
3. Type text like "Avoid" or "Bruise" or "Previous filler"
4. A **floating panel** should appear with quick presets
5. **Use case:** Mark areas to avoid, note complications
6. ✅ Success: Text appears on the chart where you clicked

#### Test 5: Danger Zone Overlays
1. Click the **⚠️ warning triangle** icon in the Tools panel
2. **Toggle ON:** Red/yellow overlay appears on face showing:
   - Blood vessel paths (arteries)
   - Danger zones near nose, glabella, temples
3. **Toggle OFF:** Overlay disappears
4. **Use case:** Safety reminder - "don't inject here, artery!"
5. ✅ Success: Semi-transparent danger zones appear/disappear

#### Test 6: Cannula Path Lines Tool
1. Click the **branching icon** (like a Y) in the Tools panel
2. **Draw cannula path:**
   - Click to place **entry point** (marked with X)
   - Drag to show where cannula travels
   - Can draw multiple paths from same entry (fanning)
3. **Use case:** Document "entered at lateral cheek, fanned to 3 areas"
4. ✅ Success: Entry point + path lines visible

#### Test 7: Vein Drawing Tool
1. Click the **activity/pulse icon** (〰️) in the Tools panel
2. **Select vein type** from panel:
   - Spider veins (thin, red)
   - Reticular veins (medium, blue)
   - Varicose veins (thick, dashed)
3. **Draw veins:** Click and drag in branching patterns
4. **Use case:** Sclerotherapy - map which veins to treat on legs
5. ✅ Success: Colored vein lines appear with correct style

#### Test 8: Brush Tool + Layers
1. Click the **paintbrush icon** (🖌️) in the Tools panel
2. **Select treatment type** from Product & Dosage panel:
   - Fractional Laser (red)
   - CO2 Laser (orange)
   - IPL (yellow)
   - Microneedling (purple)
3. **Paint on face:** Click and drag to highlight treatment area
4. **Check Layers panel** (bottom left):
   - Should show "Treatments" section
   - Each treatment type = separate layer
   - Toggle visibility on/off
5. ✅ Success: Brush strokes appear in Layers as separate treatment types

---

### Injection Point Enhancements

- [ ] **8. Depth Indicator Symbols**
  - Different visual markers for:
    - Periosteal (bone level)
    - Subcutaneous (fat layer)
    - Intradermal (skin level)
    - Intramuscular
  - Legend showing depth meanings

- [ ] **9. Running Unit Calculator**
  - Auto-sum total units as you tap
  - Always visible on screen
  - Per-product subtotals
  - Grand total

- [ ] **10. Symmetric Auto-Mirror**
  - Document one side of face
  - One-click duplicate to other side
  - Flip injection points symmetrically

- [ ] **11. Injection Site Rotation Tracker**
  - Show last 4-6 injection sites
  - For GLP-1, hormones, B12
  - Visual history on body map
  - Rotate recommendation

### Product Selection Enhancements

- [ ] **12. Lot Number Scanner**
  - Scan vial barcode when selecting product
  - Auto-populate lot number into chart
  - Expiration date tracking
  - Links to inventory system

- [ ] **13. Open Vial Indicator**
  - Show which vials are currently open
  - Display remaining units
  - Multi-patient vial tracking
  - Waste documentation

- [ ] **14. Dilution Ratio Field**
  - Document Botox reconstitution
  - Options: 1ml, 2ml, 2.5ml, 4ml, etc.
  - Affects unit calculations
  - Per-provider preferences

- [x] **15. Quick-Pick Product Buttons** *(Already Implemented)*

### Treatment-Specific Tools

- [ ] **16. Muscle Anatomy Overlay Toggle**
  - Show/hide muscle names on face
  - Frontalis, corrugator, procerus, etc.
  - Educational reference
  - Helps precise documentation

- [ ] **17. Depth-by-Zone Auto-Suggest**
  - RF microneedling depth recommendations
  - Based on treatment zone selected
  - Adjustable defaults in settings

- [ ] **18. Pass Counter**
  - Track laser/RF passes per zone
  - Visual counter per area
  - Reset per zone
  - Total pass count

- [ ] **19. Thread Vector Snap-to-Anatomy**
  - Thread placement vectors
  - Snap to anatomical landmarks
  - Entry/exit point marking
  - Thread type annotation

- [ ] **20. Kirby-Desai Calculator**
  - Tattoo removal session estimator
  - Input: skin type, ink colors, location, etc.
  - Output: estimated sessions needed
  - Track progress across sessions

### Timers (In-Chart)

- [ ] **21. Numbing Cream Timer**
  - Start countdown when applied
  - Configurable duration (20-60 min default)
  - Audio/visual alert when ready
  - Per-treatment presets

- [ ] **22. Peel Timer + Layer Counter**
  - Contact time countdown
  - Layer tracking ("Apply Layer 2")
  - Neutralization reminder
  - Different presets by peel type

- [ ] **23. Treatment Duration Timer**
  - Auto-start when chart opened
  - Track total procedure time
  - Pause/resume capability
  - Auto-record to chart

---

## SECTION 2: PHOTOS TAB (7 Features)

- [ ] **24. Photo Ghost Overlay**
  - Semi-transparent previous photo
  - Helps position patient identically
  - Adjustable opacity
  - Toggle on/off

- [ ] **25. Progress Photo Slider**
  - Interactive before/after reveal
  - Drag slider to compare
  - Side-by-side or overlay mode
  - Export as comparison image

- [ ] **26. Draw on Patient Photo**
  - Annotate directly on imported photos
  - Same drawing tools as injection map
  - Circle areas of concern
  - Add text notes

- [ ] **27. Side-by-Side Comparison**
  - Before/after together
  - Same-day or across sessions
  - Date labels
  - Sync zoom/pan

- [ ] **28. Standardized Position Guides**
  - On-screen overlay for camera
  - Consistent angles (front, 45°, profile)
  - Chin position marker
  - Eye level indicator

- [ ] **29. Photo Series Timeline**
  - All photos for patient chronologically
  - Filter by treatment type
  - Thumbnail strip navigation
  - Quick compare any two

- [ ] **30. Photo Requirement Blocker**
  - Cannot proceed to treatment tab without before photos
  - Configurable requirements
  - Override with reason
  - Audit trail

---

## SECTION 3: SOAP NOTES TAB (7 Features)

- [ ] **31. Voice-to-Text Dictation**
  - Microphone button in every text field
  - Real-time transcription
  - Edit after dictation
  - Works offline (device API)

- [ ] **32. Treatment-Specific SOAP Templates**
  - Pre-filled based on treatment type
  - Neurotoxin template
  - Filler template
  - Laser template
  - Customizable in settings

- [ ] **33. Smart Copy-Forward**
  - Pull from previous visit
  - Highlight what changed
  - Edit before accepting
  - Track modifications

- [ ] **34. Auto-Fill from Injection Map**
  - Generate text from chart data
  - "Patient received X units of Botox to Y areas"
  - Includes products, units, locations
  - Editable output

- [ ] **35. Endpoint Documentation Buttons**
  - Quick-tap clinical endpoints
  - Erythema grading (0-4)
  - Frosting level (types I-IV)
  - Edema scale
  - Bruising documentation

- [ ] **36. Complication Documentation Section**
  - Structured adverse event form
  - Timeline tracking
  - Severity grading
  - Treatment provided
  - Follow-up plan
  - Required fields

- [ ] **37. Supervising Physician Attestation**
  - Required sign-off field
  - For RN/NP treatments
  - Timestamp capture
  - Configurable by role

---

## SECTION 4: CONSENT TAB (3 Features)

- [ ] **38. Consent Verification Checklist**
  - Shows which consents are signed
  - Which are pending
  - Expiration tracking
  - Re-consent reminders

- [ ] **39. Treatment-Specific Consent Selection**
  - Auto-suggest based on treatment type
  - Multiple consent support
  - Version tracking
  - Language options

- [ ] **40. Consent Completion Blocker**
  - Cannot proceed without required signatures
  - Configurable requirements
  - Emergency override with audit
  - Visual indicator

---

## SECTION 5: HISTORY TAB (6 Features)

- [ ] **41. Treatment Series Progress Bar**
  - "Session 3 of 6" visual
  - Progress percentage
  - Remaining sessions
  - Series completion estimate

- [ ] **42. Cumulative Dose Tracker**
  - Running total across visits
  - For: Accutane, weight loss meds, etc.
  - Safety limits warning
  - Visual graph

- [ ] **43. Previous Treatment Summary Card**
  - At-a-glance last visit details
  - Products used
  - Units/amounts
  - Provider notes
  - One-click expand

- [ ] **44. One-Tap "Repeat Last Treatment"**
  - Load previous chart as starting point
  - Pre-fill all products/units
  - Modify as needed
  - Tracks as new session

- [ ] **45. Session Parameter Recall**
  - Load previous laser/device settings
  - Energy, pulse, passes
  - Quick apply to new session
  - Compare to manufacturer defaults

- [ ] **46. Treatment Timeline Visualization**
  - All treatments on visual timeline
  - Zoom in/out
  - Filter by treatment type
  - Click to view details

---

## SECTION 6: PATIENT CONTEXT (4 Features)

*Visible across all tabs*

- [ ] **47. Fitzpatrick Auto-Flag**
  - Alert banner for skin type IV+
  - "Recommend test spot"
  - Treatment-specific warnings
  - Customizable thresholds

- [ ] **48. Contraindication Alert Banner**
  - Warning if patient has known issues
  - Pregnancy status
  - Autoimmune conditions
  - Recent procedures
  - Medication interactions

- [ ] **49. Allergy/Medication Alerts**
  - Prominent display
  - Relevant to current treatment
  - Lidocaine allergy warning
  - Blood thinner alert

- [ ] **50. Patient Preferences Note**
  - "Prefers conservative approach"
  - "Sensitive to topical numbing"
  - "Requests same provider"
  - Quick-add common preferences

---

## SECTION 7: COMPLETION WORKFLOW (5 Features)

- [ ] **51. Pre-Treatment Photo Check**
  - Verify photos captured before starting
  - Visual checklist
  - Missing angle warnings
  - Quick capture shortcut

- [ ] **52. 2-Week Follow-Up Prompt**
  - "Schedule touch-up?" before closing
  - One-click schedule
  - Default follow-up by treatment type
  - Skip with reason

- [ ] **53. Aftercare Instructions Trigger**
  - Auto-send treatment-specific aftercare
  - On chart completion
  - Email/SMS options
  - Track delivery

- [ ] **54. Chart Signing**
  - Provider signature capture
  - Timestamp
  - Cannot edit after signing
  - Amendment process

- [ ] **55. Auto-Save Every Change**
  - Continuous saving
  - Never lose work
  - Save indicator
  - Version history

---

## SECTION 8: CHART-WIDE UI/UX (5 Features)

- [ ] **56. One-Page View Option**
  - See everything without scrolling
  - Condensed mode
  - Print-friendly layout
  - Toggle in/out

- [ ] **57. Floating Quick Actions**
  - Always visible buttons
  - Add Photo
  - Quick Note
  - Save
  - Configurable

- [ ] **58. Offline Mode with Sync**
  - Work without internet
  - Queue changes
  - Sync when connected
  - Conflict resolution

- [x] **59. Keyboard Shortcuts** *(Partially Implemented)*
  - Power user navigation
  - Tool switching
  - Save shortcuts
  - Help overlay

- [ ] **60. Tab Progress Indicators**
  - Show which tabs are complete
  - Incomplete markers
  - Required vs optional
  - Visual checklist

---

## SECTION 9: SMART DOSAGES (1 Feature)

- [ ] **61. Smart Quick Dosage Presets**

  Different quick dosage buttons based on treatment type:

  | Treatment Type | Quick Dosages | Why |
  |---------------|---------------|-----|
  | Neurotoxins (Botox) | 5, 10, 15, 20, 25 units | Fine control |
  | Fillers (Juvederm) | 0.25, 0.5, 1.0, 1.5, 2.0 ml | Syringe-based |
  | Kybella | 0.2, 0.4, 0.6, 0.8, 1.0 ml | Per injection site |
  | PRP | 1, 2, 3, 4 ml | Tube-based |
  | RF Energy | 10, 20, 30, 40, 50 mJ | Device settings |
  | Laser Fluence | 5, 10, 15, 20 J/cm² | Energy-based |

  **Settings Integration:**
  - Default presets per treatment category
  - User-customizable quick dosages
  - Per-practitioner preferences (future)

---

## SECTION 10: FUTURE/AI FEATURES (1 Feature)

- [ ] **62. AI-Powered Treatment Summary (Gemini)**
  - Automatically analyzes all chart layers and annotations after practitioner saves
  - Uses Gemini AI to detect all procedures performed and their exact locations
  - Generates a natural language summary displayed in the LEFT dock
  - Example output: "IPL treatment to bilateral cheeks and forehead. Botox 25 units to glabella and crow's feet. Juvederm 1mL to nasolabial folds."
  - Allows practitioner to quickly understand what was done without reading through every marking
  - Saves documentation time and improves chart review efficiency
  - Summary appears in LEFT dock under patient information section
  - Can be edited/refined by practitioner before finalizing
  - Future: Voice readout of summary option

  **Technical Details:**
  - Trigger: On "Save Chart" action
  - Input: All layer data (injection points, brush strokes, annotations, products, dosages)
  - AI Model: Google Gemini API
  - Output: Structured text summary with treatment breakdown
  - Storage: Save summary as part of chart record for future reference

  **Benefits:**
  - Instant chart review without manual reading
  - Accurate procedure documentation
  - Consistent summary format across all treatments
  - Helps with billing verification (procedures match charges)
  - Assists future practitioners reviewing patient history

---

## Implementation Notes

### Priority Guide
- **High Impact:** 9, 21, 24, 31, 34, 55, 61
- **Quick Wins:** 4, 18, 35, 43, 50
- **Complex:** 5, 12, 16, 58

### Dependencies
- Features 12, 13 depend on Inventory module
- Feature 37 depends on Auth/roles
- Feature 58 requires service worker

### Files to Modify
- `/src/app/charting/page.tsx` - Main charting page
- `/src/components/charting/*` - All charting components
- `/src/app/settings/charting/page.tsx` - Settings integration
- `/src/types/charting.ts` - Type definitions

---

## Session Log

| Date | Section | Features Completed | Notes |
|------|---------|-------------------|-------|
| Jan 12, 2026 | - | Created TODO | Starting point |

