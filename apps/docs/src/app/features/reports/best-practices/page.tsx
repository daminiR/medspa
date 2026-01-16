import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import Link from 'next/link'
import { Lightbulb, TrendingUp, Clock, Calendar, BarChart3, AlertCircle, ArrowRight, Target, Users, DollarSign, Activity, CheckCircle2 } from 'lucide-react'

export default function ReportsBestPracticesPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Lightbulb className="w-6 h-6 text-primary-600" />
        </div>
      </div>
      <h1>Reports Best Practices</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        How top-performing med spas use data to grow revenue 20%+ year over year
      </p>

      <Callout type="info" title="The Performance Gap">
        The difference between average and top performers isn&apos;t having data—it&apos;s using it consistently. Top-performing spas check their numbers daily, review weekly, and take action immediately.
      </Callout>

      {/* Video */}
      <VideoPlaceholder
        title="Building Your Data Habit"
        duration="6 min"
        description="Learn how successful spa owners use reports to drive growth"
      />

      <h2 id="daily-check-in">The Daily Check-In (2 minutes)</h2>
      <p>
        Start every morning with a quick data check. This takes just 2 minutes but keeps you aware of your business pulse:
      </p>

      <h3>What to Look at Every Morning</h3>
      <div className="grid md:grid-cols-3 gap-4 not-prose mb-6">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Today&apos;s Schedule</h4>
          </div>
          <p className="text-sm text-blue-800">Any gaps? Last-minute cancellations? Time to fill them from your waitlist.</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">Yesterday&apos;s Revenue</h4>
          </div>
          <p className="text-sm text-green-800">Did you hit your daily target? If not, what can you do differently today?</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-900">Yesterday&apos;s No-Shows</h4>
          </div>
          <p className="text-sm text-amber-800">Which patients didn&apos;t show? Follow up today before they ghost completely.</p>
        </div>
      </div>

      <StepList steps={[
        {
          title: 'Open your dashboard',
          description: 'Check today\'s appointment count and look for any gaps in the schedule.'
        },
        {
          title: 'Review yesterday\'s numbers',
          description: 'Revenue total, number of completed appointments, any no-shows or cancellations.'
        },
        {
          title: 'Take immediate action',
          description: 'If you have gaps, reach out to waitlist. If you had no-shows, send a re-engagement text.'
        }
      ]} />

      <Callout type="tip" title="Set a Daily Reminder">
        Set a phone reminder for 8 AM every weekday: &quot;Check dashboard.&quot; Make it a habit like brushing your teeth.
      </Callout>

      <h2 id="weekly-review">The Weekly Review (15 minutes)</h2>
      <p>
        Every Monday morning (or your first day of the week), dive a bit deeper. This 15-minute review helps you spot trends before they become problems:
      </p>

      <h3>What to Review Each Week</h3>
      <ul>
        <li><strong>Week&apos;s revenue vs target</strong> — Are you on track for monthly goals?</li>
        <li><strong>Provider utilization rates</strong> — Is everyone busy or is capacity wasted?</li>
        <li><strong>Top services this week</strong> — What&apos;s selling? What&apos;s not?</li>
        <li><strong>New patients acquired</strong> — How many first-timers came through?</li>
        <li><strong>At-risk patients to contact</strong> — Who hasn&apos;t booked in 90+ days?</li>
      </ul>

      <p><strong>Best day to do it:</strong> Monday morning before your first appointment. Review last week&apos;s performance and set this week&apos;s priorities.</p>

      <StepList steps={[
        {
          title: 'Pull last week\'s revenue report',
          description: 'Compare to your weekly target. Up or down from the week before?'
        },
        {
          title: 'Check provider utilization',
          description: 'Is everyone at 70%+ booked time? If not, why? Scheduling issue or demand problem?'
        },
        {
          title: 'Review new patient acquisition',
          description: 'How many new patients? Which marketing channel did they come from?'
        },
        {
          title: 'Identify at-risk patients',
          description: 'Export patients who haven\'t booked in 90+ days. Assign someone to reach out this week.'
        },
        {
          title: 'Set 1-2 action items',
          description: 'Based on what you learned, what will you DO this week? Write it down.'
        }
      ]} />

      <h2 id="monthly-deep-dive">The Monthly Deep Dive (30 minutes)</h2>
      <p>
        Once a month, block 30 minutes for a comprehensive business review. This is where you spot long-term trends and make strategic decisions:
      </p>

      <h3>What to Analyze Monthly</h3>
      <div className="grid md:grid-cols-2 gap-4 not-prose mb-6">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-gray-900">Revenue Trends</h4>
          </div>
          <p className="text-sm text-gray-600">Up or down vs last month? Same month last year? Identify patterns.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-gray-900">Cohort Retention</h4>
          </div>
          <p className="text-sm text-gray-600">Are new patients sticking around? Track 30-day, 90-day, and 1-year retention.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-gray-900">Marketing ROI</h4>
          </div>
          <p className="text-sm text-gray-600">Which channels bring in patients? Cost per acquisition by source.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-primary-600" />
            <h4 className="font-semibold text-gray-900">Referral Performance</h4>
          </div>
          <p className="text-sm text-gray-600">How many patients referred friends? Are incentives working?</p>
        </div>
      </div>

      <StepList steps={[
        {
          title: 'Run full month revenue report',
          description: 'Total revenue, breakdown by service, provider, and payment method. Compare to last month and same month last year.'
        },
        {
          title: 'Analyze patient retention',
          description: 'Of patients who came in for first time this month, how many returned? Look at 30-day cohort retention.'
        },
        {
          title: 'Review marketing channels',
          description: 'Where did new patients come from? Calculate cost per acquisition for each channel. Double down on what works.'
        },
        {
          title: 'Check referral program',
          description: 'How many patients referred friends? Are you incentivizing and training staff to ask?'
        },
        {
          title: 'Evaluate service profitability',
          description: 'Which services have best margins? Which take too long for the revenue? Consider pricing changes.'
        },
        {
          title: 'Schedule team review meeting',
          description: 'Share wins with your team. Discuss challenges. Set goals for next month together.'
        }
      ]} />

      <div className="not-prose p-6 bg-gray-50 rounded-lg border border-gray-200 my-8">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary-600" />
          Template: Monthly Business Review Meeting Agenda
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <div><strong>1. Wins (5 min):</strong> Celebrate successes. Top revenue day, great reviews, new patient milestones.</div>
          <div><strong>2. Numbers (10 min):</strong> Share key metrics—revenue, new patients, retention, no-show rate.</div>
          <div><strong>3. Challenges (5 min):</strong> What didn&apos;t go well? Where did we miss targets?</div>
          <div><strong>4. Actions (10 min):</strong> Based on data, what will we DO differently this month? Assign ownership.</div>
        </div>
      </div>

      <h2 id="metrics-that-matter">5 Metrics That Actually Matter</h2>
      <p>
        Don&apos;t get lost in vanity metrics. Focus on these five numbers—they&apos;re ranked by importance:
      </p>

      <div className="space-y-6 my-8">
        <div className="not-prose p-6 bg-white rounded-lg border-2 border-primary-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="step-number">1</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Revenue Per Hour</h3>
              <p className="text-sm text-primary-600 mb-2">Your true productivity measure</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            <strong>What it is:</strong> Total revenue divided by total provider hours worked. This tells you how efficiently you&apos;re using your most expensive resource—time.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Benchmark:</strong> Top med spas target $200-300/hour for injectors, $150-200/hour for estheticians.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm font-semibold text-amber-900 mb-1">If it&apos;s low:</p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4">
              <li>• Increase prices (easiest lever)</li>
              <li>• Reduce appointment gaps (better scheduling)</li>
              <li>• Upsell add-ons (higher ticket per visit)</li>
            </ul>
          </div>
        </div>

        <div className="not-prose p-6 bg-white rounded-lg border-2 border-gray-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="step-number">2</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Client Retention Rate</h3>
              <p className="text-sm text-gray-600 mb-2">Cheaper to keep than acquire</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            <strong>What it is:</strong> Percentage of patients who return within 90 days of their last visit. Most aesthetic treatments need regular maintenance.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Benchmark:</strong> Top spas maintain 75-85% retention. Below 70% means you&apos;re leaking patients.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm font-semibold text-amber-900 mb-1">If it&apos;s low:</p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4">
              <li>• Send post-visit follow-ups (how are you feeling?)</li>
              <li>• Book next appointment before they leave</li>
              <li>• Launch 60-day &quot;we miss you&quot; campaign</li>
              <li>• Review patient experience—are they happy?</li>
            </ul>
          </div>
        </div>

        <div className="not-prose p-6 bg-white rounded-lg border-2 border-gray-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="step-number">3</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">No-Show Rate</h3>
              <p className="text-sm text-gray-600 mb-2">Direct revenue loss</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            <strong>What it is:</strong> Percentage of appointments where patient didn&apos;t show up and didn&apos;t cancel with enough notice to fill the slot.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Benchmark:</strong> Keep it under 8%. Every point above 8% is thousands in lost revenue monthly.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm font-semibold text-amber-900 mb-1">If it&apos;s high:</p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4">
              <li>• Require credit card on file</li>
              <li>• Charge no-show fees (even $25 helps)</li>
              <li>• Send text reminders 24 hours before</li>
              <li>• Require deposits for new patients</li>
            </ul>
          </div>
        </div>

        <div className="not-prose p-6 bg-white rounded-lg border-2 border-gray-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="step-number">4</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">LTV:CAC Ratio</h3>
              <p className="text-sm text-gray-600 mb-2">Marketing efficiency</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            <strong>What it is:</strong> Lifetime Value of a patient divided by Cost to Acquire them. If average patient spends $2,000 over their lifetime and costs $200 to acquire, your ratio is 10:1.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Benchmark:</strong> Aim for at least 3:1 (make back 3x what you spend). Top performers hit 5:1 or better.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm font-semibold text-amber-900 mb-1">If it&apos;s low:</p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4">
              <li>• Improve retention (increase LTV)</li>
              <li>• Focus on cheaper channels like referrals</li>
              <li>• Cut underperforming ad campaigns</li>
              <li>• Increase package sales (higher initial spend)</li>
            </ul>
          </div>
        </div>

        <div className="not-prose p-6 bg-white rounded-lg border-2 border-gray-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="step-number">5</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Provider Utilization</h3>
              <p className="text-sm text-gray-600 mb-2">Capacity optimization</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            <strong>What it is:</strong> Percentage of available provider time that&apos;s actually booked with appointments. If your injector works 8 hours but only has 6 hours of appointments, that&apos;s 75% utilization.
          </p>
          <p className="text-sm text-gray-700 mb-3">
            <strong>Benchmark:</strong> Target 70-80%. Below 70% means wasted capacity. Above 90% means you need to hire or raise prices.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="text-sm font-semibold text-amber-900 mb-1">If it&apos;s low:</p>
            <ul className="text-sm text-amber-800 space-y-1 ml-4">
              <li>• Reduce provider hours (if demand isn&apos;t there)</li>
              <li>• Fill gaps from waitlist proactively</li>
              <li>• Run promotions during slow times</li>
              <li>• Cross-train providers on other services</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 id="red-flags">Red Flags to Watch For</h2>
      <p>
        These are warning signs that require immediate action. If you see any of these trends, address them within a week—not a month:
      </p>

      <div className="not-prose grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">No-show rate climbing above 10%</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">This is a crisis. You&apos;re losing 1 in 10 appointments.</p>
          <p className="text-xs text-red-700"><strong>Action:</strong> Implement deposits TODAY. Send reminder texts. Review cancellation policy.</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Retention dropping below 70%</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">Most patients aren&apos;t coming back. That&apos;s expensive.</p>
          <p className="text-xs text-red-700"><strong>Action:</strong> Survey recent patients. What went wrong? Launch win-back campaign immediately.</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Single provider doing &gt;50% of revenue</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">You&apos;re one resignation away from disaster.</p>
          <p className="text-xs text-red-700"><strong>Action:</strong> Cross-train other providers. Build second provider&apos;s reputation. Diversify NOW.</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">At-risk patient count growing</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">Your &quot;haven&apos;t seen in 90+ days&quot; list is getting longer.</p>
          <p className="text-xs text-red-700"><strong>Action:</strong> Launch re-engagement campaign. Offer incentive to come back. Review why they left.</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Referral rate dropping</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">Patients used to refer friends. Now they don&apos;t. Why?</p>
          <p className="text-xs text-red-700"><strong>Action:</strong> Increase referral rewards. Train staff to ask. Make it EASY to refer.</p>
        </div>

        <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-semibold text-red-900">Revenue declining 2+ months in a row</h4>
          </div>
          <p className="text-sm text-red-800 mb-2">This isn&apos;t seasonality—it&apos;s a trend.</p>
          <p className="text-xs text-red-700"><strong>Action:</strong> Deep dive into ALL metrics. Something fundamental changed. Find it and fix it.</p>
        </div>
      </div>

      <Callout type="warning" title="Take Action Within a Week">
        If you see these red flags, don&apos;t wait for next month&apos;s review. Act immediately. Every week you wait costs you revenue and momentum.
      </Callout>

      <h2 id="taking-action">Taking Action on Data</h2>
      <p>
        Data without action is just numbers. Here&apos;s how to turn insights into results:
      </p>

      <div className="not-prose my-8">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-48 p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm">High no-shows (&gt;10%)</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
            <div className="flex-1 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-900 font-medium mb-1">Actions to take:</p>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• Require credit card on file for all appointments</li>
                <li>• Send automated text reminders 24h before</li>
                <li>• Charge $25-50 no-show fee (enforced consistently)</li>
                <li>• Require deposits for new patients or high-value services</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-48 p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm">Low retention (&lt;70%)</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
            <div className="flex-1 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-900 font-medium mb-1">Actions to take:</p>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• Send &quot;How are your results?&quot; follow-up at 2 weeks</li>
                <li>• Book next appointment before they leave (pre-booking)</li>
                <li>• Launch &quot;We miss you&quot; campaign at 60 days</li>
                <li>• Offer loyalty rewards (5th treatment free, etc.)</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-48 p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm">Poor referral rate (&lt;15%)</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
            <div className="flex-1 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-900 font-medium mb-1">Actions to take:</p>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• Increase referral reward ($50 → $100 credit)</li>
                <li>• Train staff to ask EVERY happy patient</li>
                <li>• Make it easy (shareable link, not complicated forms)</li>
                <li>• Reward both referrer AND new patient</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-48 p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-900 text-sm">Provider underutilization (&lt;60%)</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-2" />
            <div className="flex-1 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-900 font-medium mb-1">Actions to take:</p>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• Review schedule—too many hours vs demand?</li>
                <li>• Proactively fill gaps from waitlist</li>
                <li>• Add new services provider can perform</li>
                <li>• Run targeted promotions during slow days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <StepList steps={[
        {
          title: 'Identify the insight',
          description: 'What does the data tell you? Be specific: "No-show rate jumped from 6% to 12% this month."'
        },
        {
          title: 'Determine root cause',
          description: 'Why is this happening? New patients? No reminder system? Poor booking process?'
        },
        {
          title: 'Choose 1-2 actions',
          description: 'Don\'t try to fix everything at once. Pick the highest-impact changes.'
        },
        {
          title: 'Assign ownership',
          description: 'WHO will do it and by WHEN? "Sarah will implement text reminders by Friday."'
        },
        {
          title: 'Measure the impact',
          description: 'Check the metric again in 2 weeks. Did it improve? If not, try something else.'
        }
      ]} />

      <h2 id="sharing-reports">Sharing Reports with Your Team</h2>
      <p>
        Transparency builds trust and accountability. But not all data should be shared with everyone:
      </p>

      <h3>What to Share with Staff</h3>
      <div className="grid md:grid-cols-2 gap-4 not-prose mb-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">Share Publicly</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Appointment booking rates</li>
            <li>• Patient satisfaction scores</li>
            <li>• Team goals and progress</li>
            <li>• Monthly revenue targets (hit or miss)</li>
            <li>• Individual provider performance (in private 1-on-1s)</li>
          </ul>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-2">Keep Private</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• Exact total revenue numbers</li>
            <li>• Provider compensation details</li>
            <li>• Profit margins</li>
            <li>• Individual patient spending</li>
            <li>• Comparisons between providers (publicly)</li>
          </ul>
        </div>
      </div>

      <h3>Running Effective Data Meetings</h3>
      <ul>
        <li><strong>Keep it short</strong> — 15-20 minutes max. People tune out longer.</li>
        <li><strong>Focus on actions</strong> — Not just &quot;here are the numbers,&quot; but &quot;here&apos;s what we&apos;re going to DO.&quot;</li>
        <li><strong>Celebrate wins first</strong> — Start with positive metrics. Builds momentum.</li>
        <li><strong>Make it visual</strong> — Charts and graphs, not just spreadsheet rows.</li>
        <li><strong>Get input</strong> — Ask team why they think numbers are what they are. They have insights you don&apos;t.</li>
      </ul>

      <Callout type="tip" title="Share Wins Publicly, Address Concerns Privately">
        If provider utilization is low for someone, don&apos;t call them out in front of the team. Pull them aside after the meeting. Public praise, private coaching.
      </Callout>

      <h2 id="setting-targets">Setting Targets</h2>
      <p>
        Goals without numbers are just wishes. Here&apos;s how to set realistic, motivating targets:
      </p>

      <StepList steps={[
        {
          title: 'Start with historical data',
          description: 'What did you do last month? Last quarter? Same month last year? That\'s your baseline.'
        },
        {
          title: 'Add realistic growth',
          description: 'Aim for 5-10% growth month-over-month. 20%+ is aggressive (possible with new marketing, but hard to sustain).'
        },
        {
          title: 'Use industry benchmarks',
          description: 'Compare your metrics to top-performing spas. If they hit 80% retention and you\'re at 65%, that\'s your target.'
        },
        {
          title: 'Break it down',
          description: 'Monthly revenue goal of $50K? That\'s $12.5K/week, $2.5K/day (5-day week). Makes it tangible.'
        },
        {
          title: 'Adjust quarterly',
          description: 'Revisit targets every 90 days. If you\'re crushing goals, raise them. If you\'re missing consistently, were they unrealistic?'
        }
      ]} />

      <div className="not-prose p-6 bg-blue-50 rounded-lg border border-blue-200 my-8">
        <h3 className="font-semibold text-blue-900 mb-3">Example Target Setting</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>Current state:</strong> $40K monthly revenue, 68% retention, 12% no-shows</p>
          <p><strong>90-day targets:</strong></p>
          <ul className="ml-4 space-y-1">
            <li>• Revenue: $45K/month (12.5% growth, achievable with better retention)</li>
            <li>• Retention: 75% (industry benchmark, focus area)</li>
            <li>• No-shows: 8% (implement deposits and reminders)</li>
          </ul>
          <p className="mt-3"><strong>How to get there:</strong> Launch text reminder system, require deposits for new patients, send 60-day re-engagement campaign to 200 at-risk patients.</p>
        </div>
      </div>

      <h2 id="mistakes">Common Mistakes to Avoid</h2>
      <p>
        Even data-driven owners make these mistakes. Learn from them:
      </p>

      <div className="space-y-4 my-6">
        <div className="not-prose p-4 bg-white rounded-lg border-l-4 border-red-500">
          <h4 className="font-semibold text-gray-900 mb-1">Looking at data but not acting</h4>
          <p className="text-sm text-gray-600">You see no-show rate is 15%. You think &quot;that&apos;s bad.&quot; Then you do nothing. Data is worthless without action.</p>
        </div>

        <div className="not-prose p-4 bg-white rounded-lg border-l-4 border-red-500">
          <h4 className="font-semibold text-gray-900 mb-1">Checking too often (daily obsession)</h4>
          <p className="text-sm text-gray-600">Checking revenue 10 times a day creates anxiety, not insight. One slow day doesn&apos;t mean your business is dying.</p>
        </div>

        <div className="not-prose p-4 bg-white rounded-lg border-l-4 border-red-500">
          <h4 className="font-semibold text-gray-900 mb-1">Checking too rarely (monthly surprises)</h4>
          <p className="text-sm text-gray-600">Only looking at reports once a month means problems compound. By the time you notice, it&apos;s a crisis.</p>
        </div>

        <div className="not-prose p-4 bg-white rounded-lg border-l-4 border-red-500">
          <h4 className="font-semibold text-gray-900 mb-1">Focusing on vanity metrics</h4>
          <p className="text-sm text-gray-600">Instagram followers and website traffic feel good but don&apos;t pay bills. Focus on revenue, retention, and bookings.</p>
        </div>

        <div className="not-prose p-4 bg-white rounded-lg border-l-4 border-red-500">
          <h4 className="font-semibold text-gray-900 mb-1">Ignoring trends (one bad week ≠ disaster)</h4>
          <p className="text-sm text-gray-600">One down week can be a fluke. Two in a row is worth investigating. Three is a trend that needs action.</p>
        </div>

        <div className="not-prose p-4 bg-white rounded-lg border-l-4 border-red-500">
          <h4 className="font-semibold text-gray-900 mb-1">Comparing yourself to others unfairly</h4>
          <p className="text-sm text-gray-600">That spa in Beverly Hills does $200K/month. You&apos;re in Iowa. Different markets, different benchmarks. Compare to YOUR past performance.</p>
        </div>
      </div>

      <h2 id="export-integration">Export & Integration Tips</h2>
      <p>
        Sometimes you need to work with data outside the platform:
      </p>

      <h3>When to Export to Excel</h3>
      <ul>
        <li><strong>Custom analysis</strong> — Pivot tables, complex formulas, custom charts</li>
        <li><strong>Sharing with partners</strong> — Investors or business partners who want raw data</li>
        <li><strong>Historical comparisons</strong> — Year-over-year analysis across multiple years</li>
        <li><strong>Tax preparation</strong> — Your accountant probably wants CSV or Excel</li>
      </ul>

      <h3>Integrating with QuickBooks</h3>
      <p>
        Export daily or weekly revenue reports to import into your accounting software:
      </p>
      <ul>
        <li>Export revenue by payment method (cash, card, check)</li>
        <li>Include service breakdown for proper categorization</li>
        <li>Match export date range to your accounting periods</li>
      </ul>

      <h3>Creating Custom Dashboards</h3>
      <p>
        If you&apos;re advanced, create a Google Sheets dashboard that auto-updates:
      </p>
      <ul>
        <li>Export key metrics weekly</li>
        <li>Use Google Sheets formulas to track trends</li>
        <li>Share view-only version with business partners</li>
      </ul>

      <Callout type="info">
        Most spas don&apos;t need fancy integrations. The built-in reports are enough. Only export when you have a specific need.
      </Callout>

      <h2 id="success-stories">Success Stories</h2>
      <p>
        Real examples from med spas using data to drive growth:
      </p>

      <div className="not-prose grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-semibold mb-2">Austin, TX Med Spa</div>
          <h4 className="font-bold text-gray-900 mb-3">40% Retention Increase</h4>
          <p className="text-sm text-gray-700 mb-3">
            Noticed retention dropping from 78% to 62% in Q2. Pulled cohort report and saw 90-day patients weren&apos;t rebooking.
          </p>
          <p className="text-sm font-semibold text-green-800 mb-2">What they did:</p>
          <ul className="text-sm text-green-800 space-y-1 ml-4">
            <li>• Launched 60-day &quot;time for your next treatment&quot; SMS</li>
            <li>• Offered $25 credit for booking within 7 days</li>
            <li>• Trained front desk to pre-book next appointment</li>
          </ul>
          <p className="text-sm text-green-900 font-semibold mt-3">Result: Retention jumped to 82% in 90 days</p>
        </div>

        <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-semibold mb-2">Los Angeles Med Spa</div>
          <h4 className="font-bold text-gray-900 mb-3">Identified Top 3 Referrers, Created VIP Program</h4>
          <p className="text-sm text-gray-700 mb-3">
            Ran referral report and discovered 3 patients had referred 15+ friends each. They were getting the same $50 credit as everyone else.
          </p>
          <p className="text-sm font-semibold text-blue-800 mb-2">What they did:</p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>• Created &quot;VIP Referrer&quot; tier with exclusive perks</li>
            <li>• Gave them priority booking and 20% off all services</li>
            <li>• Asked them to share their secret to referring</li>
          </ul>
          <p className="text-sm text-blue-900 font-semibold mt-3">Result: Those 3 patients referred 40+ more within a year</p>
        </div>

        <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-semibold mb-2">Miami Beach Spa</div>
          <h4 className="font-bold text-gray-900 mb-3">Cut No-Shows from 14% to 5%</h4>
          <p className="text-sm text-gray-700 mb-3">
            No-show rate was hemorrhaging revenue. Lost $8K+ per month in empty appointment slots.
          </p>
          <p className="text-sm font-semibold text-purple-800 mb-2">What they did:</p>
          <ul className="text-sm text-purple-800 space-y-1 ml-4">
            <li>• Required credit card on file (enforced strictly)</li>
            <li>• Charged $50 no-show fee (actually collected it)</li>
            <li>• Sent automated reminders 24h and 2h before</li>
          </ul>
          <p className="text-sm text-purple-900 font-semibold mt-3">Result: Recovered $6K/month in previously lost revenue</p>
        </div>

        <div className="p-5 bg-amber-50 rounded-lg border border-amber-200">
          <div className="text-sm text-amber-600 font-semibold mb-2">Seattle Med Spa</div>
          <h4 className="font-bold text-gray-900 mb-3">Doubled Revenue Per Hour</h4>
          <p className="text-sm text-gray-700 mb-3">
            Revenue per provider hour was $140. Industry benchmark is $200-250. Leaving money on the table.
          </p>
          <p className="text-sm font-semibold text-amber-800 mb-2">What they did:</p>
          <ul className="text-sm text-amber-800 space-y-1 ml-4">
            <li>• Raised Botox prices by 15% (no patient complaints)</li>
            <li>• Trained staff to upsell add-ons (lip flip with filler)</li>
            <li>• Reduced appointment times by 10 min (better flow)</li>
          </ul>
          <p className="text-sm text-amber-900 font-semibold mt-3">Result: Revenue/hour increased to $215 in 6 months</p>
        </div>
      </div>

      <h2 id="conclusion">Final Thoughts</h2>
      <p>
        The most successful med spa owners we work with all have one thing in common: they use data consistently, not occasionally. They check their dashboard every morning, review weekly, analyze monthly, and most importantly—they ACT on what they learn.
      </p>

      <p>
        You don&apos;t need a PhD in analytics. You just need to:
      </p>
      <ol>
        <li><strong>Look at the right metrics</strong> (the 5 that actually matter)</li>
        <li><strong>Do it consistently</strong> (daily check-in, weekly review, monthly deep dive)</li>
        <li><strong>Take action</strong> (data without action is just numbers)</li>
      </ol>

      <Callout type="success" title="Start Small, Build the Habit">
        Don&apos;t try to implement everything today. Start with the 2-minute daily check-in. Once that&apos;s a habit, add the weekly review. Build momentum gradually.
      </Callout>

      <h2 id="related">Related Pages</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/reports" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Reports Overview</h3>
          <p className="text-sm text-gray-500">See all available reports and what they track</p>
        </Link>
        <Link href="/features/reports/sales" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Sales Reports</h3>
          <p className="text-sm text-gray-500">Detailed revenue tracking and analysis</p>
        </Link>
        <Link href="/features/reports/appointments" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Appointment Analytics</h3>
          <p className="text-sm text-gray-500">No-shows, utilization, and booking patterns</p>
        </Link>
        <Link href="/features/reports/outcomes" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Treatment Outcomes</h3>
          <p className="text-sm text-gray-500">Patient retention and treatment effectiveness</p>
        </Link>
      </div>
    </div>
  )
}
