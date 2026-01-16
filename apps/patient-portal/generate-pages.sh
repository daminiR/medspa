#!/bin/bash

# Generate Dashboard Page
cat > src/app/dashboard/page.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Camera, Gift, MessageSquare, Star } from 'lucide-react';

export default function DashboardPage() {
  const user = {
    firstName: 'Sarah',
    membershipTier: 'Gold',
    points: 1250,
    nextReward: 2000,
  };

  const upcomingAppointments = [
    { id: 1, service: 'Botox - Forehead', date: '2025-12-15', time: '2:00 PM', provider: 'Dr. Smith' },
    { id: 2, service: 'Hydrafacial', date: '2025-12-22', time: '10:30 AM', provider: 'Jane' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user.firstName}!</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-2xl">{user.membershipTier} Member</CardTitle>
                <p className="text-purple-100">Member ID: #12345</p>
              </div>
              <Star className="w-12 h-12 text-yellow-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Points Balance</span>
                  <span>{user.points} pts</span>
                </div>
                <div className="w-full bg-purple-400 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{width: '62%'}} />
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/rewards">View Rewards</Link>
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent border-white text-white" asChild>
                  <Link href="/referrals">Refer Friend</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: 'Book', href: '/booking', icon: Calendar, color: 'bg-purple-500' },
              { label: 'Photos', href: '/photos', icon: Camera, color: 'bg-pink-500' },
              { label: 'Rewards', href: '/rewards', icon: Gift, color: 'bg-blue-500' },
              { label: 'Messages', href: '/messages', icon: MessageSquare, color: 'bg-green-500' },
            ].map((action) => (
              <Link key={action.label} href={action.href} className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100">
                <div className={'w-10 h-10 ' + action.color + ' rounded-full flex items-center justify-center mb-2'}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Link href="/appointments"><Button variant="ghost" size="sm">View All</Button></Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{apt.service}</p>
                    <p className="text-sm text-gray-600">{apt.provider}</p>
                    <p className="text-sm text-gray-500">{apt.date} at {apt.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-8 h-8 text-purple-400" />
                </div>
              ))}
            </div>
            <Link href="/photos/upload"><Button className="w-full" variant="outline">Upload Photo</Button></Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
EOF

# Generate Appointments Page
cat > src/app/appointments/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

export default function AppointmentsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const appointments = [
    { id: 1, service: 'Botox - Forehead', date: '2025-12-15', time: '2:00 PM', provider: 'Dr. Smith', status: 'confirmed' },
    { id: 2, service: 'Hydrafacial', date: '2025-12-22', time: '10:30 AM', provider: 'Jane', status: 'confirmed' },
    { id: 3, service: 'Lip Filler', date: '2025-11-20', time: '3:00 PM', provider: 'Dr. Smith', status: 'completed' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Link href="/booking">
          <Button><Plus className="w-4 h-4 mr-2" />Book New</Button>
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'upcoming', 'past'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f as any)}
            className="capitalize"
          >
            {f}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {appointments.map((apt) => (
          <Card key={apt.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{apt.service}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{apt.date}</span>
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Provider: {apt.provider}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={'/appointments/' + apt.id}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                  {apt.status === 'confirmed' && (
                    <Button variant="outline" size="sm">Reschedule</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

# Generate Booking Page
cat > src/app/booking/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Check } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const services = [
    { id: '1', name: 'Botox', duration: '30 min', price: 350 },
    { id: '2', name: 'Dermal Fillers', duration: '45 min', price: 650 },
    { id: '3', name: 'Hydrafacial', duration: '60 min', price: 250 },
    { id: '4', name: 'Laser Hair Removal', duration: '30 min', price: 300 },
  ];

  const times = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

  const handleBooking = () => {
    router.push('/booking/confirmed');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Book Appointment</h1>

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={'w-10 h-10 rounded-full flex items-center justify-center font-semibold ' + (step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600')}>
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className={'w-16 h-1 mx-2 ' + (step > s ? 'bg-purple-600' : 'bg-gray-200')} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  className={'p-4 rounded-lg border-2 transition-colors text-left ' + (selectedService === service.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.duration}</p>
                    </div>
                    <p className="font-semibold">${service.price}</p>
                  </div>
                </button>
              ))}
            </div>
            <Button
              className="w-full mt-6"
              disabled={!selectedService}
              onClick={() => setStep(2)}
            >
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg"
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Time</label>
              <div className="grid grid-cols-3 gap-3">
                {times.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={'py-2 px-4 rounded-lg border-2 transition-colors ' + (selectedTime === time ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300')}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1" disabled={!selectedDate || !selectedTime} onClick={() => setStep(3)}>
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold">{services.find(s => s.id === selectedService)?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold">{selectedDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold">{selectedTime}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-lg">${services.find(s => s.id === selectedService)?.price}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
              <Button className="flex-1" onClick={handleBooking}>Confirm Booking</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
EOF

# Generate Photos Page
cat > src/app/photos/page.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';

export default function PhotosPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Photo Gallery</h1>
        <Link href="/photos/upload">
          <Button><Upload className="w-4 h-4 mr-2" />Upload Photos</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
            <Camera className="w-12 h-12 text-purple-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

echo "Pages generated successfully!"
