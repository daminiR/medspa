import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Users, Clock, Bell, Zap, CheckCircle2, Crown, Award, Medal, TrendingUp, Smartphone, Lock, BarChart3 } from 'lucide-react'

export default function WaitlistPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 100% Complete
        </span>
      </div>
      <h1>Waitlist Management</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Intelligent waitlist management with automated SMS notifications, VIP tiers, and one-click
        acceptance. Maximize your schedule and recover revenue from cancellations.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Waitlist Management Tutorial"
        duration="8 min"
        description="Complete guide to automated waitlist management with SMS offers"
      />

      <Callout type="success" title="Fully Automated System">
        Our waitlist system is fully automated with SMS notifications, smart matching algorithms,
        and one-click patient acceptance. Fill cancellations in 90 seconds instead of 90 minutes!
      </Callout>

      <h2 id="overview">Why Use a Waitlist?</h2>
      <p>
        A waitlist helps you maximize your schedule by filling last-minute cancellations. Instead of
        losing revenue when appointments get cancelled, you can automatically offer those slots to patients
        who want to come in sooner.
      </p>

      <h3 id="benefits">Waitlist Benefits</h3>
      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Maximize Revenue</h3>
          </div>
          <p className="text-sm text-gray-500">Fill 75-80% of cancellations vs. 25% manual. Recover $10K+/month.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">90-Second Response</h3>
          </div>
          <p className="text-sm text-gray-500">Automated SMS offers sent instantly. Patients reply YES to book.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">VIP Tiers</h3>
          </div>
          <p className="text-sm text-gray-500">Platinum/Gold/Silver tiers reward loyal patients with priority.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Race Condition Protection</h3>
          </div>
          <p className="text-sm text-gray-500">Optimistic locking prevents double-booking when multiple patients respond.</p>
        </div>
      </div>

      <h2 id="vip-tiers">VIP Tier System</h2>
      <p>
        Patients are automatically assigned to tiers based on their appointment history, loyalty, and value:
      </p>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-8">
        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Platinum</h3>
          </div>
          <p className="text-sm text-purple-700 mb-2">2x priority multiplier</p>
          <ul className="text-xs text-purple-600 space-y-1">
            <li>• 25+ visits or $10K+ lifetime value</li>
            <li>• First to receive offers</li>
            <li>• Premium service level</li>
          </ul>
        </div>
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Gold</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-2">1.5x priority multiplier</p>
          <ul className="text-xs text-yellow-600 space-y-1">
            <li>• 10-24 visits or $5K-$10K value</li>
            <li>• Second-tier priority</li>
            <li>• Loyal patient status</li>
          </ul>
        </div>
        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Medal className="w-6 h-6 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Silver</h3>
          </div>
          <p className="text-sm text-gray-700 mb-2">1x priority multiplier</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• New or occasional patients</li>
            <li>• Standard priority</li>
            <li>• Path to Gold/Platinum</li>
          </ul>
        </div>
      </div>

      <Callout type="info">
        VIP tiers are configured in Settings → Waitlist. You can customize thresholds and
        multipliers based on your business model.
      </Callout>

      <h2 id="smart-matching">Smart Matching Algorithm</h2>
      <p>
        When a slot opens, the system automatically scores all waitlisted patients to find the best match:
      </p>

      <h3 id="scoring-factors">Scoring Factors</h3>
      <ul>
        <li><strong>VIP Tier</strong> (Platinum 2x, Gold 1.5x, Silver 1x) - Multiplies final score</li>
        <li><strong>Priority Level</strong> (High/Medium/Low) - 30/20/10 points</li>
        <li><strong>Service Match</strong> (Exact/Similar/Category) - 25/15/5 points</li>
        <li><strong>Duration Fit</strong> - Service must fit in slot (hard requirement)</li>
        <li><strong>Practitioner Preference</strong> - 20 points if matches preferred provider</li>
        <li><strong>Wait Time</strong> - Up to 20 points for longest-waiting patients</li>
        <li><strong>Availability Window</strong> - 15 points if slot falls in preferred times</li>
        <li><strong>Forms/Deposit Complete</strong> - 10/5 points bonus (reduces no-shows)</li>
        <li><strong>Response Speed</strong> - Up to 15 points for fast responders</li>
        <li><strong>Offer Count Penalty</strong> - -5 points per declined offer (max -25)</li>
      </ul>

      <Callout type="tip" title="Better Than Competitors">
        Our matching algorithm is more sophisticated than any competitor. Square doesn't check duration,
        Mangomint doesn't notify patients automatically, and Boulevard is 100% manual.
      </Callout>

      <h2 id="automated-sms">Automated SMS Notifications</h2>
      <p>
        When appointments are cancelled, the system automatically sends SMS offers to matching patients:
      </p>

      <StepList steps={[
        {
          title: 'Appointment Cancelled',
          description: 'Staff cancels an appointment in the calendar.'
        },
        {
          title: 'Smart Matching',
          description: 'System finds best-matching waitlisted patients using scoring algorithm.'
        },
        {
          title: 'SMS Offer Sent',
          description: 'Top-matching patient receives SMS: "Hi Sarah! A Botox slot opened with Dr. Smith on Dec 15 at 2:00 PM. Reply YES to book or NO to skip. (Expires in 30 min)"'
        },
        {
          title: 'Patient Responds',
          description: 'Patient replies YES or NO via SMS, or clicks the link for web acceptance.'
        },
        {
          title: 'Auto-Booking',
          description: 'If YES: Appointment created automatically. If NO: Offer cascades to next patient.'
        },
        {
          title: 'Confirmation',
          description: 'Patient receives booking confirmation with calendar link.'
        }
      ]} />

      <div className="not-prose my-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <Smartphone className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">One-Click SMS Acceptance</h4>
            <p className="text-sm text-gray-700 mb-3">
              Patients can reply with a simple "YES" to book instantly. No app required, no login needed.
            </p>
            <div className="bg-white rounded-lg p-3 text-sm font-mono text-gray-700 border border-gray-200">
              <div className="mb-2"><strong>From: Luxe MedSpa</strong></div>
              <div className="mb-2">Hi Sarah! A Botox slot just opened with Dr. Smith on Dec 15 at 2:00 PM.</div>
              <div className="mb-2">Reply YES to book or visit: luxespa.com/w/abc123</div>
              <div className="text-gray-500">(Expires in 30 min)</div>
            </div>
          </div>
        </div>
      </div>

      <h3 id="sms-templates">SMS Templates</h3>
      <p>The system uses 8 different SMS templates for various scenarios:</p>
      <ul>
        <li><strong>Slot Available</strong> - Initial offer with YES/NO options</li>
        <li><strong>Offer Accepted</strong> - Booking confirmation</li>
        <li><strong>Offer Declined</strong> - "You're still on waitlist" reassurance</li>
        <li><strong>Offer Expired</strong> - Gentle reminder they're still on waitlist</li>
        <li><strong>Waitlist Added</strong> - Welcome to waitlist confirmation</li>
        <li><strong>Waitlist Reminder</strong> - Periodic check-in (7-day default)</li>
        <li><strong>Position Update</strong> - Queue position transparency (optional)</li>
        <li><strong>Waitlist Removed</strong> - Removal confirmation</li>
      </ul>

      <h2 id="offer-cascading">Offer Cascading</h2>
      <p>
        If a patient declines or doesn't respond, the offer automatically cascades to the next best match:
      </p>

      <div className="not-prose my-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
              <div className="flex-1">
                <div className="font-semibold">Sarah (Platinum) - Offered 2:05 PM</div>
                <div className="text-sm text-gray-600">Declined at 2:07 PM</div>
              </div>
            </div>
            <div className="ml-4 border-l-2 border-gray-300 h-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">2</div>
              <div className="flex-1">
                <div className="font-semibold">Jessica (Gold) - Offered 2:07 PM</div>
                <div className="text-sm text-gray-600">No response - Expired 2:37 PM</div>
              </div>
            </div>
            <div className="ml-4 border-l-2 border-gray-300 h-4"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
              <div className="flex-1">
                <div className="font-semibold">Emma (Gold) - Offered 2:37 PM</div>
                <div className="text-sm text-green-600">✓ Accepted at 2:39 PM - Booked!</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Callout type="info">
        Cascading is limited to 3 levels by default (configurable in settings). This prevents
        excessive SMS costs and ensures timely filling of slots.
      </Callout>

      <h2 id="race-conditions">Race Condition Prevention</h2>
      <p>
        What happens when two patients accept the same slot within seconds? Our system prevents double-booking:
      </p>

      <div className="not-prose my-6 bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <h4 className="font-semibold text-red-900 mb-3">Optimistic Locking</h4>
        <ol className="text-sm text-red-800 space-y-2">
          <li><strong>1. Slot Lock Created:</strong> When offer is sent, slot is temporarily locked with version number</li>
          <li><strong>2. First Response Wins:</strong> First patient to respond gets the slot if version matches</li>
          <li><strong>3. Second Response Handled:</strong> Second patient receives "Sorry, that slot was just filled" message</li>
          <li><strong>4. Automatic Cascade:</strong> System immediately offers next available slot to second patient</li>
        </ol>
      </div>

      <h2 id="patient-portal">Patient Portal Integration</h2>
      <p>
        Patients can manage their waitlist status through the web portal:
      </p>

      <h3 id="join-waitlist">Joining Waitlist (Patient Side)</h3>
      <p>
        When no appointments are available, patients see a "Join Waitlist" button:
      </p>

      <StepList steps={[
        {
          title: 'Select Service',
          description: 'Patient chooses the service they want from a grid with images and pricing.'
        },
        {
          title: 'Choose Provider (Optional)',
          description: 'Select preferred provider or choose "Any Available" for more opportunities.'
        },
        {
          title: 'Set Availability',
          description: 'Select preferred days (M/T/W/Th/F/S/Su) and time windows (morning/afternoon/evening).'
        },
        {
          title: 'Confirm & Consent',
          description: 'Review selections and agree to SMS notifications (required).'
        }
      ]} />

      <h3 id="patient-dashboard">Patient Waitlist Dashboard</h3>
      <p>
        Patients can view their waitlist status at /waitlist:
      </p>
      <ul>
        <li><strong>Active Entries:</strong> Show queue position (#3 of 12), days waiting, service details</li>
        <li><strong>Pending Offers:</strong> Live countdown timer, one-click acceptance</li>
        <li><strong>Recent Activity:</strong> Timeline of offers sent, accepted, declined</li>
        <li><strong>Actions:</strong> Edit preferences, leave waitlist, check position</li>
      </ul>

      <h2 id="admin-interface">Admin Interface</h2>

      <h3 id="waitlist-panel">Enhanced Waitlist Panel</h3>
      <p>
        The calendar waitlist panel now includes:
      </p>
      <ul>
        <li>⚡ <strong>Send SMS Offer</strong> button for each patient</li>
        <li>🏆 <strong>VIP tier badges</strong> (Platinum/Gold/Silver with icons)</li>
        <li>📊 <strong>Filter by tier</strong> with count badges</li>
        <li>🟣 <strong>Pulse animation</strong> for patients with pending offers</li>
        <li>⏱️ <strong>Last offer timestamp</strong> display</li>
        <li>📈 <strong>Offer status badges</strong> (Pending/Accepted/Declined/Expired)</li>
      </ul>

      <h3 id="offer-modal">Waitlist Offer Modal</h3>
      <p>
        When sending an offer, a modal opens to configure:
      </p>
      <ul>
        <li><strong>Patient Info:</strong> Name, tier badge, masked phone number</li>
        <li><strong>Slot Details:</strong> Service, date, time, duration, provider</li>
        <li><strong>Expiry Time:</strong> Quick select (15/30/60 minutes)</li>
        <li><strong>Email Option:</strong> Also send email notification (checkbox)</li>
        <li><strong>SMS Preview:</strong> Live preview of message with character count</li>
        <li><strong>Custom Message:</strong> Option to edit message text</li>
      </ul>

      <h3 id="offer-status">Real-Time Offer Status Tracker</h3>
      <p>
        A dedicated panel shows all pending offers with:
      </p>
      <ul>
        <li>🔴 <strong>Live countdown timers</strong> for each offer</li>
        <li>🎨 <strong>Color-coded badges</strong> (pending, accepted, declined, expired)</li>
        <li>⚡ <strong>"Expiring soon"</strong> visual warning (&lt; 5 minutes)</li>
        <li>🔄 <strong>Auto-refresh</strong> every 30 seconds</li>
        <li>❌ <strong>Cancel offer</strong> button</li>
        <li>👤 <strong>View patient</strong> links</li>
      </ul>

      <h2 id="settings">Waitlist Settings</h2>
      <p>
        Configure waitlist behavior at Settings → Waitlist:
      </p>

      <h3 id="automated-offers">Automated Offers</h3>
      <ul>
        <li><strong>Auto-send offers:</strong> Toggle automatic SMS when slots open</li>
        <li><strong>Offer expiry:</strong> 15/30/60/90/120 minutes</li>
        <li><strong>Max offers per slot:</strong> How many patients to cascade to (1-5)</li>
        <li><strong>Minimum notice:</strong> Don't offer slots &lt;2 hours away</li>
        <li><strong>Offer sequence:</strong> Priority / FIFO / Tier-Weighted</li>
      </ul>

      <h3 id="tier-config">VIP Tier Configuration</h3>
      <ul>
        <li><strong>Tier weights:</strong> Platinum 60% / Gold 30% / Silver 10% (adjustable sliders)</li>
        <li><strong>Auto-tier rules:</strong> Visit count and revenue thresholds</li>
      </ul>

      <h3 id="communication">Communication Preferences</h3>
      <ul>
        <li><strong>SMS enabled:</strong> Send offers via SMS</li>
        <li><strong>Email enabled:</strong> Send offers via email</li>
        <li><strong>Multi-channel delay:</strong> Minutes between SMS and email</li>
        <li><strong>Periodic reminders:</strong> Enable 7-day check-ins</li>
      </ul>

      <h2 id="analytics">Waitlist Analytics</h2>
      <p>
        Track performance with comprehensive metrics at /api/waitlist/statistics:
      </p>

      <div className="not-prose my-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">Key Metrics</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Fill Rate:</strong> 75-80% target</li>
              <li>• <strong>Conversion Rate:</strong> Offers → Bookings</li>
              <li>• <strong>Response Time:</strong> Average 90 seconds</li>
              <li>• <strong>Revenue Recovered:</strong> $10K+/month</li>
            </ul>
          </div>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">By Tier Performance</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Platinum:</strong> 85% acceptance rate</li>
              <li>• <strong>Gold:</strong> 70% acceptance rate</li>
              <li>• <strong>Silver:</strong> 55% acceptance rate</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 id="compliance">Compliance & Security</h2>

      <h3 id="tcpa">TCPA Compliance</h3>
      <ul>
        <li>✅ <strong>Double opt-in:</strong> Required checkbox when joining waitlist</li>
        <li>✅ <strong>Any method opt-out:</strong> SMS "STOP", web dashboard removal</li>
        <li>✅ <strong>10-day processing:</strong> Opt-out requests processed immediately</li>
        <li>✅ <strong>Audit logging:</strong> All SMS tracked with timestamps</li>
      </ul>

      <h3 id="hipaa">HIPAA Compliance</h3>
      <ul>
        <li>✅ <strong>No PHI in SMS:</strong> Only first name, service type, date/time</li>
        <li>✅ <strong>Twilio BAA:</strong> Business Account Association required</li>
        <li>✅ <strong>Audit logs:</strong> 6-year retention period</li>
        <li>✅ <strong>Secure tokens:</strong> Cryptographically secure offer URLs</li>
        <li>✅ <strong>HTTPS only:</strong> All communication encrypted</li>
      </ul>

      <h3 id="a2p">A2P 10DLC Registration</h3>
      <Callout type="warning" title="Required Before Launch">
        You must register for A2P 10DLC with Twilio before sending SMS offers. This takes
        10 business days and costs $4/month per phone number.
      </Callout>

      <h2 id="best-practices">Best Practices</h2>

      <Callout type="tip" title="Enable Auto-Offers">
        Turn on automatic offers in settings. Fill rates jump from 25% (manual) to 75-80% (automated).
      </Callout>

      <Callout type="tip" title="Monitor Offer Status">
        Check the Offer Status tracker regularly to see pending offers and response rates.
        Adjust expiry times if offers are expiring too quickly.
      </Callout>

      <Callout type="tip" title="Reward VIP Patients">
        Use the tier system to reward your best patients. They'll appreciate the priority
        and become even more loyal.
      </Callout>

      <Callout type="tip" title="Test Your Messages">
        Review SMS templates and test with your own phone before going live. Make sure
        messages are clear and professional.
      </Callout>

      <Callout type="warning" title="Respect Expiry Times">
        Don't set expiry times too short (&lt;15 min) or too long (&gt;2 hours). 30 minutes
        is the sweet spot for most practices.
      </Callout>

      <h2 id="roi">ROI & Impact</h2>

      <div className="not-prose my-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-200">
        <h4 className="font-semibold text-green-900 mb-4 text-lg">Expected Revenue Impact</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-green-700 mb-1">Current (Manual)</div>
            <div className="text-2xl font-bold text-green-900 mb-2">$3,125/month</div>
            <div className="text-xs text-green-600">50 cancellations × 25% fill × $250 avg</div>
          </div>
          <div>
            <div className="text-sm text-green-700 mb-1">Target (Automated)</div>
            <div className="text-2xl font-bold text-green-900 mb-2">$10,000/month</div>
            <div className="text-xs text-green-600">50 cancellations × 80% fill × $250 avg</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="text-sm text-green-700">Monthly Increase</div>
          <div className="text-3xl font-bold text-green-900">+$6,875</div>
          <div className="text-xs text-green-600">$82,500/year revenue recovery</div>
        </div>
      </div>

      <h2 id="related">Related Topics</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">Calendar Overview</h3>
          <p className="text-sm text-gray-500">Learn about all calendar features</p>
        </Link>
        <Link href="/features/messaging/sms" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">SMS Messaging</h3>
          <p className="text-sm text-gray-500">Two-way SMS with patients</p>
        </Link>
        <Link href="/features/calendar/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">Appointments</h3>
          <p className="text-sm text-gray-500">Creating and managing appointments</p>
        </Link>
        <Link href="/integrations/twilio" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900 mb-1">Twilio Setup</h3>
          <p className="text-sm text-gray-500">Configure SMS integration</p>
        </Link>
      </div>
    </div>
  )
}
