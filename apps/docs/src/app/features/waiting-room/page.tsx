import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Clock, MessageSquare, Users, CheckCircle2, Smartphone, Bell, ArrowRight } from 'lucide-react'

export default function WaitingRoomPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Clock className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 85% Complete
        </span>
      </div>
      <h1>Virtual Waiting Room</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Streamline patient arrivals with SMS-based check-in. Patients check in from their car,
        you see them in a queue, and call them in when ready.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Waiting Room Demo"
        duration="2 min"
        description="See how the virtual waiting room works from both patient and staff perspectives"
      />

      <h2 id="overview">How It Works</h2>
      <p>
        The Virtual Waiting Room replaces crowded waiting areas with a digital queue. Here&apos;s the flow:
      </p>

      <StepList steps={[
        {
          title: 'Patient Arrives',
          description: 'Patient receives SMS with check-in link when they arrive at your location.'
        },
        {
          title: 'Check In via SMS',
          description: 'Patient clicks link, confirms arrival, and waits in their car or outside.'
        },
        {
          title: 'Queue Management',
          description: 'Front desk sees all checked-in patients in a real-time queue dashboard.'
        },
        {
          title: 'Ready Notification',
          description: 'When ready, staff clicks "Call In" and patient receives SMS to come inside.'
        }
      ]} />

      <Callout type="tip" title="Perfect for COVID-Era Operations">
        Many practices adopted virtual waiting rooms during COVID. Patients love the convenience
        of waiting in their car instead of a crowded lobby.
      </Callout>

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Mobile Check-In</h3>
          </div>
          <p className="text-sm text-gray-500">Patients check in from their phone. No app download required &mdash; just click the SMS link.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Live Queue</h3>
          </div>
          <p className="text-sm text-gray-500">Real-time dashboard shows all waiting patients with check-in time and appointment details.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Instant Notifications</h3>
          </div>
          <p className="text-sm text-gray-500">One-click to notify patient they&apos;re ready. SMS sent immediately.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Wait Time Tracking</h3>
          </div>
          <p className="text-sm text-gray-500">See how long each patient has been waiting. Identify and address long waits.</p>
        </div>
      </div>

      <h2 id="patient-flow">Patient Experience</h2>
      <p>
        From the patient&apos;s perspective, check-in is simple and takes just seconds:
      </p>

      <div className="not-prose my-8">
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          <div className="flex-shrink-0 w-64 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Step 1</div>
            <div className="font-medium text-gray-900 mb-1">Receive SMS</div>
            <p className="text-sm text-gray-600">&quot;Hi Sarah! Click here to check in for your 2pm appointment&quot;</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-shrink-0 w-64 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Step 2</div>
            <div className="font-medium text-gray-900 mb-1">Click Link</div>
            <p className="text-sm text-gray-600">Opens mobile-friendly check-in page</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-shrink-0 w-64 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Step 3</div>
            <div className="font-medium text-gray-900 mb-1">Confirm Arrival</div>
            <p className="text-sm text-gray-600">Tap &quot;I&apos;m Here&quot; button to check in</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-shrink-0 w-64 p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
            <div className="text-xs text-primary-600 mb-2">Step 4</div>
            <div className="font-medium text-primary-900 mb-1">Wait for Call</div>
            <p className="text-sm text-primary-700">Receives SMS when ready to come in</p>
          </div>
        </div>
      </div>

      <h2 id="staff-dashboard">Staff Dashboard</h2>
      <p>
        The waiting room dashboard shows all checked-in patients at a glance:
      </p>
      <ul>
        <li><strong>Patient name</strong> and appointment time</li>
        <li><strong>Service</strong> they&apos;re here for</li>
        <li><strong>Provider</strong> they&apos;re seeing</li>
        <li><strong>Check-in time</strong> and wait duration</li>
        <li><strong>Status</strong> (Waiting, Called In, In Treatment, etc.)</li>
      </ul>

      <Callout type="info">
        The queue automatically sorts by appointment time and highlights patients who have been
        waiting longer than expected.
      </Callout>

      <h3 id="status-updates">Status Updates</h3>
      <p>
        Staff can update patient status as they move through their visit:
      </p>
      <ul>
        <li><strong>Waiting</strong> &mdash; Checked in, waiting to be called</li>
        <li><strong>Called In</strong> &mdash; SMS sent to come inside</li>
        <li><strong>In Room</strong> &mdash; In treatment room, waiting for provider</li>
        <li><strong>In Treatment</strong> &mdash; Provider is with patient</li>
        <li><strong>Checkout</strong> &mdash; Treatment complete, at front desk</li>
      </ul>

      <h2 id="configuration">Configuration</h2>
      <p>
        Customize the waiting room to match your practice&apos;s workflow:
      </p>

      <h3 id="auto-checkin">Automatic Check-In Links</h3>
      <p>
        Configure when check-in links are sent automatically:
      </p>
      <ul>
        <li><strong>2 hours before</strong> &mdash; Default. Patient receives link with day-of reminder.</li>
        <li><strong>On arrival</strong> &mdash; Triggered when patient texts &quot;here&quot; or calls the clinic.</li>
        <li><strong>Manual only</strong> &mdash; Front desk sends link when patient indicates arrival.</li>
      </ul>

      <h3 id="messages">Custom Messages</h3>
      <p>
        Customize the SMS messages patients receive:
      </p>
      <ul>
        <li><strong>Check-in prompt</strong> &mdash; Message with check-in link</li>
        <li><strong>Confirmation</strong> &mdash; After successful check-in</li>
        <li><strong>Ready notification</strong> &mdash; When called to come in</li>
      </ul>

      <h2 id="benefits">Benefits</h2>
      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">For Your Practice</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Reduce lobby crowding</li>
            <li>• Better traffic flow</li>
            <li>• Know exactly who&apos;s waiting</li>
            <li>• Identify schedule bottlenecks</li>
          </ul>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">For Your Patients</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Wait in car, not lobby</li>
            <li>• No crowded waiting rooms</li>
            <li>• Clear communication</li>
            <li>• Feel valued and respected</li>
          </ul>
        </div>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Messaging & SMS</h3>
          <p className="text-sm text-gray-500">Learn about SMS capabilities</p>
        </Link>
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar</h3>
          <p className="text-sm text-gray-500">See today&apos;s appointments</p>
        </Link>
      </div>
    </div>
  )
}
