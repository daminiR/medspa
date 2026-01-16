import { VideoPlaceholder } from '@/components/docs/VideoPlaceholder'
import { Callout } from '@/components/docs/Callout'
import Link from 'next/link'
import { Settings, Users, Shield, MessageSquare, Bell, Building2, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="prose animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Settings className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> 85% Complete
        </span>
      </div>
      <h1>Settings</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Configure your clinic, manage users, and customize your Luxe Medical Spa experience.
        All settings are centralized for easy access and management.
      </p>

      {/* Video */}
      <VideoPlaceholder
        title="Settings Overview"
        duration="4 min"
        description="Learn how to configure your clinic settings, manage users, and customize the platform"
      />

      <h2 id="settings-sections">Settings Sections</h2>
      <p>
        The Settings page is organized into logical sections to help you quickly find and manage different aspects of your clinic.
      </p>

      <div className="grid md:grid-cols-2 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">General Settings</h3>
          </div>
          <p className="text-sm text-gray-500">Clinic name, address, phone, business hours, and timezone configuration.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Users & Roles</h3>
          </div>
          <p className="text-sm text-gray-500">Manage staff accounts, assign roles, and control permissions.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Quick Replies</h3>
          </div>
          <p className="text-sm text-gray-500">Configure templated responses for common patient messages.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">SMS Templates</h3>
          </div>
          <p className="text-sm text-gray-500">Customize appointment reminders, confirmations, and marketing messages.</p>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Security</h3>
          </div>
          <p className="text-sm text-gray-500">Password policies, session timeouts, and audit logging. (Coming soon)</p>
        </div>
      </div>

      <Callout type="info" title="Role-Based Access">
        Only users with Admin or Owner roles can access the full Settings page.
        Managers can view settings but cannot modify critical configurations.
      </Callout>

      <h2 id="related">Related Features</h2>
      <div className="not-prose grid gap-4 md:grid-cols-2">
        <Link href="/features/settings/users" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">User Management</h3>
          <p className="text-sm text-gray-500">Add, edit, and manage staff accounts and permissions</p>
        </Link>
        <Link href="/features/messaging/templates" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">SMS Templates</h3>
          <p className="text-sm text-gray-500">Configure automated message templates</p>
        </Link>
        <Link href="/features/messaging/quick-replies" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Quick Replies</h3>
          <p className="text-sm text-gray-500">Set up templated responses for common inquiries</p>
        </Link>
        <Link href="/features/charting" className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary-300 transition-all">
          <h3 className="font-semibold text-gray-900">Charting Settings</h3>
          <p className="text-sm text-gray-500">Configure charting preferences and injection point defaults</p>
        </Link>
      </div>
    </div>
  )
}
