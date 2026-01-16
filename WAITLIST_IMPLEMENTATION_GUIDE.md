# Waitlist Management: Technical Implementation Guide

Based on research and analysis of the existing codebase, this guide provides specific, actionable implementation patterns for handling edge cases in the medical spa waitlist system.

---

## 1. Slot Locking Pattern (Race Condition Prevention)

### Problem
Multiple patients click "Accept" simultaneously for the same slot. Current system has no protection against this.

### Solution Architecture

```typescript
// Database schema additions
interface WaitlistOffer {
  id: string
  appointment_id: string
  patient_id: string
  service_id: string
  created_at: timestamp
  window_expires_at: timestamp
  accepted_at?: timestamp
  accepted_by_patient_id?: string
  locked_until?: timestamp
  status: 'pending' | 'accepted' | 'expired' | 'withdrawn'
}

// When patient attempts to accept
async function acceptWaitlistOffer(offerId: string, patientId: string) {
  const db = getDatabase()
  
  // Start transaction
  const transaction = db.transaction()
  
  try {
    // 1. Check if offer still valid
    const offer = await transaction.query(
      'SELECT * FROM waitlist_offers WHERE id = ? FOR UPDATE',
      [offerId]
    )
    
    if (!offer) throw new OfferNotFoundError()
    if (offer.status !== 'pending') throw new OfferAlreadyAcceptedError()
    if (new Date() > offer.window_expires_at) throw new OfferExpiredError()
    
    // 2. Lock the slot for 90 seconds
    const appointment = await transaction.query(
      'SELECT * FROM appointments WHERE id = ? FOR UPDATE',
      [offer.appointment_id]
    )
    
    if (appointment.status !== 'available') {
      throw new SlotAlreadyBookedError()
    }
    
    // 3. Mark offer as accepted (atomic operation)
    await transaction.update('waitlist_offers', 
      { 
        status: 'accepted',
        accepted_at: new Date(),
        accepted_by_patient_id: patientId,
        locked_until: new Date(Date.now() + 90000) // 90 second lock
      },
      { id: offerId }
    )
    
    // 4. Create appointment booking
    const booking = await transaction.insert('appointments', {
      patient_id: patientId,
      service_id: offer.service_id,
      start_time: offer.appointment_id,
      status: 'confirmed',
      source: 'waitlist',
      booked_at: new Date()
    })
    
    // 5. Update all other offers for this appointment to withdrawn
    await transaction.update('waitlist_offers',
      { status: 'withdrawn', withdrawn_reason: 'slot_filled' },
      { appointment_id: offer.appointment_id, id: { '!=': offerId } }
    )
    
    // Commit transaction
    await transaction.commit()
    
    return { success: true, bookingId: booking.id, offerId }
    
  } catch (error) {
    await transaction.rollback()
    
    // Return specific error that tells patient what happened
    if (error instanceof SlotAlreadyBookedError) {
      return {
        success: false,
        error: 'slot_filled',
        message: 'This slot just filled. Finding alternatives...',
        alternatives: await findAlternativeSlots(offer)
      }
    }
    
    throw error
  }
}
```

### Race Condition Timing

```
Timeline:
T0: System sends offer to Patient A, Patient B, Patient C
    - window_expires_at = T0 + 30 minutes

T15: Patient A clicks "Accept"
    - Database lock acquired on appointment
    - Offer marked as accepted
    - Appointment status set to confirmed
    - Other offers marked as "withdrawn"

T16: Patient B clicks "Accept"
    - Database check: appointment status = confirmed (not available)
    - Returns error: "Slot filled"
    - System finds alternatives
    - Presents to Patient B

T17: Patient C still loading page
    - Receives push notification: "Slot taken, here are alternatives"
```

---

## 2. Graceful Degradation: Offer Alternatives Pattern

### Problem
When slot fills, patient sees error. We need to immediately offer similar alternatives.

### Solution

