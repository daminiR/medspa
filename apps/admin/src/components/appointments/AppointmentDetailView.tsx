'use client'

import { useState } from 'react'
import { X, Calendar, Clock, User, MapPin, DollarSign, FileText, Edit, History, Footprints } from 'lucide-react'
import moment from 'moment'
import { type Appointment, practitioners, services, locations } from '@/lib/data'
import { mockRooms } from '@/lib/mockResources'
import AppointmentHistory from './AppointmentHistory'
import AddToCalendarButton from './AddToCalendarButton'

interface AppointmentDetailViewProps {
  appointment: Appointment
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

export default function AppointmentDetailView({
  appointment,
  isOpen,
  onClose,
  onEdit
}: AppointmentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')

  // Get service details
  const service = services.find(s => s.name === appointment.serviceName)

  // Get practitioner for calendar export
  const practitioner = practitioners.find(p => p.id === appointment.practitionerId)

  // Get location for calendar export
  const location = appointment.locationId
    ? locations.find(l => l.id === appointment.locationId)
    : locations[0] // Default to first location

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Appointment Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center text-sm font-medium"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            {/* Add to Calendar Button */}
            {practitioner && (
              <AddToCalendarButton
                appointment={appointment}
                practitioner={practitioner}
                location={location}
                variant="outline"
                size="md"
              />
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'details'
              ? 'text-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <Calendar className="h-4 w-4 mr-2" />
            Booking Details
          </div>
          {activeTab === 'details' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'history'
              ? 'text-purple-600 bg-purple-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <History className="h-4 w-4 mr-2" />
            History & Activity
          </div>
          {activeTab === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' ? (
          <div className="p-6 space-y-6">
            {/* Service Info */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">{appointment.serviceName}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-700">{appointment.duration} minutes</span>
                <span className="font-semibold text-purple-900">
                  <DollarSign className="h-4 w-4 inline" />
                  {service?.price || 'N/A'}
                </span>
              </div>
              {appointment.postTreatmentTime && (
                <div className="mt-2 text-xs text-purple-600">
                  + {appointment.postTreatmentTime} min post-treatment time
                </div>
              )}
            </div>

            {/* DateTime Info */}
            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium">{moment(appointment.startTime).format('dddd, MMMM D, YYYY')}</p>
                  <p className="text-sm text-gray-500">
                    {moment(appointment.startTime).format('h:mm A')} - {moment(appointment.endTime).format('h:mm A')}
                  </p>
                </div>
              </div>

              {/* Practitioner */}
              <div className="flex items-center text-gray-700">
                <User className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {practitioners.find(p => p.id === appointment.practitionerId)?.name || 'Unknown Practitioner'}
                  </p>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </div>

              {/* Location */}
              {appointment.roomId && (
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {mockRooms.find(r => r.id === appointment.roomId)?.name || appointment.roomId}
                    </p>
                    <p className="text-sm text-gray-500">Treatment Room</p>
                  </div>
                </div>
              )}
            </div>

            {/* Client Info */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Client Information</h4>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">{appointment.patientName}</span>
                </p>
                {appointment.phone && (
                  <p className="text-sm text-gray-600">
                    Phone: {appointment.phone}
                  </p>
                )}
                {appointment.email && (
                  <p className="text-sm text-gray-600">
                    Email: {appointment.email}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            {appointment.notes && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Notes
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{appointment.notes}</p>
              </div>
            )}

            {/* Status */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  appointment.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                  appointment.status === 'arrived' ? 'bg-indigo-100 text-indigo-800' :
                  appointment.status === 'scheduled' ? 'bg-gray-100 text-gray-800' :
                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  appointment.status === 'no_show' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1).replace('_', ' ')}
                </span>
              </div>
              {appointment.cancellationReason && (
                <div className="mt-3 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Cancellation Reason:</span> {appointment.cancellationReason}
                  </p>
                  {appointment.cancelledAt && (
                    <p className="text-xs text-red-600 mt-1">
                      Cancelled on {moment(appointment.cancelledAt).format('MMM D, YYYY h:mm A')}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Booking Type & Check-In Time */}
            {(appointment.bookingType || appointment.checkInTime) && (
              <div className="border-t pt-6">
                {appointment.bookingType && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Booking Type</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                      appointment.bookingType === 'walk_in' ? 'bg-orange-100 text-orange-800' :
                      appointment.bookingType === 'express_booking' ? 'bg-amber-100 text-amber-800' :
                      appointment.bookingType === 'from_waitlist' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.bookingType === 'walk_in' && (
                        <Footprints className="h-3 w-3" />
                      )}
                      {appointment.bookingType === 'walk_in' ? 'Walk-In' :
                       appointment.bookingType === 'express_booking' ? 'Express Booking' :
                       appointment.bookingType === 'from_waitlist' ? 'From Waitlist' :
                       'Scheduled'}
                    </span>
                  </div>
                )}
                {appointment.checkInTime && (
                  <div className="p-3 bg-orange-50 rounded-md">
                    <div className="flex items-center gap-2 text-orange-800">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Checked in at {moment(appointment.checkInTime).format('h:mm A')}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      {moment(appointment.checkInTime).format('MMM D, YYYY')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <AppointmentHistory
            appointmentId={appointment.id}
            onEventClick={(event) => {
              console.log('Event clicked:', event)
              // Could open a modal with more details, allow resending emails, etc.
            }}
          />
        )}
      </div>
    </div>
  )
}