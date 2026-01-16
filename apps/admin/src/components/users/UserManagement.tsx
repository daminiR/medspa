'use client'

import { useState, useMemo, useCallback } from 'react'
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Shield,
  Mail,
  Phone,
  Clock,
  MoreVertical,
  User as UserIcon,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { User, UserRole, UserStatus, UserFormData, USER_ROLES } from '@/types/users'
import { getAllUsers, addUser, updateUser, deleteUser, toggleUserStatus, filterUsers } from '@/lib/data'
import { UserModal } from './UserModal'
import { RolePermissionsMatrix } from './RolePermissionsMatrix'
import toast from 'react-hot-toast'

type ViewMode = 'users' | 'permissions'

export function UserManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('users')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Get filtered users
  const filteredUsers = useMemo(() => {
    return filterUsers({
      search: searchQuery,
      role: roleFilter,
      status: statusFilter,
    })
  }, [searchQuery, roleFilter, statusFilter])

  // Get user counts by role
  const userCounts = useMemo(() => {
    const allUsers = getAllUsers()
    return {
      total: allUsers.length,
      active: allUsers.filter(u => u.status === 'active').length,
      inactive: allUsers.filter(u => u.status === 'inactive').length,
      byRole: USER_ROLES.reduce((acc, role) => {
        acc[role] = allUsers.filter(u => u.role === role).length
        return acc
      }, {} as Record<UserRole, number>)
    }
  }, [filteredUsers])

  const handleAddUser = useCallback(() => {
    setEditingUser(null)
    setIsModalOpen(true)
  }, [])

  const handleEditUser = useCallback((user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
    setActiveDropdown(null)
  }, [])

  const handleSaveUser = useCallback(async (data: UserFormData) => {
    setIsSaving(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editingUser) {
        updateUser(editingUser.id, data)
        toast.success('User updated successfully')
      } else {
        addUser(data)
        toast.success('User added successfully')
      }
      setIsModalOpen(false)
      setEditingUser(null)
    } catch (error) {
      toast.error('Failed to save user')
    } finally {
      setIsSaving(false)
    }
  }, [editingUser])

  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      deleteUser(userId)
      toast.success('User deleted successfully')
      setShowDeleteConfirm(null)
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }, [])

  const handleToggleStatus = useCallback(async (userId: string) => {
    try {
      const user = toggleUserStatus(userId)
      if (user) {
        toast.success(`User ${user.status === 'active' ? 'activated' : 'deactivated'} successfully`)
      }
      setActiveDropdown(null)
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }, [])

  const formatLastLogin = (date?: Date) => {
    if (!date) return 'Never'
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Owner':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Admin':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'Manager':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Provider':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Front Desk':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Billing':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* View Toggle Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setViewMode('users')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 -mb-px ${
            viewMode === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Users ({userCounts.total})
        </button>
        <button
          onClick={() => setViewMode('permissions')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 -mb-px ${
            viewMode === 'permissions'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          Role Permissions
        </button>
      </div>

      {viewMode === 'users' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userCounts.total}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">{userCounts.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Inactive</p>
                  <p className="text-2xl font-bold text-gray-500">{userCounts.inactive}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-gray-500" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Providers</p>
                  <p className="text-2xl font-bold text-blue-600">{userCounts.byRole['Provider'] || 0}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Roles</option>
                  {USER_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Add User Button */}
              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                      <p className="text-gray-500">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-purple-600">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {user.email}
                              </span>
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3.5 w-3.5" />
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {formatLastLogin(user.lastLogin)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-500" />
                          </button>

                          {activeDropdown === user.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveDropdown(null)}
                              />
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  Edit User
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(user.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  {user.status === 'active' ? (
                                    <>
                                      <XCircle className="h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </button>
                                <hr className="my-1" />
                                <button
                                  onClick={() => {
                                    setShowDeleteConfirm(user.id)
                                    setActiveDropdown(null)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete User
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Footer with count */}
            {filteredUsers.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {filteredUsers.length} of {userCounts.total} users
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        <RolePermissionsMatrix />
      )}

      {/* Add/Edit User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
        }}
        onSave={handleSaveUser}
        user={editingUser}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowDeleteConfirm(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[400px] max-w-[95vw] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? They will lose access to the system immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
