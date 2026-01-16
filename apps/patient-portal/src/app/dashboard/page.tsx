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
