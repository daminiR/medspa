import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import { ComparisonTable } from '@/components/docs/ComparisonTable'
import Link from 'next/link'
import { Users, Shield, UserPlus, Edit, Search, Filter, CheckCircle2, Eye, X } from 'lucide-react'

export default function UserManagementPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>User & Role Management</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Manage your staff accounts, assign roles with appropriate permissions, and control access to different areas of the platform.
        Keep your team organized and your data secure.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="User Management Overview"
        duration="5 min"
        description="Learn how to add staff, assign roles, and manage permissions in your clinic"
      />

      <h2 id="features">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Add Users</h3>
          </div>
          <p className="text-sm text-gray-500">Create new staff accounts with name, email, phone, and role assignment.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Edit className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Edit Users</h3>
          </div>
          <p className="text-sm text-gray-500">Update user details, change roles, or deactivate accounts as needed.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Search & Filter</h3>
          </div>
          <p className="text-sm text-gray-500">Quickly find users by name or email, filter by role or status.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Permissions Matrix</h3>
          </div>
          <p className="text-sm text-gray-500">View role-based permissions at a glance with our visual permissions grid.</p>
        </div>
      </div>

      <h2 id="user-roles">User Roles</h2>
      <p>
        Luxe Medical Spa includes six pre-defined roles, each with specific permissions designed for different staff responsibilities:
      </p>

      <div className="not-prose mb-8">
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Owner</span>
            </div>
            <p className="text-sm text-gray-700">Full access to all features and settings. Can manage billing, view all reports, and configure the entire system.</p>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Admin</span>
            </div>
            <p className="text-sm text-gray-700">Full access to all features and settings. Can manage users, configure settings, and access all reports.</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Manager</span>
            </div>
            <p className="text-sm text-gray-700">Can manage staff schedules, approve refunds, view reports, and handle day-to-day operations. Limited settings access.</p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Provider</span>
            </div>
            <p className="text-sm text-gray-700">Practitioners who provide treatments. Can manage their own schedule, edit patient records, and view billing information.</p>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Front Desk</span>
            </div>
            <p className="text-sm text-gray-700">Handles check-ins, appointment scheduling, and basic patient inquiries. View-only access to patient records.</p>
          </div>
          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs font-medium rounded-full">Billing</span>
            </div>
            <p className="text-sm text-gray-700">Focuses on invoicing, payments, and financial reporting. Full billing access with limited clinical access.</p>
          </div>
        </div>
      </div>

      <h2 id="permissions-matrix">Permissions Matrix</h2>
      <p>
        Each role has specific permissions across different areas of the platform. The permissions matrix provides a clear view of what each role can access:
      </p>

      <div className="not-prose mb-8 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left font-semibold">Permission</th>
              <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Owner</th>
              <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Admin</th>
              <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Manager</th>
              <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Provider</th>
              <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Front Desk</th>
              <th className="border border-gray-200 px-4 py-2 text-center font-semibold">Billing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-medium">Calendar</td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 font-medium">Patients</td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-medium">Billing</td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 font-medium">Reports</td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-gray-400">None</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-4 py-2 font-medium">Settings</td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-gray-400">None</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-gray-400">None</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-gray-400">None</span></td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border border-gray-200 px-4 py-2 font-medium">Inventory</td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-green-600">Edit</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-blue-600">View</span></td>
              <td className="border border-gray-200 px-4 py-2 text-center"><span className="text-gray-400">None</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="info" title="Permission Levels">
        <strong>Edit</strong> = Full read/write access | <strong>View</strong> = Read-only access | <strong>None</strong> = No access
      </Callout>

      <h2 id="adding-users">Adding a New User</h2>
      <p>
        Follow these steps to add a new staff member to your clinic:
      </p>

      <StepList steps={[
        {
          title: 'Navigate to Settings > Users & Roles',
          description: 'Click the Settings icon in the navigation, then select "Users & Roles" from the sidebar.'
        },
        {
          title: 'Click "Add User"',
          description: 'Click the purple "Add User" button in the top right corner of the users table.'
        },
        {
          title: 'Fill in user details',
          description: 'Enter the user\'s first name, last name, email address, and phone number.'
        },
        {
          title: 'Select a role',
          description: 'Choose the appropriate role from the dropdown. This determines what features they can access.'
        },
        {
          title: 'Set status',
          description: 'Toggle the status to Active. New users are active by default.'
        },
        {
          title: 'Save the user',
          description: 'Click "Add User" to create the account. The user will receive an email to set their password.'
        }
      ]} />

      <h2 id="user-status">User Status</h2>
      <p>
        Users can have one of two statuses:
      </p>
      <ul>
        <li><strong>Active</strong> - User can log in and access the system based on their role permissions</li>
        <li><strong>Inactive</strong> - User cannot log in. Use this for former employees or temporary access suspension</li>
      </ul>

      <Callout type="warning" title="Deactivating vs. Deleting">
        We recommend deactivating users instead of deleting them. Deactivated users maintain their audit trail
        and historical records (who created appointments, processed payments, etc.).
      </Callout>

      <h2 id="best-practices">Best Practices</h2>
      <ul>
        <li><strong>Principle of least privilege</strong> - Assign users the minimum role needed for their job</li>
        <li><strong>Regular audits</strong> - Review user accounts quarterly to remove access for former employees</li>
        <li><strong>Unique accounts</strong> - Each staff member should have their own account for audit trail purposes</li>
        <li><strong>Secure emails</strong> - Use work emails, not personal emails, for staff accounts</li>
      </ul>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/settings" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Settings Overview</h3>
          <p className="text-sm text-gray-500">All clinic settings in one place</p>
        </Link>
        <Link href="/features/messaging/settings" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Settings</h3>
          <p className="text-sm text-gray-500">Configure SMS permissions and templates</p>
        </Link>
      </div>
    </div>
  )
}
