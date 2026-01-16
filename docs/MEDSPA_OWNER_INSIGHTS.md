# MedSpa Owner Insights

**Purpose**: Real-world insights gathered from conversations with actual medical spa owners and practitioners. These inform product decisions and competitive advantages.

---

## Insight #1: Package Pricing Transparency Problem (Mango Mint)

**Source**: MedSpa owner friend (dinner conversation, January 2026)
**Software Used**: Mango Mint
**Business Type**: New medspa (~1 year old), specializes in lasers and customizable treatments

### The Problem

When the owner does consultative phone sales, she creates **custom packages** tailored to each client's needs (e.g., a personalized laser treatment series at $X). However, Mango Mint's system creates a **pricing transparency conflict**:

1. **Phone Sales (High-Touch)**: Owner sells customized package for $1,200 based on consultation
2. **Portal/Website (Self-Service)**: Client sees pre-built packages listed at $900
3. **Result**: Client questions why they should pay more, or just books the cheaper pre-built option

### Why This Happens

From our research, Mango Mint has these documented limitations:

- **"Packages could be built out better"** - You have to charge the package in one invoice and then charge the service used in another step
- **"Timing and pricing customizations increased by a percentage instead of a flat dollar amount"** - Manual pricing adjustments required
- **"Limited customization"** - You adapt to Mangomint's workflows rather than configuring it to match your processes
- **No Unit-Based Tracking** - Can't track injectable units in packages (per our SWOT analysis)

### Our Opportunity

Build a package system that supports:

1. **Private/Custom Packages**: Packages that aren't visible on public booking but can be assigned to specific clients
2. **Consultative Selling Mode**: Create custom packages on-the-fly during phone calls that don't conflict with website pricing
3. **Client-Specific Pricing**: Different clients can have different package prices without it being publicly visible
4. **Flexible Payment Plans**: Spread large packages (like $10,000 laser series) over time without showing the "cheaper" bundled price publicly
5. **Price-Match Protection**: If a custom package is sold, the client shouldn't see cheaper alternatives in their portal

### User Story

> "As a medspa owner who does consultative phone sales, I need to create custom package pricing for specific clients without those clients seeing different (cheaper) package options on the public booking site, so that I don't undercut my own sales."

---

## Insight #2: Charting is the BIG Opportunity

**Source**: Same medspa owner
**Key Quote**: "Charting is going to be your big thing because no one does charting well for injectables"

### The Problem Statement

Current charting solutions optimize for **accuracy** OR **speed**, but not both:

- **Accuracy-focused**: Detailed forms, dropdowns, lots of clicking - takes too long
- **Speed-focused**: Quick notes - not precise enough for medical documentation

### The Real-World Workflow (How Practitioners Actually Work)

The owner described her ideal workflow:

1. **Multi-Point Selection**: "I could just click on the top of the forehead and put 5 dots"
2. **Batch Unit Assignment**: "Then say 'all of these are 0.2 units'"
3. **Voice Input**: "If you have a stylus or something, put 5 dots and say in a speaker '0.2 units'"
4. **Phone-Based**: "I just use my phone" - mobile is the primary device, not desktop

### The Speed + Accuracy Formula

```
SPEED: Tap multiple points → Voice command for units → Done
ACCURACY: Each injection site precisely mapped with exact dosage
```

### Device Priority (Based on Real Usage)

1. **Mobile (Phone)** - "She just uses her phone" - PRIMARY device
2. **iPad/Tablet** - For providers who want bigger screen with stylus
3. **Web** - For detailed review, reports, back-office work

### Feature Requirements

| Feature | Description | Why It Matters |
|---------|-------------|----------------|
| **Multi-Point Selection** | Tap/click multiple injection sites before entering dosage | 5x faster than one-by-one |
| **Voice Input** | Say "0.2 units" instead of typing | Hands stay on patient/screen |
| **Batch Apply** | Apply same dosage to all selected points at once | Common pattern for forehead, crow's feet |
| **Touch-Optimized** | Works with finger on phone, stylus on iPad | Real-world usage patterns |
| **Auto-Total** | Automatically sum total units used | Required for billing/inventory |
| **Template Starting Points** | Common injection patterns as starting templates | Speed up common treatments |

### Competitive Analysis: Current Charting Solutions

