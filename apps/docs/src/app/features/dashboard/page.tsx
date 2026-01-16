import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - MedSpa Platform',
  description: 'Real-time business intelligence at a glance',
}

export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            Complete
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <p className="text-xl text-gray-600">
          Your command center for daily operations. See everything happening in your practice
          at a glance - from today's revenue to provider performance.
        </p>
      </div>

      {/* Video Placeholder */}
      <div className="mb-12 bg-gray-100 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <p className="text-gray-600 font-medium">Dashboard Overview Video</p>
        <p className="text-sm text-gray-500 mt-1">2 min walkthrough of your daily dashboard</p>
      </div>

      {/* Key Metrics Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Metrics</h2>
        <p className="text-gray-600 mb-6">
          Four key performance indicators update throughout the day, giving you instant visibility
          into business health.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">$</span>
              </div>
              <span className="font-medium">Today's Revenue</span>
            </div>
            <p className="text-sm text-gray-600">
              Live revenue tracking with comparison to previous periods
            </p>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">#</span>
              </div>
              <span className="font-medium">Appointments Today</span>
            </div>
            <p className="text-sm text-gray-600">
              Total scheduled appointments with trend indicator
            </p>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">+</span>
              </div>
              <span className="font-medium">New Patients</span>
            </div>
            <p className="text-sm text-gray-600">
              New patient acquisitions today vs. previous period
            </p>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">=</span>
              </div>
              <span className="font-medium">Total Patients</span>
            </div>
            <p className="text-sm text-gray-600">
              Your growing patient database with growth rate
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Trend Indicators:</strong> Green arrows show improvement over the previous
            period, red arrows indicate decline. Percentages help you spot patterns quickly.
          </p>
        </div>
      </section>

      {/* Today's Schedule Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Today's Schedule</h2>
        <p className="text-gray-600 mb-6">
          A live view of your day's appointments with status tracking. No need to switch to
          the calendar for a quick glance.
        </p>

        {/* Mock Schedule */}
        <div className="bg-white border rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
            <span className="font-medium">Today's Schedule</span>
            <span className="text-sm text-indigo-600">View Calendar →</span>
          </div>
          <div className="divide-y">
            <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-16">9:00 AM</span>
                <div>
                  <div className="font-medium text-sm">Sarah Johnson</div>
                  <div className="text-xs text-gray-500">Botox - Dr. Smith</div>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Completed</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center bg-blue-50">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-16">10:00 AM</span>
                <div>
                  <div className="font-medium text-sm">Emily Rodriguez</div>
                  <div className="text-xs text-gray-500">Filler - Dr. Lee</div>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">In Progress</span>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-16">10:30 AM</span>
                <div>
                  <div className="font-medium text-sm">James Wilson</div>
                  <div className="text-xs text-gray-500">Laser - Sarah RN</div>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">Confirmed</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Status Colors:</strong> Green = Completed, Blue = In Progress, Gray = Confirmed/Upcoming.
            The current appointment is highlighted for quick reference.
          </p>
        </div>
      </section>

      {/* Provider Performance Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Provider Performance</h2>
        <p className="text-gray-600 mb-6">
          Track each provider's daily performance including patient count, revenue generated,
          and schedule utilization.
        </p>

        <div className="bg-white border rounded-lg p-4 mb-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-sm">Dr. Smith</span>
                <span className="text-xs text-gray-500">8 patients - $2,400</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <span className="text-xs text-gray-500">85% utilization</span>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-sm">Dr. Lee</span>
                <span className="text-xs text-gray-500">6 patients - $1,800</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{width: '75%'}}></div>
              </div>
              <span className="text-xs text-gray-500">75% utilization</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Utilization Rate:</strong> Measures booked time vs. available time.
            Target 80%+ for optimal scheduling efficiency while leaving room for walk-ins.
          </p>
        </div>
      </section>

      {/* Activity Feed Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-600 mb-6">
          A real-time feed of everything happening in your practice - bookings, payments,
          messages, and more.
        </p>

        <div className="bg-white border rounded-lg divide-y">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xs">CAL</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">New appointment booked</p>
              <p className="text-xs text-gray-500">David Kim - 5 min ago</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xs">$</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Payment received</p>
              <p className="text-xs text-gray-500">$650 - 12 min ago</p>
            </div>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xs">MSG</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">New message</p>
              <p className="text-xs text-gray-500">Anna Lee - 25 min ago</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks & Reminders</h2>
        <p className="text-gray-600 mb-6">
          Keep track of follow-ups, inventory orders, and other to-dos right from your dashboard.
        </p>

        <div className="bg-white border rounded-lg divide-y">
          <div className="px-4 py-3 flex items-start gap-3">
            <input type="checkbox" className="mt-1 rounded" disabled />
            <div className="flex-1">
              <p className="text-sm">Call back Maria about rescheduling</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">Today 2:00 PM</span>
                <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">high</span>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 flex items-start gap-3">
            <input type="checkbox" className="mt-1 rounded" disabled />
            <div className="flex-1">
              <p className="text-sm">Order more Botox units</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">Today 5:00 PM</span>
                <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">medium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <p className="text-gray-600 mb-6">
          One-click access to common tasks directly from your dashboard.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-600 text-white rounded-lg p-4 text-center">
            <span className="font-medium">+ New Appointment</span>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <span className="font-medium text-gray-700">View Calendar</span>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="border-t pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Features</h2>
        <div className="grid grid-cols-2 gap-4">
          <a href="/features/calendar" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <h3 className="font-medium text-gray-900">Calendar & Scheduling</h3>
            <p className="text-sm text-gray-600">Full calendar view with drag-and-drop</p>
          </a>
          <a href="/features/reports" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <h3 className="font-medium text-gray-900">Reports & Analytics</h3>
            <p className="text-sm text-gray-600">Deep dive into your business data</p>
          </a>
        </div>
      </section>
    </div>
  )
}
