import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Clock, Lock, Calendar, Zap, CheckCircle2, AlertCircle } from 'lucide-react'

export default function TimeBlocksPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Lock className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Time Blocks & Breaks</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Reserve time on your schedule that shouldn't be booked with patient appointments.
        Perfect for lunch, meetings, training, and personal time.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Time Blocks and Breaks Tutorial"
        duration="4 min"
        description="Learn how to create and manage time blocks, breaks, and recurring blocks"
      />

      <h2 id="overview">What are Time Blocks?</h2>
      <p>
        Time blocks are reserved periods on your calendar that are protected from appointment bookings.
        Unlike appointments with patients, time blocks are for internal use and prevent double-booking of your team's time.
      </p>

      <h3 id="common-uses">Common Uses for Time Blocks</h3>
      <ul>
        <li><strong>Lunch breaks</strong> - Daily or recurring lunch time when no appointments are scheduled</li>
        <li><strong>Staff meetings</strong> - Weekly team meetings or one-on-one check-ins</li>
        <li><strong>Procedure prep time</strong> - Time needed to prepare instruments or supplies for complex procedures</li>
        <li><strong>Admin time</strong> - Charting, emails, returning patient calls</li>
        <li><strong>Training</strong> - New procedure training, staff development sessions</li>
        <li><strong>Vacations</strong> - Multi-day or weekly blocks for time off</li>
        <li><strong>Personal appointments</strong> - Doctor visits, dentist, personal errands</li>
        <li><strong>Inventory management</strong> - Time dedicated to inventory counts or restocking</li>
      </ul>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Daily Recurring</h3>
          </div>
          <p className="text-sm text-gray-500">Set once, repeats every weekday (or custom days). Perfect for lunch or daily admin time.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">One-Time Blocks</h3>
          </div>
          <p className="text-sm text-gray-500">Single occurrence for special situations like personal appointments or one-off meetings.</p>
        </div>
      </div>

      <h2 id="creating-blocks">Creating Time Blocks</h2>
      <p>
        Create time blocks using the same simple process as appointments:
      </p>

      <StepList steps={[
        {
          title: 'Right-click or use menu',
          description: 'Right-click the calendar to open the quick menu, or click the "New Block" button in the toolbar.'
        },
        {
          title: 'Select block type',
          description: 'Choose from predefined types like Lunch, Meeting, Personal Time, or Training. Or create a custom type.'
        },
        {
          title: 'Set time and date',
          description: 'Choose the date and time range for the block. This is automatically pre-filled if you clicked a specific time slot.'
        },
        {
          title: 'Add description (optional)',
          description: 'Add notes about why this time is blocked, like "Team standup meeting" or "Inventory count".'
        },
        {
          title: 'Set recurrence (optional)',
          description: 'Make it repeat daily, weekly, or on specific days. Set an end date or number of occurrences.'
        },
        {
          title: 'Save',
          description: 'Click Create to add the block to your calendar. It immediately appears and prevents appointments during that time.'
        }
      ]} />

      <Callout type="tip" title="Quick Block Creation">
        The fastest way to create a block is to click and drag on the calendar, just like creating an appointment.
        The new block modal opens pre-filled with your selected time.
      </Callout>

      <h3 id="block-types">Block Types</h3>
      <p>
        Different block types are color-coded for easy visual identification:
      </p>
      <ul>
        <li><strong>Lunch Break</strong> - Typically 12-1 PM (yellow)</li>
        <li><strong>Meeting</strong> - Staff meetings and team time (blue)</li>
        <li><strong>Personal Time</strong> - Personal appointments and errands (gray)</li>
        <li><strong>Training</strong> - Skill development or procedure training (purple)</li>
        <li><strong>Admin Time</strong> - Charting, calls, paperwork (teal)</li>
        <li><strong>Vacation</strong> - Days off or extended time away (red)</li>
        <li><strong>Custom</strong> - Create your own block types for specific needs</li>
      </ul>

      <Callout type="info">
        Color coding makes it easy to scan your calendar and understand why time is blocked at a glance.
        The colors are consistent across all views (day, week, month).
      </Callout>

      <h2 id="recurring-blocks">Recurring Blocks</h2>
      <p>
        For regular, repeating time blocks, set up recurrence to avoid creating them manually each time.
      </p>

      <h3 id="setting-recurrence">Setting Up Recurrence</h3>
      <p>
        When creating or editing a block:
      </p>

      <StepList steps={[
        {
          title: 'Click "Make Recurring"',
          description: 'Toggle the recurring option in the block creation form.'
        },
        {
          title: 'Choose frequency',
          description: 'Select Daily (repeats every day), Weekly (repeats on specific days), or Custom pattern.'
        },
        {
          title: 'Select days',
          description: 'If weekly, choose which days the block repeats (M-F for lunch, or specific days for meetings).'
        },
        {
          title: 'Set end date',
          description: 'Choose when the recurrence ends (specific date, or infinite if it never ends).'
        },
        {
          title: 'Save',
          description: 'The system creates all recurring instances automatically.'
        }
      ]} />

      <h3 id="recurrence-patterns">Recurrence Patterns</h3>
      <p>
        Common recurrence patterns:
      </p>
      <ul>
        <li><strong>Daily (weekdays)</strong> - Lunch 12-1 PM every Monday-Friday</li>
        <li><strong>Weekly</strong> - Monday morning team meeting 9-10 AM every week</li>
        <li><strong>Bi-weekly</strong> - All-hands meeting every other Thursday</li>
        <li><strong>Monthly</strong> - First Friday of each month for inventory</li>
        <li><strong>Custom</strong> - Specific complex patterns (e.g., every Tuesday and Thursday)</li>
      </ul>

      <Callout type="tip" title="Set Once, Forget It">
        Once you set up a recurring lunch block, it automatically appears on your calendar every weekday.
        No need to manually create it each day. The system handles it automatically.
      </Callout>

      <h2 id="editing-blocks">Editing Time Blocks</h2>
      <p>
        Make changes to time blocks the same way you edit appointments:
      </p>

      <h3 id="edit-methods">Editing Methods</h3>

      <StepList steps={[
        {
          title: 'Click the block',
          description: 'Click any time block on the calendar to see its details.'
        },
        {
          title: 'Click Edit',
          description: 'Click the Edit button in the details panel to open the edit form.'
        },
        {
          title: 'Make changes',
          description: 'Update the time, date, description, or recurrence settings.'
        },
        {
          title: 'Save',
          description: 'Click Save to apply changes. For recurring blocks, choose to update this one or all instances.'
        }
      ]} />

      <h3 id="drag-to-reschedule">Drag to Reschedule</h3>
      <p>
        For quick time changes, use drag-and-drop:
      </p>
      <ol>
        <li>Click and hold the time block</li>
        <li>Drag it to the new time or date</li>
        <li>Release to save the change</li>
        <li>If it's a recurring block, choose to update this one or all instances</li>
      </ol>

      <h3 id="editing-recurring">Editing Recurring Blocks</h3>
      <p>
        When you edit a recurring block, you have options:
      </p>
      <ul>
        <li><strong>This instance only</strong> - Change just this one occurrence (e.g., move Friday's lunch to 1-2 PM)</li>
        <li><strong>This and all future</strong> - Change this and all future occurrences</li>
        <li><strong>All instances</strong> - Change every occurrence of this block</li>
      </ul>

      <Callout type="info">
        This flexibility lets you handle exceptions. If you need lunch moved one day, change just that instance.
        If you're changing a recurring meeting time permanently, update all instances at once.
      </Callout>

      <h2 id="deleting-blocks">Deleting Time Blocks</h2>
      <p>
        To remove a time block:
      </p>

      <StepList steps={[
        {
          title: 'Click the block',
          description: 'Click the time block you want to delete.'
        },
        {
          title: 'Click Delete',
          description: 'Click the Delete button in the details panel.'
        },
        {
          title: 'Confirm deletion',
          description: 'A dialog confirms the deletion. For recurring blocks, choose to delete this one or all instances.'
        },
        {
          title: 'Block is removed',
          description: 'The time is now available for appointments again.'
        }
      ]} />

      <Callout type="warning" title="Delete Recurring with Care">
        When deleting a recurring block, be careful to select the right option. Deleting all instances
        of a daily lunch block will remove it from every day. You probably want to keep it recurring.
      </Callout>

      <h2 id="block-colors">Custom Block Colors</h2>
      <p>
        Color-code your blocks for better visual organization:
      </p>

      <p>
        You can:
      </p>
      <ul>
        <li><strong>Use predefined colors</strong> - Each block type has a default color</li>
        <li><strong>Customize block type colors</strong> - Change the color of any block type globally</li>
        <li><strong>One-off colors</strong> - Set a custom color for a single block instance</li>
      </ul>

      <h3 id="color-strategy">Color Coding Strategy</h3>
      <p>
        Example color strategy:
      </p>
      <ul>
        <li><strong>Red</strong> - Vacation or out of office</li>
        <li><strong>Yellow</strong> - Lunch or meal breaks</li>
        <li><strong>Blue</strong> - Meetings and team time</li>
        <li><strong>Purple</strong> - Training and development</li>
        <li><strong>Gray</strong> - Personal time</li>
      </ul>

      <Callout type="tip" title="Consistent Colors">
        Use consistent colors across your team. If everyone's lunch is yellow and everyone's meetings
        are blue, it's easier to understand the schedule at a glance.
      </Callout>

      <h2 id="blocking-conflicts">Preventing Double-Booking</h2>
      <p>
        Time blocks automatically prevent appointments from being scheduled during blocked time:
      </p>

      <h3 id="conflict-behavior">How Conflicts Work</h3>
      <p>
        When someone tries to book an appointment during a time block:
      </p>
      <ol>
        <li>The system detects the time conflict</li>
        <li>A warning message appears</li>
        <li>The user must choose a different time or override the block</li>
        <li>If overridden, both the appointment and block appear on the schedule with a warning badge</li>
      </ol>

      <Callout type="warning" title="Override with Caution">
        Overriding a time block should be rare. It defeats the purpose of protecting that time.
        Only override in emergency situations.
      </Callout>

      <h2 id="blocks-by-provider">Provider-Specific Blocks</h2>
      <p>
        Time blocks can be specific to one provider or apply to your entire team:
      </p>

      <ul>
        <li><strong>Personal blocks</strong> - Your lunch, your meeting, your personal time</li>
        <li><strong>Provider-specific</strong> - Dr. Smith's vacation while other staff work</li>
        <li><strong>Team-wide blocks</strong> - Company-wide meetings when everyone is unavailable</li>
      </ul>

      <p>
        When creating a block, select which provider(s) it applies to.
      </p>

      <h2 id="multi-day-blocks">Multi-Day Blocks</h2>
      <p>
        For vacation or extended time off, create blocks that span multiple days:
      </p>

      <p>
        To create a multi-day block:
      </p>
      <ol>
        <li>Click the "New Block" button</li>
        <li>Select the start date and time</li>
        <li>Select the end date and time (can be days later)</li>
        <li>The block spans all selected dates</li>
        <li>In month view, the block shows as a bar across multiple days</li>
      </ol>

      <Callout type="tip" title="Mark Your Vacation">
        Use a "Vacation" type multi-day block to clearly mark when you're out of the office.
        This prevents any appointments from being booked during your time away.
      </Callout>

      <h2 id="team-blocks">Team & Meeting Blocks</h2>
      <p>
        Create blocks that apply to multiple team members:
      </p>

      <p>
        For team-wide events:
      </p>
      <ol>
        <li>Create a block and set it to "Team Meeting" or similar type</li>
        <li>Select all providers who should be blocked during this time</li>
        <li>Save the block</li>
        <li>All selected team members now have this time blocked and unavailable for appointments</li>
      </ol>

      <Callout type="info">
        Team blocks are useful for company meetings, training sessions, or facility maintenance
        when the entire practice needs to be closed.
      </Callout>

      <h2 id="best-practices">Best Practices</h2>

      <Callout type="tip" title="Block Lunch Time">
        Always block out your lunch or meal break. Eating away from the schedule reduces stress
        and ensures you have proper break time during the day.
      </Callout>

      <Callout type="tip" title="Admin Time Matters">
        Schedule regular admin time for charting, patient calls, and administrative tasks.
        This improves documentation quality and patient communication.
      </Callout>

      <Callout type="tip" title="Use Meaningful Descriptions">
        Add descriptive notes to blocks so other staff understand why time is blocked.
        "Team standup" is more informative than just "Meeting".
      </Callout>

      <Callout type="tip" title="Review Recurring Blocks Quarterly">
        Review your recurring blocks quarterly to ensure they still make sense. Remove blocks
        that are no longer needed or adjust those that have changed.
      </Callout>

      <Callout type="info">
        Time blocks are visible to the entire team when they view the schedule. This helps everyone
        understand everyone else's availability at a glance.
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
        <Link href="/features/calendar/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Appointments</h3>
          <p className="text-sm text-gray-500">Creating and managing appointments</p>
        </Link>
        <Link href="/features/calendar/waitlist" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Waitlist</h3>
          <p className="text-sm text-gray-500">Managing the waitlist</p>
        </Link>
      </div>
    </div>
  )
}
