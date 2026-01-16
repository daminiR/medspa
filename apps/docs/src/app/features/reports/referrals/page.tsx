import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import Link from 'next/link'
import {
  Users,
  TrendingUp,
  DollarSign,
  Share2,
  Target,
  Award,
  Gift,
  CheckCircle2,
  BarChart3,
  Zap,
  MousePointer,
  Mail,
  MessageSquare,
  Instagram,
  Facebook,
  Copy,
  Crown,
  Medal,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  TrendingDown,
  Heart,
  Trophy,
  Percent
} from 'lucide-react'

export default function ReferralAnalyticsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Gift className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Referral Analytics</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Transform your happiest patients into your most powerful marketing channel. Track every
        referral from share to qualified visit, calculate exact ROI, and identify your VIP advocates
        who drive 30-40% of all new patient growth.
      </p>

      {/* Pain Point Callout */}
      <Callout type="warning" title="The Problem 97% of Medical Spas Face">
        <strong>97% of medical spas</strong> have no structured referral tracking. Most rely on:
        <ul className="mt-2 mb-0">
          <li>Paper punchcards that get lost or forgotten in wallets</li>
          <li>Manually asking "How did you hear about us?" at check-in</li>
          <li>No idea which patients are actually referring others</li>
          <li>Can't calculate ROI on referral rewards ($25 gift card → ??? return)</li>
          <li>Don't know if their referral program is working or just costing money</li>
        </ul>
        <p className="mt-3 mb-0"><strong>Our analytics show you the complete picture:</strong> from social share to
        qualified appointment, with exact revenue attribution and ROI down to the penny.</p>
      </Callout>

      {/* Video */}
      <VideoPlaceholder
        title="Referral Analytics Dashboard Tour"
        duration="7 min"
        description="See how to track ROI, identify top referrers, optimize channels, and turn referrals into your #1 acquisition source"
      />

      <h2 id="why-referrals">Why Referrals Matter More Than You Think</h2>
      <p>
        Referred patients are fundamentally different from other acquisition channels. They're pre-sold,
        higher trust, and dramatically more loyal:
      </p>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-8">
        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-green-900">40-60% Higher LTV</h3>
          </div>
          <p className="text-sm text-green-700">
            Referred patients spend $2,500-$4,000 lifetime vs. $1,800 for walk-ins. They trust you
            already through their friend's experience.
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900">89% Retention</h3>
          </div>
          <p className="text-sm text-blue-700">
            89% of referred patients return within 90 days vs. 62% for other channels. They're
            committed from day one.
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-purple-900">87% Lower CAC</h3>
          </div>
          <p className="text-sm text-purple-700">
            $25 reward vs. $200+ for Instagram/Facebook ads. Referrals are 8x more cost-effective
            than paid acquisition.
          </p>
        </div>
      </div>

      <Callout type="success" title="The Industry Reality">
        Average medical spa referral rate: <strong>3.6%</strong><br />
        Top performers: <strong>7.2%+</strong><br /><br />
        <strong>Doubling your referral rate from 3.6% to 7.2% can add $150K-$300K annually</strong> for
        a mid-sized practice. This dashboard shows you exactly how to get there.
      </Callout>

      <h2 id="dashboard-overview">Dashboard Overview: 4 KPIs That Matter</h2>
      <p>
        The Referral Analytics dashboard gives you complete visibility into your referral program
        performance with four critical metrics:
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-200 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Total Referrals</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">198 qualified</div>
          <p className="text-sm text-gray-600 mb-3">
            Track total referrals, qualified (completed first visit), pending (signed up but not
            visited), and expired. See your overall conversion rate.
          </p>
          <div className="text-xs text-gray-500">
            Example: 1,245 shares → 198 qualified = 15.9% conversion
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-200 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="font-semibold text-gray-900">Program ROI</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">600%</div>
          <p className="text-sm text-gray-600 mb-3">
            Exact return on investment: revenue generated vs. rewards paid out. Includes first visit
            revenue plus projected LTV calculations.
          </p>
          <div className="text-xs text-gray-500">
            Target: 500%+ ROI | Industry average: 400%
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-200 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Revenue Generated</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">$69,300</div>
          <p className="text-sm text-gray-600 mb-3">
            Total revenue from referred patients this period. Shows average referral value ($350)
            and tracks revenue per channel.
          </p>
          <div className="text-xs text-gray-500">
            Avg referral value: $350 first visit | $2,500 LTV
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-primary-200 transition-all">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-6 h-6 text-pink-600" />
            <h3 className="font-semibold text-gray-900">Viral Coefficient</h3>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">1.2</div>
          <p className="text-sm text-gray-600 mb-3">
            Measure organic growth potential. A coefficient above 1.0 means each patient brings
            more than one new patient. This is viral growth!
          </p>
          <div className="text-xs text-gray-500">
            Above 1.0 = organic growth | Target: 1.2+ for top performers
          </div>
        </div>
      </div>

      <h2 id="conversion-funnel">The Referral Conversion Funnel</h2>
      <p>
        Understanding where your referrals leak is critical to optimization. We track every step
        from share to qualified referral:
      </p>

      <div className="not-prose mb-8 p-6 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg border-2 border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-gray-900 text-lg">Complete Referral Journey</h4>
          <span className="text-sm text-gray-600">1,245 shares → 198 qualified (15.9%)</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-gray-700">Shares</div>
            <div className="flex-1 bg-purple-200 rounded-full h-10 relative">
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-purple-900">
                1,245 shares (100%)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-gray-700">Clicks</div>
            <div className="flex-1 relative">
              <div className="bg-purple-300 rounded-full h-10" style={{width: '50%'}}>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-purple-900">
                  623 clicks (50% CTR)
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-gray-700">Signups</div>
            <div className="flex-1 relative">
              <div className="bg-purple-400 rounded-full h-10" style={{width: '25%'}}>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                  312 signups (25% of shares)
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-gray-700">First Visits</div>
            <div className="flex-1 relative">
              <div className="bg-purple-500 rounded-full h-10" style={{width: '19%'}}>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                  234 visits (75% of signups)
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-gray-700">Qualified</div>
            <div className="flex-1 relative">
              <div className="bg-green-500 rounded-full h-10" style={{width: '16%'}}>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white">
                  198 qualified (85% of visits)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 id="funnel-metrics">What Each Metric Means</h3>
      <ul>
        <li>
          <strong>Click-through Rate (CTR)</strong> - Percentage of shares that get clicked.
          <span className="text-green-600 font-medium"> Target: 40-60%</span>. Low CTR means your
          referral messaging isn't compelling.
        </li>
        <li>
          <strong>Signup Rate</strong> - Percentage of clicks that create an account.
          <span className="text-green-600 font-medium"> Target: 30-50%</span>. Low signup rate means
          your landing page isn't converting.
        </li>
        <li>
          <strong>Visit Rate</strong> - Percentage of signups that book first appointment.
          <span className="text-green-600 font-medium"> Target: 60-80%</span>. This is where most
          programs leak! (See callout below)
        </li>
        <li>
          <strong>Qualification Rate</strong> - Percentage that complete qualifying action (typically
          spending $100+ or completing visit). <span className="text-green-600 font-medium"> Target: 70-90%</span>.
        </li>
        <li>
          <strong>Overall Conversion</strong> - Shares to qualified referrals.
          <span className="text-green-600 font-medium"> Target: 10-20%</span>. Industry benchmark: 12-15%.
        </li>
      </ul>

      <Callout type="warning" title="Where Most Referral Programs Leak">
        <strong>The #1 leak point: Signup → First Visit (60-80% target, many see only 40%)</strong>
        <br /><br />
        Why? People sign up to help their friend get the reward, but never actually book. How to fix:
        <ul className="mt-2 mb-0">
          <li>Send automated "complete your booking" reminders 24 hours after signup</li>
          <li>Give the referred patient an incentive too ($50 off first visit)</li>
          <li>Make booking dead simple - one-click from signup confirmation email</li>
          <li>Have staff call high-value referrals personally to book</li>
        </ul>
      </Callout>

      <h2 id="channel-performance">Channel Performance Analysis</h2>
      <p>
        Not all sharing channels are created equal. SMS referrals convert at 35%+, while Facebook
        is closer to 8%. Understanding channel performance helps you optimize your program:
      </p>

      <div className="not-prose overflow-x-auto mb-6">
        <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Channel</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Shares</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Clicks</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">CTR</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Conversions</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Conv Rate</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-gray-200">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  <span className="font-medium">SMS</span>
                </div>
              </td>
              <td className="text-center py-3 px-4 text-gray-700">342</td>
              <td className="text-center py-3 px-4 text-gray-700">267</td>
              <td className="text-center py-3 px-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">78%</span></td>
              <td className="text-center py-3 px-4 text-gray-700">89</td>
              <td className="text-center py-3 px-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">26%</span></td>
              <td className="text-right py-3 px-4 font-semibold text-gray-900">$31,150</td>
            </tr>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Email</span>
                </div>
              </td>
              <td className="text-center py-3 px-4 text-gray-700">278</td>
              <td className="text-center py-3 px-4 text-gray-700">139</td>
              <td className="text-center py-3 px-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">50%</span></td>
              <td className="text-center py-3 px-4 text-gray-700">42</td>
              <td className="text-center py-3 px-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">15%</span></td>
              <td className="text-right py-3 px-4 font-semibold text-gray-900">$14,700</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium">WhatsApp</span>
                </div>
              </td>
              <td className="text-center py-3 px-4 text-gray-700">189</td>
              <td className="text-center py-3 px-4 text-gray-700">132</td>
              <td className="text-center py-3 px-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">70%</span></td>
              <td className="text-center py-3 px-4 text-gray-700">34</td>
              <td className="text-center py-3 px-4"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm font-medium">18%</span></td>
              <td className="text-right py-3 px-4 font-semibold text-gray-900">$11,900</td>
            </tr>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="font-medium">Instagram</span>
                </div>
              </td>
              <td className="text-center py-3 px-4 text-gray-700">234</td>
              <td className="text-center py-3 px-4 text-gray-700">82</td>
              <td className="text-center py-3 px-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">35%</span></td>
              <td className="text-center py-3 px-4 text-gray-700">19</td>
              <td className="text-center py-3 px-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">8%</span></td>
              <td className="text-right py-3 px-4 font-semibold text-gray-900">$6,650</td>
            </tr>
            <tr className="border-t border-gray-200">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-700" />
                  <span className="font-medium">Facebook</span>
                </div>
              </td>
              <td className="text-center py-3 px-4 text-gray-700">145</td>
              <td className="text-center py-3 px-4 text-gray-700">44</td>
              <td className="text-center py-3 px-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">30%</span></td>
              <td className="text-center py-3 px-4 text-gray-700">10</td>
              <td className="text-center py-3 px-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">7%</span></td>
              <td className="text-right py-3 px-4 font-semibold text-gray-900">$3,500</td>
            </tr>
            <tr className="border-t border-gray-200 bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">Copy Link</span>
                </div>
              </td>
              <td className="text-center py-3 px-4 text-gray-700">57</td>
              <td className="text-center py-3 px-4 text-gray-700">20</td>
              <td className="text-center py-3 px-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm font-medium">35%</span></td>
              <td className="text-center py-3 px-4 text-gray-700">4</td>
              <td className="text-center py-3 px-4"><span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-medium">7%</span></td>
              <td className="text-right py-3 px-4 font-semibold text-gray-900">$1,400</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="tip" title="Channel Optimization Strategy">
        <strong>Focus on SMS and WhatsApp for highest ROI:</strong>
        <ul className="mt-2 mb-0">
          <li><strong>SMS converts 3.7x better than email</strong> - Make SMS sharing prominent in your referral flow</li>
          <li><strong>WhatsApp is growing fast</strong> - Especially for practices with international clientele</li>
          <li><strong>Social media is for awareness, not conversion</strong> - Use Instagram/Facebook to remind patients about the program, but push them to SMS/email sharing</li>
          <li><strong>Don't remove low-performing channels</strong> - Some patients prefer them. Just prioritize high-performers in your UI</li>
        </ul>
      </Callout>

      <h2 id="top-referrers">Top Referrers Leaderboard</h2>
      <p>
        Your top 5-10 referrers often drive 30-40% of all qualified referrals. Identifying and
        celebrating these VIP advocates is critical to program success:
      </p>

      <div className="not-prose mb-6 bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            Top 10 Referrers - Last 90 Days
          </h4>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Rank</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Patient</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Refs</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Qualified</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Conv Rate</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Earnings</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Available</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="bg-purple-50">
              <td className="py-3 px-4 font-bold text-purple-700">1</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Sarah Johnson</span>
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-0.5 rounded">Platinum</span>
                </div>
              </td>
              <td className="text-center py-3 px-4">47</td>
              <td className="text-center py-3 px-4 font-semibold">42</td>
              <td className="text-center py-3 px-4 text-green-600 font-medium">89%</td>
              <td className="text-right py-3 px-4 font-semibold">$3,150</td>
              <td className="text-right py-3 px-4 text-green-600">$425</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-bold text-gray-700">2</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium">Emily Chen</span>
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">Gold</span>
                </div>
              </td>
              <td className="text-center py-3 px-4">28</td>
              <td className="text-center py-3 px-4 font-semibold">24</td>
              <td className="text-center py-3 px-4 text-green-600 font-medium">86%</td>
              <td className="text-right py-3 px-4 font-semibold">$1,400</td>
              <td className="text-right py-3 px-4 text-green-600">$150</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="py-3 px-4 font-bold text-gray-700">3</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium">Jessica Martinez</span>
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">Gold</span>
                </div>
              </td>
              <td className="text-center py-3 px-4">21</td>
              <td className="text-center py-3 px-4 font-semibold">19</td>
              <td className="text-center py-3 px-4 text-green-600 font-medium">90%</td>
              <td className="text-right py-3 px-4 font-semibold">$1,050</td>
              <td className="text-right py-3 px-4 text-green-600">$275</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-gray-600">4</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4 text-gray-500" />
                  <span>Amanda Taylor</span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Silver</span>
                </div>
              </td>
              <td className="text-center py-3 px-4">18</td>
              <td className="text-center py-3 px-4">15</td>
              <td className="text-center py-3 px-4 text-green-600">83%</td>
              <td className="text-right py-3 px-4">$700</td>
              <td className="text-right py-3 px-4 text-green-600">$100</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="py-3 px-4 text-gray-600">5</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Medal className="w-4 h-4 text-gray-500" />
                  <span>Rachel Kim</span>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Silver</span>
                </div>
              </td>
              <td className="text-center py-3 px-4">14</td>
              <td className="text-center py-3 px-4">11</td>
              <td className="text-center py-3 px-4 text-yellow-600">79%</td>
              <td className="text-right py-3 px-4">$525</td>
              <td className="text-right py-3 px-4 text-green-600">$175</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="success" title="What Top Performers Do with VIP Referrers">
        Your top 10 referrers are pure gold. Here's how successful practices treat them:
        <ul className="mt-2 mb-0">
          <li><strong>Create a VIP Advocate Program</strong> - Invite top referrers to exclusive events, give birthday gifts, handwritten thank you notes</li>
          <li><strong>Enhanced rewards</strong> - Once someone hits Platinum (31+ referrals), consider bumping their reward to $100 per referral</li>
          <li><strong>Feature them</strong> - Ask permission to feature their story on Instagram ("Sarah has helped 47 friends discover confidence!")</li>
          <li><strong>Check in personally</strong> - Owner/manager should personally thank top referrers at their next visit</li>
          <li><strong>Give them swag</strong> - Branded tote bags, water bottles, etc. They're already evangelists, make it easy!</li>
        </ul>
      </Callout>

      <h2 id="tier-breakdown">Referrer Tier Distribution</h2>
      <p>
        Understanding your referrer base composition helps you set realistic goals and identify
        opportunities to move people up tiers:
      </p>

      <div className="grid md:grid-cols-4 gap-4 not-prose mb-6">
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg text-center">
          <Award className="w-10 h-10 text-amber-600 mx-auto mb-3" />
          <h4 className="font-semibold text-amber-900 mb-1">Bronze</h4>
          <div className="text-2xl font-bold text-amber-700 mb-1">342</div>
          <p className="text-xs text-amber-600 mb-3">68% of referrers</p>
          <div className="text-sm text-amber-700 mb-1">1-5 referrals</div>
          <div className="text-xs text-amber-600">$25 per referral</div>
        </div>
        <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded-lg text-center">
          <Award className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h4 className="font-semibold text-gray-800 mb-1">Silver</h4>
          <div className="text-2xl font-bold text-gray-700 mb-1">112</div>
          <p className="text-xs text-gray-600 mb-3">22% of referrers</p>
          <div className="text-sm text-gray-700 mb-1">6-15 referrals</div>
          <div className="text-xs text-gray-600">$35 per referral</div>
        </div>
        <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
          <Award className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
          <h4 className="font-semibold text-yellow-900 mb-1">Gold</h4>
          <div className="text-2xl font-bold text-yellow-700 mb-1">38</div>
          <p className="text-xs text-yellow-600 mb-3">8% of referrers</p>
          <div className="text-sm text-yellow-700 mb-1">16-30 referrals</div>
          <div className="text-xs text-yellow-600">$50 per referral</div>
        </div>
        <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded-lg text-center">
          <Crown className="w-10 h-10 text-purple-600 mx-auto mb-3" />
          <h4 className="font-semibold text-purple-900 mb-1">Platinum</h4>
          <div className="text-2xl font-bold text-purple-700 mb-1">8</div>
          <p className="text-xs text-purple-600 mb-3">2% of referrers</p>
          <div className="text-sm text-purple-700 mb-1">31+ referrals</div>
          <div className="text-xs text-purple-600">$75 per referral</div>
        </div>
      </div>

      <Callout type="info" title="Why Tiered Rewards Work Psychologically">
        Tiered referral programs tap into several psychological drivers:
        <ul className="mt-2 mb-0">
          <li><strong>Gamification</strong> - People love leveling up. "I'm only 2 referrals from Gold!" creates motivation</li>
          <li><strong>Status</strong> - Being a "Platinum Referrer" feels exclusive and special</li>
          <li><strong>Fairness</strong> - Your best advocates get rewarded more, which feels right</li>
          <li><strong>Progressive rewards</strong> - Each tier increase feels like a win, maintaining momentum</li>
        </ul>
        <p className="mt-3 mb-0">Research shows tiered programs generate 40-60% more referrals than flat-rate programs.</p>
      </Callout>

      <h2 id="roi-calculation">ROI Calculation Explained</h2>
      <p>
        The most important question for any marketing spend: "What's the return?" Our dashboard
        calculates exact ROI automatically:
      </p>

      <StepList steps={[
        {
          title: 'Track Revenue from Referred Patients',
          description: 'System tracks every dollar spent by referred patients, from first visit through their entire patient journey. Includes both actual revenue (realized) and projected LTV (conservative 24-month projection).'
        },
        {
          title: 'Calculate Total Rewards Paid',
          description: 'Sum of all referral credits earned by referrers during the period. Includes both redeemed credits (actual cost) and outstanding credits (future liability).'
        },
        {
          title: 'Calculate ROI Percentage',
          description: 'ROI = ((Revenue - Rewards) / Rewards) × 100. Example: ($69,300 - $9,900) / $9,900 = 600% ROI'
        },
        {
          title: 'Compare to Other Channels',
          description: 'Dashboard shows ROI vs. paid advertising, organic, and other acquisition channels to prove referrals are your best investment.'
        }
      ]} />

      <div className="not-prose p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg mb-8 mt-6">
        <h4 className="font-semibold text-green-900 mb-4 text-lg">Example ROI Calculation - 90 Days</h4>
        <div className="space-y-3 text-sm mb-4">
          <div className="flex justify-between items-center">
            <span className="text-green-700">Qualified referrals:</span>
            <span className="font-semibold text-green-900">198 patients</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-700">Average first visit revenue:</span>
            <span className="font-semibold text-green-900">$350</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-700">Total first visit revenue:</span>
            <span className="font-semibold text-green-900">$69,300</span>
          </div>
          <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
            <span className="text-green-700">Rewards paid out (198 × $50 avg):</span>
            <span className="font-semibold text-red-700">-$9,900</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-green-700 font-medium">Net profit from referrals:</span>
            <span className="font-bold text-green-900 text-lg">$59,400</span>
          </div>
          <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
            <span className="text-green-800 font-semibold text-base">Program ROI:</span>
            <span className="font-bold text-green-900 text-2xl">600%</span>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-800 mb-2">
            <strong>Translation:</strong> Every $1 spent on referral rewards generates $7 in revenue.
          </p>
          <p className="text-xs text-green-700 mb-0">
            Compare this to Instagram ads ($1 → $2-$3) or Google Ads ($1 → $3-$4). Referrals are
            2-3x more profitable than paid advertising, with higher quality patients who stay longer.
          </p>
        </div>
      </div>

      <Callout type="success" title="Target ROI Benchmark">
        <strong>Target: 500%+ ROI on referral programs</strong><br />
        Industry average: 400%<br />
        Top performers: 600-800%<br /><br />
        If your ROI is below 300%, you're either:
        <ul className="mt-2 mb-0">
          <li>Paying rewards too high (reduce from $50 to $25)</li>
          <li>Not tracking revenue correctly (make sure you're including full patient LTV)</li>
          <li>Have poor funnel conversion (fix the Signup → Visit leak)</li>
        </ul>
      </Callout>

      <h2 id="benchmarks">Industry Benchmarks & Targets</h2>
      <p>
        How does your referral program compare to industry standards? Use these benchmarks to
        identify improvement opportunities:
      </p>

      <div className="not-prose overflow-x-auto mb-8">
        <table className="min-w-full bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Metric</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Industry Average</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Top Performers</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">What It Means</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Referral Rate</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">3.6%</td>
              <td className="px-4 py-3 text-center text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">7.2%+</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">% of patients who refer at least one person</td>
            </tr>
            <tr className="hover:bg-gray-50 bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Viral Coefficient</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">0.8</td>
              <td className="px-4 py-3 text-center text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">1.2+</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">Avg referrals per patient (above 1.0 = viral growth!)</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Referred Patient LTV</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">$2,500</td>
              <td className="px-4 py-3 text-center text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">$4,000+</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">24-month lifetime value of referred patients</td>
            </tr>
            <tr className="hover:bg-gray-50 bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Program ROI</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">400%</td>
              <td className="px-4 py-3 text-center text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">600%+</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">Return on referral reward investment</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">90-Day Retention (Referred)</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">75%</td>
              <td className="px-4 py-3 text-center text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">85%+</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">% who return within 90 days of first visit</td>
            </tr>
            <tr className="hover:bg-gray-50 bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Share → Qualified Conversion</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">12%</td>
              <td className="px-4 py-3 text-center text-sm">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">18%+</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">Overall funnel conversion rate</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">Avg Reward Cost</td>
              <td className="px-4 py-3 text-center text-sm text-gray-700">$35</td>
              <td className="px-4 py-3 text-center text-sm">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">$25-$50</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">Weighted average reward per qualified referral</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="actionable-insights">Actionable Insights (What the Dashboard Tells You)</h2>
      <p>
        The analytics dashboard doesn't just show numbers - it tells you what to DO. Here are the
        key insights and actions:
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">When ROI is Above 600%</h4>
              <p className="text-sm text-green-700 mb-2">
                Your program is crushing it! Consider:
              </p>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• Increase reward amount to drive even more referrals</li>
                <li>• Launch a limited-time double reward campaign</li>
                <li>• Feature success stories to encourage more sharing</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">When ROI is Below 300%</h4>
              <p className="text-sm text-red-700 mb-2">
                Something needs adjustment:
              </p>
              <ul className="text-xs text-red-600 space-y-1">
                <li>• Reduce reward amount ($50 → $25)</li>
                <li>• Fix funnel leaks (especially Signup → Visit)</li>
                <li>• Tighten qualification requirements</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">When Top 10 Slow Down</h4>
              <p className="text-sm text-purple-700 mb-2">
                Your best advocates need love:
              </p>
              <ul className="text-xs text-purple-600 space-y-1">
                <li>• Send personal thank you from owner</li>
                <li>• Invite to VIP event or exclusive treatment</li>
                <li>• Offer enhanced reward tier temporarily</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">When Viral Coefficient &gt; 1.0</h4>
              <p className="text-sm text-blue-700 mb-2">
                You've achieved organic growth:
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Maintain current program - don't change what works!</li>
                <li>• Document and share success internally</li>
                <li>• Consider expanding to new services</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <h2 id="export">Export & Sharing Options</h2>
      <p>
        Export your referral data for external analysis, tax preparation, or sharing with partners/investors:
      </p>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-6">
        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">CSV Export</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Comma-separated values for Excel, Google Sheets, or custom analysis
          </p>
          <div className="text-xs text-gray-500">
            Includes all referral data with date filtering
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Excel Export</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Native .xlsx format with formatting, charts, and pivot tables pre-built
          </p>
          <div className="text-xs text-gray-500">
            Best for presentation to stakeholders
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-300 transition-all">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-gray-900">PDF Report</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Formatted executive summary with key metrics, charts, and insights
          </p>
          <div className="text-xs text-gray-500">
            Perfect for partner/investor updates
          </div>
        </div>
      </div>

      <h3 id="export-data">What's Included in Exports</h3>
      <ul>
        <li><strong>Referral ID & Status</strong> - Unique identifier, qualified/pending/expired status</li>
        <li><strong>Referrer Information</strong> - Name, email, phone, tier level, total referrals to date</li>
        <li><strong>Referee Information</strong> - Name, signup date, first visit date, services purchased</li>
        <li><strong>Rewards Data</strong> - Reward amount earned, credited date, redemption status, outstanding balance</li>
        <li><strong>Channel Attribution</strong> - Which channel was used (SMS, email, WhatsApp, etc.)</li>
        <li><strong>Revenue Tracking</strong> - First visit revenue, 90-day revenue, projected LTV</li>
        <li><strong>Conversion Timestamps</strong> - Share date, click date, signup date, visit date, qualification date</li>
        <li><strong>Funnel Metrics</strong> - Time to convert at each stage, drop-off points</li>
      </ul>

      <Callout type="info">
        All exports respect date range filters. Use the dashboard date picker to select a specific
        period (last 30/60/90 days, custom range, or all-time).
      </Callout>

      <h2 id="comparison">How We Compare to Competitors</h2>
      <p>
        Most medical spa software treats referrals as an afterthought. We built the most comprehensive
        referral analytics in the industry:
      </p>

      <ComparisonTable
        showCompetitors={true}
        rows={[
          {
            feature: 'Complete funnel tracking (share → qualified)',
            luxe: true,
            mangomint: 'partial',
            boulevard: false,
            jane: 'partial'
          },
          {
            feature: 'Channel performance breakdown',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: false
          },
          {
            feature: 'Automated ROI calculation',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: 'partial'
          },
          {
            feature: 'Tiered reward system (Bronze/Silver/Gold/Platinum)',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: false
          },
          {
            feature: 'Top referrers leaderboard',
            luxe: true,
            mangomint: true,
            boulevard: 'partial',
            jane: true
          },
          {
            feature: 'Viral coefficient tracking',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: false
          },
          {
            feature: 'LTV projection for referred patients',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: false
          },
          {
            feature: 'Export to CSV/Excel/PDF',
            luxe: true,
            mangomint: 'CSV only',
            boulevard: 'CSV only',
            jane: true
          },
          {
            feature: 'Industry benchmarks comparison',
            luxe: true,
            mangomint: false,
            boulevard: false,
            jane: false
          }
        ]}
      />

      <Callout type="success" title="Why This Matters">
        Without proper analytics, you're flying blind. You might be spending $500/month on referral
        rewards with no idea if it's generating $1,000 or $10,000 in return. Our dashboard gives you
        the data to make confident decisions about your referral program investment.
      </Callout>

      <h2 id="getting-started">Getting Started: 3-Step Launch</h2>
      <p>
        Ready to launch a data-driven referral program? Here's how to start:
      </p>

      <StepList steps={[
        {
          title: 'Configure Reward Tiers',
          description: 'Go to Settings → Referral Program. Set your tier thresholds (Bronze 1-5, Silver 6-15, Gold 16-30, Platinum 31+) and reward amounts. Start conservative: $25 Bronze, $35 Silver, $50 Gold, $75 Platinum.'
        },
        {
          title: 'Enable Patient Portal Referral Page',
          description: 'Turn on the referral feature in patient portal. Patients can access their unique referral link at /referrals. Make sure SMS/email/WhatsApp sharing buttons are all enabled.'
        },
        {
          title: 'Monitor Dashboard Weekly',
          description: 'Check Referral Analytics dashboard weekly for first 90 days. Watch ROI, conversion funnel, and top referrers. Adjust rewards/messaging based on data, not guesses.'
        }
      ]} />

      <Callout type="tip" title="Pro Tip: Start with Lower Rewards">
        Many practices start with $50 flat rewards, then realize they could achieve the same results
        with $25. Start at $25 and increase if ROI is above 700%. It's easier to increase rewards
        than decrease them!
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/reports/acquisition" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Acquisition Analytics</h3>
          <p className="text-sm text-gray-500">Track all patient sources beyond referrals - ads, organic, walk-ins, events</p>
        </Link>
        <Link href="/features/patient-portal" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Patient Portal</h3>
          <p className="text-sm text-gray-500">Where patients access their referral links and share with friends</p>
        </Link>
        <Link href="/features/reports/revenue" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Revenue Reports</h3>
          <p className="text-sm text-gray-500">See how referral revenue contributes to overall practice revenue</p>
        </Link>
        <Link href="/features/messaging/campaigns" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Campaigns</h3>
          <p className="text-sm text-gray-500">Remind existing patients about your referral program via SMS</p>
        </Link>
      </div>
    </div>
  )
}
