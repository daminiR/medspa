'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Filter,
  Search,
  MoreVertical,
  ChevronRight,
  Printer,
  CalendarPlus,
  XCircle,
  AlertCircle,
  Check,
} from 'lucide-react';
import { appointmentsApi, type Appointment } from '@/lib/api';

type TabType = 'upcoming' | 'past';

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const data = activeTab === 'upcoming'
          ? await appointmentsApi.getUpcoming()
          : await appointmentsApi.getPast();
        setAppointments(data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        // Mock data for demonstration
        setAppointments([
          {
            id: '1',
            serviceName: 'Botox Treatment',
            serviceCategory: 'Injectables',
            providerName: 'Dr. Sarah Smith',
            providerTitle: 'MD',
            locationName: 'Luxe Medical Spa - Downtown',
            locationAddress: '123 Main St, Suite 100',
            startTime: activeTab === 'upcoming'
              ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            duration: 60,
            status: activeTab === 'upcoming' ? 'confirmed' : 'completed',
            price: 450,
          },
          {
            id: '2',
            serviceName: 'HydraFacial',
            serviceCategory: 'Facials',
            providerName: 'Jenny Chen',
            providerTitle: 'Licensed Esthetician',
            locationName: 'Luxe Medical Spa - Downtown',
            locationAddress: '123 Main St, Suite 100',
            startTime: activeTab === 'upcoming'
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
            duration: 90,
            status: activeTab === 'upcoming' ? 'confirmed' : 'completed',
            price: 250,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [activeTab]);

  const filteredAppointments = appointments.filter((apt) =>
    apt.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    apt.providerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCancel = async () => {
    if (!selectedAppointment || !cancelReason) return;

    setIsCancelling(true);
    try {
      await appointmentsApi.cancel(selectedAppointment, cancelReason);
      setAppointments((prev) =>
        prev.filter((apt) => apt.id !== selectedAppointment)
      );
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrint = (appointmentId: string) => {
    // Open print view
    window.open('/appointments/' + appointmentId + '/print', '_blank');
  };

  const handleAddToCalendar = (appointment: Appointment) => {
    const startDate = parseISO(appointment.startTime);
    const endDate = parseISO(appointment.endTime);
    
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      'DTSTART:' + format(startDate, "yyyyMMdd'T'HHmmss"),
      'DTEND:' + format(endDate, "yyyyMMdd'T'HHmmss"),
      'SUMMARY:' + appointment.serviceName + ' at Luxe Medical Spa',
      'DESCRIPTION:' + appointment.serviceName + ' with ' + appointment.providerName,
      'LOCATION:' + appointment.locationAddress,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appointment.ics';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      pending: { class: 'badge-warning', label: 'Pending' },
      confirmed: { class: 'badge-success', label: 'Confirmed' },
      checked_in: { class: 'badge-primary', label: 'Checked In' },
      in_progress: { class: 'badge-primary', label: 'In Progress' },
      completed: { class: 'bg-gray-100 text-gray-700', label: 'Completed' },
      cancelled: { class: 'badge-error', label: 'Cancelled' },
      no_show: { class: 'badge-error', label: 'No Show' },
    };

    const config = statusConfig[status];
    return <span className={'badge ' + config.class}>{config.label}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your upcoming and past appointments</p>
        </div>
        <Link href="/booking" className="btn-primary btn-md shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Book New
        </Link>
      </div>

      {/* Tabs and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b border-gray-100">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + (activeTab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + (activeTab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}
            >
              Past
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Appointments List */}
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              {searchQuery
                ? 'No appointments match your search'
                : activeTab === 'upcoming'
                ? 'No upcoming appointments'
                : 'No past appointments'}
            </p>
            {!searchQuery && activeTab === 'upcoming' && (
              <>
                <p className="text-sm text-gray-500 mt-1 mb-4">Book your next treatment today!</p>
                <Link href="/booking" className="btn-primary btn-sm">
                  Book Appointment
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 rounded-xl bg-primary-100 flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-primary-600 uppercase">
                        {format(parseISO(appointment.startTime), 'MMM')}
                      </span>
                      <span className="text-lg font-bold text-primary-700">
                        {format(parseISO(appointment.startTime), 'd')}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {appointment.serviceName}
                        </h3>
                        {getStatusBadge(appointment.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {format(parseISO(appointment.startTime), 'h:mm a')} ({appointment.duration} min)
                        </span>
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {appointment.providerName}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {appointment.locationName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {activeTab === 'upcoming' && appointment.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleAddToCalendar(appointment)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Add to Calendar"
                        >
                          <CalendarPlus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handlePrint(appointment.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="Print Confirmation"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <Link
                      href={'/appointments/' + appointment.id}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

                {/* Action buttons for upcoming */}
                {activeTab === 'upcoming' && appointment.status !== 'cancelled' && (
                  <div className="flex items-center gap-2 mt-4 ml-[72px]">
                    <Link
                      href={'/appointments/' + appointment.id + '/reschedule'}
                      className="btn-outline btn-sm"
                    >
                      Reschedule
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment.id);
                        setShowCancelModal(true);
                      }}
                      className="btn-ghost btn-sm text-error-600 hover:bg-error-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Book again for past */}
                {activeTab === 'past' && appointment.status === 'completed' && (
                  <div className="flex items-center gap-2 mt-4 ml-[72px]">
                    <Link href="/booking" className="btn-outline btn-sm">
                      Book Again
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setShowCancelModal(false);
              setCancelReason('');
            }}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto">
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center mr-3">
                  <AlertCircle className="w-5 h-5 text-error-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cancel Appointment</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="label mb-1 block">Reason for cancellation</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please let us know why you are cancelling..."
                  className="input min-h-[100px]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="btn-secondary btn-md flex-1"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancel}
                  disabled={!cancelReason || isCancelling}
                  className="btn bg-error-600 text-white hover:bg-error-700 btn-md flex-1"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
