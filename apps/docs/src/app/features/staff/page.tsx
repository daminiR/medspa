import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Staff Management - MedSpa Platform',
  description: 'Manage your team, schedules, and permissions',
}

export default function StaffManagementPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            Complete
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Staff Management</h1>
        <p className="text-xl text-gray-600">
          Your complete team management hub. Add staff members, manage schedules,
          approve shifts, and track performance - all in one place.
        </p>
      </div>

      {/* Video Placeholder */}
      <div className="mb-12 bg-gray-100 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
        <p className="text-gray-600 font-medium">Staff Management Overview Video</p>
        <p className="text-sm text-gray-500 mt-1">3 min tour of team management features</p>
      </div>

      {/* Feature Tabs Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Four Powerful Views</h2>
        <p className="text-gray-600 mb-6">
          Staff Management is organized into four tabs, each focused on a different aspect
          of team management.
        </p>

        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="flex border-b">
            <div className="px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium">Staff Directory</div>
            <div className="px-4 py-2 text-gray-600 text-sm font-medium">Shift Approvals</div>
            <div className="px-4 py-2 text-gray-600 text-sm font-medium">Schedule Templates</div>
            <div className="px-4 py-2 text-gray-600 text-sm font-medium">Metrics</div>
          </div>
          <div className="p-4 text-sm text-gray-600">
            Click any tab to switch between views. Each view provides specialized tools for that task.
          </div>
        </div>
      </section>

      {/* Staff Directory Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Directory</h2>
        <p className="text-gray-600 mb-6">
          Your complete team roster with search, filtering, and quick actions.
        </p>

        {/* Screenshot Placeholder */}
        <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Staff Directory Screenshot</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Search & Filter</h4>
            <p className="text-sm text-gray-600">
              Find staff by name, role, or department. Filter by active/inactive status.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Quick View Cards</h4>
            <p className="text-sm text-gray-600">
              See role, contact info, and schedule status at a glance.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Add New Staff</h4>
            <p className="text-sm text-gray-600">
              One-click to add new team members with guided setup.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Bulk Selection</h4>
            <p className="text-sm text-gray-600">
              Select multiple staff members for bulk schedule updates.
            </p>
          </div>
        </div>
      </section>

      {/* Staff Detail Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Profiles</h2>
        <p className="text-gray-600 mb-6">
          Click any staff member to view their full profile with all details and actions.
        </p>

        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-indigo-600">DS</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Dr. Sarah Smith</h3>
              <p className="text-sm text-gray-500">Physician - Injectables, Laser</p>
              <p className="text-sm text-gray-500">sarah.smith@clinic.com</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-xs text-gray-500">Patients This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">$48.5K</p>
              <p className="text-xs text-gray-500">Revenue This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">82%</p>
              <p className="text-xs text-gray-500">Utilization Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Profile Actions:</strong> Edit details, view schedule, check upcoming appointments,
            or deactivate the staff member - all from the profile view.
          </p>
        </div>
      </section>

      {/* Shift Approvals Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Shift Approvals</h2>
        <p className="text-gray-600 mb-6">
          Review and approve shift change requests, time-off requests, and schedule modifications.
        </p>

        <div className="bg-white border rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-3 border-b bg-yellow-50">
            <span className="text-sm font-medium text-yellow-800">3 Pending Approvals</span>
          </div>
          <div className="divide-y">
            <div className="px-4 py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Jenny Martinez</p>
                <p className="text-xs text-gray-500">Swap: Tuesday 9-5 → Wednesday 9-5</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded">Approve</button>
                <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded">Deny</button>
              </div>
            </div>
            <div className="px-4 py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">Sarah RN</p>
                <p className="text-xs text-gray-500">Time Off: Dec 23-26 (Holiday)</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded">Approve</button>
                <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded">Deny</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>Smart Conflict Detection:</strong> The system automatically checks for scheduling
            conflicts before you approve. You'll see warnings if approving would cause double-booking.
          </p>
        </div>
      </section>

      {/* Schedule Templates Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Schedule Templates</h2>
        <p className="text-gray-600 mb-6">
          Create reusable schedule templates and apply them to multiple staff members at once.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Standard Full-Time</h4>
            <p className="text-sm text-gray-600 mb-3">Mon-Fri, 9:00 AM - 5:00 PM</p>
            <div className="flex gap-1">
              {['M', 'T', 'W', 'T', 'F'].map((day, i) => (
                <span key={i} className="w-6 h-6 bg-indigo-100 text-indigo-700 text-xs rounded flex items-center justify-center">
                  {day}
                </span>
              ))}
              {['S', 'S'].map((day, i) => (
                <span key={i} className="w-6 h-6 bg-gray-100 text-gray-400 text-xs rounded flex items-center justify-center">
                  {day}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Part-Time Mornings</h4>
            <p className="text-sm text-gray-600 mb-3">Mon, Wed, Fri - 8:00 AM - 1:00 PM</p>
            <div className="flex gap-1">
              <span className="w-6 h-6 bg-indigo-100 text-indigo-700 text-xs rounded flex items-center justify-center">M</span>
              <span className="w-6 h-6 bg-gray-100 text-gray-400 text-xs rounded flex items-center justify-center">T</span>
              <span className="w-6 h-6 bg-indigo-100 text-indigo-700 text-xs rounded flex items-center justify-center">W</span>
              <span className="w-6 h-6 bg-gray-100 text-gray-400 text-xs rounded flex items-center justify-center">T</span>
              <span className="w-6 h-6 bg-indigo-100 text-indigo-700 text-xs rounded flex items-center justify-center">F</span>
              <span className="w-6 h-6 bg-gray-100 text-gray-400 text-xs rounded flex items-center justify-center">S</span>
              <span className="w-6 h-6 bg-gray-100 text-gray-400 text-xs rounded flex items-center justify-center">S</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Bulk Apply:</strong> Select multiple staff members from the directory, then apply
            a template to set everyone's schedule at once. Perfect for seasonal schedule changes.
          </p>
        </div>
      </section>

      {/* Pending Widget Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Items Widget</h2>
        <p className="text-gray-600 mb-6">
          A quick-glance widget at the top of the page shows all items needing your attention.
        </p>

        <div className="bg-white border rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">3</p>
              <p className="text-xs text-yellow-600">Shift Requests</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">2</p>
              <p className="text-xs text-blue-600">Time Off</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">1</p>
              <p className="text-xs text-green-600">Onboarding</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">0</p>
              <p className="text-xs text-purple-600">Training</p>
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Staff Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Adding & Editing Staff</h2>
        <p className="text-gray-600 mb-6">
          A comprehensive form for adding new team members or updating existing profiles.
        </p>

        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Staff Form Fields</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Full Name</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Email Address</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Phone Number</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Role/Title</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Department</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Services Provided</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Start Date</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Access Permissions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Staff Metrics</h2>
        <p className="text-gray-600 mb-6">
          Performance analytics for your team (coming soon with enhanced reporting).
        </p>

        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">📊</span>
          </div>
          <p className="text-gray-600 font-medium">Staff Metrics Dashboard</p>
          <p className="text-sm text-gray-500 mt-1">Performance analytics and KPIs coming soon</p>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h2>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-1">Keep Profiles Updated</h4>
            <p className="text-sm text-blue-800">
              Update service offerings and certifications regularly to ensure proper appointment routing.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-1">Use Templates for Consistency</h4>
            <p className="text-sm text-green-800">
              Create templates for common schedule patterns to save time and ensure consistency.
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-1">Review Approvals Daily</h4>
            <p className="text-sm text-yellow-800">
              Check pending approvals at least once daily to keep schedules accurate and staff happy.
            </p>
          </div>
        </div>
      </section>

      {/* Related Features */}
      <section className="border-t pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Features</h2>
        <div className="grid grid-cols-2 gap-4">
          <a href="/features/calendar" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <h3 className="font-medium text-gray-900">Calendar & Scheduling</h3>
            <p className="text-sm text-gray-600">See staff schedules on the calendar</p>
          </a>
          <a href="/features/settings/users" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
            <h3 className="font-medium text-gray-900">User Permissions</h3>
            <p className="text-sm text-gray-600">Configure role-based access control</p>
          </a>
        </div>
      </section>
    </div>
  )
}
