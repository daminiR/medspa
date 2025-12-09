import { Service, Practitioner } from '@/lib/data'
import { Shift } from '@/types/shifts'

export interface CapabilityMatchResult {
  canPerform: boolean
  hasPreferredCapabilities: boolean
  matchType: 'perfect' | 'good' | 'basic' | 'incompatible'
  missingCapabilities: string[]
  missingEquipment: string[]
  warnings: string[]
  recommendation: string
}

/**
 * Check if a practitioner can perform a service during a specific shift
 * Uses the new capabilities/equipment system with fallback to legacy tags
 */
export function checkServiceCapabilityMatch(
  service: Service,
  practitioner: Practitioner,
  shift: Shift
): CapabilityMatchResult {
  const result: CapabilityMatchResult = {
    canPerform: false,
    hasPreferredCapabilities: false,
    matchType: 'incompatible',
    missingCapabilities: [],
    missingEquipment: [],
    warnings: [],
    recommendation: ''
  }

  // NEW SYSTEM: Check capabilities and equipment
  if (service.requiredCapabilities || service.requiredEquipment) {
    return checkNewCapabilitySystem(service, practitioner, shift, result)
  }

  // LEGACY SYSTEM: Fallback to tag matching
  if (service.tags && service.tags.length > 0) {
    return checkLegacyTagSystem(service, shift, result)
  }

  // NO REQUIREMENTS: Service can be performed by anyone
  result.canPerform = true
  result.matchType = 'basic'
  result.recommendation = 'No specific requirements - can be booked'
  return result
}

function checkNewCapabilitySystem(
  service: Service,
  practitioner: Practitioner,
  shift: Shift,
  result: CapabilityMatchResult
): CapabilityMatchResult {
  const practitionerCertifications = practitioner.certifications || []
  const shiftEquipment = shift.availableEquipment || []

  // Check required capabilities (practitioner must have these)
  if (service.requiredCapabilities) {
    for (const capability of service.requiredCapabilities) {
      if (!practitionerCertifications.includes(capability)) {
        result.missingCapabilities.push(capability)
      }
    }
  }

  // Check required equipment (shift must have these available)
  if (service.requiredEquipment) {
    for (const equipment of service.requiredEquipment) {
      if (!shiftEquipment.includes(equipment)) {
        result.missingEquipment.push(equipment)
      }
    }
  }

  // Can't perform if missing required capabilities or equipment
  if (result.missingCapabilities.length > 0 || result.missingEquipment.length > 0) {
    result.canPerform = false
    result.matchType = 'incompatible'
    result.recommendation = generateIncompatibleRecommendation(result)
    return result
  }

  // Check preferred capabilities for better matching
  result.hasPreferredCapabilities = checkPreferredCapabilities(service, practitioner)
  result.canPerform = true

  // Determine match quality
  if (result.hasPreferredCapabilities) {
    result.matchType = 'perfect'
    result.recommendation = 'Excellent match - practitioner has all preferred qualifications'
  } else if (service.preferredCapabilities && service.preferredCapabilities.length > 0) {
    result.matchType = 'good'
    result.recommendation = 'Good match - meets all requirements'
    result.warnings.push('Practitioner could benefit from additional training in preferred areas')
  } else {
    result.matchType = 'good'
    result.recommendation = 'Good match - meets all requirements'
  }

  return result
}

function checkLegacyTagSystem(
  service: Service,
  shift: Shift,
  result: CapabilityMatchResult
): CapabilityMatchResult {
  if (!service.tags || service.tags.length === 0) {
    result.canPerform = true
    result.matchType = 'basic'
    result.recommendation = 'No tag requirements'
    return result
  }

  const shiftTags = shift.tags || []
  const hasMatchingTag = service.tags.some(serviceTag => shiftTags.includes(serviceTag))

  if (hasMatchingTag) {
    result.canPerform = true
    result.matchType = 'basic'
    result.recommendation = 'Tag requirements met (legacy system)'
  } else {
    result.canPerform = false
    result.matchType = 'incompatible'
    result.recommendation = `Missing required tags: ${service.tags.join(', ')}`
    result.warnings.push('Using legacy tag system - consider upgrading to capabilities system')
  }

  return result
}

function checkPreferredCapabilities(service: Service, practitioner: Practitioner): boolean {
  if (!service.preferredCapabilities || service.preferredCapabilities.length === 0) {
    return true // No preferences = perfect match
  }

  const practitionerCertifications = practitioner.certifications || []
  const practitionerSpecialties = practitioner.specialties || []
  const allPractitionerCapabilities = [...practitionerCertifications, ...practitionerSpecialties]

  return service.preferredCapabilities.some(preferred =>
    allPractitionerCapabilities.includes(preferred)
  )
}

function generateIncompatibleRecommendation(result: CapabilityMatchResult): string {
  const issues = []
  
  if (result.missingCapabilities.length > 0) {
    issues.push(`Missing certifications: ${result.missingCapabilities.join(', ')}`)
  }
  
  if (result.missingEquipment.length > 0) {
    issues.push(`Missing equipment: ${result.missingEquipment.join(', ')}`)
  }

  return `Cannot perform service. ${issues.join(' | ')}`
}

/**
 * Get a user-friendly explanation for why a service can't be booked
 */
export function getBookingExplanation(match: CapabilityMatchResult, serviceName: string): string {
  if (match.canPerform) {
    return `✅ ${serviceName} can be booked - ${match.recommendation}`
  }

  let explanation = `❌ ${serviceName} cannot be booked at this time.\n\n`
  
  if (match.missingCapabilities.length > 0) {
    explanation += `Practitioner needs: ${match.missingCapabilities.map(cap => cap.replace(/-/g, ' ')).join(', ')}\n`
  }
  
  if (match.missingEquipment.length > 0) {
    explanation += `This shift needs: ${match.missingEquipment.map(eq => eq.replace(/-/g, ' ')).join(', ')}\n`
  }

  explanation += `\n💡 Suggestion: ${match.recommendation}`
  
  return explanation
}

/**
 * Filter services that a practitioner can perform (regardless of shift)
 */
export function getServicesForPractitioner(services: Service[], practitioner: Practitioner): Service[] {
  return services.filter(service => {
    // Check practitioner ID list first
    if (!service.practitionerIds.includes(practitioner.id)) {
      return false
    }

    // If no capability requirements, they can perform it
    if (!service.requiredCapabilities || service.requiredCapabilities.length === 0) {
      return true
    }

    // Check if practitioner has required capabilities
    const practitionerCertifications = practitioner.certifications || []
    return service.requiredCapabilities.every(capability =>
      practitionerCertifications.includes(capability)
    )
  })
}