```typescript
interface AlternativeSlot {
  appointmentId: string
  startTime: Date
  endTime: Date
  practitionerId: string
  practitionerName: string
  matchScore: number
  matchReasons: string[]
  serviceId: string
}

async function findAlternativeSlots(
  originalOffer: WaitlistOffer,
  patientId: string,
  limit: number = 3
): Promise<AlternativeSlot[]> {
  
  // Get patient preferences from waitlist record
  const patient = await db.query(
    'SELECT * FROM waitlist_entries WHERE id = ?',
    [patientId]
  )
  
  // Get original appointment details
  const originalAppointment = await db.query(
    'SELECT * FROM appointments WHERE id = ?',
    [originalOffer.appointment_id]
  )
  
  // Find available slots matching criteria
  const availableSlots = await db.query(`
    SELECT a.*, p.name as practitioner_name
    FROM appointments a
    JOIN practitioners p ON a.practitioner_id = p.id
    WHERE a.status = 'available'
    AND a.service_id = ?
    AND a.start_time > NOW()
    AND a.start_time <= NOW() + INTERVAL '48 hours'
    ORDER BY a.start_time ASC
    LIMIT 10
  `, [originalAppointment.service_id])
  
  // Score each alternative
  const scoredSlots: AlternativeSlot[] = availableSlots
    .map(slot => ({
      appointmentId: slot.id,
      startTime: slot.start_time,
      endTime: slot.end_time,
      practitionerId: slot.practitioner_id,
      practitionerName: slot.practitioner_name,
      matchScore: scoreAlternativeSlot(slot, patient, originalAppointment),
      matchReasons: getMatchReasons(slot, patient, originalAppointment),
      serviceId: slot.service_id
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
  
  return scoredSlots
}

function scoreAlternativeSlot(
  slot: any,
  patient: any,
  originalAppointment: any
): number {
  let score = 100 // Base score
  
  // Same practitioner: +30
  if (slot.practitioner_id === originalAppointment.practitioner_id) {
    score += 30
  } else if (slot.practitioner_id === patient.preferred_practitioner_id) {
    score += 20
  }
  
  // Time proximity: -points per hour away
  const originalTime = moment(originalAppointment.start_time)
  const slotTime = moment(slot.start_time)
  const hoursDiff = Math.abs(slotTime.diff(originalTime, 'hours'))
  score -= Math.min(hoursDiff * 5, 30)
  
  // Same day: +25
  if (slotTime.isSame(originalTime, 'day')) {
    score += 25
  }
  
  // Within patient availability: +15
  if (patient.availability_start && patient.availability_end) {
    const slotHour = slotTime.hour()
    const availStart = moment(patient.availability_start).hour()
    const availEnd = moment(patient.availability_end).hour()
    
    if (slotHour >= availStart && slotHour < availEnd) {
      score += 15
    }
  }
  
  // Preferred time: +10
  if (patient.preferred_time && slotTime.isSame(patient.preferred_time, 'hour')) {
    score += 10
  }
  
  return Math.max(0, score)
}

// API response to failed slot acceptance
async function handleSlotFilled(
  offerId: string,
  patientId: string,
  patientPhone: string
) {
  const offer = await db.query('SELECT * FROM waitlist_offers WHERE id = ?', [offerId])
  
  const alternatives = await findAlternativeSlots(offer, patientId)
  
  if (alternatives.length === 0) {
    // No alternatives available
    return {
      success: false,
      error: 'slot_filled_no_alternatives',
      message: 'Unfortunately, that slot was claimed. No similar slots available right now.',
      action: 'return_to_waitlist',
      waitlistStatus: 'You remain on the waitlist. We\'ll notify you when similar slots open.'
    }
  }
  
  // Send SMS with top alternative
  const topAlternative = alternatives[0]
  await sendSMS(patientPhone, {
    body: `That slot filled! We found: ${topAlternative.practitionerName} on ${moment(topAlternative.startTime).format('MMM Do')} at ${moment(topAlternative.startTime).format('h:mm A')}. [BOOK] or [WAITLIST]`,
    actionButtons: {
      BOOK: { appointmentId: topAlternative.appointmentId },
      WAITLIST: { action: 'return' }
    }
  })
  
  return {
    success: false,
    error: 'slot_filled',
    message: 'This slot filled but we found alternatives',
    alternatives: alternatives.map(a => ({
      appointmentId: a.appointmentId,
      time: a.startTime,
      practitioner: a.practitionerName,
      score: a.matchScore,
      reasons: a.matchReasons
    }))
  }
}
```

