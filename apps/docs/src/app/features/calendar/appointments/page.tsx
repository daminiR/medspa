import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Clock, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Users } from 'lucide-react'

export default function AppointmentsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Clock className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Managing Appointments</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Create, edit, and manage patient appointments with flexibility. Support drag-and-drop rescheduling,
        custom durations, service-driven timing, and group bookings.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Appointment Management Tutorial"
        duration="8 min"
        description="Learn how to create, edit, and manage patient appointments efficiently"
      />

      <h2 id="creating-appointments">Creating Appointments</h2>
      <p>
        There are multiple ways to create new appointments in the calendar. Choose the method that works best for your workflow.
      </p>

      <h3 id="quick-create">Quick Create Methods</h3>
      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Click Time Slot</h3>
          </div>
          <p className="text-sm text-gray-500">Click any empty space on the calendar to open the new appointment form pre-filled with that date and time.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Drag to Create</h3>
          </div>
          <p className="text-sm text-gray-500">Click and drag from the start time to the end time to create an appointment with that exact duration instantly.</p>
        </div>
      </div>

      <StepList steps={[
        {
          title: 'Click a time slot',
          description: 'Click any empty space on the calendar. The new appointment modal opens with that date and time pre-filled.'
        },
        {
          title: 'Select patient',
          description: 'Search for an existing patient or create a new one. The search supports phone, email, or name.'
        },
        {
          title: 'Choose service',
          description: 'Select the service/procedure. The duration automatically fills based on the service duration settings.'
        },
        {
          title: 'Set time & duration',
          description: 'Adjust the time or duration if needed. The system checks for conflicts and shows availability warnings.'
        },
        {
          title: 'Add notes (optional)',
          description: 'Add any special instructions, allergies, or information about the appointment.'
        },
        {
          title: 'Confirm',
          description: 'Click Save to create the appointment. The calendar updates instantly.'
        }
      ]} />

      <h3 id="drag-to-create">Drag-to-Create Feature</h3>
      <p>
        For quick scheduling, use the drag-to-create feature in day or week view:
      </p>
      <ol>
        <li>Click and hold at the start time of the desired appointment</li>
        <li>Drag down to the end time</li>
        <li>Release to create the appointment</li>
        <li>A quick modal opens asking for patient name and service selection</li>
      </ol>

      <Callout type="tip" title="Fastest Method for Known Services">
        Drag-to-create is the fastest way to book appointments when you already know the duration.
        It creates the appointment and opens the modal, letting you fill in the patient and service details quickly.
      </Callout>

      <h3 id="service-driven-duration">Service-Driven Duration</h3>
      <p>
        When you select a service, the appointment duration automatically fills based on your service settings.
        This ensures:
      </p>
      <ul>
        <li><strong>Consistency</strong> - Same service always takes the same amount of time</li>
        <li><strong>No conflicts</strong> - System automatically prevents over-booking</li>
        <li><strong>Faster booking</strong> - You don't have to manually set duration every time</li>
      </ul>

      <Callout type="info">
        Service durations can be customized in your service settings. You can set different durations for different providers
        or adjust for combo treatments that take longer.
      </Callout>

      <h3 id="custom-duration">Custom Durations</h3>
      <p>
        Sometimes you need to override the default service duration:
      </p>
      <ul>
        <li><strong>First-time patient</strong> - Add 15 minutes for intake forms</li>
        <li><strong>Complex procedure</strong> - Extend time for consultation or additional services</li>
        <li><strong>Back-to-back services</strong> - Combine multiple services into one appointment</li>
      </ul>

      <p>
        To use a custom duration:
      </p>
      <ol>
        <li>Select the service (which sets the default duration)</li>
        <li>Click the duration field to edit it</li>
        <li>Manually set the correct duration</li>
        <li>The system rechecks for conflicts with the new duration</li>
      </ol>

      <h2 id="editing-appointments">Editing Appointments</h2>
      <p>
        Once an appointment is created, you can easily modify it using several methods.
      </p>

      <h3 id="edit-methods">Editing Methods</h3>

      <StepList steps={[
        {
          title: 'Click to edit',
          description: 'Click any appointment on the calendar to open the details panel with all information.'
        },
        {
          title: 'Drag to reschedule',
          description: 'Click and drag an appointment to a new time slot. Changes apply instantly if no conflicts exist.'
        },
        {
          title: 'Quick edit',
          description: 'Click the appointment to see a quick-edit view where you can change status, notes, or provider.'
        },
        {
          title: 'Full edit',
          description: 'Click Edit in the details panel to open the full appointment form with all fields editable.'
        }
      ]} />

      <h3 id="reschedule">Rescheduling Appointments</h3>
      <p>
        Rescheduling is one of the most common appointment management tasks:
      </p>

      <Callout type="tip" title="Drag is Fastest">
        For simple time changes, drag-and-drop is the fastest method. Just click and drag the appointment
        to the new time. The system checks for conflicts automatically.
      </Callout>

      <h3 id="change-provider">Changing Provider</h3>
      <p>
        You can reassign an appointment to a different provider:
      </p>
      <ol>
        <li>Click the appointment to open details</li>
        <li>Click Edit</li>
        <li>Change the provider from the dropdown</li>
        <li>The system checks if the new provider has availability at that time</li>
        <li>Save to apply the change</li>
      </ol>

      <Callout type="info">
        When changing providers, the system confirms that the new provider is available. If there's a conflict,
        you'll be alerted and can choose a different time or provider.
      </Callout>

      <h3 id="modify-service">Modifying Service</h3>
      <p>
        Change what service is being performed:
      </p>
      <ol>
        <li>Open the appointment</li>
        <li>Click Edit</li>
        <li>Select a different service from the dropdown</li>
        <li>The duration updates to match the new service</li>
        <li>The system checks for conflicts with the new duration</li>
      </ol>

      <h3 id="appointment-status">Appointment Status</h3>
      <p>
        Manage appointment status through the lifecycle:
      </p>
      <ul>
        <li><strong>Scheduled</strong> - Default status when appointment is created</li>
        <li><strong>Confirmed</strong> - Patient has confirmed via SMS or phone</li>
        <li><strong>Checked In</strong> - Patient has arrived at the practice</li>
        <li><strong>In Progress</strong> - Treatment is currently being performed</li>
        <li><strong>Completed</strong> - Treatment finished, ready for checkout</li>
        <li><strong>Cancelled</strong> - Appointment was cancelled by patient or staff</li>
        <li><strong>No-show</strong> - Patient didn't show up for scheduled appointment</li>
      </ul>

      <Callout type="tip">
        Updating status to Checked In automatically opens the waiting room interface. Status updates
        are visible to patients via SMS if configured.
      </Callout>

      <h3 id="add-notes">Adding Appointment Notes</h3>
      <p>
        Notes are essential for capturing important appointment details:
      </p>
      <ul>
        <li><strong>Pre-appointment notes</strong> - Allergies, medical history, patient preferences</li>
        <li><strong>During-appointment notes</strong> - What services were performed, reactions, adjustments</li>
        <li><strong>Post-appointment notes</strong> - Aftercare instructions, next steps, follow-up needed</li>
      </ul>

      <p>
        To add notes:
      </p>
      <ol>
        <li>Click the appointment to open details</li>
        <li>Click in the Notes field</li>
        <li>Type any relevant information</li>
        <li>Changes save automatically as you type</li>
      </ol>

      <h2 id="cancelling-appointments">Cancelling Appointments</h2>
      <p>
        When a patient cancels or needs to be removed from the schedule:
      </p>

      <StepList steps={[
        {
          title: 'Open the appointment',
          description: 'Click the appointment to open the details panel.'
        },
        {
          title: 'Click Cancel',
          description: 'Click the Cancel button to mark the appointment as cancelled.'
        },
        {
          title: 'Confirm cancellation',
          description: 'A dialog asks if you want to notify the patient via SMS about the cancellation.'
        },
        {
          title: 'Notify if needed',
          description: 'Choose to send a cancellation message to the patient with a link to reschedule.'
        }
      ]} />

      <Callout type="tip" title="Auto-Fill from Waitlist">
        When you cancel an appointment, the system checks if there are any waitlist patients available
        for that time slot. You can instantly offer the slot to a waiting patient with one click.
      </Callout>

      <h3 id="delete-vs-cancel">Delete vs. Cancel</h3>
      <p>
        There's a difference between canceling and deleting appointments:
      </p>
      <ul>
        <li><strong>Cancel</strong> - Marks appointment as cancelled but keeps the record for history and reporting</li>
        <li><strong>Delete</strong> - Completely removes the appointment. Use only for mistakes or test bookings</li>
      </ul>

      <Callout type="info">
        For compliance and reporting purposes, use Cancel instead of Delete. Cancelled appointments
        still appear in reports but don't affect the schedule.
      </Callout>

      <h2 id="group-appointments">Group Appointments</h2>
      <p>
        Create appointments for multiple patients at the same time with one booking:
      </p>

      <StepList steps={[
        {
          title: 'Select group booking',
          description: 'When creating an appointment, toggle "Group Booking" if booking multiple patients.'
        },
        {
          title: 'Add patients',
          description: 'Search for and add each patient who will be in the group appointment.'
        },
        {
          title: 'Set common details',
          description: 'Choose the service, time, and provider - same for all patients in the group.'
        },
        {
          title: 'Confirm',
          description: 'Save to create individual appointments for each patient at the same time with one action.'
        }
      ]} />

      <Callout type="tip" title="Group Parties and Events">
        Group appointments are perfect for bridal parties, friend groups, or team events. All patients
        get their own appointment in the schedule, but booked together for convenience.
      </Callout>

      <h2 id="conflict-detection">Conflict Detection</h2>
      <p>
        The system automatically detects scheduling conflicts:
      </p>

      <h3 id="types-of-conflicts">Types of Conflicts</h3>
      <ul>
        <li><strong>Provider double-booking</strong> - Same provider has two appointments at overlapping times</li>
        <li><strong>Room conflicts</strong> - If you track room assignments, conflicts show when a room is double-booked</li>
        <li><strong>Overlapping time blocks</strong> - Trying to book during lunch or meeting time</li>
        <li><strong>Equipment conflicts</strong> - Same equipment needed for multiple appointments</li>
      </ul>

      <p>
        When a conflict is detected:
      </p>
      <ol>
        <li>The system shows a warning banner with details of the conflict</li>
        <li>You can choose to override (if permitted by permissions) or select a different time</li>
        <li>If you override, both appointments remain on the schedule with a warning badge</li>
      </ol>

      <Callout type="warning" title="Watch for Conflicts">
        Always pay attention to conflict warnings. Over-booking damages patient experience and can lead to missed appointments.
        The system helps prevent this automatically.
      </Callout>

      <h2 id="bulk-operations">Bulk Operations</h2>
      <p>
        For large scheduling changes, use bulk operations:
      </p>

      <ul>
        <li><strong>Select multiple appointments</strong> - Click the checkbox on multiple appointments to select them</li>
        <li><strong>Change status</strong> - Update status for all selected appointments at once</li>
        <li><strong>Send message</strong> - Send a bulk SMS to all selected patients</li>
        <li><strong>Reschedule</strong> - Move all selected appointments to a new provider or time range</li>
        <li><strong>Export</strong> - Export selected appointments to CSV or PDF</li>
      </ul>

      <Callout type="tip" title="Saving Time">
        Use bulk operations when you need to make the same change to multiple appointments, like
        confirming a batch of bookings or changing a provider's status for all their appointments.
      </Callout>

      <h2 id="appointment-templates">Appointment Templates</h2>
      <p>
        For frequently booked service combinations, create appointment templates:
      </p>

      <p>
        Templates let you save:
      </p>
      <ul>
        <li>Common service combinations</li>
        <li>Default durations</li>
        <li>Pre-appointment notes or reminders</li>
        <li>Follow-up instructions</li>
      </ul>

      <p>
        Use a template by selecting it when creating an appointment. It pre-fills all the standard information,
        saving you time on repetitive bookings.
      </p>

      <h2 id="best-practices">Best Practices</h2>

      <Callout type="tip" title="Use Service Durations">
        Always use the service-driven duration feature. This prevents double-booking and ensures consistent
        timing across your practice.
      </Callout>

      <Callout type="tip" title="Keep Notes Updated">
        Add notes immediately after appointments. This is critical for continuity of care and helps other staff
        understand patient preferences and history.
      </Callout>

      <Callout type="tip" title="Confirm Before Reschedule">
        When rescheduling, always notify the patient before moving their appointment. Send an SMS with
        the new time and ask them to confirm.
      </Callout>

      <Callout type="info">
        The appointment system integrates with messaging, billing, and charting. Changes in appointments
        automatically flow to these systems.
      </Callout>

      <h2 id="related">Related Topics</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar Overview</h3>
          <p className="text-sm text-gray-500">Learn about all calendar features</p>
        </Link>
        <Link href="/features/calendar/views" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar Views</h3>
          <p className="text-sm text-gray-500">Day, week, and month view documentation</p>
        </Link>
        <Link href="/features/calendar/blocks" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Time Blocks</h3>
          <p className="text-sm text-gray-500">Managing breaks and blocked time</p>
        </Link>
        <Link href="/features/group-booking" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Group Booking</h3>
          <p className="text-sm text-gray-500">Detailed group booking guide</p>
        </Link>
      </div>
    </div>
  )
}
