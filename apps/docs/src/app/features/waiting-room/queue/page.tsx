import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Users, CheckCircle2, Clock, Star, ArrowUp, ArrowDown } from 'lucide-react'

export default function QueueManagementPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Queue Management</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        See who&apos;s waiting, how long they&apos;ve waited, and manage the flow of patients
        through your clinic efficiently.
      </p>

      <h2 id="why">Why This Matters</h2>
      <p>
        Long waits frustrate patients and hurt reviews. Queue management gives you
        visibility into wait times so you can keep things moving and set expectations.
      </p>

      <h2 id="dashboard">The Queue Dashboard</h2>
      <p>
        A real-time view shows everyone currently waiting:
      </p>
      <ul>
        <li><strong>Patient name</strong> &mdash; Who&apos;s in the queue</li>
        <li><strong>Scheduled time</strong> &mdash; When they were supposed to be seen</li>
        <li><strong>Check-in time</strong> &mdash; When they actually arrived</li>
        <li><strong>Wait time</strong> &mdash; Minutes since check-in (color-coded)</li>
        <li><strong>Provider</strong> &mdash; Who they&apos;re waiting for</li>
        <li><strong>Service</strong> &mdash; What they&apos;re here for</li>
      </ul>

      <h2 id="wait-times">Wait Time Indicators</h2>
      <p>
        Wait times are color-coded for quick scanning:
      </p>
      <div className="not-prose space-y-2 mb-6">
        <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm"><strong>Green (0-10 min)</strong> - On track</span>
        </div>
        <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm"><strong>Yellow (10-20 min)</strong> - Getting long</span>
        </div>
        <div className="flex items-center gap-3 p-2 bg-red-50 rounded">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm"><strong>Red (20+ min)</strong> - Needs attention</span>
        </div>
      </div>

      <Callout type="tip" title="Acknowledge Long Waits">
        If someone&apos;s in the red, have someone acknowledge them: &quot;We&apos;re running a bit
        behind, should be just a few more minutes.&quot; It goes a long way.
      </Callout>

      <h2 id="vip">VIP Priority</h2>
      <p>
        VIP patients are flagged with a star and can be:
      </p>
      <ul>
        <li>Automatically moved up in the queue</li>
        <li>Assigned to specific providers</li>
        <li>Given priority room assignments</li>
      </ul>
      <p>
        VIP status is set in the patient profile based on spend level or manually.
      </p>

      <h2 id="reordering">Reordering the Queue</h2>
      <p>
        Drag patients up or down to change their order, or use the arrows:
      </p>
      <ul>
        <li><strong>Move up</strong> &mdash; See them sooner</li>
        <li><strong>Move down</strong> &mdash; Push them back</li>
      </ul>
      <p>
        Common reasons to reorder:
      </p>
      <ul>
        <li>Quick service (just picking up products)</li>
        <li>Running late patient who just arrived</li>
        <li>Provider preference</li>
      </ul>

      <h2 id="multiple-providers">Multiple Providers</h2>
      <p>
        Filter the queue by provider to see:
      </p>
      <ul>
        <li>All patients waiting for a specific provider</li>
        <li>Provider utilization at a glance</li>
        <li>Balance workload if someone&apos;s backed up</li>
      </ul>

      <h2 id="notifications">Patient Notifications</h2>
      <p>
        Send updates directly from the queue:
      </p>
      <ul>
        <li><strong>&quot;Ready&quot;</strong> &mdash; Come to the treatment room</li>
        <li><strong>&quot;Running late&quot;</strong> &mdash; We&apos;re behind, X more minutes</li>
        <li><strong>&quot;Room ready&quot;</strong> &mdash; Please proceed to Room 2</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/waiting-room/check-in" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Check-In</h3>
          <p className="text-sm text-gray-500">Contactless arrival</p>
        </Link>
        <Link href="/features/waiting-room/status" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Status Updates</h3>
          <p className="text-sm text-gray-500">Keep patients informed</p>
        </Link>
      </div>
    </div>
  )
}
