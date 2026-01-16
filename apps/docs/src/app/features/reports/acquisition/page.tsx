import React from 'react';
import {
  TrendingUp,
  Users,
  UserPlus,
  AlertTriangle,
  Target,
  DollarSign,
  Calendar,
  Phone,
  Globe,
  Instagram,
  Search,
  MessageSquare,
  Clock,
  ListChecks,
  BarChart3,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { Callout } from '@/components/docs/Callout';
import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder';
import { StepList } from '@/components/docs/StepList';
import { ComparisonTable } from '@/components/docs/ComparisonTable';

export default function PatientAcquisitionAnalyticsPage() {
  return (
    <div className="max-w-4xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            Complete
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Patient Acquisition Analytics
        </h1>

        <p className="text-xl text-gray-600 mb-6">
          Know exactly where every patient comes from—without spreadsheets. Track attribution,
          calculate true ROI, and make data-driven marketing decisions in seconds.
        </p>

        <Callout type="info" title="The Problem We Solve">
          <strong>67% of med spa owners cite manual patient tracking as their biggest operational headache.</strong> They're
          stuck asking "how did you hear about us?" and manually updating spreadsheets for hours each week—only
          to still not know which marketing channels actually produce profitable, loyal patients. This system
          automatically tracks every patient source, calculates true lifetime value by channel, and alerts you
          when patients are at risk of churning.
        </Callout>
      </div>

      {/* Video Overview */}
      <VideoPlaceholder
        title="Patient Acquisition Dashboard Tour"
        duration="5 min"
        description="Watch how to track patient sources, analyze cohort retention, and identify your highest-ROI marketing channels in under 5 minutes"
      />

      {/* Why Source Tracking Matters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Why Source Tracking Actually Matters
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            We know what you're thinking: "I already ask patients how they found us." But here's the truth—not
            all patients are created equal. A patient who found you through Google Ads might spend $500 and never
            come back. A referred patient might become a $8,000 lifetime client who refers 3 more friends.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Different Sources = Different Quality</h3>
            <p className="text-sm text-gray-600">
              Industry data shows referral patients have 40-60% higher lifetime value than paid ad conversions.
              Without tracking by source, you're flying blind.
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Stop Wasting Marketing Budget</h3>
            <p className="text-sm text-gray-600">
              If you're spending $2,000/month on Instagram ads that bring patients with 30% retention while
              Google Organic brings 75% retention for free—you need to know that.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Calculate True ROI</h3>
            <p className="text-sm text-gray-600">
              Compare customer acquisition cost (CAC) to lifetime value (LTV) by channel. A 5:1 LTV:CAC ratio
              is excellent. Less than 3:1? That channel is losing you money.
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Make Data-Driven Decisions</h3>
            <p className="text-sm text-gray-600">
              No more guessing. See exactly which marketing efforts produce loyal, high-value patients so you
              can double down on what works and cut what doesn't.
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Dashboard Overview: 4 Critical Metrics
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">New Patients (MTD)</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-semibold">+18%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">47</div>
            <p className="text-xs text-gray-500">vs 40 last month</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Returning Patients</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-semibold">+5%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">73%</div>
            <p className="text-xs text-gray-500">of total appointments</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-gray-600">Referral Rate</span>
              </div>
              <div className="flex items-center gap-1 text-amber-600">
                <ArrowDownRight className="w-4 h-4" />
                <span className="text-sm font-semibold">-0.4%</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">4.8%</div>
            <p className="text-xs text-gray-500">vs 3.6% industry avg</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600">At-Risk Patients</span>
              </div>
              <div className="flex items-center gap-1 text-red-600">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-sm font-semibold">+12</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">28</div>
            <p className="text-xs text-gray-500">$34,500 potential revenue impact</p>
          </div>
        </div>

        <Callout type="tip">
          These four metrics give you a complete health snapshot. Healthy metrics: 20-30% new patients, 70-80%
          returning, 4-6% referral rate, and fewer than 5% of active patients at-risk. If you're outside these
          ranges, the sections below will show you exactly what to fix.
        </Callout>
      </section>

      {/* Source Attribution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Source Attribution: Where Every Patient Comes From
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            This table is the heart of acquisition analytics. Every patient is automatically tagged with their
            source at booking (online, phone, walk-in, etc.). You see not just <em>how many</em> patients each
            source brings, but <strong>which sources produce the most valuable, loyal patients</strong>.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Source</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Patients</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">% of Total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Avg LTV</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">90-Day Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-gray-900">Referral</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">87</td>
                <td className="px-4 py-3 text-right text-gray-600">23.4%</td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">$152,400</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    $5,850
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    82%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">Online Booking</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">124</td>
                <td className="px-4 py-3 text-right text-gray-600">33.3%</td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">$186,000</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    $4,200
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    71%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-900">Google Organic</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">56</td>
                <td className="px-4 py-3 text-right text-gray-600">15.1%</td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">$89,600</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    $4,800
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    76%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">Phone</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">43</td>
                <td className="px-4 py-3 text-right text-gray-600">11.6%</td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">$64,500</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    $3,900
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    68%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    <span className="font-medium text-gray-900">Instagram</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">31</td>
                <td className="px-4 py-3 text-right text-gray-600">8.3%</td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">$37,200</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    $2,800
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    54%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-gray-900">Google Ads</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">18</td>
                <td className="px-4 py-3 text-right text-gray-600">4.8%</td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">$27,000</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    $2,250
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    41%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium text-gray-900">Waitlist</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">9</td>
                <td className="px-4 py-3 text-right text-gray-600">2.4%</td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">$13,500</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                    $4,100
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    78%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Walk-in</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">4</td>
                <td className="px-4 py-3 text-right text-gray-600">1.1%</td>
                <td className="px-4 py-3 text-right text-gray-900 font-medium">$4,800</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    $2,400
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    50%
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">372</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">100%</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">$575,000</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">$4,120</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900">68%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <Callout type="tip" title="The Secret to Smart Marketing Spend">
          Notice how Referral patients have the highest LTV ($5,850) and best retention (82%), while Google Ads
          has the lowest LTV ($2,250) and worst retention (41%). <strong>This tells you to focus budget on building
          your referral program</strong> (incentives, thank-you gifts, VIP treatment) rather than pouring money
          into paid ads. It's not about volume—it's about quality.
        </Callout>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">How Source Tracking Works</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Online Booking:</strong> Automatically tagged when patient books through your website</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Phone:</strong> Tagged by front desk during booking (with dropdown menu)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Referral:</strong> Captured when existing patient refers someone (with referrer tracking)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Walk-in:</strong> Tagged at check-in if patient arrives without prior appointment</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Waitlist:</strong> Auto-tagged when patient converts from waitlist to appointment</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>Google/Instagram/Ads:</strong> UTM parameters from marketing campaigns automatically captured</span>
            </li>
          </ul>
        </div>
      </section>

      {/* New vs Returning Analysis */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          New vs Returning: The Balance That Matters
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            Many spa owners obsess over new patient acquisition. But here's the truth: <strong>returning patients
            are 5-7x more profitable than new ones</strong>. You've already paid to acquire them, they trust you,
            and they're more likely to try higher-ticket services. The healthiest practices maintain a balance.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Current Patient Mix</h3>
            <div className="text-sm text-gray-600">Last 90 days</div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">New Patients</span>
                <span className="text-sm font-bold text-gray-900">27% (100 patients)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '27%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Returning Patients</span>
                <span className="text-sm font-bold text-gray-900">73% (272 patients)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-emerald-600 h-3 rounded-full" style={{ width: '73%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <Callout type="success" title="You're in the Sweet Spot">
          <strong>Healthy range: 25-30% new patients, 70-75% returning.</strong> Your current 27/73 split is
          ideal. This means you're growing (new patients) while maintaining a loyal base (returning patients)
          that provides predictable revenue. Keep this balance by investing equally in acquisition and retention.
        </Callout>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900">Warning Sign: Too Many New Patients</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              If new patients exceed 40%, you have a retention problem. You're acquiring patients but they're
              not coming back. This is expensive and unsustainable.
            </p>
            <div className="text-xs font-semibold text-red-700 uppercase">Fix: Focus on rebooking and follow-ups</div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Warning Sign: Too Many Returning Patients</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              If returning patients exceed 85%, your growth has stalled. You're serving the same people over
              and over, which is stable but limits revenue potential.
            </p>
            <div className="text-xs font-semibold text-amber-700 uppercase">Fix: Invest in marketing and acquisition</div>
          </div>
        </div>
      </section>

      {/* Cohort Retention Analysis */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Cohort Retention Analysis: The Most Powerful Metric
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            This is where the magic happens. <strong>Cohort analysis groups patients by their first visit month
            and tracks how many return over time.</strong> It's the single best way to measure patient loyalty,
            identify problems early, and predict future revenue.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">How to Read This Table</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 mt-0.5">1.</span>
              <span><strong>Rows = Cohorts:</strong> Patients grouped by the month they first visited</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 mt-0.5">2.</span>
              <span><strong>Columns = Months Since First Visit:</strong> M0 = acquisition month, M1 = 1 month later, etc.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 mt-0.5">3.</span>
              <span><strong>Percentages = Retention:</strong> What % of that cohort returned in each subsequent month</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600 mt-0.5">4.</span>
              <span><strong>Colors = Health:</strong> Green (70%+) = excellent, Yellow (50-69%) = average, Red (&lt;50%) = needs attention</span>
            </li>
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Cohort</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">Size</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">M0</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">M1</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">M2</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">M3</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">M6</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">M12</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">Jan 2024</td>
                <td className="px-3 py-2 text-center text-gray-600">45</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                    100%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    78%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    71%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    64%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    58%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    51%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">Feb 2024</td>
                <td className="px-3 py-2 text-center text-gray-600">52</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                    100%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    81%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    75%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    71%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    65%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    58%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">Mar 2024</td>
                <td className="px-3 py-2 text-center text-gray-600">38</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                    100%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                    45%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                    39%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                    34%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                    29%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                    24%
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">Apr 2024</td>
                <td className="px-3 py-2 text-center text-gray-600">61</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                    100%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    84%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    79%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    75%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    70%
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-gray-400">-</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">May 2024</td>
                <td className="px-3 py-2 text-center text-gray-600">47</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                    100%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    77%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    72%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
                    68%
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-gray-400">-</td>
                <td className="px-3 py-2 text-center text-gray-400">-</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-gray-900">Jun 2024</td>
                <td className="px-3 py-2 text-center text-gray-600">55</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                    100%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    80%
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-flex items-center justify-center w-16 px-2 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                    76%
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-gray-400">-</td>
                <td className="px-3 py-2 text-center text-gray-400">-</td>
                <td className="px-3 py-2 text-center text-gray-400">-</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="warning" title="March 2024 Cohort Needs Immediate Attention">
          Notice how the March cohort (red) has terrible retention—only 45% returned in month 1, dropping to
          24% by month 12. <strong>Something went wrong that month.</strong> Dig into what happened: Did you run
          a discount promotion that attracted price-sensitive patients? Change front desk staff who didn't
          follow up? Run a campaign targeting the wrong audience? Fix it before repeating the same mistake.
        </Callout>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">The Power Move: Cohort Analysis By Source</h3>
          <p className="text-sm text-gray-600 mb-3">
            Here's the real insight: <strong>run cohort retention analysis separately for each patient source.</strong> You
            might discover that Instagram patients have 35% 6-month retention while referral patients have 82%.
            That's your signal to shift budget from Instagram ads to referral incentives.
          </p>
          <div className="text-xs font-semibold text-emerald-700 uppercase">Available in: Reports → Acquisition → Filter by Source</div>
        </div>
      </section>

      {/* Churn Risk Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Churn Risk: Catch Patients Before They Disappear
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            The brutal truth: <strong>you don't have a patient acquisition problem, you have a patient retention
            problem.</strong> Acquiring a new patient costs 5-7x more than keeping an existing one. This alert
            system flags patients who are at risk of churning before it's too late—giving you time to re-engage
            them with targeted campaigns.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">30-Day Alert (Yellow)</h3>
                  <span className="text-sm font-bold text-gray-900">12 patients</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Haven't visited in 30-45 days. They're not gone yet, but attention is drifting.
                </p>
                <div className="text-xs font-semibold text-yellow-700 uppercase mb-2">Action: Re-engagement campaign</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Send "We miss you" email with 15% off next treatment</li>
                  <li>• SMS reminder about upcoming seasonal specials</li>
                  <li>• Personal call from front desk to check in</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-400 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">60-Day Alert (Orange)</h3>
                  <span className="text-sm font-bold text-gray-900">9 patients</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Haven't visited in 60-89 days. High risk—they may be trying competitors.
                </p>
                <div className="text-xs font-semibold text-orange-700 uppercase mb-2">Action: Special win-back offer</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Exclusive "come back" offer: 25% off or free add-on service</li>
                  <li>• Personalized video message from their favorite practitioner</li>
                  <li>• Limited-time VIP treatment upgrade</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">90+ Day Alert (Red)</h3>
                  <span className="text-sm font-bold text-gray-900">7 patients</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Haven't visited in 90+ days. Critical—they've likely churned to a competitor.
                </p>
                <div className="text-xs font-semibold text-red-700 uppercase mb-2">Action: Last-chance recovery</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Personal phone call (not automated): "We noticed it's been a while..."</li>
                  <li>• Survey to understand what went wrong</li>
                  <li>• Aggressive win-back: 40% off or complimentary consultation</li>
                  <li>• If no response, mark as churned and analyze why</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">At-Risk Revenue Impact</h3>
            <div className="text-sm text-gray-600">Based on average LTV</div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">30-Day Alert (12 patients × $4,120 avg LTV)</span>
              <span className="font-semibold text-gray-900">$49,440</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">60-Day Alert (9 patients × $4,120 avg LTV)</span>
              <span className="font-semibold text-gray-900">$37,080</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">90+ Day Alert (7 patients × $4,120 avg LTV)</span>
              <span className="font-semibold text-gray-900">$28,840</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
              <span className="font-bold text-gray-900">Total At-Risk Revenue</span>
              <span className="text-2xl font-bold text-red-600">$115,360</span>
            </div>
          </div>
        </div>

        <h4 className="text-lg font-semibold text-gray-900 mb-4">Preventing Churn in 3 Steps</h4>
        <StepList
          steps={[
            {
              title: "Set Up Automated Alerts",
              description: "Configure the system to email you daily with at-risk patients. Review every morning with your front desk team."
            },
            {
              title: "Create Re-engagement Templates",
              description: "Pre-write SMS and email templates for each alert tier. Personalize with patient name and last service, then send in one click."
            },
            {
              title: "Track Recovery Rate",
              description: "Measure what % of at-risk patients you successfully re-engage. Industry best: 35-45% recovery rate for 30-day alerts, 15-25% for 60-day, 5-10% for 90-day."
            }
          ]}
        />
      </section>

      {/* Industry Benchmarks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-blue-600" />
          Industry Benchmarks: How You Stack Up
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            "Is my retention rate good?" You finally have an answer. These benchmarks come from analyzing hundreds
            of med spas across North America. Use them to set realistic goals and identify where you're excelling
            vs. where you need improvement.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Metric</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Average</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Top Performers</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">What It Means</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">Client Retention Rate</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    75-85%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    85%+
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">% of patients who return within 12 months</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">Rebooking Rate</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    20-30%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    30%+
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">% of patients who book next appt before leaving</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">Patient LTV</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    $2,500-$5,000
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    $5,000+
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Total revenue from patient over their lifetime</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">LTV:CAC Ratio</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    3:1
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    5:1+
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Lifetime value vs customer acquisition cost</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">90-Day Retention</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    65%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    80%+
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">% of new patients who return within 90 days</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">Referral Rate</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    3.6%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    6%+
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">% of patients who refer at least one friend</td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">Churn Rate (Annual)</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                    15-25%
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    &lt;15%
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">% of patients who don't return within 12 months</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="info" title="Benchmarks Vary by Service Mix">
          These benchmarks assume a typical service mix (50% injectables, 30% laser/skin treatments, 20% wellness).
          If you specialize in one-time treatments (e.g., tattoo removal), expect lower retention. If you focus
          on maintenance treatments (e.g., monthly facials, quarterly Botox), expect higher retention.
        </Callout>
      </section>

      {/* Actionable Insights */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ListChecks className="w-6 h-6 text-blue-600" />
          Actionable Insights: What to Do With This Data
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            Data is useless without action. Here's exactly what to do with your acquisition analytics—no guessing,
            no spreadsheets, just clear next steps.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-emerald-200 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Shift Budget to High-LTV Sources</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Identify which sources produce patients with the highest lifetime value. Double down on those
                  channels. Cut spending on low-LTV sources.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-emerald-700 uppercase">Example: Increase referral incentives, reduce Google Ads</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Target className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Improve Retention for Weak Sources</h3>
                <p className="text-sm text-gray-600 mt-1">
                  If Instagram brings volume but low retention, don't kill the channel—fix the onboarding. Create
                  a special follow-up sequence for Instagram patients.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-blue-700 uppercase">Example: 3-touch email series for ad-sourced patients</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Rescue At-Risk Patients</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Review your at-risk patient list weekly. Prioritize high-LTV patients first. A personal call
                  to a $8,000 patient is worth your time.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-purple-700 uppercase">Goal: Recover 35%+ of 30-day alerts</div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-amber-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Optimize New vs Returning Balance</h3>
                <p className="text-sm text-gray-600 mt-1">
                  If new patients exceed 35%, focus on retention (rebooking, follow-ups). If below 20%, increase
                  acquisition spend. Sweet spot: 25-30% new.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-amber-700 uppercase">Target: 27% new, 73% returning</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-rose-200 rounded-lg">
                <BarChart3 className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analyze Cohorts by Source</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Filter cohort retention by source to see which channels produce loyal patients. This is the
                  ultimate marketing ROI metric.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-rose-700 uppercase">Compare: Referral vs Ads 6-month retention</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-indigo-200 rounded-lg">
                <MessageSquare className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Build a Referral Engine</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Referral patients have the best LTV and retention. Systematize referral requests: ask every
                  happy patient to refer 2 friends. Reward referrers generously.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-indigo-700 uppercase">Goal: Increase referral rate from 4.8% to 6%+</div>
          </div>
        </div>
      </section>

      {/* Daily Trend Analysis */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Daily Trend Analysis: When Patients Book
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            Beyond just tracking sources, see <strong>when patients actually book</strong> over time. This helps
            you identify slow periods to run promotions, seasonal trends to prepare for, and whether your
            marketing campaigns are actually working.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">New Patient Acquisitions (Last 90 Days)</h3>
          <div className="h-64 flex items-end justify-between gap-1">
            {/* Simplified bar chart visualization */}
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '45%' }} title="Week 1"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '52%' }} title="Week 2"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '38%' }} title="Week 3"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '61%' }} title="Week 4"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '48%' }} title="Week 5"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '55%' }} title="Week 6"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '42%' }} title="Week 7"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '68%' }} title="Week 8"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '71%' }} title="Week 9"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '59%' }} title="Week 10"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '64%' }} title="Week 11"></div>
            <div className="flex-1 bg-blue-200 rounded-t" style={{ height: '77%' }} title="Week 12"></div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>12 weeks ago</span>
            <span>This week</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Identify Slow Periods</h4>
            <p className="text-xs text-gray-600">
              If Tuesdays are consistently slow, run a "Tuesday Special" to fill gaps. Data beats guessing.
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Seasonal Trends</h4>
            <p className="text-xs text-gray-600">
              Notice summer slowdown or holiday spike? Plan inventory, staffing, and promotions accordingly.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Campaign Effectiveness</h4>
            <p className="text-xs text-gray-600">
              Launch Instagram campaign on Monday, see spike on Thursday? That's your proof of ROI.
            </p>
          </div>
        </div>
      </section>

      {/* Export & Reports */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Download className="w-6 h-6 text-blue-600" />
          Export & Reports: Share With Your Team
        </h2>

        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-600 leading-relaxed">
            Need to present to investors? Review with your team? Send to your accountant? Export any report in
            seconds with all the data you need.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Export Options</h3>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900">CSV Export</span>
              </div>
              <p className="text-xs text-gray-600">Raw data for Excel analysis</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:border-emerald-400 hover:bg-emerald-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-gray-900">Excel Export</span>
              </div>
              <p className="text-xs text-gray-600">Pre-formatted with charts</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 hover:border-red-400 hover:bg-red-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-gray-900">PDF Report</span>
              </div>
              <p className="text-xs text-gray-600">Professional presentation</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Data Included in Exports</h4>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Patient count by source</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Revenue by source</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>LTV by source</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Retention rates (30/60/90 day)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Cohort retention table</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>At-risk patient list</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>New vs returning breakdown</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Daily trend data</span>
              </li>
            </ul>
          </div>
        </div>

        <Callout type="tip">
          <strong>QuickBooks Integration:</strong> Exports are formatted to match QuickBooks customer import format.
          Export your patient list with LTV and source data, then import directly into QuickBooks for unified
          financial reporting.
        </Callout>
      </section>

      {/* Comparison Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How We Compare to Competitors
        </h2>

        <ComparisonTable
          showCompetitors={true}
          rows={[
            {
              feature: "Automatic Source Tracking",
              luxe: "9 sources auto-tagged",
              mangomint: "Manual entry only",
              boulevard: "5 sources",
              jane: "Manual entry only"
            },
            {
              feature: "Cohort Retention Analysis",
              luxe: "Full cohort table",
              mangomint: false,
              boulevard: "Basic only",
              jane: false
            },
            {
              feature: "LTV by Source",
              luxe: "Real-time",
              mangomint: false,
              boulevard: true,
              jane: false
            },
            {
              feature: "At-Risk Patient Alerts",
              luxe: "3 tiers (30/60/90 day)",
              mangomint: false,
              boulevard: "1 tier only",
              jane: false
            },
            {
              feature: "UTM Parameter Tracking",
              luxe: "Automatic",
              mangomint: false,
              boulevard: false,
              jane: false
            },
            {
              feature: "Referral Source Tracking",
              luxe: "With referrer name",
              mangomint: "partial",
              boulevard: true,
              jane: "partial"
            },
            {
              feature: "Export Formats",
              luxe: "CSV, Excel, PDF",
              mangomint: "CSV only",
              boulevard: "CSV, PDF",
              jane: "CSV only"
            },
            {
              feature: "Industry Benchmarks",
              luxe: "7 metrics",
              mangomint: false,
              boulevard: false,
              jane: false
            },
            {
              feature: "Daily Trend Analysis",
              luxe: "Visual charts",
              mangomint: "partial",
              boulevard: true,
              jane: false
            },
            {
              feature: "Source Attribution Reports",
              luxe: "Real-time dashboard",
              mangomint: "Monthly only",
              boulevard: "Real-time",
              jane: "Weekly only"
            }
          ]}
        />
      </section>

      {/* Related Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Related Features</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="/features/reports/referral-analytics"
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  Referral Analytics
                </h3>
                <p className="text-sm text-gray-600">
                  Track referral sources, measure referral program ROI, and identify your best referrers
                </p>
              </div>
            </div>
          </a>

          <a
            href="/features/reports"
            className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                  Reports Overview
                </h3>
                <p className="text-sm text-gray-600">
                  See all available reports: revenue, services, practitioners, inventory, and more
                </p>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Stop Guessing. Start Growing.
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          You'll never have to ask "how did you hear about us?" again. Every patient is automatically tracked,
          every source is measured, and you'll know exactly where to invest your marketing budget for maximum ROI.
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">67%</div>
            <div className="text-xs text-gray-600">less manual tracking</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">5-7x</div>
            <div className="text-xs text-gray-600">ROI on retention vs acquisition</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">82%</div>
            <div className="text-xs text-gray-600">retention for referral patients</div>
          </div>
        </div>
      </div>
    </div>
  );
}