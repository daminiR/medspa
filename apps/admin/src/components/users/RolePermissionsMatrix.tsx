'use client'

import { Shield, Eye, Edit3, X as XIcon, Info } from 'lucide-react'
import {
  PERMISSION_CATEGORIES,
  DEFAULT_ROLE_PERMISSIONS,
  USER_ROLES,
  PermissionLevel
} from '@/types/users'

interface RolePermissionsMatrixProps {
  onClose?: () => void
}

export function RolePermissionsMatrix({ onClose }: RolePermissionsMatrixProps) {
  const getPermissionIcon = (level: PermissionLevel) => {
    switch (level) {
      case 'edit':
        return <Edit3 className="h-4 w-4 text-green-600" />
      case 'view':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'none':
        return <XIcon className="h-4 w-4 text-gray-300" />
    }
  }

  const getPermissionLabel = (level: PermissionLevel) => {
    switch (level) {
      case 'edit':
        return 'Full Access'
      case 'view':
        return 'View Only'
      case 'none':
        return 'No Access'
    }
  }

  const getPermissionBadge = (level: PermissionLevel) => {
    switch (level) {
      case 'edit':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'view':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'none':
        return 'bg-gray-100 text-gray-400 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Role Permissions Matrix</h3>
              <p className="text-sm text-gray-500">View permissions for each role (read-only)</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <XIcon className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Info Banner */}
      <div className="mx-6 mt-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800">
            This matrix shows the default permissions for each role. Contact your administrator to request permission changes.
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 flex items-center gap-6 text-sm">
        <span className="text-gray-500 font-medium">Legend:</span>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded border text-xs font-medium ${getPermissionBadge('edit')}`}>
            <Edit3 className="h-3 w-3 inline mr-1" />
            Full Access
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded border text-xs font-medium ${getPermissionBadge('view')}`}>
            <Eye className="h-3 w-3 inline mr-1" />
            View Only
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded border text-xs font-medium ${getPermissionBadge('none')}`}>
            <XIcon className="h-3 w-3 inline mr-1" />
            No Access
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="p-6 pt-2 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200 w-40">
                Permission
              </th>
              {USER_ROLES.map((role) => (
                <th
                  key={role}
                  className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200 min-w-[100px]"
                >
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_CATEGORIES.map((category, index) => (
              <tr key={category.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 border border-gray-200">
                  <div>
                    <span className="font-medium text-gray-900">{category.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                  </div>
                </td>
                {USER_ROLES.map((role) => {
                  const rolePermissions = DEFAULT_ROLE_PERMISSIONS.find(rp => rp.role === role)
                  const permissionLevel = rolePermissions?.permissions[category.key as keyof typeof rolePermissions.permissions] || 'none'

                  return (
                    <td key={`${role}-${category.key}`} className="px-4 py-3 text-center border border-gray-200">
                      <div className="flex items-center justify-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${getPermissionBadge(permissionLevel)}`}
                          title={getPermissionLabel(permissionLevel)}
                        >
                          {getPermissionIcon(permissionLevel)}
                          <span className="hidden sm:inline">{permissionLevel === 'edit' ? 'Edit' : permissionLevel === 'view' ? 'View' : '-'}</span>
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-500 text-center">
          Permission levels determine what actions users can perform in each area of the system.
          Contact your system administrator to modify role permissions.
        </p>
      </div>
    </div>
  )
}