---

## 3. Notification Delivery Failure Handling

### Problem
SMS delivery fails silently. Patient never receives offer but system marks them as notified.

### Solution: Delivery Tracking with Fallback Chain

```typescript
interface NotificationAttempt {
  id: string
  patient_id: string
  phone: string
  email: string
  offer_id: string
  channel: 'sms' | 'email' | 'voice' | 'push'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  sent_at: timestamp
  delivered_at?: timestamp
  failure_reason?: string
  next_attempt_at?: timestamp
  attempt_count: number
  max_attempts: number
}

async function sendWaitlistNotification(
  offer: WaitlistOffer,
  patient: WaitlistPatient
): Promise<void> {
  
  // Validate phone number first
  const { isValid, formatted, country } = validatePhoneNumber(patient.phone)
  
  if (!isValid) {
    console.error(`Invalid phone for patient ${patient.id}: ${patient.phone}`)
    await logError({
      type: 'invalid_phone_number',
      patient_id: patient.id,
      phone: patient.phone,
      offer_id: offer.id
    })
    
    // Skip SMS, go directly to email
    return sendNotificationFallback(offer, patient, 'email')
  }
  
  // Create notification log
  const notification = await db.insert('notification_attempts', {
    patient_id: patient.id,
    phone: formatted,
    email: patient.email,
    offer_id: offer.id,
    channel: 'sms',
    status: 'pending',
    attempt_count: 1,
    max_attempts: 3
  })
  
  try {
    // Send SMS
    const smsResult = await twilio.messages.create({
      body: formatWaitlistSMS(offer, patient),
      to: formatted,
      from: process.env.TWILIO_PHONE_NUMBER,
      // Request delivery receipt
      statusCallback: `${process.env.API_BASE_URL}/webhooks/sms-status`,
      timeout: 30000
    })
    
    // Mark as sent (not yet delivered - delivery comes via webhook)
    await db.update('notification_attempts',
      {
        status: 'sent',
        sent_at: new Date(),
        twilio_message_id: smsResult.sid
      },
      { id: notification.id }
    )
    
    console.log(`SMS sent to patient ${patient.id}: ${smsResult.sid}`)
    
  } catch (error) {
    console.error(`SMS send failed: ${error.message}`)
    
    await db.update('notification_attempts',
      {
        status: 'failed',
        failure_reason: error.message,
        next_attempt_at: new Date(Date.now() + 2 * 60000) // Retry in 2 minutes
      },
      { id: notification.id }
    )
    
    // Immediate fallback to email
    return sendNotificationFallback(offer, patient, 'email')
  }
}

// Webhook handler for SMS delivery status
async function handleSMSStatusWebhook(
  messageSid: string,
  status: 'sent' | 'delivered' | 'failed' | 'bounced' | 'undelivered'
): Promise<void> {
  
  const notification = await db.query(
    'SELECT * FROM notification_attempts WHERE twilio_message_id = ?',
    [messageSid]
  )
  
  if (!notification) return
  
  if (status === 'delivered') {
    // Success!
    await db.update('notification_attempts',
      { status: 'delivered', delivered_at: new Date() },
      { id: notification.id }
    )
  } else if (status === 'failed' || status === 'undelivered') {
    // Mark as failed and initiate fallback
    await db.update('notification_attempts',
      {
        status: 'failed',
        failure_reason: `Twilio delivery failed: ${status}`,
        next_attempt_at: new Date(Date.now() + 2 * 60000)
      },
      { id: notification.id }
    )
    
    // Escalate to fallback after 2 minutes
    scheduleTask({
      type: 'notification_fallback',
      notification_id: notification.id,
      run_at: new Date(Date.now() + 2 * 60000)
    })
  }
}

// Notification fallback chain
async function sendNotificationFallback(
  offer: WaitlistOffer,
  patient: WaitlistPatient,
  fromChannel: 'sms' | 'email' | 'voice'
): Promise<void> {
  
  const fallbackChain = {
    'sms': ['email', 'voice', 'manual'],
    'email': ['voice', 'manual'],
    'voice': ['manual']
  }
  
  const nextChannel = fallbackChain[fromChannel]?.[0]
  
  if (!nextChannel) {
    // All channels exhausted - mark patient as unreachable
    await db.update('waitlist_entries',
      { notification_status: 'unreachable' },
      { patient_id: patient.id }
    )
    return
  }
  
  const notification = await db.insert('notification_attempts', {
    patient_id: patient.id,
    phone: patient.phone,
    email: patient.email,
    offer_id: offer.id,
    channel: nextChannel,
    status: 'pending',
    attempt_count: 1,
    max_attempts: 1,
    fallback_from: fromChannel
  })
  
  if (nextChannel === 'email') {
    try {
      await sendEmail({
        to: patient.email,
        subject: `Appointment Available: ${offer.service_name}`,
        template: 'waitlist_offer_email',
        variables: { patient, offer },
        callbackUrl: `${process.env.API_BASE_URL}/webhooks/email-status`
      })
      
      await db.update('notification_attempts',
        { status: 'sent', sent_at: new Date() },
        { id: notification.id }
      )
    } catch (error) {
      await db.update('notification_attempts',
        { status: 'failed', failure_reason: error.message },
        { id: notification.id }
      )
      // Continue to voice fallback
      return sendNotificationFallback(offer, patient, 'email')
    }
    
  } else if (nextChannel === 'voice') {
    try {
      const call = await twilio.calls.create({
        to: patient.phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        url: `${process.env.API_BASE_URL}/twiml/waitlist-offer?patient_id=${patient.id}&offer_id=${offer.id}`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallback: `${process.env.API_BASE_URL}/webhooks/call-status`,
        timeout: 30
      })
      
      await db.update('notification_attempts',
        { status: 'sent', sent_at: new Date(), twilio_call_id: call.sid },
        { id: notification.id }
      )
    } catch (error) {
      await db.update('notification_attempts',
        { status: 'failed', failure_reason: error.message },
        { id: notification.id }
      )
      // Final fallback: manual outreach
      return sendNotificationFallback(offer, patient, 'voice')
    }
    
  } else if (nextChannel === 'manual') {
    // Queue for staff manual outreach
    await db.insert('manual_outreach_queue', {
      patient_id: patient.id,
      offer_id: offer.id,
      phone: patient.phone,
      email: patient.email,
      priority: 'high',
      created_at: new Date(),
      deadline: new Date(Date.now() + 60 * 60000), // 1 hour to contact
      notes: `SMS failed, email failed, voice failed. Contact patient about ${offer.service_name} appointment.`
    })
    
    // Alert staff
    await sendStaffNotification({
      type: 'manual_outreach_needed',
      offer_id: offer.id,
      patient_id: patient.id,
      urgency: 'high'
    })
  }
}
```

