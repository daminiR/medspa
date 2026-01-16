import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Lightbulb, Clock, Users, CreditCard, MessageSquare, CheckCircle2 } from 'lucide-react'

export default function BestPracticesPage() {
  const schedulingSteps = [
    {
      title: 'Set Service Durations Accurately',
      description:
        'Configure realistic treatment times for each service. This prevents overbooking and ensures providers have adequate time between appointments. Consider setup time, procedure time, and buffer time.',
    },
    {
      title: 'Use Service-Driven Duration',
      description:
        'When creating appointments, use the service-driven duration feature which automatically sets duration based on the selected service. This prevents manual errors and ensures consistency.',
    },
    {
      title: 'Block Time for Breaks',
      description:
        'Schedule regular breaks for staff (lunch, cleanup between patients, admin time). This improves work-life balance and prevents burnout.',
    },
    {
      title: 'Set Booking Windows',
      description:
        'Limit how far in advance patients can book (e.g., 90 days) to maintain flexibility for promotional slots and new patient onboarding.',
    },
    {
      title: 'Manage Cancellation Policies',
      description:
        'Enforce 24-hour cancellation notices to reduce no-shows. The platform can automatically send reminder messages.',
    },
  ]

  const patientSteps = [
    {
      title: 'Maintain Detailed Patient Records',
      description:
        'Complete medical history and treatment records reduce risk, prevent complications, and improve personalized care recommendations.',
    },
    {
      title: 'Document Consent',
      description:
        'Store signed consent forms and medical questionnaires. This is critical for liability protection and HIPAA compliance.',
    },
    {
      title: 'Use Patient Profiles Fully',
      description:
        'Keep detailed notes about preferences, previous treatments, and outcomes. This information helps provide consistent, personalized service across your team.',
    },
    {
      title: 'Track Treatment History',
      description:
        'Before each appointment, review the patient\'s treatment history. This helps identify potential issues, recommend appropriate services, and upsell complementary treatments.',
    },
    {
      title: 'Build Relationships',
      description:
        'Use the platform to track patient preferences, milestones, and communication history. This helps build strong relationships that lead to loyalty and referrals.',
    },
  ]

  const billingSteps = [
    {
      title: 'Price Services Competitively',
      description:
        'Research local market rates and adjust pricing accordingly. Consider offering package pricing to increase average ticket size.',
    },
    {
      title: 'Use Service Packages',
      description:
        'Bundle complementary services at a discounted rate (e.g., "Glow Package": Facial + microneedling + skincare products). This increases average revenue per patient.',
    },
    {
      title: 'Track Product Costs',
      description:
        'Record the cost of injectables and products used. This helps you understand margins, optimize purchasing, and price services appropriately.',
    },
    {
      title: 'Offer Multiple Payment Options',
      description:
        'Accept credit cards, cash, and financing options like CareCredit. This removes payment barriers and increases conversion rates.',
    },
    {
      title: 'Collect Payment Upfront',
      description:
        'Process payment at booking or check-in to reduce no-shows and payment disputes. The platform stores payment information securely.',
    },
    {
      title: 'Create Referral Incentives',
      description:
        'Offer discounts or credits for patient referrals. Track referral sources in the platform to identify your best marketing channels.',
    },
  ]

  const messagingSteps = [
    {
      title: 'Send Appointment Confirmations',
      description:
        'Send SMS or email confirmations within 2 hours of booking. Include date, time, provider, location, and cancellation policy.',
    },
    {
      title: 'Automate Appointment Reminders',
      description:
        'Send 24-hour reminders to reduce no-shows. The platform can schedule these automatically to specific times (e.g., 9 AM the day before).',
    },
    {
      title: 'Follow Up Post-Appointment',
      description:
        'Send follow-up messages thanking patients for their visit, providing aftercare instructions, and requesting feedback. This improves satisfaction and repeat bookings.',
    },
    {
      title: 'Build Message Templates',
      description:
        'Create templates for common scenarios (confirmations, reminders, follow-ups, promotions). This saves time and ensures consistency.',
    },
    {
      title: 'Respect Consent and Preferences',
      description:
        'Only send SMS to patients who opted in. Respect communication preferences and include clear opt-out instructions in every message.',
    },
    {
      title: 'Personalize When Possible',
      description:
        'Use patient name and service details in messages. Personalized communication has higher engagement rates.',
    },
  ]

  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Lightbulb className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge success">
          <CheckCircle2 className="w-3 h-3" /> Best Practices
        </span>
      </div>

      <h1>Best Practices for Running Your MedSpa</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Learn proven strategies for maximizing revenue, improving patient satisfaction, and running an efficient
        medical spa using the platform.
      </p>

      <Callout type="tip" title="Start with one area">
        Don't try to implement everything at once. Pick one best practice area (scheduling, patient management,
        billing, or messaging) and master it before moving to the next.
      </Callout>

      {/* Scheduling Section */}
      <h2 id="scheduling">
        <Clock className="w-6 h-6 inline mr-2" />
        Scheduling Best Practices
      </h2>

      <p>
        Efficient scheduling is the foundation of a successful medical spa. It impacts provider productivity,
        patient satisfaction, and revenue.
      </p>

      <StepList steps={schedulingSteps} />

      <h3>Pro Tips</h3>
      <ul>
        <li>
          <strong>Overbooking strategically:</strong> Book 10-15% more patients than your capacity to account for
          no-shows and cancellations. Monitor your no-show rate and adjust accordingly.
        </li>
        <li>
          <strong>Use buffer time:</strong> Add 5-10 minute buffers between appointments for notes, restocking,
          and decontamination.
        </li>
        <li>
          <strong>Batch similar services:</strong> Group similar treatments (e.g., all injectables in the morning)
          to improve workflow efficiency.
        </li>
        <li>
          <strong>Monitor calendar utilization:</strong> Aim for 75-80% calendar occupancy. Track utilization by
          provider and service to identify optimization opportunities.
        </li>
      </ul>

      <Callout type="info">
        The platform shows real-time calendar occupancy rates and no-show statistics. Use this data to optimize
        your schedule.
      </Callout>

      {/* Patient Management Section */}
      <h2 id="patients">
        <Users className="w-6 h-6 inline mr-2" />
        Patient Management Best Practices
      </h2>

      <p>
        Strong patient relationships lead to loyalty, repeat business, and valuable referrals. Use the platform
        to build comprehensive patient profiles.
      </p>

      <StepList steps={patientSteps} />

      <h3>Pro Tips</h3>
      <ul>
        <li>
          <strong>Segment your patient base:</strong> Identify high-value patients, at-risk patients (haven't
          visited in 6+ months), and new patients. Create targeted communication strategies for each group.
        </li>
        <li>
          <strong>Track lifetime value:</strong> Monitor total spending per patient over time. Focus retention
          efforts on high-value patients.
        </li>
        <li>
          <strong>Before/after photos:</strong> Always store high-quality before/after photos (with consent).
          These are invaluable for case studies, testimonials, and showcasing results.
        </li>
        <li>
          <strong>Build treatment plans:</strong> Recommend multi-visit treatment plans instead of one-off
          services. This increases predictable revenue.
        </li>
      </ul>

      <Callout type="success">
        Patients with detailed profiles and treatment plans have 3x higher lifetime value than those with
        minimal records.
      </Callout>

      {/* Billing Section */}
      <h2 id="billing">
        <CreditCard className="w-6 h-6 inline mr-2" />
        Billing & Revenue Best Practices
      </h2>

      <p>
        Strategic pricing, service bundling, and payment options directly impact your bottom line. Use data to
        optimize pricing and identify new revenue opportunities.
      </p>

      <StepList steps={billingSteps} />

      <h3>Pro Tips</h3>
      <ul>
        <li>
          <strong>Monitor service popularity:</strong> Track which services are most popular and profitable.
          Focus marketing on high-margin services.
        </li>
        <li>
          <strong>Upsell strategically:</strong> Recommend complementary services based on patient history
          (e.g., suggest maintenance treatments or add-on services).
        </li>
        <li>
          <strong>Loyalty programs:</strong> Create point systems or membership packages that encourage repeat
          visits. Track redemption to measure program success.
        </li>
        <li>
          <strong>Price increases:</strong> Increase prices gradually (5-10% annually) as you gain experience
          and improve results. Grandfather existing patients for 6 months.
        </li>
        <li>
          <strong>No-show fees:</strong> Charge no-show or late cancellation fees (enforce 24-48 hour notice).
          This reduces no-shows and recovers lost revenue.
        </li>
      </ul>

      <Callout type="warning" title="Payment processing">
        Always store payment information securely and comply with PCI-DSS standards. Never store sensitive
        payment data yourself.
      </Callout>

      <h3>Revenue Optimization Quick Wins</h3>
      <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
          <h4 className="font-semibold text-gray-900 mb-2">Increase Service Prices by 5%</h4>
          <p className="text-sm text-gray-600">
            On $10,000/month revenue = +$500/month = +$6,000/year with minimal impact on demand
          </p>
        </div>
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
          <h4 className="font-semibold text-gray-900 mb-2">Reduce No-Shows from 15% to 10%</h4>
          <p className="text-sm text-gray-600">
            On 100 monthly appointments at $300 average = +$1,500/month = +$18,000/year
          </p>
        </div>
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
          <h4 className="font-semibold text-gray-900 mb-2">Increase Average Ticket Size by 10%</h4>
          <p className="text-sm text-gray-600">
            Through upsells and add-ons = +$1,000/month on $10,000/month revenue = +$12,000/year
          </p>
        </div>
        <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
          <h4 className="font-semibold text-gray-900 mb-2">Improve Capacity Utilization by 10%</h4>
          <p className="text-sm text-gray-600">
            From 70% to 80% capacity = +$1,000/month on $10,000/month revenue = +$12,000/year
          </p>
        </div>
      </div>

      {/* Messaging Section */}
      <h2 id="messaging">
        <MessageSquare className="w-6 h-6 inline mr-2" />
        Communication Best Practices
      </h2>

      <p>
        Proactive, timely, and personalized communication improves patient satisfaction and reduces no-shows.
        The platform makes it easy to stay in touch.
      </p>

      <StepList steps={messagingSteps} />

      <h3>Communication Timeline</h3>
      <div className="not-prose bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
        <div className="space-y-4 text-sm">
          <div className="flex gap-4">
            <div className="font-semibold text-primary-600 min-w-max">Within 2 hours</div>
            <div className="text-gray-600">Send booking confirmation with appointment details and directions</div>
          </div>
          <div className="flex gap-4">
            <div className="font-semibold text-primary-600 min-w-max">24 hours before</div>
            <div className="text-gray-600">Send appointment reminder with reconfirmation link</div>
          </div>
          <div className="flex gap-4">
            <div className="font-semibold text-primary-600 min-w-max">Immediately after</div>
            <div className="text-gray-600">
              Send thank you message with care instructions and request for feedback
            </div>
          </div>
          <div className="flex gap-4">
            <div className="font-semibold text-primary-600 min-w-max">1 week later</div>
            <div className="text-gray-600">Follow-up on results and recommend next treatment</div>
          </div>
          <div className="flex gap-4">
            <div className="font-semibold text-primary-600 min-w-max">Monthly</div>
            <div className="text-gray-600">Promotional offers and maintenance reminders</div>
          </div>
        </div>
      </div>

      <h3>Pro Tips</h3>
      <ul>
        <li>
          <strong>SMS for urgent/time-sensitive:</strong> Use SMS for confirmations and reminders. Response
          rates are 98% within 5 minutes.
        </li>
        <li>
          <strong>Email for detailed info:</strong> Use email for educational content, before/after photos,
          and aftercare instructions.
        </li>
        <li>
          <strong>Automate where possible:</strong> Set up automatic reminders and confirmations. Your staff
          should only send personalized messages manually.
        </li>
        <li>
          <strong>Timing matters:</strong> Send reminders in the morning (9-11 AM) for higher open rates.
          Avoid evenings and weekends unless specifically requested.
        </li>
        <li>
          <strong>Track metrics:</strong> Monitor open rates, click rates, and conversion rates. A/B test
          different message templates.
        </li>
      </ul>

      <Callout type="success">
        Implementing a proper reminder system can reduce no-shows by up to 50% and save $5,000-$10,000 annually.
      </Callout>

      {/* Implementation Checklist */}
      <h2>Implementation Checklist</h2>
      <p>Use this checklist to implement best practices in your business:</p>

      <div className="not-prose space-y-3 mb-8">
        {[
          'Configure accurate service durations and treatment times',
          'Set up automatic appointment confirmation messages',
          'Create appointment reminder templates (24 hours before)',
          'Build comprehensive patient profiles with medical history',
          'Store consent forms and before/after photos for all patients',
          'Set competitive pricing and create service packages',
          'Configure payment methods (credit card, cash, financing)',
          'Create post-appointment follow-up message template',
          'Set up referral incentive program',
          'Create monthly promotional campaign template',
          'Monitor and analyze calendar utilization rates',
          'Review patient lifetime value by service type',
          'Implement no-show/cancellation fees',
          'Create patient communication preferences system',
        ].map((item, index) => (
          <label key={index} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-gray-700">{item}</span>
          </label>
        ))}
      </div>

      {/* Related Resources */}
      <h2>Related Resources</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link
          href="/features/calendar"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Calendar Features</h3>
          <p className="text-sm text-gray-500">Advanced scheduling and conflict management</p>
        </Link>
        <Link
          href="/features/patients"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Patient Management</h3>
          <p className="text-sm text-gray-500">Build comprehensive patient profiles</p>
        </Link>
        <Link
          href="/features/billing"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Billing & Payments</h3>
          <p className="text-sm text-gray-500">Pricing, invoicing, and revenue optimization</p>
        </Link>
        <Link
          href="/features/messaging"
          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all"
        >
          <h3 className="font-semibold text-gray-900">Messaging & Communication</h3>
          <p className="text-sm text-gray-500">SMS campaigns and automated reminders</p>
        </Link>
      </div>
    </div>
  )
}
