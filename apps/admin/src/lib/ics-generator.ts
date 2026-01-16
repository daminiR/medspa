/**
 * ICS Calendar File Generator
 * RFC 5545 Compliant .ics file generator for appointment calendar exports
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 *
 * Test Cases:
 * 1. Basic appointment with all fields populated
 * 2. Appointment with minimal fields (no email, no location)
 * 3. Appointment with special characters in description (newlines, commas)
 * 4. Appointment spanning midnight
 * 5. Long description that requires line folding
 * 6. Unicode characters in patient/practitioner names
 */

import { Appointment, Practitioner, Location } from '@/lib/data'

/**
 * Interface for ICS generation input
 */
export interface ICSAppointmentData {
  appointment: Appointment
  practitioner: Practitioner
  location?: Location
  clinicName?: string
  clinicPhone?: string
  clinicEmail?: string
  clinicAddress?: string
  mapLink?: string
}

/**
 * Default clinic information (would typically come from config/env)
 */
const DEFAULT_CLINIC = {
  name: 'Medical Spa',
  phone: '(555) 0100',
  email: 'appointments@medicalspa.com',
  address: '123 Main Street, Suite 100, City, State 12345',
  mapLink: 'https://maps.google.com/?q=Medical+Spa'
}

/**
 * Sanitizes text content for ICS format
 * - Escapes special characters: backslash, semicolon, comma
 * - Converts newlines to escaped format
 * - Removes any potentially harmful content
 *
 * @param text - Raw text to sanitize
 * @returns Sanitized text safe for ICS
 */
export function sanitizeICSText(text: string): string {
  if (!text) return ''

  return text
    // Escape backslashes first (must be first to avoid double-escaping)
    .replace(/\\/g, '\\\\')
    // Escape semicolons
    .replace(/;/g, '\\;')
    // Escape commas
    .replace(/,/g, '\\,')
    // Convert newlines to escaped newline (RFC 5545 spec)
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n')
    // Remove any null bytes or other control characters (except \n which is now escaped)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Folds long lines according to RFC 5545 (max 75 octets per line)
 * Lines are folded by inserting CRLF followed by a space
 *
 * @param line - Line to fold
 * @returns Folded line(s)
 */
export function foldLine(line: string): string {
  const maxLength = 75

  if (line.length <= maxLength) {
    return line
  }

  const result: string[] = []
  let currentLine = line

  // First line can be full length
  result.push(currentLine.substring(0, maxLength))
  currentLine = currentLine.substring(maxLength)

  // Subsequent lines start with a space and can be 74 chars of content
  while (currentLine.length > 0) {
    const chunkLength = maxLength - 1 // Account for leading space
    result.push(' ' + currentLine.substring(0, chunkLength))
    currentLine = currentLine.substring(chunkLength)
  }

  return result.join('\r\n')
}

/**
 * Formats a Date object to ICS datetime format (UTC)
 * Format: YYYYMMDDTHHMMSSZ
 *
 * @param date - Date to format
 * @returns ICS formatted datetime string
 */
export function formatICSDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')

  // Convert to UTC
  const utcYear = date.getUTCFullYear()
  const utcMonth = pad(date.getUTCMonth() + 1)
  const utcDay = pad(date.getUTCDate())
  const utcHours = pad(date.getUTCHours())
  const utcMinutes = pad(date.getUTCMinutes())
  const utcSeconds = pad(date.getUTCSeconds())

  return `${utcYear}${utcMonth}${utcDay}T${utcHours}${utcMinutes}${utcSeconds}Z`
}

/**
 * Generates a unique identifier for the calendar event
 * Format: {appointmentId}@medicalspa.com
 *
 * @param appointmentId - Appointment ID
 * @returns UID string
 */
export function generateUID(appointmentId: string): string {
  return `${appointmentId}@medicalspa.com`
}

/**
 * Builds the DESCRIPTION field content with appointment details
 *
 * @param data - Appointment data
 * @returns Formatted description text
 */
export function buildDescription(data: ICSAppointmentData): string {
  const { appointment, practitioner, location } = data
  const clinic = {
    name: data.clinicName || DEFAULT_CLINIC.name,
    phone: data.clinicPhone || DEFAULT_CLINIC.phone,
    email: data.clinicEmail || DEFAULT_CLINIC.email,
    address: location?.address || data.clinicAddress || DEFAULT_CLINIC.address,
    mapLink: data.mapLink || DEFAULT_CLINIC.mapLink
  }

  const service = appointment.serviceName
  const duration = appointment.duration

  // Find service price (would typically come from service lookup)
  // For now, we'll skip price if not available
  const priceInfo = '' // Could be: `- Price: $${service.price}`

  const lines = [
    'Appointment Details:',
    `- Service: ${service}`,
    `- Duration: ${duration} minutes`,
    `- Practitioner: ${practitioner.name}`,
    priceInfo,
    '',
    'Preparation Instructions:',
    '- Arrive 10 minutes early',
    '- Bring valid ID',
    '- Inform practitioner of any allergies or medications',
    '',
    'Cancellation Policy:',
    '- Free cancellation up to 24 hours before appointment',
    '- $50 fee if less than 24 hours notice',
    '- No-shows may be charged full amount',
    '',
    `Contact: ${clinic.phone} | ${clinic.email}`,
    `Directions: ${clinic.mapLink}`
  ].filter(line => line !== '') // Remove empty price line if not set

  return lines.join('\n')
}

