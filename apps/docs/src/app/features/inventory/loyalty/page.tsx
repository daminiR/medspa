import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import {
  Link2, Clock, CheckCircle2, Gift, Star, Sparkles, Settings, ArrowRight
} from 'lucide-react'

export default function LoyaltyIntegrationPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Link2 className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge in-progress">
          <Clock className="w-3 h-3" /> Integration Ready
        </span>
      </div>
      <h1>Allē &amp; ASPIRE Integration</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Connect with Allergan Allē and Galderma ASPIRE loyalty programs.
        Auto-log treatments, track patient rewards, and streamline rebate management.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Loyalty Integration Setup"
        duration="4 min"
        description="Learn how to connect and configure manufacturer loyalty programs"
      />

      <Callout type="info" title="Integration Status">
        API hooks are built and ready. Actual program connectivity depends on manufacturer
        API availability. Currently preparing for Allergan and Galderma partnership discussions.
      </Callout>

      <h2 id="programs">Supported Programs</h2>

      <div className="not-prose grid gap-6 md:grid-cols-2 mb-8">
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <span className="text-xl font-bold text-purple-600">Allē</span>
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Allergan Allē</h3>
              <p className="text-sm text-purple-600">Botox, Juvederm, Latisse</p>
            </div>
          </div>
          <ul className="text-sm text-purple-700 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              Patient rewards tracking
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              Treatment auto-logging
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              Points balance display
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              Reward redemption
            </li>
          </ul>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <span className="text-lg font-bold text-blue-600">ASPIRE</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Galderma ASPIRE</h3>
              <p className="text-sm text-blue-600">Dysport, Restylane, Sculptra</p>
            </div>
          </div>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Product-specific tracking
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Indication mapping
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Auto-verification
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              Rebate management
            </li>
          </ul>
        </div>
      </div>

      <h2 id="how-it-works">How It Works</h2>
      <p>
        Once connected, the integration works automatically:
      </p>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">1</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Treatment Charted</div>
              <div className="text-sm text-gray-500">Provider charts 25u Botox to forehead</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold">2</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Auto-Logged to Allē</div>
              <div className="text-sm text-gray-500">Treatment sent to Allergan with lot number</div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">3</div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Points Awarded</div>
              <div className="text-sm text-gray-500">Patient earns 140 Allē points automatically</div>
            </div>
          </div>
        </div>
      </div>

      <h2 id="patient-view">Patient Rewards View</h2>
      <p>
        When viewing a patient profile, see their loyalty status:
      </p>

      <div className="not-prose bg-white border border-gray-200 rounded-lg overflow-hidden my-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h4 className="font-semibold text-gray-900">Sarah Johnson — Loyalty Programs</h4>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">Allē Rewards</div>
                <div className="text-sm text-purple-600">Gold Member</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-700">450 points</div>
              <div className="text-xs text-purple-500">$50 off available</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">ASPIRE Rewards</div>
                <div className="text-sm text-blue-600">Enrolled</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-700">220 points</div>
              <div className="text-xs text-blue-500">$20 rebate pending</div>
            </div>
          </div>
        </div>
      </div>

      <h2 id="setup">Setting Up Integration</h2>
      <p>
        To connect a loyalty program:
      </p>
      <ol>
        <li>Go to <strong>Settings → Integrations → Loyalty Programs</strong></li>
        <li>Select the program to connect (Allē, ASPIRE, etc.)</li>
        <li>Enter your practice&apos;s API credentials (from manufacturer portal)</li>
        <li>Configure auto-logging preferences</li>
        <li>Test the connection</li>
      </ol>

      <Callout type="tip" title="Get Your Credentials">
        Contact your Allergan or Galderma rep to request API access for your practice.
        They&apos;ll provide the account ID and API key needed for integration.
      </Callout>

      <h2 id="auto-logging">Auto-Logging Configuration</h2>
      <p>
        Control what gets logged automatically:
      </p>

      <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Allē Auto-Log Settings
        </h4>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
            <span className="text-sm text-gray-700">Auto-log treatments when charted</span>
            <div className="w-10 h-6 bg-primary-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </label>
          <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
            <span className="text-sm text-gray-700">Auto-enroll new patients</span>
            <div className="w-10 h-6 bg-gray-200 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
            </div>
          </label>
          <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
            <span className="text-sm text-gray-700">Show points at checkout</span>
            <div className="w-10 h-6 bg-primary-600 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </div>
          </label>
        </div>
      </div>

      <h2 id="benefits">Benefits of Integration</h2>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">No Double Entry</h3>
          </div>
          <p className="text-sm text-gray-500">
            Chart once, logged everywhere. No need to separately enter treatments in Allē/ASPIRE portals.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Patient Visibility</h3>
          </div>
          <p className="text-sm text-gray-500">
            See patient points balances during consultation and checkout. Remind them to redeem.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Accurate Tracking</h3>
          </div>
          <p className="text-sm text-gray-500">
            Lot numbers from inventory flow to loyalty programs. Better compliance, accurate rebates.
          </p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Better Retention</h3>
          </div>
          <p className="text-sm text-gray-500">
            Patients see value from loyalty programs. More points = more repeat visits.
          </p>
        </div>
      </div>

      <h2 id="coming-soon">Coming Soon</h2>

      <div className="not-prose grid gap-4 md:grid-cols-2 mb-8">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Merz Aesthetics</h3>
          <p className="text-sm text-purple-700">
            Integration for Xeomin, Radiesse, and Belotero products.
          </p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Evolus Rewards</h3>
          <p className="text-sm text-purple-700">
            Integration for Jeuveau (Newtox) loyalty program.
          </p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Checkout Redemption</h3>
          <p className="text-sm text-purple-700">
            Redeem points directly at checkout without leaving the system.
          </p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold text-purple-900 mb-1">Points Notifications</h3>
          <p className="text-sm text-purple-700">
            SMS patients when they have enough points for rewards.
          </p>
        </div>
      </div>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/inventory" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Inventory Overview</h3>
          <p className="text-sm text-gray-500">Where product tracking happens</p>
        </Link>
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting</h3>
          <p className="text-sm text-gray-500">Treatments that trigger loyalty logging</p>
        </Link>
        <Link href="/features/billing" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Billing</h3>
          <p className="text-sm text-gray-500">Checkout with loyalty redemption</p>
        </Link>
        <Link href="/features/patients" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Profiles</h3>
          <p className="text-sm text-gray-500">View patient loyalty status</p>
        </Link>
      </div>
    </div>
  )
}
