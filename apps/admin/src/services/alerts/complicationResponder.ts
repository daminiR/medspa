/**
 * Complication Responder
 *
 * Generates appropriate auto-responses for patients reporting
 * complications or concerns after treatment.
 */

import { type RecentTreatment, getTreatmentCategory } from '@/lib/data/treatmentLookup'
import { isEmergency } from './complicationAlertService'

// ============================================
// AFTERCARE TIPS BY TREATMENT TYPE
// ============================================

const AFTERCARE_TIPS: Record<string, Record<string, string>> = {
  neurotoxin: {
    bruising: 'Bruising is normal and typically resolves within 7-10 days. Arnica cream can help.',
    swelling: 'Mild swelling is expected. Stay upright for 4 hours post-treatment. Ice gently if needed.',
    pain: 'Some tenderness is normal. Tylenol is safe; avoid aspirin or ibuprofen for 24 hours.',
    headache: 'Mild headache can occur and usually resolves within 24-48 hours. Stay hydrated.',
    drooping: 'If you notice any drooping, please contact us right away so we can evaluate.',
    asymmetry: 'Some asymmetry can occur as the product settles. Wait 2 weeks for full results before assessing.',
    default: 'Avoid rubbing the area, exercise, or lying down for 4 hours. Results appear in 3-7 days.'
  },
  filler: {
    bruising: 'Bruising is common and usually resolves in 1-2 weeks. Arnica gel can help. Avoid blood thinners.',
    swelling: 'Swelling peaks at 24-48 hours and typically resolves within 3-5 days. Ice intermittently and sleep elevated.',
    pain: 'Tenderness is normal. Over-the-counter pain relievers (not aspirin) can help. Contact us if severe.',
    bump: 'Small bumps can occur. Gentle massage as directed by your provider may help. Usually resolves on its own.',
    lump: 'Lumps can be normal initially. If firm or painful after 2 weeks, please schedule a follow-up.',
    asymmetry: 'Minor asymmetry is common as swelling resolves differently. Wait 2 weeks to assess final results.',
    hardspot: 'Some firmness is normal initially. Massage gently as directed. Contact us if it persists.',
    migration: 'If you notice product has moved, please contact us right away for evaluation.',
    default: 'Avoid exercise, alcohol, and extreme heat for 24 hours. Swelling is normal and temporary.'
  },
  chemical_peel: {
    redness: 'Redness is a normal part of the healing process and typically fades within a few days.',
    peeling: 'Peeling usually begins 3-5 days post-treatment. Do not pick or peel skin manually.',
    burning: 'Mild burning sensation is normal. Apply moisturizer and avoid hot water. Contact us if severe.',
    blistering: 'Blistering is not expected. Please contact us right away if you see blisters.',
    sensitivity: 'Your skin is more sensitive now. Use gentle products and SPF 30+ daily.',
    default: 'Keep skin moisturized, use gentle cleanser, wear SPF 30+ daily. Avoid retinols for 1 week.'
  },
  microneedling: {
    redness: 'Redness is normal and typically resolves within 2-3 days. Avoid makeup for 24 hours.',
    swelling: 'Mild swelling is expected, especially around eyes. It usually resolves within 48 hours.',
    bleeding: 'Minor pinpoint bleeding during treatment is normal. Contact us if you see new bleeding.',
    breakout: 'Temporary breakouts can occur as skin purges. Keep skin clean and moisturized.',
    dryness: 'Skin may feel tight or dry. Use the provided serum and gentle moisturizer frequently.',
    default: 'Avoid sun, makeup, and exercise for 24-48 hours. Use gentle products only.'
  },
  laser: {
    redness: 'Redness is expected and typically fades within hours to days depending on treatment intensity.',
    swelling: 'Mild swelling is normal, especially around eyes. Ice gently and it should resolve within 48 hours.',
    blistering: 'Blistering is not expected with most laser treatments. Please contact us immediately if this occurs.',
    burns: 'If you experience burn-like symptoms, contact us right away. Apply cool compress, not ice directly.',
    crusting: 'Some crusting may occur with certain lasers. Do not pick. Keep area moist and clean.',
    pigment: 'Temporary darkening or lightening can occur. Use SPF 50+ and avoid sun exposure.',
    default: 'Apply moisturizer frequently, use SPF 50+ daily, avoid heat and sweating for 48 hours.'
  },
  body_contouring: {
    swelling: 'Swelling is very common and can last 1-3 weeks. This is your body processing the treated cells.',
    bruising: 'Bruising can occur and typically resolves within 2 weeks.',
    numbness: 'Temporary numbness or tingling is normal and can last several weeks.',
    pain: 'Some discomfort is expected. Over-the-counter pain relievers can help. Contact us if severe.',
    firmness: 'The treated area may feel firm. This is normal and resolves as swelling decreases.',
    default: 'Wear compression garment as directed, stay hydrated, and maintain healthy habits for best results.'
  },
  general: {
    bruising: 'Some bruising is normal and typically resolves within 1-2 weeks.',
    swelling: 'Mild swelling is expected and usually peaks at 24-48 hours before improving.',
    pain: 'Some tenderness is normal. Over-the-counter pain relievers can help.',
    redness: 'Temporary redness is common and usually fades within hours to days.',
    default: 'Follow your aftercare instructions. Contact us if symptoms worsen or you have concerns.'
  }
}