| Platform | Injection Mapping | Voice Input | Multi-Point Select | Mobile-First |
|----------|-------------------|-------------|-------------------|--------------|
| Mango Mint | Basic annotations | No | No | No |
| OptiMantra | Annotatable images | No | No | Partial |
| Pabau | Face chart mapping | No | No | No |
| Zenoti | Drag-and-drop forms | No | No | No |
| Meevo | Image annotation | No | No | No |
| **Us (Target)** | Full injection mapping | YES | YES | YES |

### Implementation Priority

This should be a **P0 DIFFERENTIATOR** because:
1. No competitor has voice + multi-point selection
2. Directly addresses the #1 pain point from real users
3. Creates word-of-mouth marketing ("You have to try their charting")
4. Stickiness - once practitioners learn the fast workflow, they won't switch

---

## Insight #3: Platform Requirements for Charting

**Requirement**: Must support Mobile, Web, AND iPad equally

### Web Charting
- Full-featured charting interface
- Best for detailed documentation, reports, back-office review
- Mouse/keyboard optimized
- Desktop screen real estate for complex charts

### Mobile Charting (Phone)
- **PRIMARY DEVICE** for many practitioners
- Touch-optimized with large tap targets
- Voice input for hands-free dosage entry
- Quick-chart mode for treatment room
- Works with one hand while patient in chair

### iPad/Tablet Charting
- Stylus support for precise injection point marking
- Larger screen than phone but portable
- Voice input integration
- Split-screen for before/after photos while charting

---

## Action Items

### Immediate (This Sprint)
- [ ] Review current charting implementation for speed bottlenecks
- [ ] Prototype multi-point selection on face diagram
- [ ] Research voice input APIs (Web Speech API, native iOS/Android)
- [ ] Design batch-apply dosage UX

### Short-Term (Next 2 Sprints)
- [ ] Implement multi-point selection MVP
- [ ] Add voice input for dosage (browser-based first)
- [ ] Create mobile-optimized charting view
- [ ] User test with at least 2 practitioners

### Medium-Term
- [ ] iPad app with stylus support
- [ ] React Native mobile app with native voice
- [ ] Template injection patterns library
- [ ] Integration with inventory (auto-deduct units)

### Package System
- [ ] Design private/custom package architecture
- [ ] Client-specific pricing feature
- [ ] Hidden packages not visible on public booking
- [ ] Consultative sales workflow

---

## Questions to Ask This Contact (Follow-Up)

When reaching out to this medspa owner again, gather more details on:

1. **Charting Workflow**
   - What specific treatments do you chart most often? (Botox, fillers, both?)
   - How many injection points in a typical treatment?
   - Do you chart DURING treatment or AFTER?
   - Do you take photos? Before/after? During?

2. **Package Pricing**
   - What's your average custom package value?
   - How often does the price-visibility problem happen?
   - Do you have a workaround currently?
   - Would you pay more for software that solves this?

3. **Device Usage**
   - What phone do you use? (iPhone/Android)
   - Do you have an iPad?
   - Would you use a stylus?
   - Is the phone always in your pocket during treatments?

4. **Switching Pain**
   - What would make you switch from Mango Mint?
   - What features can you NOT live without?
   - How much do you pay currently?
   - Would you do a beta test?

---

## How to Reach Out (Networking Advice)

Since this is a new business connection, here's how to follow up without being too pushy:

### Timing
- Wait 2-3 days after the dinner (not immediately)
- Weekend or evening message is less "businessy"

### Message Template

```
Hey [Name]! It was so great catching up at dinner the other night.

I've been thinking about what you said about charting and packages -
it's honestly some of the most valuable feedback I've gotten.

Would you be open to a quick 15-min call sometime? I'd love to
understand your workflow better. No sales pitch, I promise -
just trying to build something practitioners actually want to use.

Totally understand if you're swamped though!
```

### Why This Works
- Acknowledges the value of THEIR input (not asking for a favor)
- Specific time ask (15 min is low commitment)
- "No sales pitch" removes pressure
- "Totally understand" gives them an easy out
- Positions you as learning, not selling

### Follow-Up Cadence
1. First message: 2-3 days after dinner
2. If no response: Wait 1 week, send a simple "Just following up!"
3. If still no response: Let it go, catch up naturally next time
4. If they respond: Lock in a specific time immediately

---

*Last Updated: January 2026*
*Next Review: After follow-up conversation with contact*
