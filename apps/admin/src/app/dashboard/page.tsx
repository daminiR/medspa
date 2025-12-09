'use client';

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { 
  Calendar, Users, DollarSign, TrendingUp, 
  Clock, AlertCircle, CheckCircle, UserPlus,
  Activity, Package, MessageSquare, Star,
  ArrowUp, ArrowDown, BarChart3, FileText,
  Bell, ChevronRight, Stethoscope, CreditCard
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const today = new Date();
  
  // Mock data - in production, fetch from API
  const stats = {
    todayRevenue: 4850,
    todayRevenueChange: 12,
    todayAppointments: 18,
    todayAppointmentsChange: -5,
    newPatients: 3,
    newPatientsChange: 50,
    totalPatients: 1247,
    totalPatientsChange: 8,
  };

  const todaySchedule = [
    { time: '9:00 AM', patient: 'Sarah Johnson', service: 'Botox', provider: 'Dr. Smith', status: 'completed' },
    { time: '9:30 AM', patient: 'Michael Chen', service: 'Consultation', provider: 'Dr. Smith', status: 'completed' },
    { time: '10:00 AM', patient: 'Emily Rodriguez', service: 'Filler', provider: 'Dr. Lee', status: 'in-progress' },
    { time: '10:30 AM', patient: 'James Wilson', service: 'Laser', provider: 'Sarah RN', status: 'confirmed' },
    { time: '11:00 AM', patient: 'Lisa Anderson', service: 'Hydrafacial', provider: 'Jenny', status: 'confirmed' },
  ];

  const recentActivity = [
    { type: 'appointment', message: 'New appointment booked', patient: 'David Kim', time: '5 min ago', icon: Calendar },
    { type: 'payment', message: 'Payment received', amount: '$650', time: '12 min ago', icon: CreditCard },
    { type: 'message', message: 'New message', patient: 'Anna Lee', time: '25 min ago', icon: MessageSquare },
    { type: 'cancellation', message: 'Appointment cancelled', patient: 'Tom Brown', time: '1 hour ago', icon: AlertCircle },
    { type: 'review', message: 'New 5-star review', patient: 'Sarah J.', time: '2 hours ago', icon: Star },
  ];

  const upcomingTasks = [
    { task: 'Call back Maria about rescheduling', due: 'Today 2:00 PM', priority: 'high' },
    { task: 'Order more Botox units', due: 'Today 5:00 PM', priority: 'medium' },
    { task: 'Review lab results for Patient #1234', due: 'Tomorrow', priority: 'low' },
    { task: 'Send follow-up to yesterday\'s treatments', due: 'Tomorrow', priority: 'medium' },
  ];

  const providerStats = [
    { name: 'Dr. Smith', patients: 8, revenue: 2400, utilization: 85 },
    { name: 'Dr. Lee', patients: 6, revenue: 1800, utilization: 75 },
    { name: 'Sarah RN', patients: 4, revenue: 650, utilization: 60 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Main Content */}
      <div className="overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  New Appointment
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <span className={`text-sm flex items-center ${stats.todayRevenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.todayRevenueChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {Math.abs(stats.todayRevenueChange)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">${stats.todayRevenue.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Today's Revenue</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <span className={`text-sm flex items-center ${stats.todayAppointmentsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.todayAppointmentsChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  {Math.abs(stats.todayAppointmentsChange)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</h3>
              <p className="text-sm text-gray-500 mt-1">Appointments Today</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-sm flex items-center text-green-600">
                  <ArrowUp className="h-4 w-4" />
                  {stats.newPatientsChange}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.newPatients}</h3>
              <p className="text-sm text-gray-500 mt-1">New Patients</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-sm flex items-center text-green-600">
                  <ArrowUp className="h-4 w-4" />
                  {stats.totalPatientsChange}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalPatients.toLocaleString()}</h3>
              <p className="text-sm text-gray-500 mt-1">Total Patients</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Today's Schedule</h2>
                  <a href="/calendar" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center">
                    View Calendar
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
                <div className="divide-y">
                  {todaySchedule.map((apt, idx) => (
                    <div key={idx} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium w-20">{apt.time}</div>
                          <div>
                            <div className="font-medium text-gray-900">{apt.patient}</div>
                            <div className="text-sm text-gray-500">{apt.service} • {apt.provider}</div>
                          </div>
                        </div>
                        <div>
                          {apt.status === 'completed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </span>
                          )}
                          {apt.status === 'in-progress' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Clock className="h-3 w-3 mr-1" />
                              In Progress
                            </span>
                          )}
                          {apt.status === 'confirmed' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Confirmed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider Performance */}
              <div className="bg-white rounded-lg shadow-sm mt-6">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Provider Performance</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {providerStats.map((provider, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{provider.name}</div>
                          <div className="text-sm text-gray-500">
                            {provider.patients} patients • ${provider.revenue.toLocaleString()}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${provider.utilization}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{provider.utilization}% utilization</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                </div>
                <div className="divide-y">
                  {recentActivity.map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div key={idx} className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'appointment' ? 'bg-blue-100' :
                            activity.type === 'payment' ? 'bg-green-100' :
                            activity.type === 'message' ? 'bg-purple-100' :
                            activity.type === 'cancellation' ? 'bg-red-100' :
                            'bg-yellow-100'
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              activity.type === 'appointment' ? 'text-blue-600' :
                              activity.type === 'payment' ? 'text-green-600' :
                              activity.type === 'message' ? 'text-purple-600' :
                              activity.type === 'cancellation' ? 'text-red-600' :
                              'text-yellow-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.patient || activity.amount} • {activity.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Tasks & Reminders</h2>
                </div>
                <div className="divide-y">
                  {upcomingTasks.map((task, idx) => (
                    <div key={idx} className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" className="mt-1 rounded" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{task.task}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{task.due}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}