/**
 * Generates RFC 5545 compliant .ics file content for an appointment
 *
 * Required Fields (RFC 5545):
 * - VCALENDAR wrapper with VERSION and PRODID
 * - VEVENT with UID, DTSTAMP, DTSTART
 *
 * Included Optional Fields:
 * - DTEND: Appointment end time
 * - SUMMARY: Event title
 * - DESCRIPTION: Detailed information
 * - LOCATION: Physical location
 * - ORGANIZER: Clinic email
 * - ATTENDEE: Patient email (if available)
 * - STATUS: CONFIRMED
 * - TRANSP: OPAQUE (blocks calendar)
 * - CREATED: Event creation timestamp
 * - LAST-MODIFIED: Last update timestamp
 * - SEQUENCE: Event version number
 *
 * @param data - Appointment data for ICS generation
 * @returns RFC 5545 compliant .ics file content with CRLF line endings
 */
export function generateICS(data: ICSAppointmentData): string {
  const { appointment, practitioner, location } = data
  const clinic = {
    name: data.clinicName || DEFAULT_CLINIC.name,
    email: data.clinicEmail || DEFAULT_CLINIC.email,
    address: location?.address || data.clinicAddress || DEFAULT_CLINIC.address
  }

  // Timestamps
  const now = new Date()
  const dtstamp = formatICSDateTime(now)
  const dtstart = formatICSDateTime(appointment.startTime)
  const dtend = formatICSDateTime(appointment.endTime)
  const created = formatICSDateTime(appointment.createdAt)
  const lastModified = formatICSDateTime(appointment.updatedAt)

  // Event details
  const uid = generateUID(appointment.id)
  const summary = sanitizeICSText(`${appointment.serviceName} with ${practitioner.name}`)
  const description = sanitizeICSText(buildDescription(data))
  const locationText = sanitizeICSText(`${clinic.address}`)

  // Build ICS lines
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Medical Spa//Appointment System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${locationText}`,
    `ORGANIZER;CN=${sanitizeICSText(clinic.name)}:mailto:${clinic.email}`,
  ]

  // Add attendee if patient has email
  if (appointment.email) {
    lines.push(`ATTENDEE;CN=${sanitizeICSText(appointment.patientName)};RSVP=TRUE:mailto:${appointment.email}`)
  }

  // Add status and transparency
  lines.push(
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    `CREATED:${created}`,
    `LAST-MODIFIED:${lastModified}`,
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  )

  // Apply line folding and join with CRLF
  return lines.map(foldLine).join('\r\n')
}

/**
 * Generates Google Calendar deep link URL
 *
 * @param data - Appointment data
 * @returns Google Calendar URL for adding event
 */
export function generateGoogleCalendarLink(data: ICSAppointmentData): string {
  const { appointment, practitioner, location } = data
  const clinic = {
    address: location?.address || data.clinicAddress || DEFAULT_CLINIC.address
  }

  // Google Calendar uses a specific date format: YYYYMMDDTHHMMSSZ (same as ICS but no separators)
  const startDate = formatICSDateTime(appointment.startTime)
  const endDate = formatICSDateTime(appointment.endTime)

  const title = `${appointment.serviceName} with ${practitioner.name}`
  const description = buildDescription(data)
  const locationStr = clinic.address

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDate}/${endDate}`,
    details: description,
    location: locationStr,
    trp: 'false' // Don't show as busy (optional)
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generates Outlook/Office 365 deep link URL
 *
 * @param data - Appointment data
 * @returns Outlook Calendar URL for adding event
 */
export function generateOutlookCalendarLink(data: ICSAppointmentData): string {
  const { appointment, practitioner, location } = data
  const clinic = {
    address: location?.address || data.clinicAddress || DEFAULT_CLINIC.address
  }

  // Outlook uses ISO 8601 format
  const startDate = appointment.startTime.toISOString()
  const endDate = appointment.endTime.toISOString()

  const title = `${appointment.serviceName} with ${practitioner.name}`
  const description = buildDescription(data)
  const locationStr = clinic.address

  const params = new URLSearchParams({
    subject: title,
    startdt: startDate,
    enddt: endDate,
    body: description,
    location: locationStr
  })

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Generates Yahoo Calendar deep link URL
 *
 * @param data - Appointment data
 * @returns Yahoo Calendar URL for adding event
 */
export function generateYahooCalendarLink(data: ICSAppointmentData): string {
  const { appointment, practitioner, location } = data
  const clinic = {
    address: location?.address || data.clinicAddress || DEFAULT_CLINIC.address
  }

  // Yahoo uses a specific format: YYYYMMDDTHHMMSS (no Z, assumes local)
  const formatYahooDate = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  }

  const startDate = formatYahooDate(appointment.startTime)
  const endDate = formatYahooDate(appointment.endTime)

  const title = `${appointment.serviceName} with ${practitioner.name}`
  const description = buildDescription(data)
  const locationStr = clinic.address

  const params = new URLSearchParams({
    v: '60',
    title: title,
    st: startDate,
    et: endDate,
    desc: description,
    in_loc: locationStr
  })

  return `https://calendar.yahoo.com/?${params.toString()}`
}

export default generateICS