---

## 4. No-Show Tracking Pattern

### Problem
System doesn't track no-shows systematically. No automatic notifications or pattern detection.

### Solution

```typescript
interface AppointmentStatus {
  appointment_id: string
  status: 'booked' | 'confirmed' | 'no_show' | 'cancelled' | 'completed'
  checked_in_at?: timestamp
  started_at?: timestamp
  completed_at?: timestamp
  no_show_reason?: string
  no_show_contacted_at?: timestamp
  is_from_waitlist: boolean
  reminder_sent_at?: timestamp
}

// Scheduled job - run every 5 minutes
async function checkForNoShows(): Promise<void> {
  const now = new Date()
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)
  
  // Find appointments that should have started 5+ minutes ago
  const missedAppointments = await db.query(`
    SELECT a.*, p.phone, p.email, p.name as patient_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.start_time < ?
    AND a.status = 'confirmed'
    AND a.checked_in_at IS NULL
    ORDER BY a.start_time ASC
  `, [fiveMinutesAgo])
  
  for (const appointment of missedAppointments) {
    await handleNoShow(appointment)
  }
}

async function handleNoShow(appointment: any): Promise<void> {
  
  // Mark as no-show
  await db.update('appointments',
    { status: 'no_show', no_show_detected_at: new Date() },
    { id: appointment.id }
  )
  
  // Track no-show history
  const noShowCount = await db.query(`
    SELECT COUNT(*) as count
    FROM appointments
    WHERE patient_id = ?
    AND status = 'no_show'
    AND start_time > NOW() - INTERVAL '6 months'
  `, [appointment.patient_id])
  
  const count = noShowCount[0].count
  
  // Send patient notification
  if (count === 1) {
    // First no-show: apologetic, offer discount
    await sendSMS(appointment.phone, {
      body: `We missed you for your ${appointment.service_name} appointment. We offer 20% off to rebook. [REBOOK] or call us.`
    })
    
    await sendEmail(appointment.email, {
      subject: 'We Missed You - Special Discount Inside',
      template: 'first_no_show',
      variables: {
        patient: appointment.patient_name,
        service: appointment.service_name,
        discount: '20%',
        rescheduleLink: `${process.env.APP_URL}/rebook?appointment_id=${appointment.id}&discount=20`
      }
    })
    
  } else if (count === 2) {
    // Second no-show: require deposit
    await sendSMS(appointment.phone, {
      body: `We've missed you twice. To rebook, we now require a $50 deposit. [DEPOSIT_PAYMENT]`
    })
    
  } else if (count >= 3) {
    // Third+ no-show: prepayment required, possible suspension
    await db.update('patients',
      { prepayment_required: true },
      { id: appointment.patient_id }
    )
    
    await sendSMS(appointment.phone, {
      body: `Due to multiple missed appointments, prepayment is now required to book with us. Please contact us to arrange.`
    })
  }
  
  // Immediately notify next patients on waitlist for same slot
  const waitlistMatches = await findMatchingWaitlistPatients(appointment)
  
  if (waitlistMatches.length > 0) {
    // Offer first 2-3 on waitlist the now-freed-up appointment
    for (let i = 0; i < Math.min(2, waitlistMatches.length); i++) {
      await sendWaitlistNotification(
        {
          ...appointment,
          id: `${appointment.id}_override` // Virtual offer
        },
        waitlistMatches[i]
      )
    }
  }
  
  // Alert staff
  await sendStaffNotification({
    type: 'patient_no_show',
    appointment_id: appointment.id,
    patient_id: appointment.patient_id,
    patient_name: appointment.patient_name,
    no_show_count: count,
    recommended_action: count >= 3 ? 'suspension' : 'outreach'
  })
  
  // Metrics
  await recordMetric({
    type: 'appointment_no_show',
    patient_id: appointment.patient_id,
    practitioner_id: appointment.practitioner_id,
    service_id: appointment.service_id,
    is_from_waitlist: !!appointment.from_waitlist_id,
    no_show_count: count
  })
}
```

---

## 5. Post-Acceptance Cancellation Grace Period

### Problem
Patient books appointment from waitlist then changes mind immediately. No mechanism to handle this gracefully with fees.

### Solution

```typescript
interface CancellationPolicy {
  grace_period_minutes: number // e.g., 15
  grace_period_free: boolean
  fee_after_grace_period: number | string // "$50" or "50%"
  cancellation_notice_hours: number // e.g., 24
  full_charge_if_less_hours: number // e.g., 24
}

