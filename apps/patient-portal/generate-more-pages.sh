#!/bin/bash

# Generate Messages Page
cat > src/app/messages/page.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Bot } from 'lucide-react';

export default function MessagesPage() {
  const conversations = [
    { id: 1, name: 'Medical Spa Team', lastMessage: 'Your appointment is confirmed', time: '2h ago', unread: 2 },
    { id: 2, name: 'AI Assistant', lastMessage: 'How can I help you today?', time: '1d ago', unread: 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4 flex items-center gap-4">
          <Bot className="w-10 h-10 text-blue-600" />
          <div>
            <h3 className="font-semibold">AI Chatbot Available</h3>
            <p className="text-sm text-gray-600">Get instant answers to your questions</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {conversations.map((conv) => (
          <Link key={conv.id} href={'/messages/' + conv.id}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold truncate">{conv.name}</h3>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {conv.unread}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
EOF

# Generate Profile Page
cat > src/app/profile/page.tsx << 'EOF'
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Lock, Bell, CreditCard, LogOut } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile & Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="Sarah" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Johnson" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="sarah@example.com" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Lock className="w-4 h-4 mr-2" />
              Manage Passkeys
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive appointment reminders via email</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive text message reminders</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Communications</p>
                <p className="text-sm text-gray-600">Receive promotions and updates</p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Add Payment Method
            </Button>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
EOF

# Generate Referrals Page
cat > src/app/referrals/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Mail, Share2, Users, Gift } from 'lucide-react';

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'SARAH2025';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Referral Program</h1>

      <Card className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Refer Friends, Earn Rewards</CardTitle>
          <p className="text-purple-100">Share your referral code and get 500 points for each friend who books!</p>
        </CardHeader>
        <CardContent>
          <div className="bg-white/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-purple-100 mb-2">Your Referral Code</p>
            <div className="flex items-center gap-2">
              <Input
                value={referralCode}
                readOnly
                className="bg-white text-gray-900 font-mono text-2xl font-bold"
              />
              <Button variant="secondary" size="icon" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied && <p className="text-xs text-green-200 mt-2">Copied to clipboard!</p>}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" size="sm" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="secondary" size="sm" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900 mb-1">12</p>
            <p className="text-gray-600">Friends Referred</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Gift className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900 mb-1">6,000</p>
            <p className="text-gray-600">Points Earned</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Emily Davis', date: '2025-11-15', points: 500, status: 'Complete' },
              { name: 'Mike Wilson', date: '2025-11-10', points: 500, status: 'Complete' },
              { name: 'Lisa Brown', date: '2025-12-01', points: 0, status: 'Pending' },
            ].map((referral, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{referral.name}</p>
                  <p className="text-sm text-gray-600">{referral.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">+{referral.points} pts</p>
                  <p className="text-xs text-gray-500">{referral.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
EOF

# Generate Rewards Page
cat > src/app/rewards/page.tsx << 'EOF'
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Star, Award } from 'lucide-react';

export default function RewardsPage() {
  const userPoints = 1250;

  const rewards = [
    { id: 1, name: '$25 Off Next Service', points: 500, available: true },
    { id: 2, name: 'Free Hydrafacial Add-on', points: 1000, available: true },
    { id: 3, name: '$50 Off Any Service', points: 1500, available: false },
    { id: 4, name: 'Complimentary Consultation', points: 2000, available: false },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Rewards Center</h1>

      <Card className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardContent className="p-6 text-center">
          <Award className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
          <p className="text-lg text-purple-100 mb-2">Your Points Balance</p>
          <p className="text-5xl font-bold mb-4">{userPoints}</p>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold">Gold</p>
              <p className="text-sm text-purple-100">Membership Tier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Available Rewards</h2>
      <div className="grid gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className={reward.available ? '' : 'opacity-60'}>
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{reward.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    {reward.points} points
                  </p>
                </div>
              </div>
              <Button
                disabled={!reward.available}
                variant={reward.available ? 'default' : 'outline'}
              >
                {reward.available ? 'Redeem' : 'Locked'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
EOF

# Generate Booking Confirmed Page
cat > src/app/booking/confirmed/page.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, Download } from 'lucide-react';

export default function BookingConfirmedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">Your appointment has been successfully booked</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Service</span>
            <span className="font-semibold">Botox Treatment</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Date</span>
            <span className="font-semibold">December 15, 2025</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Time</span>
            <span className="font-semibold">2:00 PM</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Provider</span>
            <span className="font-semibold">Dr. Smith</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button className="w-full" variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
        <Button className="w-full" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Receipt
        </Button>
        <Link href="/dashboard" className="block">
          <Button className="w-full">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
EOF

# Generate Register Page
cat > src/app/auth/register/page.tsx << 'EOF'
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push('/dashboard'), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Join our medical spa community</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-600 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
EOF

echo "Additional pages generated successfully!"
