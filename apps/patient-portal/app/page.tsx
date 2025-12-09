'use client';

import { useState } from 'react';
import { Calendar, Clock, CreditCard, FileText, MessageSquare, User, ChevronRight, Star, Package, Bell, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const upcomingAppointments = [
    {
      id: 1,
      service: 'Botox Treatment',
      provider: 'Dr. Sarah Smith',
      date: 'Tomorrow',
      time: '2:00 PM',
      location: 'Luxe Medical Spa - Downtown',
      status: 'confirmed'
    },
    {
      id: 2,
      service: 'HydraFacial',
      provider: 'Jenny Chen',
      date: 'Next Thursday',
      time: '10:00 AM',
      location: 'Luxe Medical Spa - Downtown',
      status: 'confirmed'
    }
  ];

  const treatmentHistory = [
    {
      date: '2024-01-15',
      treatment: 'Botox - Forehead & Crow\'s Feet',
      provider: 'Dr. Smith',
      cost: 450,
      notes: 'Great results, minimal bruising'
    },
    {
      date: '2023-12-10',
      treatment: 'Dermal Filler - Lips',
      provider: 'Dr. Lee',
      cost: 650,
      notes: 'Natural enhancement achieved'
    },
    {
      date: '2023-11-20',
      treatment: 'Chemical Peel',
      provider: 'Sarah RN',
      cost: 250,
      notes: 'Skin texture improved significantly'
    }
  ];

  const membershipInfo = {
    tier: 'Gold',
    credits: 2,
    nextRenewal: '2024-03-01',
    savings: 1250,
    benefits: [
      '20% off all treatments',
      '2 free HydraFacials per year',
      'Priority booking',
      'Exclusive member events'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Luxe Medical Spa</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 p-2">
                <Bell className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700 p-2">
                <MessageSquare className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm">
                  JD
                </div>
                <span className="text-sm font-medium">Jane Doe</span>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: User },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'records', label: 'Medical Records', icon: FileText },
              { id: 'billing', label: 'Billing', icon: CreditCard },
              { id: 'membership', label: 'Membership', icon: Star },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Welcome back, Jane!</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-600 font-medium">Next Appointment</p>
                      <p className="text-lg font-semibold mt-1">Tomorrow, 2:00 PM</p>
                      <p className="text-sm text-gray-600">Botox Treatment</p>
                    </div>
                    <Calendar className="h-8 w-8 text-indigo-400" />
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Membership Credits</p>
                      <p className="text-lg font-semibold mt-1">2 Available</p>
                      <p className="text-sm text-gray-600">Gold Member</p>
                    </div>
                    <Star className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total Savings</p>
                      <p className="text-lg font-semibold mt-1">$1,250</p>
                      <p className="text-sm text-gray-600">This year</p>
                    </div>
                    <Package className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                  <Calendar className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Book Appointment</span>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                  <MessageSquare className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Message Clinic</span>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                  <CreditCard className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">Make Payment</span>
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
                  <FileText className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <span className="text-sm font-medium">View Records</span>
                </button>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="divide-y">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{apt.service}</h4>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {apt.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {apt.time}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {apt.provider}
                          </span>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {apt.location}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                          Reschedule
                        </button>
                        <button className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Treatment History */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Treatments</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View Full History
                  </button>
                </div>
              </div>
              <div className="divide-y">
                {treatmentHistory.map((treatment, idx) => (
                  <div key={idx} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{treatment.treatment}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {treatment.date} • {treatment.provider}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">{treatment.notes}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">${treatment.cost}</p>
                        <button className="text-sm text-indigo-600 hover:text-indigo-700 mt-1">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            {/* Book New Appointment */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Book New Appointment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="border rounded-lg px-4 py-2">
                  <option>Select Service</option>
                  <option>Botox</option>
                  <option>Dermal Fillers</option>
                  <option>HydraFacial</option>
                  <option>Chemical Peel</option>
                  <option>Laser Treatment</option>
                </select>
                <select className="border rounded-lg px-4 py-2">
                  <option>Select Provider</option>
                  <option>Dr. Sarah Smith</option>
                  <option>Dr. Michael Lee</option>
                  <option>Any Provider</option>
                </select>
                <input type="date" className="border rounded-lg px-4 py-2" />
              </div>
              <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Find Available Times
              </button>
            </div>

            {/* Appointment List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Your Appointments</h3>
              </div>
              <div className="divide-y">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{apt.service}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {apt.date} at {apt.time} • {apt.provider}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'membership' && (
          <div className="space-y-6">
            {/* Membership Status */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{membershipInfo.tier} Member</h3>
                  <p className="mt-2">Member since January 2023</p>
                  <p className="text-sm mt-4 opacity-90">Next renewal: {membershipInfo.nextRenewal}</p>
                </div>
                <Star className="h-16 w-16 text-yellow-300" />
              </div>
            </div>

            {/* Membership Benefits */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Your Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {membershipInfo.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-green-500 mr-2" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Credits and Savings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Available Credits</h3>
                <div className="text-3xl font-bold text-indigo-600">{membershipInfo.credits}</div>
                <p className="text-gray-600 mt-2">Use for any treatment</p>
                <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
                  Use Credits →
                </button>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Total Savings</h3>
                <div className="text-3xl font-bold text-green-600">${membershipInfo.savings}</div>
                <p className="text-gray-600 mt-2">Saved this year</p>
                <button className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Luxe Medical Spa</h3>
              <p className="text-gray-400 text-sm">Your journey to beauty and wellness starts here.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <p className="flex items-center"><Phone className="h-4 w-4 mr-2" /> (555) 123-4567</p>
                <p className="flex items-center"><Mail className="h-4 w-4 mr-2" /> info@luxemedspa.com</p>
                <p className="flex items-center"><MapPin className="h-4 w-4 mr-2" /> 123 Main St, City, ST 12345</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hours</h4>
              <div className="space-y-1 text-gray-400 text-sm">
                <p>Monday - Friday: 9am - 7pm</p>
                <p>Saturday: 10am - 6pm</p>
                <p>Sunday: 11am - 5pm</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}