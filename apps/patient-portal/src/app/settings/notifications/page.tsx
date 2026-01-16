'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bell,
  Calendar,
  MessageSquare,
  Gift,
  Megaphone,
  Clock,
  Save,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationSettings {
  appointments: boolean;
  appointmentReminders: boolean;
  appointmentChanges: boolean;
  messages: boolean;
  rewards: boolean;
  promotions: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export default function NotificationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    appointments: true,
    appointmentReminders: true,
    appointmentChanges: true,
    messages: true,
    rewards: true,
    promotions: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
  });

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSavedSuccess(false);
  };

  const handleTimeChange = (key: 'quietHoursStart' | 'quietHoursEnd', value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setSavedSuccess(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation, you would call the API:
      // await fetch('/api/notifications/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-gray-600">
          Manage how and when you receive notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Appointment Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Appointment Notifications</CardTitle>
                <CardDescription>
                  Stay updated about your appointments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleItem
              label="All Appointment Notifications"
              description="Receive notifications about appointments"
              checked={settings.appointments}
              onChange={() => handleToggle('appointments')}
            />
            <div className="pl-6 space-y-4 border-l-2 border-gray-200">
              <ToggleItem
                label="Appointment Reminders"
                description="Reminders 24 hours and 1 hour before appointments"
                checked={settings.appointmentReminders}
                onChange={() => handleToggle('appointmentReminders')}
                disabled={!settings.appointments}
              />
              <ToggleItem
                label="Appointment Changes"
                description="Confirmations, cancellations, and rescheduling updates"
                checked={settings.appointmentChanges}
                onChange={() => handleToggle('appointmentChanges')}
                disabled={!settings.appointments}
              />
            </div>
          </CardContent>
        </Card>

        {/* Message Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Message Notifications</CardTitle>
                <CardDescription>
                  Get notified about new messages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ToggleItem
              label="New Messages"
              description="Receive notifications when the medical spa team sends you a message"
              checked={settings.messages}
              onChange={() => handleToggle('messages')}
            />
          </CardContent>
        </Card>

        {/* Rewards Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Rewards & Points</CardTitle>
                <CardDescription>
                  Updates about your rewards and loyalty points
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ToggleItem
              label="Reward Notifications"
              description="Points earned, rewards unlocked, and special member benefits"
              checked={settings.rewards}
              onChange={() => handleToggle('rewards')}
            />
          </CardContent>
        </Card>

        {/* Promotional Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <CardTitle>Promotions & Updates</CardTitle>
                <CardDescription>
                  Special offers and news from Glow MedSpa
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ToggleItem
              label="Promotional Notifications"
              description="Special offers, new treatments, and exclusive deals"
              checked={settings.promotions}
              onChange={() => handleToggle('promotions')}
            />
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle>Quiet Hours</CardTitle>
                <CardDescription>
                  Pause non-urgent notifications during specific hours
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleItem
              label="Enable Quiet Hours"
              description="You'll still receive urgent appointment reminders"
              checked={settings.quietHoursEnabled}
              onChange={() => handleToggle('quietHoursEnabled')}
            />
            {settings.quietHoursEnabled && (
              <div className="pl-6 border-l-2 border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Quiet hours: {settings.quietHoursStart} - {settings.quietHoursEnd}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Browser Notifications */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-900 mb-1">
                  Browser Notifications
                </h3>
                <p className="text-sm text-purple-700 mb-3">
                  Enable push notifications in your browser to receive real-time alerts even when you're not on this page.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-purple-100"
                  onClick={() => {
                    if ('Notification' in window && Notification.permission === 'default') {
                      Notification.requestPermission();
                    }
                  }}
                >
                  {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
                    ? 'Notifications Enabled'
                    : 'Enable Browser Notifications'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm border-t py-4">
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">Settings saved successfully</span>
              </div>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ToggleItemProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

function ToggleItem({ label, description, checked, onChange, disabled }: ToggleItemProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h4
          className={cn(
            'font-medium mb-1',
            disabled && 'text-gray-400'
          )}
        >
          {label}
        </h4>
        <p
          className={cn(
            'text-sm text-gray-600',
            disabled && 'text-gray-400'
          )}
        >
          {description}
        </p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          checked && !disabled ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
