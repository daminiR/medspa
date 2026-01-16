'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Bell, CreditCard, LogOut, ChevronRight, Heart } from 'lucide-react';
import { paymentService } from '@/lib/payments/paymentService';
import type { PaymentMethod } from '@/lib/payments/mockData';

export default function ProfilePage() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPaymentMethods(paymentService.getPaymentMethods());
  }, []);

  const defaultMethod = paymentMethods.find((m) => m.isDefault);
  const hsaFsaCount = paymentMethods.filter((m) => m.isHsaFsa).length;

  const handleSaveChanges = async () => {
    setIsSaving(true);
    // Mock save logic - in production this would call an API
    console.log('Saving profile changes...');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show success feedback
    alert('Profile changes saved successfully!');
    setIsSaving(false);
  };

  const handleSignOut = () => {
    // Clear any local storage or session data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token');
      sessionStorage.clear();
    }
    // Redirect to logout page which will handle the full sign out
    router.push('/auth/logout');
  };

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
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
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
          <CardContent className="space-y-4">
            {/* Payment Summary */}
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {/* Default Card */}
                {defaultMethod && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-medium">
                          {defaultMethod.brand.charAt(0).toUpperCase() +
                            defaultMethod.brand.slice(1)}{' '}
                          ending in {defaultMethod.last4}
                        </p>
                        <p className="text-sm text-gray-500">Default payment method</p>
                      </div>
                    </div>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      Default
                    </span>
                  </div>
                )}

                {/* HSA/FSA Summary */}
                {hsaFsaCount > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-800">
                        {hsaFsaCount} HSA/FSA {hsaFsaCount === 1 ? 'Card' : 'Cards'} on File
                      </p>
                      <p className="text-sm text-emerald-600">
                        Save on eligible medical expenses
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Count */}
                <p className="text-sm text-gray-500">
                  {paymentMethods.length} payment{' '}
                  {paymentMethods.length === 1 ? 'method' : 'methods'} saved
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No payment methods added yet.</p>
            )}

            <Link href="/profile/payment-methods">
              <Button variant="outline" className="w-full justify-between">
                <span>Manage Payment Methods</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