const defaultCancellationPolicy: Record<string, CancellationPolicy> = {
  'injectables': {
    grace_period_minutes: 15,
    grace_period_free: true,
    fee_after_grace_period: '50%',
    cancellation_notice_hours: 24,
    full_charge_if_less_hours: 24
  },
  'laser': {
    grace_period_minutes: 10,
    grace_period_free: true,
    fee_after_grace_period: '50%',
    cancellation_notice_hours: 24,
    full_charge_if_less_hours: 24
  },
  'facial': {
    grace_period_minutes: 15,
    grace_period_free: true,
    fee_after_grace_period: '50%',
    cancellation_notice_hours: 12,
    full_charge_if_less_hours: 12
  }
}

async function cancelWaitlistAppointment(
  appointmentId: string,
  patientId: string,
  cancelReason?: string
): Promise<{
  cancelled: boolean
  gracePeriodActive: boolean
  cancellationFee?: number
  requiresConfirmation: boolean
}> {
  
  const appointment = await db.query(
    'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
    [appointmentId, patientId]
  )
  
  if (!appointment) throw new AppointmentNotFoundError()
  if (appointment.status !== 'confirmed') throw new NotCancellableError()
  
  // Check if from waitlist
  const isFromWaitlist = !!appointment.from_waitlist_id
  const bookedAt = moment(appointment.booked_at || appointment.created_at)
  const now = moment()
  const minutesSinceBooking = now.diff(bookedAt, 'minutes')
  
  // Get cancellation policy for this service
  const service = await db.query('SELECT * FROM services WHERE id = ?', [appointment.service_id])
  const policy = defaultCancellationPolicy[service.category] || defaultCancellationPolicy.facial
  
  // Determine if in grace period
  const inGracePeriod = minutesSinceBooking <= policy.grace_period_minutes && isFromWaitlist
  
  if (inGracePeriod) {
    // Free cancellation
    await db.update('appointments',
      {
        status: 'cancelled',
        cancelled_at: new Date(),
        cancelled_reason: cancelReason,
        cancellation_fee: 0,
        grace_period_cancellation: true
      },
      { id: appointmentId }
    )
    
    // Send confirmation
    await sendSMS(appointment.patient_phone, {
      body: `Your ${appointment.service_name} appointment has been cancelled with no charge. You can rejoin the waitlist anytime.`
    })
    
    // Re-add to waitlist
    await db.insert('waitlist_entries', {
      patient_id: patientId,
      service_id: appointment.service_id,
      // ... copy original waitlist preferences
      rejoin_at: new Date()
    })
    
    return { cancelled: true, gracePeriodActive: true }
    
  } else {
    // Calculate fee
    const appointmentTime = moment(appointment.start_time)
    const hoursUntilAppointment = appointmentTime.diff(now, 'hours')
    
    let cancellationFee = 0
    let feeReason = ''
    
    if (hoursUntilAppointment < policy.full_charge_if_less_hours) {
      // Full charge
      cancellationFee = appointment.service_price
      feeReason = `Less than ${policy.full_charge_if_less_hours} hours notice`
    } else if (hoursUntilAppointment < policy.cancellation_notice_hours) {
      // Partial charge
      const percentage = typeof policy.fee_after_grace_period === 'string'
        ? parseInt(policy.fee_after_grace_period)
        : 50
      cancellationFee = appointment.service_price * (percentage / 100)
      feeReason = `${percentage}% cancellation fee`
    }
    
    // Require explicit confirmation of fee
    return {
      cancelled: false,
      gracePeriodActive: false,
      cancellationFee,
      requiresConfirmation: true,
      message: `Cancellation fee: ${feeReason}. 
        $${cancellationFee.toFixed(2)} will be charged.
        [CONFIRM_CANCEL] or [KEEP_APPOINTMENT]`
    }
  }
}

