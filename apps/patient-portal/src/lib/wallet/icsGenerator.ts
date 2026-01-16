/**
 * ICS Calendar File Generator
 * RFC 5545 Compliant .ics file generator for appointment calendar exports
 *
 * Ported from admin app with patient portal specific modifications
 *
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface ICSEvent {
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  organizer?: {
    name: string;
    email: string;
  };
  attendee?: {
    name: string;
    email: string;
  };
}

export interface AppointmentForCalendar {
  id: string;
  service: string;
  provider: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address?: string;
  patientName?: string;
  patientEmail?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_CLINIC = {
  name: 'Glow Medical Spa',
  phone: '(555) 123-4567',
  email: 'appointments@glowmedspa.com',
  address: '123 Wellness Way, San Francisco, CA 94102',
  mapLink: 'https://maps.google.com/?q=Glow+Medical+Spa',
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Sanitizes text content for ICS format
 * - Escapes special characters: backslash, semicolon, comma
 * - Converts newlines to escaped format
 */
export function sanitizeICSText(text: string): string {
  if (!text) return '';

  return text
    // Escape backslashes first
    .replace(/\\/g, '\\\\')
    // Escape semicolons
    .replace(/;/g, '\\;')
    // Escape commas
    .replace(/,/g, '\\,')
    // Convert newlines to escaped newline (RFC 5545 spec)
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n')
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Folds long lines according to RFC 5545 (max 75 octets per line)
 */
export function foldLine(line: string): string {
  const maxLength = 75;

  if (line.length <= maxLength) {
    return line;
  }

  const result: string[] = [];
  let currentLine = line;

  result.push(currentLine.substring(0, maxLength));
  currentLine = currentLine.substring(maxLength);

  while (currentLine.length > 0) {
    const chunkLength = maxLength - 1;
    result.push(' ' + currentLine.substring(0, chunkLength));
    currentLine = currentLine.substring(chunkLength);
  }

  return result.join('\r\n');
}

/**
 * Formats a Date object to ICS datetime format (UTC)
 * Format: YYYYMMDDTHHMMSSZ
 */
export function formatICSDateTime(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  const utcYear = date.getUTCFullYear();
  const utcMonth = pad(date.getUTCMonth() + 1);
  const utcDay = pad(date.getUTCDate());
  const utcHours = pad(date.getUTCHours());
  const utcMinutes = pad(date.getUTCMinutes());
  const utcSeconds = pad(date.getUTCSeconds());

  return `${utcYear}${utcMonth}${utcDay}T${utcHours}${utcMinutes}${utcSeconds}Z`;
}

/**
 * Generates a unique identifier for the calendar event
 */
export function generateUID(appointmentId: string): string {
  return `${appointmentId}@glowmedspa.com`;
}

/**
 * Parses appointment date and time strings into a Date object
 */
export function parseAppointmentDateTime(dateStr: string, timeStr: string): Date {
  // Parse date like "December 15, 2025"
  const datePart = new Date(dateStr);

  // Parse time like "2:00 PM"
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const isPM = timeMatch[3].toUpperCase() === 'PM';

    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    datePart.setHours(hours, minutes, 0, 0);
  }

  return datePart;
}

/**
 * Parses duration string like "30 minutes" into minutes number
 */
export function parseDuration(durationStr: string): number {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

// ============================================================================
// Main ICS Generation Functions
// ============================================================================

/**
 * Generates RFC 5545 compliant .ics file content for an event
 */
export function generateICS(event: ICSEvent): string {
  const now = new Date();
  const dtstamp = formatICSDateTime(now);
  const dtstart = formatICSDateTime(event.startTime);
  const dtend = formatICSDateTime(event.endTime);
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@glowmedspa.com`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Glow Medical Spa//Patient Portal//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${sanitizeICSText(event.title)}`,
    `DESCRIPTION:${sanitizeICSText(event.description)}`,
    `LOCATION:${sanitizeICSText(event.location)}`,
  ];

  if (event.organizer) {
    lines.push(
      `ORGANIZER;CN=${sanitizeICSText(event.organizer.name)}:mailto:${event.organizer.email}`
    );
  }

  if (event.attendee) {
    lines.push(
      `ATTENDEE;CN=${sanitizeICSText(event.attendee.name)};RSVP=TRUE:mailto:${event.attendee.email}`
    );
  }

  lines.push(
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return lines.map(foldLine).join('\r\n');
}

/**
 * Creates an ICS event from appointment data
 */
export function createEventFromAppointment(appointment: AppointmentForCalendar): ICSEvent {
  const startTime = parseAppointmentDateTime(appointment.date, appointment.time);
  const durationMinutes = parseDuration(appointment.duration);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

  const description = [
    `Your appointment for ${appointment.service} with ${appointment.provider}.`,
    '',
    'Please arrive 10 minutes early.',
    '',
    'Preparation Instructions:',
    '- Avoid blood-thinning medications 24 hours before',
    '- Do not consume alcohol 24 hours before treatment',
    '- Bring your insurance card if applicable',
    '',
    `Contact: ${DEFAULT_CLINIC.phone}`,
    `Email: ${DEFAULT_CLINIC.email}`,
    '',
    'Cancellation Policy:',
    '- Free cancellation up to 24 hours before appointment',
    '- $50 fee if less than 24 hours notice',
  ].join('\n');

  return {
    title: `${appointment.service} - ${DEFAULT_CLINIC.name}`,
    description,
    location: appointment.address || `${appointment.location}, ${DEFAULT_CLINIC.address}`,
    startTime,
    endTime,
    organizer: {
      name: DEFAULT_CLINIC.name,
      email: DEFAULT_CLINIC.email,
    },
    attendee: appointment.patientEmail
      ? {
          name: appointment.patientName || 'Patient',
          email: appointment.patientEmail,
        }
      : undefined,
  };
}

/**
 * Downloads an ICS file for the given event
 */
export function downloadICS(event: ICSEvent, filename: string): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Downloads an ICS file from appointment data
 */
export function downloadAppointmentICS(appointment: AppointmentForCalendar): void {
  const event = createEventFromAppointment(appointment);
  downloadICS(event, `appointment-${appointment.id}`);
}

// ============================================================================
// Calendar Deep Link Generators
// ============================================================================

/**
 * Generates Google Calendar deep link URL
 */
export function getGoogleCalendarUrl(event: ICSEvent): string {
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`,
    details: event.description,
    location: event.location,
    trp: 'false',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates Outlook.com/Office 365 deep link URL
 */
export function getOutlookUrl(event: ICSEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
    body: event.description,
    location: event.location,
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates Office 365 deep link URL
 */
export function getOffice365Url(event: ICSEvent): string {
  const params = new URLSearchParams({
    subject: event.title,
    startdt: event.startTime.toISOString(),
    enddt: event.endTime.toISOString(),
    body: event.description,
    location: event.location,
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates Yahoo Calendar deep link URL
 */
export function getYahooCalendarUrl(event: ICSEvent): string {
  const formatYahooDate = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  };

  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    st: formatYahooDate(event.startTime),
    et: formatYahooDate(event.endTime),
    desc: event.description,
    in_loc: event.location,
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

// ============================================================================
// Default Export
// ============================================================================

const calendarService = {
  generateICS,
  downloadICS,
  downloadAppointmentICS,
  createEventFromAppointment,
  getGoogleCalendarUrl,
  getOutlookUrl,
  getOffice365Url,
  getYahooCalendarUrl,
};

export default calendarService;
