'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, parseISO, isToday, isTomorrow, isThisWeek } from 'date-fns';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  Camera,
  MessageSquare,
  Star,
  TrendingUp,
  Award,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsApi, type Appointment } from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await appointmentsApi.getUpcoming();
        setAppointments(data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
        // Use mock data for demonstration
        setAppointments([
          {
            id: '1',
            serviceName: 'Botox Treatment',
            serviceCategory: 'Injectables',
            providerName: 'Dr. Sarah Smith',
            providerTitle: 'MD',
            locationName: 'Luxe Medical Spa - Downtown',
            locationAddress: '123 Main St, Suite 100',
            startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            duration: 60,
            status: 'confirmed',
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
            startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
            duration: 90,
            status: 'confirmed',
            price: 250,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatAppointmentDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMM d');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const nextAppointment = appointments[0];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here is what is happening with your aesthetic journey.
          </p>
        </div>
        <Link href="/booking" className="btn-primary btn-md shrink-0">
          <Plus className="w-5 h-5 mr-2" />
          Book Appointment
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Upcoming</span>
            <Calendar className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
          <p className="text-xs text-gray-500">appointments</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Photos</span>
            <Camera className="w-5 h-5 text-accent-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">12</p>
          <p className="text-xs text-gray-500">in gallery</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Messages</span>
            <MessageSquare className="w-5 h-5 text-success-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">2</p>
          <p className="text-xs text-gray-500">unread</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Savings</span>
            <TrendingUp className="w-5 h-5 text-warning-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">$850</p>
          <p className="text-xs text-gray-500">this year</p>
        </div>
      </div>

      {/* Next Appointment Card */}
      {nextAppointment && (
        <div className="card p-6 bg-gradient-to-br from-primary-50 to-white border-primary-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="badge-primary mb-2">Next Appointment</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">
                {nextAppointment.serviceName}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">
                {formatAppointmentDate(nextAppointment.startTime)}
              </p>
              <p className="text-sm text-gray-600">
                {format(parseISO(nextAppointment.startTime), 'h:mm a')}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm">{nextAppointment.providerName}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">{nextAppointment.duration} minutes</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{nextAppointment.locationName}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={'/appointments/' + nextAppointment.id}
              className="btn-primary btn-sm"
            >
              View Details
            </Link>
            <button className="btn-outline btn-sm">
              Reschedule
            </button>
            <button className="btn-ghost btn-sm text-error-600 hover:bg-error-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Upcoming Appointments</h2>
              <Link href="/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No upcoming appointments</p>
                <p className="text-sm text-gray-500 mb-4">Book your next treatment today!</p>
                <Link href="/booking" className="btn-primary btn-sm">
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {appointments.slice(0, 3).map((appointment) => (
                  <Link
                    key={appointment.id}
                    href={'/appointments/' + appointment.id}
                    className="flex items-center p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {appointment.serviceName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatAppointmentDate(appointment.startTime)} at{' '}
                        {format(parseISO(appointment.startTime), 'h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={'badge ' + (appointment.status === 'confirmed' ? 'badge-success' : 'badge-warning')}>
                        {appointment.status}
                      </span>
                      <ArrowRight className="w-4 h-4 ml-2 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Membership Card */}
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium opacity-90">Gold Member</span>
                <Award className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold">2 Credits</p>
              <p className="text-sm opacity-75">Use for any treatment</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Total Savings</span>
                <span className="font-semibold text-gray-900">$1,250</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Next Renewal</span>
                <span className="font-semibold text-gray-900">Mar 1, 2025</span>
              </div>
              <Link href="/profile/membership" className="btn-outline btn-sm w-full mt-4">
                Manage Membership
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/booking" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
                  <Calendar className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Book Appointment</p>
                  <p className="text-sm text-gray-500">Schedule your next visit</p>
                </div>
              </Link>

              <Link href="/photos" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center mr-3">
                  <Camera className="w-5 h-5 text-accent-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">View Progress</p>
                  <p className="text-sm text-gray-500">See your before/after photos</p>
                </div>
              </Link>

              <Link href="/messages" className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center mr-3">
                  <MessageSquare className="w-5 h-5 text-success-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Message Provider</p>
                  <p className="text-sm text-gray-500">Ask questions or share updates</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Review Prompt */}
          <div className="card p-4 bg-primary-50 border-primary-100">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mr-3">
                <Star className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">How was your last visit?</p>
                <p className="text-sm text-gray-600 mt-1">
                  Your feedback helps us improve. Leave a review for your Botox treatment.
                </p>
                <button className="text-sm text-primary-600 font-medium mt-2 hover:text-primary-700">
                  Leave Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
