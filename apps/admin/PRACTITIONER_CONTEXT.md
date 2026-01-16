# Practitioner Context for Charting Features

> **IMPORTANT FOR ALL AGENTS**: You MUST read and internalize this context before implementing ANY charting feature. This is not optional guidance - it is the foundation for every design decision.

---

## Who You're Building For

Medical spa practitioners - injectors, nurses, aestheticians - who are physically treating patients. Their hands might be gloved, they might be mid-injection, they're in a focused flow state. This isn't someone casually browsing software. This is someone whose attention is split between a patient's face and their documentation tool.

They are **in the zone** during treatments. This is a state of focused concentration where interruptions have exponential costs.

---

## The Cost of Friction

When you add a button, a setting, a choice - you're not just adding "a small thing." You're potentially:

- **Breaking their treatment rhythm** - They have to mentally shift from "patient care" to "software navigation"
- **Forcing a mental gear-shift** - Away from the patient, toward troubleshooting UI
- **Accumulating frustration** - Across a 10-hour day of back-to-back treatments, small annoyances become rage
- **Creating opportunities for errors** - When cognitively overloaded, mistakes happen
- **Making them feel the software works against them** - Not for them

**One error, one confusing UI element, one extra tap - has a penalty that compounds.**

They have to stop, think, troubleshoot, when they should be focused on the patient in front of them. Every second of friction is a second stolen from patient care.

---

## The Philosophy: Mangomint Simplicity

Think Mangomint. On the surface, it looks almost too simple - "Where are all the features?"

But the power is there, waiting in settings, configured ahead of time.

**During the treatment**: The practitioner sees only what they need. Clean. Focused. No decisions to make.

**In settings (before/after hours)**: This is where complexity lives. When they have mental space to think, configure, customize. They're not rushed. They can explore.

The settings page is where you can "overwhelm" them with options - because that's when they're taking time outside the hustle to think about it. Not during the workday. Not while treating patients.

---

## The Goal

Build something that makes them say:

> "This saves my day."

NOT "This has a lot of features."

They should feel **relief** when they use it, not cognitive burden. It should feel like an extension of their workflow, not an interruption to it.

When they're charting at the end of a long day, they should think: "At least this part is easy."

---

## Research-Backed Decisions

These practitioners stare at this screen for **hours**. Human psychology matters:

### Panel Placement
- **LEFT side**: Reference and viewing (patient info, history, layers, read-only data)
- **RIGHT side**: Actions and tools (drawing, products, save buttons)
- Based on right-handed dominance (~90% of population) and Fitts' Law
- Right hand holds stylus/does actions, left side is for glancing at reference

### Visual Hierarchy
- What catches the eye first should be what they need first
- Primary actions should be obvious without reading
- Secondary options should be discoverable but not competing for attention

### Color Meaning
- Colors are **functional**, not decorative
- Each product has a distinct color for instant recognition
- Error states, warnings, success - all color-coded for glance-ability

### Touch Targets
- Gloved fingers are less precise
- Stylus use is common (Apple Pencil on iPad)
- Quick taps - no hover states to rely on
- Minimum 44x44px touch targets

---

## The Lens for Every Feature

Before adding ANYTHING, ask:

> "If a practitioner is mid-treatment, will this help or interrupt?"

If it **helps**: Make it visible, accessible, one-tap.

If it **interrupts**: Either hide it in settings, make it optional, or reconsider if it's needed at all.

Features that are "nice to have" but add cognitive load during treatment should be:
1. Off by default
2. Enabled via settings
3. Designed to be invisible until explicitly activated

---

## Practical Examples

### Good
- Tap a product, tap the face, done. Point placed.
- Undo is one tap. Always visible.
- Tool palette shows only enabled tools (configured in settings beforehand)

### Bad
- Modal popup asking "Are you sure?" for routine actions
- Requiring calibration before measuring (add it in settings for power users)
- Showing 15 tool options when they only use 4

### The Test
Imagine the practitioner has just injected a patient and needs to document it in 3 seconds before moving to the next injection site. Can they do it without thinking? If yes, you've succeeded.

---

## When Reading This File

If you are a sub-agent working on charting features:

1. **Read this entire file first** before writing any code
2. **Reference this context** when making design decisions
3. **Justify your choices** against these principles
4. **Default to simplicity** - you can always add complexity in settings later
5. **Ask yourself**: Would a practitioner mid-treatment thank me or curse me for this?

---

*This context should be included with every charting-related task. It represents hours of thoughtful consideration about the end users and their daily reality.*