// ============================================
// EMERGENCY RESPONSE MESSAGES
// ============================================

const EMERGENCY_RESPONSE =
  "This sounds urgent. If this is a medical emergency, please call 911 immediately. " +
  "Our medical team has been alerted and will contact you right away. " +
  "If you're experiencing difficulty breathing, chest pain, or severe allergic reaction, call 911 now."

const VISION_EMERGENCY_RESPONSE =
  "Vision changes after filler are serious. Please seek IMMEDIATE medical attention - " +
  "go to the nearest emergency room NOW. Our team has been alerted and will call you. " +
  "This may require urgent treatment within hours."

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Get relevant aftercare tip based on treatment type and keywords
 */
function getAftercareTip(treatmentCategory: string, keywords: string[]): string {
  const tips = AFTERCARE_TIPS[treatmentCategory] || AFTERCARE_TIPS.general
  const keywordsLower = keywords.map(k => k.toLowerCase())

  // Find the most relevant tip
  for (const keyword of keywordsLower) {
    for (const [tipKey, tipText] of Object.entries(tips)) {
      if (tipKey !== 'default' && keyword.includes(tipKey)) {
        return tipText
      }
    }
  }

  return tips.default
}

/**
 * Generate an appropriate auto-response for a complication report
 */
export function generateComplicationResponse(
  treatment: RecentTreatment | null,
  keywords: string[]
): string {
  const keywordsLower = keywords.map(k => k.toLowerCase())

  // Check for true emergency first
  if (isEmergency(keywords)) {
    // Special handling for vision changes with filler
    if (
      keywordsLower.some(k => k.includes('vision') || k.includes('blind') || k.includes('see')) &&
      treatment?.serviceName.toLowerCase().includes('filler')
    ) {
      return VISION_EMERGENCY_RESPONSE
    }
    return EMERGENCY_RESPONSE
  }

  // Build response parts
  const parts: string[] = []

  // Opening acknowledgment
  parts.push("We've received your message and our team has been notified.")

  // Get treatment-specific tip if we know the treatment
  if (treatment) {
    const treatmentCategory = getTreatmentCategory(treatment.serviceName)
    const aftercareTip = getAftercareTip(treatmentCategory, keywords)
    parts.push(aftercareTip)

    // Add context about when they had the treatment
    if (treatment.daysSince <= 1) {
      parts.push("It's normal to experience some effects in the first 24-48 hours after treatment.")
    } else if (treatment.daysSince <= 3) {
      parts.push("You're still in the initial healing period where some symptoms are expected.")
    } else if (treatment.daysSince <= 7) {
      parts.push("Most symptoms typically improve within the first week.")
    }
  } else {
    // No treatment found - give general response
    const generalTip = getAftercareTip('general', keywords)
    parts.push(generalTip)
  }

  // Closing with callback
  parts.push(
    "If symptoms worsen or you have additional concerns, reply to this message or call us at 555-0100. " +
    "A team member will follow up with you shortly."
  )

  return parts.join(' ')
}

/**
 * Generate a shorter acknowledgment for non-complication urgent messages
 */
export function generateUrgentAcknowledgment(): string {
  return (
    "We've received your message and marked it as urgent. " +
    "A team member will respond shortly. If this is a medical emergency, please call 911."
  )
}

/**
 * Get specific aftercare tips for a treatment type
 * Can be used to send proactive aftercare reminders
 */
export function getAftercareTipsForTreatment(serviceName: string): string[] {
  const category = getTreatmentCategory(serviceName)
  const tips = AFTERCARE_TIPS[category] || AFTERCARE_TIPS.general

  return Object.entries(tips)
    .filter(([key]) => key !== 'default')
    .map(([symptom, tip]) => `${symptom.charAt(0).toUpperCase() + symptom.slice(1)}: ${tip}`)
}

/**
 * Generate a general post-treatment check-in message
 */
export function generateFollowUpMessage(
  patientName: string,
  treatment: RecentTreatment
): string {
  const category = getTreatmentCategory(treatment.serviceName)
  const defaultTip = AFTERCARE_TIPS[category]?.default || AFTERCARE_TIPS.general.default

  return (
    `Hi ${patientName}! This is a follow-up from your ${treatment.serviceName} ` +
    `${treatment.daysSince} day${treatment.daysSince !== 1 ? 's' : ''} ago. ` +
    `How are you feeling? Remember: ${defaultTip} ` +
    `Any concerns? Reply to this message and we'll help!`
  )
}
