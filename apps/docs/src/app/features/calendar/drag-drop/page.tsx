import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Move, CheckCircle2, Calendar, Clock, AlertCircle } from 'lucide-react'

export default function DragDropPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Move className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Drag &amp; Drop Scheduling</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Reschedule appointments in seconds. Just drag an appointment to a new time -
        no forms, no clicking through menus.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        A patient calls to reschedule. With traditional systems, you&apos;d click edit,
        scroll through a date picker, select a time, confirm, and save. With drag and
        drop, you just grab the appointment and move it. Done in 2 seconds.
      </p>

      <h2 id="how">How It Works</h2>
      <ol>
        <li><strong>Click and hold</strong> any appointment on the calendar</li>
        <li><strong>Drag</strong> it to the new time slot</li>
        <li><strong>Release</strong> to drop it in place</li>
        <li>The appointment is instantly rescheduled</li>
      </ol>

      <Callout type="tip" title="Visual Feedback">
        As you drag, the appointment becomes semi-transparent and the target time slot
        highlights. You can see exactly where it will land before you drop.
      </Callout>

      <h2 id="moving-options">What You Can Do</h2>

      <h3>Move Within a Day</h3>
      <p>
        Drag an appointment up or down to a different time on the same day. Perfect for
        &quot;can I come 30 minutes later?&quot; requests.
      </p>

      <h3>Move to a Different Day</h3>
      <p>
        In week view, drag an appointment horizontally to a different day. Great for
        &quot;can we move to Thursday instead?&quot;
      </p>

      <h3>Move to a Different Provider</h3>
      <p>
        When viewing multiple providers, drag an appointment from one column to another
        to reassign it to a different provider.
      </p>

      <h2 id="conflict-detection">Conflict Detection</h2>
      <p>
        The system automatically checks for conflicts as you drag:
      </p>
      <ul>
        <li><strong>Green highlight</strong> &mdash; Time slot is available, safe to drop</li>
        <li><strong>Yellow highlight</strong> &mdash; Tight fit, may need adjustment</li>
        <li><strong>Red highlight</strong> &mdash; Conflict with another appointment</li>
      </ul>

      <Callout type="warning" title="Double-Booking Protection">
        By default, you can&apos;t drop an appointment on a time that would create a conflict.
        Managers can enable double-booking override mode if needed.
      </Callout>

      <h2 id="notifications">What Happens After</h2>
      <p>
        When you reschedule via drag and drop:
      </p>
      <ul>
        <li><strong>Confirmation</strong> &mdash; A brief toast message confirms the change</li>
        <li><strong>Patient notification</strong> &mdash; Automatic SMS/email with new time (if enabled)</li>
        <li><strong>Audit log</strong> &mdash; The change is recorded with who made it and when</li>
      </ul>

      <h2 id="undo">Made a Mistake?</h2>
      <p>
        Click the &quot;Undo&quot; button that appears in the confirmation toast, or press
        <code>Ctrl+Z</code> (Windows) / <code>Cmd+Z</code> (Mac) immediately after dropping.
      </p>

      <h2 id="tips">Pro Tips</h2>
      <ul>
        <li><strong>Week view</strong> is best for drag and drop - you can see more options</li>
        <li><strong>Hold Shift</strong> while dragging to snap to 15-minute intervals</li>
        <li><strong>Provider view</strong> makes it easy to move between providers</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/calendar/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Appointments</h3>
          <p className="text-sm text-gray-500">Create and manage appointments</p>
        </Link>
        <Link href="/features/calendar/views" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar Views</h3>
          <p className="text-sm text-gray-500">Day, week, and month views</p>
        </Link>
      </div>
    </div>
  )
}
