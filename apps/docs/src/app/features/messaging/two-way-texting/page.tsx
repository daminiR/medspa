import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import Link from 'next/link'
import { MessageCircle, Send, Users, Clock, Shield, Smartphone, Bell, Sparkles, CheckCircle2, Lock, Phone, ArrowRight, Settings, Eye, EyeOff, Image, Calendar } from 'lucide-react'

export default function TwoWayTexting() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <MessageCircle className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 100% Complete
        </span>
      </div>
      <h1>Two-Way Texting & Messaging</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        A unified messaging hub for all client communication. Combine automated appointment reminders
        with real two-way conversations, AI-powered reply suggestions, and comprehensive staff permissions.
        Perfect for modern med spa operations.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Two-Way Texting Overview"
        duration="5 min"
        description="See how the messaging hub streamlines all client communication in one place"
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Two-Way Texting system transforms how your med spa communicates with clients. Unlike basic
        reminder systems, this is a complete messaging platform that combines:
      </p>
      <ul>
        <li><strong>Automated messages</strong> &mdash; Appointment reminders, confirmations, and follow-ups</li>
        <li><strong>Two-way conversations</strong> &mdash; Real back-and-forth texting with clients</li>
        <li><strong>Unified inbox</strong> &mdash; All messages (automated + manual) in one place</li>
        <li><strong>AI assistance</strong> &mdash; Smart reply suggestions powered by context analysis</li>
        <li><strong>Staff permissions</strong> &mdash; Control who can send, view, and manage conversations</li>
      </ul>

      <Callout type="info" title="Dedicated Business Number">
        You get a unique phone number for each location with your local area code. This number is
        text-only (no voice calls) and appears as the sender for all your messages. Patients can save
        this number and text it anytime.
      </Callout>

      <h2 id="key-features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Centralized Inbox</h3>
          </div>
          <p className="text-sm text-gray-500">See all client conversations in one place. Automated reminders and two-way texts side by side.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Message from Calendar</h3>
          </div>
          <p className="text-sm text-gray-500">Click any appointment to instantly message that patient. Context is automatically loaded.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Staff Permissions</h3>
          </div>
          <p className="text-sm text-gray-500">Granular control over who can send messages, view conversations, and see contact details.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Mobile App Messaging</h3>
          </div>
          <p className="text-sm text-gray-500">Staff can respond to messages from the mobile app with push notifications for new messages.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Auto-Close Conversations</h3>
          </div>
          <p className="text-sm text-gray-500">Conversations automatically close after 7 days of inactivity. Keep your inbox clean and focused.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">After-Hours Auto-Responder</h3>
          </div>
          <p className="text-sm text-gray-500">Automatically reply to texts received outside business hours with custom message.</p>
        </div>
      </div>

      <h2 id="workflows">Messaging Workflows</h2>
      <p>
        The system supports several powerful workflows that streamline common med spa communication scenarios:
      </p>

      <h3 id="provider-running-late">Provider Running Late Workflow</h3>
      <p>
        When a provider is running behind schedule, quickly notify affected patients:
      </p>

      <StepList steps={[
        {
          title: 'Provider Updates Status',
          description: 'Provider clicks "Running Late" in their schedule view and enters delay time (e.g., "20 minutes").'
        },
        {
          title: 'AI Drafts Message',
          description: 'System automatically drafts personalized message: "Hi [Name], Dr. Smith is running about 20 minutes behind. Your appointment time will be around 2:20pm. Thank you for your patience!"'
        },
        {
          title: 'Review & Send',
          description: 'Provider or front desk reviews the message and clicks "Send to All Affected Patients".'
        },
        {
          title: 'Patient Receives SMS',
          description: 'All patients with appointments in the next 2 hours receive the notification via SMS.'
        }
      ]} />

      <Callout type="tip" title="Reduce No-Shows">
        This workflow significantly reduces frustration and no-shows. Patients appreciate the transparency
        and can adjust their arrival time accordingly.
      </Callout>

      <h3 id="form-submission-followup">Form Submission → Text Follow-Up</h3>
      <p>
        When a potential client submits a consultation request form on your website, automatically follow up via text:
      </p>

      <div className="not-prose my-8">
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          <div className="flex-shrink-0 w-64 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Step 1</div>
            <div className="font-medium text-gray-900 mb-1">Form Submitted</div>
            <p className="text-sm text-gray-600">Client fills out consultation form on website</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-shrink-0 w-64 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Step 2</div>
            <div className="font-medium text-gray-900 mb-1">Patient Created</div>
            <p className="text-sm text-gray-600">System creates patient record automatically</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-shrink-0 w-64 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Step 3</div>
            <div className="font-medium text-gray-900 mb-1">Auto Text Sent</div>
            <p className="text-sm text-gray-600">&quot;Thanks for your interest! We&apos;ll reach out within 1 hour&quot;</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-shrink-0 w-64 p-4 bg-primary-50 rounded-lg border-2 border-primary-200">
            <div className="text-xs text-primary-600 mb-2">Step 4</div>
            <div className="font-medium text-primary-900 mb-1">Staff Follows Up</div>
            <p className="text-sm text-primary-700">Coordinator sees notification, reviews form, texts to book consultation</p>
          </div>
        </div>
      </div>

      <h3 id="new-client-cookie">New Client "Cookie" Workflow</h3>
      <p>
        Add a personal touch for first-time clients with a pre-visit introduction text:
      </p>

      <ul>
        <li><strong>24 hours before</strong> &mdash; Send personalized text introducing their provider and what to expect</li>
        <li><strong>Include provider photo</strong> &mdash; Attach headshot so client knows who they&apos;ll be seeing</li>
        <li><strong>Set expectations</strong> &mdash; Brief overview of the consultation process and parking instructions</li>
        <li><strong>Invite questions</strong> &mdash; Encourage them to reply with any pre-visit questions</li>
      </ul>

      <div className="not-prose my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900 font-medium mb-2">Example "Cookie" Message:</p>
        <p className="text-sm text-blue-800 italic">
          &quot;Hi Emma! We&apos;re so excited to meet you tomorrow at 2pm! You&apos;ll be seeing Jessica,
          our lead injector (photo attached). She&apos;s been doing Botox for 8 years and is amazing.
          Park in front, come to the blue door, and we&apos;ll check you in. Any questions before tomorrow? 💙&quot;
        </p>
      </div>

      <Callout type="success" title="First Impressions Matter">
        This personal touch makes new clients feel valued and reduces first-appointment anxiety. Many
        practices report that clients specifically mention this text as making them feel welcome.
      </Callout>

      <h3 id="sick-provider-workflow">Sick Provider → Reschedule Notifications</h3>
      <p>
        When a provider calls in sick, quickly reschedule all affected appointments:
      </p>

      <StepList steps={[
        {
          title: 'Mark Provider Unavailable',
          description: 'Manager marks provider as "Sick" in the schedule for the day.'
        },
        {
          title: 'System Identifies Appointments',
          description: 'System automatically finds all appointments for that provider today and tomorrow.'
        },
        {
          title: 'Draft Bulk Message',
          description: 'Generates message: "Hi [Name], unfortunately [Provider] is out sick. We need to reschedule your [Service] appointment. Please reply with your availability or call us at [Phone]."'
        },
        {
          title: 'Review & Send',
          description: 'Manager reviews patient list, makes any adjustments, and sends to all affected patients at once.'
        },
        {
          title: 'Track Responses',
          description: 'Patient replies appear in the inbox. Manager can rebook directly from the conversation.'
        }
      ]} />

      <h2 id="phone-numbers">Phone Numbers & Setup</h2>

      <h3 id="number-assignment">Unique Number Per Location</h3>
      <p>
        Each of your locations gets its own dedicated phone number:
      </p>
      <ul>
        <li><strong>Local area codes</strong> &mdash; Choose a number with your local area code</li>
        <li><strong>Text-only</strong> &mdash; Numbers are SMS-enabled but do not receive voice calls</li>
        <li><strong>Location-specific</strong> &mdash; Each clinic can have its own number for brand consistency</li>
        <li><strong>One-time setup</strong> &mdash; Number stays with your account permanently</li>
      </ul>

      <Callout type="info" title="Why Text-Only?">
        Text-only numbers prevent patients from calling the SMS line. This keeps voice calls going to
        your main business line where staff can properly handle them, while texts stay in the messaging hub.
      </Callout>

      <h3 id="area-code-selection">Area Code Selection</h3>
      <p>
        During setup, you can search for available numbers in your area:
      </p>
      <ul>
        <li>Search by area code (e.g., "310" for Los Angeles)</li>
        <li>Search by city name</li>
        <li>View 10-15 available numbers to choose from</li>
        <li>Select a memorable number if available</li>
      </ul>

      <h2 id="permissions">Staff Permissions & Privacy</h2>
      <p>
        Control exactly what each staff member can do in the messaging system:
      </p>

      <h3 id="permission-levels">Permission Levels</h3>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Can Send Messages</h3>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Controls who can compose and send SMS messages to patients.
          </p>
          <div className="text-xs text-gray-600">
            <strong>Typical use:</strong> Front desk, managers, providers, coordinators
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">View Individual Conversations</h3>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Can view message history for patients they&apos;re working with, but not all conversations.
          </p>
          <div className="text-xs text-gray-600">
            <strong>Typical use:</strong> Treatment coordinators, medical assistants
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">View ALL Conversations</h3>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Can access the full messaging inbox and see all patient conversations across the practice.
          </p>
          <div className="text-xs text-gray-600">
            <strong>Typical use:</strong> Practice managers, office managers, owners
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <EyeOff className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Hide Contact Details</h3>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Staff can text patients through the system but cannot see or copy phone numbers.
          </p>
          <div className="text-xs text-gray-600">
            <strong>Typical use:</strong> Prevents staff from taking client lists when they leave
          </div>
        </div>
      </div>

      <h3 id="permission-combinations">Common Permission Combinations</h3>

      <div className="not-prose space-y-3 my-6">
        <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
          <div className="font-semibold text-blue-900 mb-1">Front Desk Staff</div>
          <p className="text-sm text-blue-800">✓ Send messages &nbsp; ✓ View all conversations &nbsp; ✓ See contact details</p>
          <p className="text-xs text-blue-700 mt-1">Full access needed to handle patient communication</p>
        </div>

        <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
          <div className="font-semibold text-green-900 mb-1">Provider / Injector</div>
          <p className="text-sm text-green-800">✓ Send messages &nbsp; ✓ View their patient conversations &nbsp; ✓ See contact details</p>
          <p className="text-xs text-green-700 mt-1">Can message their own patients, cannot see other providers&apos; conversations</p>
        </div>

        <div className="p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
          <div className="font-semibold text-purple-900 mb-1">Treatment Coordinator</div>
          <p className="text-sm text-purple-800">✓ Send messages &nbsp; ✗ View all conversations &nbsp; ✗ Hidden contact details</p>
          <p className="text-xs text-purple-700 mt-1">Can text patients to book/reschedule but cannot export contact lists</p>
        </div>

        <div className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
          <div className="font-semibold text-amber-900 mb-1">Medical Assistant</div>
          <p className="text-sm text-amber-800">✓ Send messages &nbsp; ✓ View assigned patient conversations &nbsp; ✓ See contact details</p>
          <p className="text-xs text-amber-700 mt-1">Can text for pre/post appointment instructions, view only their patients</p>
        </div>
      </div>

      <h2 id="use-cases">Med Spa Use Cases</h2>
      <p>
        Here are real-world scenarios where two-way texting transforms med spa operations:
      </p>

      <h3 id="pre-appointment-consultation">Pre-Appointment Consultation via Text</h3>
      <p>
        Before a new client&apos;s first Botox appointment, have a text consultation:
      </p>
      <ul>
        <li><strong>Ask about concerns</strong> &mdash; &quot;What areas are you most interested in treating?&quot;</li>
        <li><strong>Set expectations</strong> &mdash; Share before/after photos of similar treatments</li>
        <li><strong>Answer questions</strong> &mdash; Address pain, downtime, results timeline</li>
        <li><strong>Prep instructions</strong> &mdash; Avoid alcohol, stop certain supplements, etc.</li>
      </ul>

      <h3 id="photo-collection">Collecting Patient Photos Before Treatment</h3>
      <p>
        Request photos via text before certain treatments (e.g., chemical peels, laser):
      </p>
      <ul>
        <li><strong>Text with request</strong> &mdash; &quot;Please send a photo of your skin concern in natural lighting&quot;</li>
        <li><strong>Patient replies with photo</strong> &mdash; MMS photo message received in inbox</li>
        <li><strong>Provider reviews</strong> &mdash; Can assess severity and prepare treatment plan</li>
        <li><strong>Photos auto-attach to chart</strong> &mdash; Stored in patient&apos;s document library</li>
      </ul>

      <Callout type="warning" title="HIPAA Compliance">
        Patient photos sent via SMS are encrypted in transit and storage. However, advise patients not
        to text photos containing sensitive identifiable information unless they acknowledge the risk.
      </Callout>

      <h3 id="post-treatment-checkins">Post-Treatment Check-Ins</h3>
      <p>
        Follow up after treatments to ensure satisfaction and identify any issues:
      </p>

      <StepList steps={[
        {
          title: 'Day 1 After Treatment',
          description: 'Auto-text: "Hi Sarah! How are you feeling after your treatment yesterday? Any questions or concerns?"'
        },
        {
          title: 'Day 3 After Treatment',
          description: 'If no response to Day 1, send: "Just checking in! Your results should start showing in the next few days. Reply if you need anything."'
        },
        {
          title: 'Day 14 After Treatment',
          description: 'Send: "Your Botox should be fully settled now. Love your results? We\'d appreciate a review! [Link]"'
        }
      ]} />

      <h3 id="appointment-confirmations-reply">Appointment Confirmations with Reply Capability</h3>
      <p>
        Unlike traditional one-way reminders, patients can reply directly to confirm or ask questions:
      </p>
      <ul>
        <li><strong>Patient receives reminder</strong> &mdash; &quot;Appointment tomorrow at 2pm. Reply C to confirm.&quot;</li>
        <li><strong>Patient replies &quot;C&quot;</strong> &mdash; System auto-marks appointment as confirmed</li>
        <li><strong>Or patient asks question</strong> &mdash; &quot;Can I bring my sister?&quot;</li>
        <li><strong>Staff sees question</strong> &mdash; Appears in inbox, staff can reply immediately</li>
      </ul>

      <h2 id="ai-features">AI-Powered Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Smart Reply Suggestions</h3>
          </div>
          <p className="text-sm text-gray-700">
            When a patient texts, AI analyzes the message and suggests 3 contextual replies. Click to use instantly.
          </p>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">HIPAA-Compliant AI</h3>
          </div>
          <p className="text-sm text-gray-700">
            AI processing happens locally. No patient data is sent to external AI services. Fully HIPAA compliant.
          </p>
        </div>
      </div>

      <p>
        The AI suggestion system detects message intent and provides appropriate responses:
      </p>
      <ul>
        <li><strong>Appointment-related</strong> &mdash; Confirmations, rescheduling, directions</li>
        <li><strong>Medical concerns</strong> &mdash; Reassurance, aftercare tips, when-to-call guidance</li>
        <li><strong>Questions</strong> &mdash; Helpful answers, offers to call, booking suggestions</li>
        <li><strong>Thank you messages</strong> &mdash; Warm, professional responses</li>
      </ul>

      <Callout type="info">
        Learn more about AI suggestions in our <Link href="/features/messaging/ai-suggestions">AI Reply Suggestions guide</Link>.
      </Callout>

      <h2 id="automation-features">Automation Features</h2>

      <h3 id="auto-close">Auto-Close Conversations</h3>
      <p>
        Conversations automatically close after 7 days of inactivity to keep your inbox clean:
      </p>
      <ul>
        <li>Closed conversations are archived but remain searchable</li>
        <li>If patient texts again, conversation automatically reopens</li>
        <li>You can manually reopen closed conversations anytime</li>
        <li>Adjust the auto-close timeframe in settings (3, 7, 14, or 30 days)</li>
      </ul>

      <h3 id="auto-responder">After-Hours Auto-Responder</h3>
      <p>
        Automatically reply to messages received outside business hours:
      </p>

      <div className="not-prose my-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-700 font-medium mb-2">Example Auto-Responder Message:</p>
        <p className="text-sm text-gray-600 italic">
          &quot;Thanks for your message! Our office hours are Mon-Fri 9am-6pm and Sat 10am-4pm.
          We&apos;ll respond first thing when we&apos;re back. For urgent matters, please call our after-hours
          line at (555) 123-4567.&quot;
        </p>
      </div>

      <p>Configure your auto-responder settings:</p>
      <ul>
        <li><strong>Business hours</strong> &mdash; Set your office hours by day of week</li>
        <li><strong>Custom message</strong> &mdash; Personalize the auto-response text</li>
        <li><strong>Emergency contact</strong> &mdash; Include after-hours phone number if available</li>
        <li><strong>Enable/disable</strong> &mdash; Turn on/off for holidays or special circumstances</li>
      </ul>

      <h2 id="mobile-app">Mobile App Messaging</h2>
      <p>
        Staff can manage conversations on the go with the mobile app:
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Push Notifications</h3>
          </div>
          <p className="text-sm text-gray-500">Get notified instantly when patients reply. Never miss an urgent message.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Full Conversation History</h3>
          </div>
          <p className="text-sm text-gray-500">Complete message history synced across web and mobile. Pick up where you left off.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Suggestions</h3>
          </div>
          <p className="text-sm text-gray-500">Smart replies work on mobile too. Respond faster with one-tap suggestions.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Image className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Send Photos</h3>
          </div>
          <p className="text-sm text-gray-500">Share photos from your phone. Great for sending product photos or directions.</p>
        </div>
      </div>

      <h2 id="comparison">Feature Comparison</h2>
      <p>See how our two-way texting compares to competitors:</p>

      <ComparisonTable
        showCompetitors
        rows={[
          { feature: 'Two-Way SMS', luxe: true, mangomint: '$75/mo add-on', boulevard: true, jane: 'In-app only' },
          { feature: 'Unified Inbox (Auto + Manual)', luxe: true, mangomint: true, boulevard: 'Separate', jane: false },
          { feature: 'Message from Calendar', luxe: true, mangomint: true, boulevard: true, jane: false },
          { feature: 'Staff Permissions', luxe: 'Granular', mangomint: 'Basic', boulevard: 'Role-based', jane: 'Role-based' },
          { feature: 'Hide Contact Details', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Mobile App with Push', luxe: true, mangomint: true, boulevard: true, jane: true },
          { feature: 'Auto-Close Conversations', luxe: true, mangomint: false, boulevard: true, jane: false },
          { feature: 'After-Hours Auto-Reply', luxe: true, mangomint: false, boulevard: true, jane: false },
          { feature: 'AI Reply Suggestions', luxe: true, mangomint: false, boulevard: false, jane: false },
          { feature: 'Patient Photo Collection', luxe: true, mangomint: true, boulevard: 'Limited', jane: false },
          { feature: 'Bulk Messaging Workflows', luxe: true, mangomint: true, boulevard: true, jane: false },
        ]}
      />

      <h2 id="best-practices">Best Practices</h2>

      <div className="not-prose space-y-4 my-8">
        <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
          <h4 className="font-semibold text-green-900 mb-2">✓ DO: Respond Within 1 Hour</h4>
          <p className="text-sm text-green-800">
            Patients expect fast replies to texts. Aim to respond within 60 minutes during business hours.
            Use mobile app notifications to stay on top of messages.
          </p>
        </div>

        <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
          <h4 className="font-semibold text-green-900 mb-2">✓ DO: Use Quick Replies for Common Questions</h4>
          <p className="text-sm text-green-800">
            Create saved replies for frequently asked questions (parking, pricing, aftercare). This ensures
            consistent, accurate responses across all staff members.
          </p>
        </div>

        <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
          <h4 className="font-semibold text-green-900 mb-2">✓ DO: Personalize Your Messages</h4>
          <p className="text-sm text-green-800">
            Always use the patient&apos;s name. Reference their specific treatment or concern. Personal touches
            build stronger relationships and increase retention.
          </p>
        </div>

        <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
          <h4 className="font-semibold text-red-900 mb-2">✗ DON&apos;T: Send Sensitive Medical Info</h4>
          <p className="text-sm text-red-800">
            While our system is HIPAA compliant, avoid texting detailed medical information or test results.
            Keep texts focused on scheduling, general questions, and non-sensitive updates.
          </p>
        </div>

        <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
          <h4 className="font-semibold text-red-900 mb-2">✗ DON&apos;T: Text Outside Business Hours (Unless Auto-Responder is On)</h4>
          <p className="text-sm text-red-800">
            Respect patient boundaries by not texting late at night or early morning. Enable the auto-responder
            to handle after-hours messages professionally.
          </p>
        </div>
      </div>

      <h2 id="compliance">HIPAA Compliance & Security</h2>

      <div className="not-prose my-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">HIPAA-Compliant Architecture</h3>
            <p className="text-sm text-blue-800 mb-3">
              Our messaging system is designed with HIPAA compliance from the ground up:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>All messages encrypted in transit (TLS 1.2+) and at rest (AES-256)</li>
              <li>Audit logs track who viewed/sent every message with timestamps</li>
              <li>Staff access controlled via role-based permissions</li>
              <li>BAA (Business Associate Agreement) in place with Twilio</li>
              <li>Messages automatically expire after retention period (7 years default)</li>
              <li>Opt-out keywords automatically processed per TCPA requirements</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 id="getting-started">Getting Started</h2>
      <p>Ready to set up two-way texting for your practice?</p>

      <StepList steps={[
        {
          title: 'Choose Your Phone Number',
          description: 'Select a local number with your area code during initial setup.'
        },
        {
          title: 'Configure Business Hours',
          description: 'Set your office hours to enable after-hours auto-responder.'
        },
        {
          title: 'Set Staff Permissions',
          description: 'Configure who can send, view, and manage messages based on role.'
        },
        {
          title: 'Create Quick Replies',
          description: 'Set up saved responses for common questions (parking, pricing, hours, etc.).'
        },
        {
          title: 'Test Messaging',
          description: 'Send a test message to your own phone to ensure everything works correctly.'
        },
        {
          title: 'Train Your Team',
          description: 'Show staff how to access the inbox, use quick replies, and follow best practices.'
        }
      ]} />

      <Callout type="tip">
        Need help getting started? Check our <Link href="/integrations/twilio">Twilio Integration Guide</Link> for
        detailed setup instructions.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-3">
        <Link href="/features/messaging/ai-suggestions" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Reply Suggestions</h3>
          </div>
          <p className="text-sm text-gray-500">Smart, contextual reply suggestions</p>
        </Link>
        <Link href="/features/messaging/quick-replies" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Send className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Quick Replies</h3>
          </div>
          <p className="text-sm text-gray-500">One-click response templates</p>
        </Link>
        <Link href="/features/messaging/campaigns" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="font-semibold text-gray-900">SMS Campaigns</h3>
          </div>
          <p className="text-sm text-gray-500">Bulk messaging for marketing</p>
        </Link>
        <Link href="/features/messaging/settings" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-900">SMS Settings</h3>
          </div>
          <p className="text-sm text-gray-500">Configure permissions and compliance</p>
        </Link>
        <Link href="/features/messaging/reminders" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Appointment Reminders</h3>
          </div>
          <p className="text-sm text-gray-500">Automated reminder configuration</p>
        </Link>
        <Link href="/integrations/twilio" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-4 h-4 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Twilio Setup</h3>
          </div>
          <p className="text-sm text-gray-500">Integration and phone number setup</p>
        </Link>
      </div>
    </div>
  )
}