async function confirmCancellationWithFee(
  appointmentId: string,
  patientId: string
): Promise<void> {
  
  const appointment = await db.query(
    'SELECT * FROM appointments WHERE id = ?',
    [appointmentId]
  )
  
  // Calculate fee again to ensure accuracy
  const { cancellationFee } = await calculateCancellationFee(appointment)
  
  // Process payment
  if (cancellationFee > 0) {
    await chargePatient(patientId, cancellationFee, {
      type: 'cancellation_fee',
      appointment_id: appointmentId,
      reference: `Cancellation fee for ${appointment.service_name}`
    })
  }
  
  // Mark as cancelled
  await db.update('appointments',
    {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_fee: cancellationFee
    },
    { id: appointmentId }
  )
  
  // Notify patient
  await sendSMS(appointment.patient_phone, {
    body: `Appointment cancelled. Cancellation fee: $${cancellationFee.toFixed(2)}.`
  })
  
  // Check if patient is frequent canceller
  const recentCancellations = await db.query(`
    SELECT COUNT(*) as count
    FROM appointments
    WHERE patient_id = ?
    AND status = 'cancelled'
    AND cancelled_at > NOW() - INTERVAL '1 month'
  `, [patientId])
  
  if (recentCancellations[0].count >= 2) {
    // Flag patient for review
    await db.insert('patient_flags', {
      patient_id: patientId,
      flag_type: 'frequent_cancellations',
      created_at: new Date(),
      notes: `${recentCancellations[0].count} cancellations in last month`
    })
  }
}
```

---

## 6. Timezone Handling in Notifications

### Problem
Patient in Pacific Time receives appointment time in Eastern Time. Confusion leads to no-shows.

### Solution

```typescript
async function sendWaitlistNotificationWithTimezone(
  offer: WaitlistOffer,
  patient: WaitlistPatient,
  patientTimezone?: string
): Promise<void> {
  
  // Detect or use provided timezone
  const timezone = patientTimezone || (await detectTimezoneFromPhone(patient.phone))
  
  // Store timezone with patient for future use
  await db.update('waitlist_entries',
    { detected_timezone: timezone },
    { patient_id: patient.id }
  )
  
  const appointmentUTC = moment.utc(offer.appointment_time)
  const appointmentPracticeTime = appointmentUTC.clone().tz('America/New_York') // Practice timezone
  const appointmentPatientTime = appointmentUTC.clone().tz(timezone)
  
  // Build SMS message
  const message = `Appointment available!
${offer.service_name} - ${appointmentPatientTime.format('ddd, MMM D')}
${appointmentPatientTime.format('h:mm A')} ${appointmentPatientTime.format('z')}
(${appointmentPracticeTime.format('h:mm A')} ET)

[ACCEPT] [DECLINE]`

  // Send SMS
  await sendSMS(patient.phone, { body: message })
  
  // Send email with more detail
  await sendEmail(patient.email, {
    template: 'waitlist_offer_with_timezone',
    variables: {
      patient,
      service: offer.service_name,
      appointmentPatientTime: appointmentPatientTime.format('dddd, MMMM Do, YYYY h:mm A z'),
      appointmentPracticeTime: appointmentPracticeTime.format('h:mm A z'),
      patientTimezone: appointmentPatientTime.format('z'),
      practiceTimezone: 'ET',
      appointmentUrl: `${process.env.APP_URL}/offers/${offer.id}/accept?tz=${timezone}`,
      addToCalendarUrl: buildCalendarLink({
        title: offer.service_name,
        time: appointmentUTC.format(),
        timezone
      })
    }
  })
}

