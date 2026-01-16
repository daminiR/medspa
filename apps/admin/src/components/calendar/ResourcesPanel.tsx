'use client'

import React, { useState } from 'react'
import { X, Zap, Activity, Search } from 'lucide-react'
import moment from 'moment'
import { mockResourcePools, mockResourceAssignments } from '@/lib/mockResources'
import { Resource, ResourcePool, ResourceAssignment } from '@/types/resources'

interface ResourcesPanelProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  view: 'day' | 'week' | 'month'
  weekDates?: Date[]
}

export default function ResourcesPanel({ 
  isOpen, 
  onClose,
  selectedDate,
  view,
  weekDates = []
}: ResourcesPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null)

  if (!isOpen) return null

  // Get date range based on view
  const startDate = view === 'week' && weekDates.length > 0 ? weekDates[0] : selectedDate
  const endDate = view === 'week' && weekDates.length > 0 ? weekDates[weekDates.length - 1] : selectedDate

  // Filter resource assignments for the current date range
  const relevantAssignments = mockResourceAssignments.filter(assignment => {
    const assignmentDate = moment(assignment.startTime).startOf('day')
    const start = moment(startDate).startOf('day')
    const end = moment(endDate).endOf('day')
    return assignmentDate.isBetween(start, end, 'day', '[]')
  })

  // Filter resource pools based on search
  const filteredPools = mockResourcePools.filter(pool =>
    pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pool.resources.some(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getResourceIcon = (poolName: string) => {
    if (poolName.includes('Laser')) return <Zap className="h-5 w-5" />
    if (poolName.includes('IPL')) return <Activity className="h-5 w-5" />
    if (poolName.includes('X-Ray')) return <Activity className="h-5 w-5" />
    return <Zap className="h-5 w-5" />
  }

  const getResourceUsage = (resourceId: string) => {
    return relevantAssignments.filter(a => a.resourceId === resourceId)
  }

  return (
    <div className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-full max-w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-30 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Resources</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Date Range */}
          <div className="text-sm opacity-90">
            {view === 'week' ? (
              <span>{moment(startDate).format('MMM D')} - {moment(endDate).format('MMM D, YYYY')}</span>
            ) : (
              <span>{moment(selectedDate).format('MMMM D, YYYY')}</span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Resource List */}
        <div className="flex-1 overflow-y-auto">
          {filteredPools.map(pool => (
            <div key={pool.id} className="border-b">
              <button
                onClick={() => setSelectedPoolId(selectedPoolId === pool.id ? null : pool.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-green-600">
                    {getResourceIcon(pool.name)}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{pool.name}</h3>
                    <p className="text-sm text-gray-500">{pool.resources.length} resource{pool.resources.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className={`transform transition-transform ${selectedPoolId === pool.id ? 'rotate-180' : ''}`}>
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {selectedPoolId === pool.id && (
                <div className="px-4 py-2 bg-gray-50">
                  {pool.resources.map(resource => {
                    const usage = getResourceUsage(resource.id)
                    const isInUse = usage.length > 0

                    return (
                      <div key={resource.id} className="py-2 border-b border-gray-200 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-800">{resource.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isInUse ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {isInUse ? 'In Use' : 'Available'}
                          </span>
                        </div>
                        
                        {usage.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {usage.map((assignment, idx) => (
                              <div key={idx} className="text-xs text-gray-600 bg-white rounded p-2">
                                <div className="font-medium">
                                  {moment(assignment.startTime).format('ddd MMM D')}
                                </div>
                                <div>
                                  {moment(assignment.startTime).format('h:mm A')} - {moment(assignment.endTime).format('h:mm A')}
                                </div>
                                <div className="text-gray-500">
                                  Appointment #{assignment.appointmentId}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                  
                  {pool.description && (
                    <p className="text-sm text-gray-600 mt-2 italic">{pool.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Resources</p>
              <p className="font-semibold text-gray-900">
                {mockResourcePools.reduce((sum, pool) => sum + pool.resources.length, 0)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">In Use</p>
              <p className="font-semibold text-red-600">
                {relevantAssignments.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}