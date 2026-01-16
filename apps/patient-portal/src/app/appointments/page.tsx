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