// For appointment reminders
async function sendAppointmentReminder(
  appointmentId: string,
  hoursInAdvance: number = 24
): Promise<void> {
  
  const appointment = await db.query(
    `SELECT a.*, p.phone, p.email, p.name, we.detected_timezone
     FROM appointments a
     JOIN patients p ON a.patient_id = p.id
     LEFT JOIN waitlist_entries we ON a.patient_id = we.patient_id
     WHERE a.id = ?`,
    [appointmentId]
  )
  
  if (!appointment) return
  
  const timezone = appointment.detected_timezone || 'America/New_York'
  const appointmentUTC = moment.utc(appointment.start_time)
  const appointmentLocal = appointmentUTC.clone().tz(timezone)
  
  // Send in patient's local time (during reasonable hours)
  const localHour = appointmentLocal.hour()
  
  // If appointment is in early morning (before 8am), send reminder at 8am patient time
  // Otherwise, send at configured hours before
  let reminderTime
  if (localHour < 8) {
    reminderTime = appointmentLocal.clone().hour(8).minute(0)
  } else {
    reminderTime = appointmentLocal.clone().subtract(hoursInAdvance, 'hours')
  }
  
  // Queue reminder for correct time
  const now = moment()
  if (reminderTime.isAfter(now)) {
    await scheduleNotification({
      type: 'appointment_reminder',
      appointment_id: appointmentId,
      scheduled_for: reminderTime.toDate(),
      timezone
    })
  }
  
  // Format reminder message in patient's timezone
  const message = `Reminder: ${appointment.service_name}
Tomorrow at ${appointmentLocal.format('h:mm A z')}
[CONFIRM] [RESCHEDULE] [CANCEL]`

  await sendSMS(appointment.phone, { body: message })
}

