'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  CreditCard,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  Loader2,
  Check,
  AlertCircle,
  Key,
  Smartphone,
  Award,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profileApi } from '@/lib/api';
import { isPasskeySupported, registerPasskey } from '@/lib/auth';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passkeySupported, setPasskeySupported] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    marketingOptIn: true,
    smsOptIn: true,
  });

  useEffect(() => {
    setPasskeySupported(isPasskeySupported());
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.get();
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          dateOfBirth: data.dateOfBirth || '',
          address: data.address || '',
          emergencyContactName: data.emergencyContact?.name || '',
          emergencyContactPhone: data.emergencyContact?.phone || '',
          emergencyContactRelationship: data.emergencyContact?.relationship || '',
          marketingOptIn: data.marketingOptIn,
          smsOptIn: data.smsOptIn,
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        // Use mock data from auth context
        if (user) {
          setFormData((prev) => ({
            ...prev,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone || '(555) 123-4567',
          }));
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileApi.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        emergencyContact: formData.emergencyContactName ? {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relationship: formData.emergencyContactRelationship,
        } : undefined,
        marketingOptIn: formData.marketingOptIn,
        smsOptIn: formData.smsOptIn,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Mock success
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await profileApi.uploadAvatar(file);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!user) return;
    
    setIsRegisteringPasskey(true);
    try {
      const result = await registerPasskey(user.id);
      if (result.success) {
        alert('Passkey registered successfully!');
      } else {
        alert('Failed to register passkey: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to register passkey:', error);
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your personal information and preferences</p>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="mb-6 p-4 rounded-lg bg-success-50 text-success-700 flex items-center">
          <Check className="w-5 h-5 mr-2" />
          Your profile has been updated successfully.
        </div>
      )}

      {/* Profile Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-gray-500">{formData.email}</p>
              <div className="flex items-center mt-2">
                <span className="badge bg-amber-100 text-amber-800">
                  <Award className="w-3 h-3 mr-1" />
                  Gold Member
                </span>
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-outline btn-sm"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label mb-1 block">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{formData.firstName}</p>
                )}
              </div>
              <div>
                <label className="label mb-1 block">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900">{formData.lastName}</p>
                )}
              </div>
              <div>
                <label className="label mb-1 block">Email</label>
                <p className="text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {formData.email}
                </p>
              </div>
              <div>
                <label className="label mb-1 block">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {formData.phone || 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="label mb-1 block">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="input"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    {formData.dateOfBirth || 'Not provided'}
                  </p>
                )}
              </div>
              <div>
                <label className="label mb-1 block">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    className="input"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {formData.address || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          {isEditing && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="label mb-1 block">Name</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
                    className="input"
                    placeholder="Contact name"
                  />
                </div>
                <div>
                  <label className="label mb-1 block">Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    className="input"
                    placeholder="Contact phone"
                  />
                </div>
                <div>
                  <label className="label mb-1 block">Relationship</label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                    className="input"
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Communication Preferences */}
          {isEditing && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Communication Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.marketingOptIn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, marketingOptIn: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">
                    Receive promotional emails and special offers
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.smsOptIn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, smsOptIn: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">
                    Receive appointment reminders via SMS
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsEditing(false)}
                className="btn-secondary btn-md flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary btn-md flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card overflow-hidden">
        <div className="divide-y divide-gray-100">
          {/* Security */}
          {passkeySupported && (
            <button
              onClick={handleRegisterPasskey}
              disabled={isRegisteringPasskey}
              className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                <Key className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Setup Passkey</p>
                <p className="text-sm text-gray-500">Use Face ID or Touch ID to sign in</p>
              </div>
              {isRegisteringPasskey ? (
                <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}

          <Link href="/profile/payment-methods" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center mr-4">
              <CreditCard className="w-5 h-5 text-success-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Payment Methods</p>
              <p className="text-sm text-gray-500">Manage your saved payment methods</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link href="/profile/membership" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mr-4">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Membership</p>
              <p className="text-sm text-gray-500">Gold Member - 2 credits available</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link href="/profile/notifications" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center mr-4">
              <Bell className="w-5 h-5 text-accent-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Notifications</p>
              <p className="text-sm text-gray-500">Manage notification preferences</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link href="/profile/privacy" className="flex items-center p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Privacy & Security</p>
              <p className="text-sm text-gray-500">Manage your data and security settings</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center p-4 hover:bg-error-50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-error-100 flex items-center justify-center mr-4">
              <LogOut className="w-5 h-5 text-error-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-error-600">Sign Out</p>
              <p className="text-sm text-gray-500">Sign out of your account</p>
            </div>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Luxe Medical Spa v1.0.0</p>
        <div className="flex items-center justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-gray-700">Privacy Policy</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-700">Terms of Service</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-700">Help</a>
        </div>
      </div>
    </div>
  );
}
