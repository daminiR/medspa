import React from 'react';
import { BookOpen, TrendingUp, Users, Target, Activity, DollarSign, Award } from 'lucide-react';

export default function GlossaryPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Reports &amp; Analytics Glossary</h1>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed">
          Quick definitions for all the metrics in your reports—with industry benchmarks to help you understand what "good" looks like.
        </p>
      </div>

      {/* How to Use This Page */}
      <div className="mb-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">How to Use This Page</h2>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span><strong>Bookmark it for reference</strong> — Keep this page handy while reviewing your reports</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span><strong>Jump from reports</strong> — Click any metric in your reports to jump to its definition here</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold mt-1">•</span>
            <span><strong>Use benchmarks</strong> — Compare your numbers to industry standards to identify opportunities</span>
          </li>
        </ul>
      </div>

      {/* Revenue Metrics Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
          <DollarSign className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Revenue Metrics</h2>
        </div>

        <div className="space-y-6">
          {/* Average Revenue Per Visit */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Revenue Per Visit (ARPV)</h3>
            <p className="text-gray-700 mb-3">
              The average amount of revenue generated each time a patient visits your spa. This metric helps you understand the typical value of a patient visit.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Total Revenue ÷ Total Visits
              </p>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Industry Benchmark</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">$200 - $400</span>
                  <span className="text-sm text-gray-600">per visit</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> Higher ARPV means you're maximizing value from each patient interaction. Consider upselling complementary services or retail products to increase this metric.
              </p>
            </div>
          </div>

          {/* Average Ticket */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Ticket</h3>
            <p className="text-gray-700 mb-3">
              The average total amount spent per transaction or visit. Similar to ARPV, but may include retail purchases, packages, and memberships sold during the visit.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Total Sales ÷ Number of Transactions
              </p>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Industry Benchmark</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">$250 - $500</span>
                  <span className="text-sm text-gray-600">per transaction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Acquisition Cost */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Acquisition Cost (CAC)</h3>
            <p className="text-gray-700 mb-3">
              The total cost of acquiring a new patient, including all marketing and advertising expenses. This helps you understand how much you're investing to bring in each new patient.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Total Marketing Spend ÷ Number of New Patients Acquired
              </p>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Industry Benchmark</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">$150 - $250</span>
                  <span className="text-sm text-gray-600">per patient</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> Lower CAC means more efficient marketing. Compare this to your LTV (Lifetime Value) to ensure you're profitable. Your LTV should be at least 3x your CAC.
              </p>
            </div>
          </div>

          {/* Gross Revenue */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gross Revenue</h3>
            <p className="text-gray-700 mb-3">
              The total revenue generated from all services, products, and memberships before any deductions like refunds, discounts, or operating costs.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Sum of all sales (services + retail + memberships)
              </p>
            </div>
          </div>

          {/* Lifetime Value */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lifetime Value (LTV)</h3>
            <p className="text-gray-700 mb-3">
              The total revenue you can expect from a patient over their entire relationship with your spa. This is one of the most important metrics for understanding long-term profitability.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Average Visit Value × Visits Per Year × Average Patient Lifespan (years)
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Example: $300 × 4 visits/year × 3 years = $3,600 LTV
              </p>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Industry Benchmark</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">$2,500 - $10,000</span>
                  <span className="text-sm text-gray-600">total lifetime value</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> High LTV patients are your most valuable asset. Focus on retention strategies to increase patient lifespan and visit frequency. Even a 10% improvement in retention can double your profits.
              </p>
            </div>
          </div>

          {/* LTV:CAC Ratio */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">LTV:CAC Ratio</h3>
            <p className="text-gray-700 mb-3">
              This ratio compares the lifetime value of a patient to the cost of acquiring them. It's a critical indicator of your business's long-term sustainability and profitability.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Lifetime Value (LTV) ÷ Client Acquisition Cost (CAC)
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Example: $4,000 LTV ÷ $200 CAC = 20:1 ratio
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-xs text-red-600 uppercase tracking-wide mb-1">Needs Work</div>
                <div className="text-lg font-bold text-red-700">&lt; 3:1</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Good</div>
                <div className="text-lg font-bold text-yellow-700">3:1 - 5:1</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Excellent</div>
                <div className="text-lg font-bold text-green-700">5:1+</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> A ratio below 3:1 means you're spending too much to acquire patients relative to their value. Above 5:1 indicates healthy profitability and suggests you might even be able to invest more in marketing.
              </p>
            </div>
          </div>

          {/* Monthly Recurring Revenue */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly Recurring Revenue (MRR)</h3>
            <p className="text-gray-700 mb-3">
              The predictable revenue generated each month from memberships and subscription-based services. This is your most stable revenue stream.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Number of Active Memberships × Average Monthly Membership Fee
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> MRR provides financial predictability and stability. Spas with strong membership programs can better forecast revenue and make strategic investments.
              </p>
            </div>
          </div>

          {/* Net Revenue */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Net Revenue</h3>
            <p className="text-gray-700 mb-3">
              Your actual revenue after subtracting refunds, discounts, promotions, and any other deductions from gross revenue. This is your real top-line number.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Gross Revenue - Refunds - Discounts - Promotions
              </p>
            </div>
          </div>

          {/* Revenue Per Hour */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Per Hour</h3>
            <p className="text-gray-700 mb-3">
              The average revenue generated per hour of operation or per provider hour. This helps you understand efficiency and optimize scheduling.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: Total Revenue ÷ Total Hours Worked (or Total Billable Hours)
              </p>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Industry Benchmark</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">$100 - $200</span>
                  <span className="text-sm text-gray-600">per hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Metrics Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Patient Metrics</h2>
        </div>

        <div className="space-y-6">
          {/* Active Patients */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Patients</h3>
            <p className="text-gray-700 mb-3">
              Patients who have visited your spa within a defined timeframe, typically the last 90-180 days. These are your currently engaged patients.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Definition: Patients with a visit in the last 90-180 days
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> Track this monthly to identify growth trends. A declining active patient count is an early warning sign that requires immediate attention.
              </p>
            </div>
          </div>

          {/* At-Risk Patients */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">At-Risk Patients</h3>
            <p className="text-gray-700 mb-3">
              Patients who haven't visited recently and are at risk of churning (leaving permanently). Early intervention can often win them back.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <div className="text-sm text-gray-800">
                <strong>Risk Tiers:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li><span className="text-yellow-600">•</span> Low Risk: 30-60 days since last visit</li>
                  <li><span className="text-orange-600">•</span> Medium Risk: 60-90 days since last visit</li>
                  <li><span className="text-red-600">•</span> High Risk: 90+ days since last visit</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> It's 5-7x more expensive to acquire a new patient than to retain an existing one. Proactive outreach to at-risk patients can prevent churn.
              </p>
            </div>
          </div>

          {/* Churn Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Churn Rate</h3>
            <p className="text-gray-700 mb-3">
              The percentage of patients who stop coming to your spa over a given period. Lower is better.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Patients Lost ÷ Total Patients at Start) × 100
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Example: Lost 15 patients out of 100 = 15% churn rate
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Excellent</div>
                <div className="text-lg font-bold text-green-700">&lt; 10%</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Average</div>
                <div className="text-lg font-bold text-yellow-700">10-15%</div>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-xs text-red-600 uppercase tracking-wide mb-1">Needs Work</div>
                <div className="text-lg font-bold text-red-700">&gt; 15%</div>
              </div>
            </div>
          </div>

          {/* Client Retention Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Retention Rate</h3>
            <p className="text-gray-700 mb-3">
              The percentage of patients who continue to visit your spa over time. The opposite of churn rate. Higher is better.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: ((End Patients - New Patients) ÷ Start Patients) × 100
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Example: Started with 100, ended with 95, gained 10 new = ((95-10)/100) × 100 = 85% retention
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Average</div>
                <div className="text-lg font-bold text-yellow-700">75-80%</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Good</div>
                <div className="text-lg font-bold text-green-700">80-85%</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Excellent</div>
                <div className="text-lg font-bold text-green-700">85%+</div>
              </div>
            </div>
          </div>

          {/* New Patient Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">New Patient Rate</h3>
            <p className="text-gray-700 mb-3">
              The percentage of your total patients who are new (first visit) in a given period. This indicates your growth and marketing effectiveness.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (New Patients ÷ Total Patients) × 100
              </p>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Healthy Range</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">25-30%</span>
                  <span className="text-sm text-gray-600">of total patients</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Balance is key:</strong> Too low means weak marketing. Too high (40%+) means poor retention. Aim for steady new patient flow while keeping existing patients engaged.
              </p>
            </div>
          </div>

          {/* Patient Cohort */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Cohort</h3>
            <p className="text-gray-700 mb-3">
              A group of patients who share a common characteristic or started during the same time period (e.g., all patients acquired in January 2024). Tracking cohorts helps you understand patient behavior patterns over time.
            </p>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> Cohort analysis reveals if recent patients are behaving differently than older patients, helping you identify what's working (or not) in your current marketing and service offerings.
              </p>
            </div>
          </div>

          {/* Rebooking Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rebooking Rate</h3>
            <p className="text-gray-700 mb-3">
              The percentage of patients who book their next appointment before leaving from their current visit. This is a key retention indicator.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Patients Who Rebooked ÷ Total Patients) × 100
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Needs Work</div>
                <div className="text-lg font-bold text-yellow-700">&lt; 20%</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Good</div>
                <div className="text-lg font-bold text-green-700">20-30%</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Excellent</div>
                <div className="text-lg font-bold text-green-700">30%+</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Pro tip:</strong> Train your staff to suggest rebooking while the patient is checking out. "Would you like to schedule your next session in 4 weeks?" is one of the most powerful retention strategies.
              </p>
            </div>
          </div>

          {/* Returning Patient Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Returning Patient Rate</h3>
            <p className="text-gray-700 mb-3">
              The percentage of your total patients who are returning (not new) in a given period. This reflects customer satisfaction and loyalty.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Returning Patients ÷ Total Patients) × 100
              </p>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Healthy Range</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">70-75%</span>
                  <span className="text-sm text-gray-600">of total patients</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Metrics Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
          <Award className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-gray-900">Referral Metrics</h2>
        </div>

        <div className="space-y-6">
          {/* Conversion Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Rate (Referrals)</h3>
            <p className="text-gray-700 mb-3">
              The percentage of referrals who actually book and complete their first appointment. Not all referrals convert to paying patients.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Referrals Who Booked &amp; Visited ÷ Total Referrals) × 100
              </p>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Good Benchmark</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-green-600">50-70%</span>
                  <span className="text-sm text-gray-600">conversion rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Qualified Referral */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Qualified Referral</h3>
            <p className="text-gray-700 mb-3">
              A referral that meets specific criteria making them more likely to become a valuable patient. This typically means they've shown genuine interest by contacting your spa or booking an appointment.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <div className="text-sm text-gray-800">
                <strong>Qualification Criteria:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Has made contact (called, texted, or emailed)</li>
                  <li>• Scheduled a consultation or service</li>
                  <li>• Fits your target demographic</li>
                  <li>• Shows ability/willingness to pay</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Referral Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Referral Rate</h3>
            <p className="text-gray-700 mb-3">
              The percentage of your patients who refer new patients to your spa. This is a strong indicator of patient satisfaction and loyalty.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Number of Patients Who Referred ÷ Total Active Patients) × 100
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Average</div>
                <div className="text-lg font-bold text-yellow-700">3.6%</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Good</div>
                <div className="text-lg font-bold text-green-700">5-7%</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Top Performers</div>
                <div className="text-lg font-bold text-green-700">7.2%+</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Industry insight:</strong> Medical spas average 3.6% referral rate. Top-performing spas achieve 7.2% through exceptional service and structured referral programs.
              </p>
            </div>
          </div>

          {/* Referrer Tier */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Referrer Tier</h3>
            <p className="text-gray-700 mb-3">
              A classification system that rewards patients based on how many qualified referrals they've sent to your spa.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <div className="text-sm text-gray-800">
                <strong>Common Tier Structure:</strong>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-8 bg-orange-400 rounded flex items-center justify-center text-white text-xs font-bold">Bronze</div>
                    <span>1-2 qualified referrals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-8 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold">Silver</div>
                    <span>3-5 qualified referrals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-8 bg-yellow-400 rounded flex items-center justify-center text-white text-xs font-bold">Gold</div>
                    <span>6-10 qualified referrals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-8 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">Platinum</div>
                    <span>11+ qualified referrals</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Best practice:</strong> Offer escalating rewards at each tier (discounts, free services, exclusive events) to incentivize continued referrals.
              </p>
            </div>
          </div>

          {/* Viral Coefficient */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Viral Coefficient</h3>
            <p className="text-gray-700 mb-3">
              A measure of how many new patients each existing patient brings in through referrals. A coefficient greater than 1.0 means organic, self-sustaining growth.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Number of Referrals per Patient) × (Referral Conversion Rate)
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Example: 0.5 referrals per patient × 60% conversion = 0.3 viral coefficient
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Needs Work</div>
                <div className="text-lg font-bold text-yellow-700">&lt; 0.5</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Good</div>
                <div className="text-lg font-bold text-green-700">0.5 - 1.0</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Viral Growth</div>
                <div className="text-lg font-bold text-green-700">1.0+</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>The holy grail:</strong> A coefficient of 1.0+ means your business is growing organically without additional marketing spend. Each patient brings in at least one more patient.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Metrics Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
          <Activity className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Operational Metrics</h2>
        </div>

        <div className="space-y-6">
          {/* Capacity Utilization */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Capacity Utilization</h3>
            <p className="text-gray-700 mb-3">
              The percentage of available appointment slots that are actually booked. This measures how efficiently you're using your resources (rooms, equipment, staff time).
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Booked Appointment Hours ÷ Total Available Hours) × 100
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Underutilized</div>
                <div className="text-lg font-bold text-yellow-700">&lt; 70%</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Optimal</div>
                <div className="text-lg font-bold text-green-700">75-85%</div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                <div className="text-xs text-orange-600 uppercase tracking-wide mb-1">Overbooked</div>
                <div className="text-lg font-bold text-orange-700">&gt; 90%</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Sweet spot:</strong> 75-85% is ideal. Below 70% means lost revenue. Above 90% leaves no room for emergencies or walk-ins, and can lead to staff burnout.
              </p>
            </div>
          </div>

          {/* No-Show Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No-Show Rate</h3>
            <p className="text-gray-700 mb-3">
              The percentage of scheduled appointments where the patient doesn't show up and doesn't cancel in advance. This directly impacts revenue and efficiency.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (No-Show Appointments ÷ Total Scheduled Appointments) × 100
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Excellent</div>
                <div className="text-lg font-bold text-green-700">&lt; 5%</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Average</div>
                <div className="text-lg font-bold text-yellow-700">5-8%</div>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-xs text-red-600 uppercase tracking-wide mb-1">Problematic</div>
                <div className="text-lg font-bold text-red-700">&gt; 8%</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Prevention strategies:</strong> Automated reminders (SMS/email), confirmation calls 24-48 hours before, and clear no-show policies can reduce this rate significantly.
              </p>
            </div>
          </div>

          {/* Provider Utilization */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Provider Utilization</h3>
            <p className="text-gray-700 mb-3">
              The percentage of a provider's (practitioner's, nurse's, aesthetician's) available time that is spent on billable services. This helps you understand individual productivity.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Billable Hours ÷ Total Scheduled Hours) × 100
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Use this to:</strong> Identify top performers, spot training opportunities, optimize scheduling, and make data-driven staffing decisions.
              </p>
            </div>
          </div>

          {/* Same-Day Cancellation Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Same-Day Cancellation Rate</h3>
            <p className="text-gray-700 mb-3">
              The percentage of appointments canceled on the same day they were scheduled. These last-minute cancellations are particularly costly because there's often no time to fill the slot.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Same-Day Cancellations ÷ Total Scheduled Appointments) × 100
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="text-xs text-green-600 uppercase tracking-wide mb-1">Excellent</div>
                <div className="text-lg font-bold text-green-700">&lt; 3%</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-xs text-yellow-600 uppercase tracking-wide mb-1">Average</div>
                <div className="text-lg font-bold text-yellow-700">3-5%</div>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="text-xs text-red-600 uppercase tracking-wide mb-1">Problematic</div>
                <div className="text-lg font-bold text-red-700">&gt; 5%</div>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Mitigation:</strong> Implement a cancellation policy (24-48 hour notice required), use a waitlist to fill gaps, and send reminders to confirm appointments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Marketing/Acquisition Metrics Section */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
          <Target className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">Marketing &amp; Acquisition Metrics</h2>
        </div>

        <div className="space-y-6">
          {/* Channel Attribution */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Channel Attribution</h3>
            <p className="text-gray-700 mb-3">
              Tracking which marketing channel (Google Ads, Instagram, referrals, etc.) gets credit for bringing in a new patient. This helps you understand which marketing efforts are most effective.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <div className="text-sm text-gray-800">
                <strong>Common Attribution Models:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• First-touch: Credit goes to the first channel patient encountered</li>
                  <li>• Last-touch: Credit goes to the last channel before booking</li>
                  <li>• Multi-touch: Credit distributed across all touchpoints</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Why it matters:</strong> Knowing which channels deliver the best ROI allows you to invest your marketing budget more effectively.
              </p>
            </div>
          </div>

          {/* Click-Through Rate */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Click-Through Rate (CTR)</h3>
            <p className="text-gray-700 mb-3">
              The percentage of people who click on your marketing content (ad, email link, social post) out of the total who saw it. Higher CTR indicates more engaging content.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <p className="text-sm font-mono text-gray-800">
                Formula: (Number of Clicks ÷ Number of Impressions) × 100
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Example: 50 clicks out of 1,000 impressions = 5% CTR
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Benchmarks vary by platform:</strong> Email: 2-5%, Google Ads: 3-5%, Facebook Ads: 0.9-1.5%, Instagram: 0.5-1.5%
              </p>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversion Funnel</h3>
            <p className="text-gray-700 mb-3">
              The journey potential patients take from first awareness of your spa to becoming a paying customer. Understanding where people drop off helps you optimize each stage.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <div className="text-sm text-gray-800">
                <strong>Typical Stages:</strong>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>1. Awareness: Sees your ad/website (100 people)</li>
                  <li>2. Interest: Visits your website (30 people)</li>
                  <li>3. Consideration: Browses services (15 people)</li>
                  <li>4. Intent: Starts booking process (8 people)</li>
                  <li>5. Conversion: Completes booking (5 people)</li>
                </ul>
              </div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Optimization:</strong> Track drop-off at each stage. Big drops reveal friction points that need fixing (confusing booking process, pricing concerns, etc.).
              </p>
            </div>
          </div>

          {/* Source Attribution */}
          <div className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Source Attribution</h3>
            <p className="text-gray-700 mb-3">
              Identifying where new patients originally heard about your spa (Google search, Instagram, friend referral, drive-by, etc.). Usually tracked by asking "How did you hear about us?"
            </p>
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm text-gray-700">
                <strong>Best practice:</strong> Ask every new patient during their first appointment and record it in your system. Use UTM parameters in digital marketing to automatically track online sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulas Reference Table */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">Quick Formula Reference</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Metric</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Formula</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">LTV</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">Avg Visit Value × Visits/Year × Years</td>
                <td className="px-4 py-3 text-sm text-gray-600">$300 × 4 × 3 = $3,600</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">CAC</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">Marketing Spend ÷ New Patients</td>
                <td className="px-4 py-3 text-sm text-gray-600">$5,000 ÷ 25 = $200</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">LTV:CAC Ratio</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">LTV ÷ CAC</td>
                <td className="px-4 py-3 text-sm text-gray-600">$3,600 ÷ $200 = 18:1</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Retention Rate</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">((End - New) ÷ Start) × 100</td>
                <td className="px-4 py-3 text-sm text-gray-600">((95-10)/100) × 100 = 85%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Churn Rate</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">(Lost ÷ Start) × 100</td>
                <td className="px-4 py-3 text-sm text-gray-600">(15/100) × 100 = 15%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">ARPV</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">Total Revenue ÷ Total Visits</td>
                <td className="px-4 py-3 text-sm text-gray-600">$30,000 ÷ 100 = $300</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Capacity Utilization</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">(Booked Hours ÷ Available Hours) × 100</td>
                <td className="px-4 py-3 text-sm text-gray-600">(160/200) × 100 = 80%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">No-Show Rate</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">(No-Shows ÷ Scheduled) × 100</td>
                <td className="px-4 py-3 text-sm text-gray-600">(6/100) × 100 = 6%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Viral Coefficient</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">Referrals/Patient × Conversion %</td>
                <td className="px-4 py-3 text-sm text-gray-600">0.5 × 60% = 0.3</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">CTR</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">(Clicks ÷ Impressions) × 100</td>
                <td className="px-4 py-3 text-sm text-gray-600">(50/1000) × 100 = 5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Benchmark Summary Table */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 pb-3 border-b-2 border-gray-200">
          <Award className="w-6 h-6 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900">Benchmark Summary</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Use these industry benchmarks to evaluate your performance. Remember that these are general guidelines—your specific market, services, and pricing may affect what's "good" for your business.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Metric</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">Needs Work</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">Average</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">Good</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-b border-gray-200">Excellent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">ARPV</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&lt; $150</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">$150-$250</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">$250-$400</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">$400+</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">CAC</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&gt; $300</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">$250-$300</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">$150-$250</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">&lt; $150</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">LTV</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&lt; $1,500</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">$1,500-$2,500</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">$2,500-$5,000</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">$5,000+</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">LTV:CAC Ratio</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&lt; 3:1</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">3:1 - 4:1</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">4:1 - 6:1</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">6:1+</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Retention Rate</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&lt; 70%</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">70-75%</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">75-85%</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">85%+</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Churn Rate</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&gt; 20%</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">15-20%</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">10-15%</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">&lt; 10%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Referral Rate</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&lt; 2%</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">2-4%</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">4-7%</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">7%+</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">No-Show Rate</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&gt; 10%</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">8-10%</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">5-8%</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">&lt; 5%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Capacity Utilization</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&lt; 60%</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">60-75%</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">75-85%</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">85-90%*</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Rebooking Rate</td>
                <td className="px-4 py-3 text-center text-sm text-red-600">&lt; 15%</td>
                <td className="px-4 py-3 text-center text-sm text-yellow-600">15-20%</td>
                <td className="px-4 py-3 text-center text-sm text-green-600">20-30%</td>
                <td className="px-4 py-3 text-center text-sm text-green-700 font-semibold">30%+</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>*Note on Capacity Utilization:</strong> While 85-90% is efficient, going above 90% can lead to staff burnout and no flexibility for emergencies. The "sweet spot" is typically 75-85%.
          </p>
        </div>
      </section>

      {/* Related Pages */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/features/reports"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Reports &amp; Analytics Overview</h3>
            </div>
            <p className="text-sm text-gray-600">
              Learn about all available reports and how to use them
            </p>
          </a>

          <a
            href="/features/reports/revenue"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Revenue Reports</h3>
            </div>
            <p className="text-sm text-gray-600">
              Track income, payments, and financial performance
            </p>
          </a>

          <a
            href="/features/reports/patients"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Patient Reports</h3>
            </div>
            <p className="text-sm text-gray-600">
              Analyze patient behavior, retention, and lifetime value
            </p>
          </a>

          <a
            href="/features/reports/export"
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Exporting Reports</h3>
            </div>
            <p className="text-sm text-gray-600">
              Export data to CSV, Excel, or PDF for further analysis
            </p>
          </a>
        </div>
      </section>

      {/* Footer Note */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Have Questions?</h3>
        <p className="text-gray-700 mb-4">
          If you need help interpreting your metrics or want to discuss strategies to improve specific KPIs, contact your account manager or reach out to our support team.
        </p>
        <p className="text-sm text-gray-600">
          Remember: The goal isn't to be perfect at every metric, but to identify your biggest opportunities and focus your efforts where they'll have the most impact.
        </p>
      </div>
    </div>
  );
}