function buildCalendarLink(config: {
  title: string
  time: string // ISO format
  timezone: string
}): string {
  const params = new URLSearchParams({
    title: config.title,
    dates: moment(config.time).tz(config.timezone).format('YYYYMMDDTHHmmss'),
    tzid: config.timezone
  })
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`
}
```

---

## 7. Implementation Priorities

### Critical (Implement First)
1. **Slot Locking** - Prevents double-booking and race conditions
2. **Graceful Slot Filled** - Offers alternatives instead of error
3. **SMS Delivery Tracking** - Know if messages actually reach patients

### High Priority
4. **No-Show Detection** - Automatic detection and notifications
5. **Cancellation Grace Period** - Reduce patient frustration
6. **Timezone Handling** - Prevent missed appointments from timezone confusion

### Medium Priority
7. **Deduplication** - Remove duplicate waitlist entries when patient books
8. **Holiday/Availability Calendar** - Handle closures and reduced hours
9. **Audit Logging** - Track all state changes for debugging

### Lower Priority (Enhancement)
10. **Manual Outreach Queue** - For unreachable patients
11. **Analytics Dashboard** - Track no-shows, acceptance rates, etc.
12. **Patient Preference Learning** - ML-based offer optimization

---

## 8. Testing Checklist

### Race Condition Testing
- [ ] Multiple simultaneous acceptance attempts
- [ ] Staff booking during pending offers
- [ ] Database lock verification
- [ ] Atomic transaction verification

### Graceful Degradation Testing
- [ ] Slot fills before patient accepts
- [ ] Alternative slots found and offered
- [ ] Alternative slots don't include full slots
- [ ] Scoring algorithm accuracy

### Delivery Failure Testing
- [ ] SMS delivery success tracked
- [ ] SMS delivery failure triggers fallback
- [ ] Email fallback works
- [ ] Voice fallback works
- [ ] Manual outreach queue populated

### No-Show Testing
- [ ] No-show detected 5+ minutes after start
- [ ] Patient notified
- [ ] Second/third no-show penalties applied
- [ ] Waitlist offered freed slot

### Timezone Testing
- [ ] Patient in different timezone sees correct time
- [ ] Reminders send in patient's local time
- [ ] Calendar links include timezone
- [ ] DST transitions handled correctly

---

## References

- Medical Spa Platform: `/Users/daminirijhwani/medical-spa-platform/`
- Waitlist Utils: `/apps/admin/src/utils/waitlistAutoFill.ts`
- Waitlist UI: `/apps/admin/src/components/calendar/WaitlistPanel.tsx`
- Twilio Integration: `/apps/admin/src/lib/twilio.ts`
