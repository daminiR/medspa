import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Package, TrendingUp, Zap, Users, CheckCircle2, Gift, Clock } from 'lucide-react'

export default function PackagesPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Package className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 80% Complete
        </span>
      </div>
      <h1>Treatment Packages & Bundles</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Create and manage treatment packages that bundle services together at discounted rates.
        Increase average transaction value and encourage patients to commit to treatment series.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Creating Treatment Packages"
        duration="4 min"
        description="Learn how to set up service bundles, pricing, and package terms"
      />

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Service Bundles</h3>
          </div>
          <p className="text-sm text-gray-500">Combine multiple services and treatments into appealing packages with volume discounts.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Dynamic Pricing</h3>
          </div>
          <p className="text-sm text-gray-500">Set package pricing with automatic discounts based on quantity or treatment frequency.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Expiration Tracking</h3>
          </div>
          <p className="text-sm text-gray-500">Set package validity periods and track which sessions have been used and remaining balance.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Usage Management</h3>
          </div>
          <p className="text-sm text-gray-500">Track sessions used, remaining balance, and automatically send reminders to use expiring packages.</p>
        </div>
      </div>

      <h2 id="package-types">Types of Packages</h2>
      <p>
        The system supports several package models to fit different business strategies:
      </p>

      <h3>Series Packages</h3>
      <p>
        Fixed number of sessions bundled together at a discount. Common for treatments requiring multiple visits.
      </p>
      <ul>
        <li>Example: &quot;Botox 4-Session Series&quot; - Book 4 appointments together, get 15% discount</li>
        <li>Example: &quot;Laser Hair Removal 6-Pack&quot; - Complete hair removal usually needs 6 sessions</li>
        <li>Example: &quot;Chemical Peel Series&quot; - Monthly peels for best results (3, 4, or 6-session options)</li>
      </ul>

      <h3>Product-Based Packages</h3>
      <p>
        Bundles focused on injectables and products with specified units or syringes.
      </p>
      <ul>
        <li>Example: &quot;Deluxe Facial Rejuvenation&quot; - 20 units Botox + 2 syringes filler</li>
        <li>Example: &quot;Lips & Smile Bundle&quot; - Lip filler + smile lines Botox combo</li>
        <li>Example: &quot;Annual Maintenance Package&quot; - Quarterly Botox sessions with filler top-ups</li>
      </ul>

      <h3>Membership Packages</h3>
      <p>
        Monthly or annual membership plans with recurring benefits and credits.
      </p>
      <ul>
        <li>Example: &quot;Elite Member - $199/month&quot; - $200 credit monthly for services, 20% discount on extras</li>
        <li>Example: &quot;Annual VIP Pass&quot; - Unlimited consultations, priority booking, 25% discount on all services</li>
      </ul>

      <h3>Custom Packages</h3>
      <p>
        Personalized treatment plans created for specific patient goals and medical needs.
      </p>

      <Callout type="tip" title="Series vs. Membership">
        Series packages work best for treatments with a defined endpoint (hair removal, chemical peels).
        Memberships work better for maintenance treatments (Botox, skincare) where patients want ongoing care.
      </Callout>

      <h2 id="creating-packages">Creating a Package</h2>

      <StepList steps={[
        {
          title: 'Go to Billing Settings',
          description: 'Navigate to Settings &gt; Billing &gt; Treatment Packages'
        },
        {
          title: 'Click "New Package"',
          description: 'Select the package type (Series, Product-Based, or Membership)'
        },
        {
          title: 'Enter package details',
          description: 'Name, description, and marketing copy to attract customers'
        },
        {
          title: 'Add services or products',
          description: 'Select which services are included and their specified quantities'
        },
        {
          title: 'Set pricing',
          description: 'Set package price and calculate the savings vs. individual services'
        },
        {
          title: 'Configure options',
          description: 'Set validity period, usage rules, and renewal options'
        },
        {
          title: 'Publish package',
          description: 'Make the package available for booking and display on your online booking site'
        }
      ]} />

      <h2 id="pricing-examples">Popular Package Examples</h2>

      <h3>Example 1: Botox Series Package</h3>

      <div className="overflow-x-auto not-prose mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left font-semibold text-gray-900">Item</th>
              <th className="p-3 text-right font-semibold text-gray-900">Quantity</th>
              <th className="p-3 text-right font-semibold text-gray-900">Unit Price</th>
              <th className="p-3 text-right font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">Botox - Forehead (20 units)</td>
              <td className="p-3 text-right text-gray-600">4 sessions</td>
              <td className="p-3 text-right text-gray-600">$240</td>
              <td className="p-3 text-right text-gray-600">$960</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td colSpan={4} className="p-3 border-t border-gray-300 text-gray-600 italic">
                Price if purchased separately: $960
              </td>
            </tr>
            <tr className="bg-green-50">
              <td colSpan={3} className="p-3 text-gray-900 font-semibold">Package Price (15% discount):</td>
              <td className="p-3 text-right text-green-700 font-bold">$816</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-3 text-gray-600 text-sm">Patient savings:</td>
              <td className="p-3 text-right text-gray-600 text-sm">$144</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example 2: Comprehensive Facial Rejuvenation Package</h3>

      <div className="overflow-x-auto not-prose mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left font-semibold text-gray-900">Service</th>
              <th className="p-3 text-right font-semibold text-gray-900">Details</th>
              <th className="p-3 text-right font-semibold text-gray-900">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">Botox</td>
              <td className="p-3 text-right text-gray-600">20 units</td>
              <td className="p-3 text-right text-gray-600">$240</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">Restylane</td>
              <td className="p-3 text-right text-gray-600">2 syringes</td>
              <td className="p-3 text-right text-gray-600">$700</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">HydraFacial</td>
              <td className="p-3 text-right text-gray-600">1 session</td>
              <td className="p-3 text-right text-gray-600">$200</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td colSpan={3} className="p-3 border-t border-gray-300 text-gray-600 italic">
                Total if purchased separately: $1,140
              </td>
            </tr>
            <tr className="bg-green-50">
              <td colSpan={2} className="p-3 text-gray-900 font-semibold">Package Price (25% discount):</td>
              <td className="p-3 text-right text-green-700 font-bold">$855</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>Example 3: Laser Hair Removal Series</h3>

      <div className="overflow-x-auto not-prose mb-8">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-3 text-left font-semibold text-gray-900">Package Tier</th>
              <th className="p-3 text-center font-semibold text-gray-900">Sessions</th>
              <th className="p-3 text-right font-semibold text-gray-900">Individual Price</th>
              <th className="p-3 text-right font-semibold text-gray-900">Package Price</th>
              <th className="p-3 text-right font-semibold text-gray-900">Savings</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">3-Session Starter</td>
              <td className="p-3 text-center text-gray-600">3</td>
              <td className="p-3 text-right text-gray-600">$450 ($150 ea)</td>
              <td className="p-3 text-right text-gray-700 font-semibold">$390</td>
              <td className="p-3 text-right text-green-700">$60 (13%)</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-900">6-Session Complete</td>
              <td className="p-3 text-center text-gray-600">6</td>
              <td className="p-3 text-right text-gray-600">$900 ($150 ea)</td>
              <td className="p-3 text-right text-gray-700 font-semibold">$720</td>
              <td className="p-3 text-right text-green-700">$180 (20%)</td>
            </tr>
            <tr className="bg-green-50">
              <td className="p-3 text-gray-900 font-semibold">8-Session Premium</td>
              <td className="p-3 text-center text-gray-600 font-semibold">8</td>
              <td className="p-3 text-right text-gray-600">$1,200 ($150 ea)</td>
              <td className="p-3 text-right text-green-700 font-bold">$900</td>
              <td className="p-3 text-right text-green-700 font-bold">$300 (25%)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="package-options">Configuring Package Options</h2>

      <h3>Validity Period</h3>
      <p>
        Set how long a package remains active after purchase:
      </p>
      <ul>
        <li>12 months (most common for annual series)</li>
        <li>6 months (quarterly maintenance packages)</li>
        <li>2 years (comprehensive multi-treatment packages)</li>
        <li>No expiration (membership packages with recurring billing)</li>
      </ul>

      <h3>Session Scheduling</h3>
      <ul>
        <li>Recommend spacing between sessions (e.g., 4 weeks for Botox)</li>
        <li>Allow flexible scheduling or require sequential order</li>
        <li>Set minimum/maximum appointments per day from package</li>
      </ul>

      <h3>Provider Selection</h3>
      <ul>
        <li>Allow any provider or restrict to specific practitioners</li>
        <li>Premium pricing for specific providers (Dr. vs. Nurse Injector)</li>
      </ul>

      <h3>Rollover Rules</h3>
      <ul>
        <li>Automatically extend 30 days for unused sessions</li>
        <li>Offer buyback value for unused sessions</li>
        <li>Allow conversion to credits toward other services</li>
      </ul>

      <Callout type="info" title="Package Reminders">
        Automatically send patients reminders when they have 2 sessions remaining or when their
        package is about to expire. This drives booking and reduces lost revenue.
      </Callout>

      <h2 id="usage-tracking">Usage & Balance Tracking</h2>
      <p>
        The system automatically tracks package usage:
      </p>

      <h3>What Gets Tracked</h3>
      <ul>
        <li>Original purchase date and price</li>
        <li>Expiration date</li>
        <li>Sessions/units used</li>
        <li>Remaining balance</li>
        <li>Provider for each session</li>
        <li>Date of each service in the package</li>
      </ul>

      <h3>Patient Dashboard</h3>
      <p>
        Patients can see their package status in their online account:
      </p>
      <ul>
        <li>Visual progress bar showing sessions used</li>
        <li>Remaining sessions and expiration date</li>
        <li>Next recommended appointment date</li>
        <li>Purchase history and pricing</li>
        <li>Easy one-click booking for remaining sessions</li>
      </ul>

      <Callout type="tip" title="Retention Through Packages">
        Patients who purchase packages are 3x more likely to return and complete the full series.
        Packages create commitment and improve retention significantly.
      </Callout>

      <h2 id="marketing">Marketing Your Packages</h2>

      <h3>Online Booking Site</h3>
      <p>
        Packages are displayed prominently on your online booking site with:
      </p>
      <ul>
        <li>Clear package name and description</li>
        <li>Benefits and results highlights</li>
        <li>Before/after photos</li>
        <li>Pricing and savings</li>
        <li>Direct booking button</li>
        <li>FAQ about package terms</li>
      </ul>

      <h3>Email Campaigns</h3>
      <p>
        Use the messaging system to promote packages via email or SMS:
      </p>
      <ul>
        <li>Seasonal promotions (&quot;Summer Glow Up Package&quot;)</li>
        <li>New patient offers (&quot;First-timer Series&quot;)</li>
        <li>Package upsells after single appointments</li>
        <li>Renewal reminders for expiring packages</li>
      </ul>

      <h3>Social Media</h3>
      <p>
        Create engaging social content around your popular packages. Feature before/after results
        and patient testimonials to boost conversions.
      </p>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/billing/checkout" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">POS Checkout</h3>
          <p className="text-sm text-gray-500">Process package payments</p>
        </Link>
        <Link href="/features/billing/payments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Payment Processing</h3>
          <p className="text-sm text-gray-500">Payment methods and processing</p>
        </Link>
        <Link href="/features/calendar" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Calendar & Scheduling</h3>
          <p className="text-sm text-gray-500">Book package sessions</p>
        </Link>
        <Link href="/features/messaging" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Messaging</h3>
          <p className="text-sm text-gray-500">Package promotions and reminders</p>
        </Link>
      </div>
    </div>
  )
}
