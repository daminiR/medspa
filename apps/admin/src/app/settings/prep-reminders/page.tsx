'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Clock,
  Mail,
  MessageSquare,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Syringe,
  Zap,
  Heart,
  Activity,
  Sun,
  Edit2,
  Save,
  Eye,
  Copy,
} from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import {
  PREP_INSTRUCTIONS,
  PrepInstruction,
  DEFAULT_PREP_SETTINGS,
  PrepReminderSettings,
} from '@/lib/data/preVisitPrep';

// Category icons and colors
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  injectable: { icon: <Syringe className="h-4 w-4" />, color: 'bg-pink-100 text-pink-600', label: 'Injectables' },
  laser: { icon: <Zap className="h-4 w-4" />, color: 'bg-amber-100 text-amber-600', label: 'Laser' },
  facial: { icon: <Sparkles className="h-4 w-4" />, color: 'bg-purple-100 text-purple-600', label: 'Facials & Peels' },
  body: { icon: <Activity className="h-4 w-4" />, color: 'bg-blue-100 text-blue-600', label: 'Body' },
  wellness: { icon: <Heart className="h-4 w-4" />, color: 'bg-green-100 text-green-600', label: 'Wellness' },
};

export default function PrepRemindersSettingsPage() {
  const [settings, setSettings] = useState<PrepReminderSettings>(DEFAULT_PREP_SETTINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTreatments, setExpandedTreatments] = useState<Set<string>>(new Set());
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editedTemplates, setEditedTemplates] = useState<Record<string, string>>({});
  const [previewTreatment, setPreviewTreatment] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Group treatments by category
  const treatmentsByCategory = Object.values(PREP_INSTRUCTIONS).reduce((acc, treatment) => {
    if (!acc[treatment.category]) {
      acc[treatment.category] = [];
    }
    acc[treatment.category].push(treatment);
    return acc;
  }, {} as Record<string, PrepInstruction[]>);

  // Filter treatments based on search and category
  const filteredTreatments = Object.values(PREP_INSTRUCTIONS).filter(treatment => {
    const matchesSearch = searchQuery === '' ||
      treatment.treatment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || treatment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle treatment expansion
  const toggleTreatment = (id: string) => {
    const newExpanded = new Set(expandedTreatments);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTreatments(newExpanded);
  };

  // Handle settings change
  const handleSettingChange = (key: keyof PrepReminderSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    showSavedMessage('Settings updated');
  };

  // Save template edit
  const saveTemplateEdit = (treatmentId: string) => {
    setEditingTemplate(null);
    showSavedMessage('Template saved');
  };

  // Show saved message
  const showSavedMessage = (message: string) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(null), 2000);
  };

  // Copy template to clipboard
  const copyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
    showSavedMessage('Copied to clipboard');
  };

  // Generate preview message
  const generatePreview = (template: string) => {
    return template
      .replace('{{patientFirstName}}', 'Sarah')
      .replace('{{appointmentDate}}', 'Tuesday, Dec 17')
      .replace('{{appointmentTime}}', '2:00 PM');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Pre-Visit Prep Reminders</h1>
              <p className="text-sm text-gray-500">Automated treatment preparation instructions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && (
              <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Check className="h-4 w-4" />
                {savedMessage}
              </span>
            )}
            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save All Changes
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Global Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Settings className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Global Settings</h2>
                <p className="text-sm text-gray-500">Configure when and how prep reminders are sent</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Enable Pre-Visit Prep Reminders</div>
                <div className="text-sm text-gray-500">Send treatment-specific preparation instructions to patients</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
              </label>
            </div>

            {/* Default Timing */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Default Reminder Timing</div>
                <div className="text-sm text-gray-500">Days before appointment to send prep instructions</div>
              </div>
              <select
                value={settings.defaultTimingDays}
                onChange={(e) => handleSettingChange('defaultTimingDays', parseInt(e.target.value))}
                className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before (recommended)</option>
                <option value={5}>5 days before</option>
                <option value={7}>1 week before</option>
              </select>
            </div>

            {/* Delivery Channels */}
            <div className="space-y-4">
              <div className="font-medium text-gray-900">Delivery Channels</div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.sendViaSMS}
                    onChange={(e) => handleSettingChange('sendViaSMS', e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">SMS</div>
                    <div className="text-xs text-gray-500">Short, essential prep tips</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.sendViaEmail}
                    onChange={(e) => handleSettingChange('sendViaEmail', e.target.checked)}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <div className="text-xs text-gray-500">Detailed instructions with lists</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4 border-t pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeInConfirmation}
                  onChange={(e) => handleSettingChange('includeInConfirmation', e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Include in Booking Confirmation</div>
                  <div className="text-xs text-gray-500">Add prep tips to the initial confirmation message</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sendSeparateReminder}
                  onChange={(e) => handleSettingChange('sendSeparateReminder', e.target.checked)}
                  className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Send Separate Prep Reminder</div>
                  <div className="text-xs text-gray-500">Send dedicated prep reminder in addition to standard appointment reminders</div>
                </div>
              </label>
            </div>

            {/* Reminder Time */}
            <div className="flex items-center justify-between border-t pt-6">
              <div>
                <div className="font-medium text-gray-900">Send Time</div>
                <div className="text-sm text-gray-500">Time of day to send prep reminders</div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
                  className="border rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Templates */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Bell className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Treatment Prep Templates</h2>
                  <p className="text-sm text-gray-500">{Object.keys(PREP_INSTRUCTIONS).length} treatments configured</p>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search treatments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === null
                      ? 'bg-pink-100 text-pink-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      selectedCategory === key
                        ? config.color
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Treatment List */}
          <div className="divide-y">
            {filteredTreatments.map((treatment) => (
              <div key={treatment.id} className="hover:bg-gray-50">
                {/* Treatment Header */}
                <button
                  onClick={() => toggleTreatment(treatment.id)}
                  className="w-full px-6 py-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${categoryConfig[treatment.category].color}`}>
                      {categoryConfig[treatment.category].icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{treatment.treatment}</div>
                      <div className="text-sm text-gray-500">
                        {treatment.instructions.length} instructions  Send {treatment.timing.idealDaysBefore} days before
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={treatment.enabled}
                        onChange={() => {}}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                    {expandedTreatments.has(treatment.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedTreatments.has(treatment.id) && (
                  <div className="px-6 pb-6 space-y-6">
                    {/* Timing */}
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Send timing:</span>
                        <select className="border rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500">
                          <option value={treatment.timing.idealDaysBefore}>
                            {treatment.timing.idealDaysBefore} days before (recommended)
                          </option>
                          {[1, 2, 3, 5, 7, 14].filter(d => d !== treatment.timing.idealDaysBefore).map(days => (
                            <option key={days} value={days}>{days} days before</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Instructions List */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">Preparation Instructions</div>
                      <div className="grid gap-2">
                        {treatment.instructions.map((instruction, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-lg">{instruction.icon || ''}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{instruction.title}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  instruction.priority === 'required'
                                    ? 'bg-red-100 text-red-700'
                                    : instruction.priority === 'recommended'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {instruction.priority}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">{instruction.description}</div>
                              <div className="text-xs text-gray-400 mt-1">{instruction.timeframe}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Do Not / Bring Lists */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                          <X className="h-4 w-4" />
                          Do NOT
                        </div>
                        <ul className="space-y-1 text-sm text-red-600">
                          {treatment.doNotList.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                          <Check className="h-4 w-4" />
                          Bring to Appointment
                        </div>
                        <ul className="space-y-1 text-sm text-green-600">
                          {treatment.bringList.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span></span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* SMS Template */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-700">SMS Template</div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyTemplate(treatment.smsTemplate)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPreviewTreatment(previewTreatment === treatment.id ? null : treatment.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingTemplate(editingTemplate === treatment.id ? null : treatment.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {editingTemplate === treatment.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editedTemplates[treatment.id] || treatment.smsTemplate}
                            onChange={(e) => setEditedTemplates(prev => ({ ...prev, [treatment.id]: e.target.value }))}
                            className="w-full p-3 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-500"
                            rows={3}
                          />
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Variables: {`{{patientFirstName}}, {{appointmentDate}}, {{appointmentTime}}`}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingTemplate(null)}
                                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => saveTemplateEdit(treatment.id)}
                                className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : previewTreatment === treatment.id ? (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-xs text-blue-600 font-medium mb-2">Preview (as patient sees it)</div>
                          <div className="text-sm text-blue-800">
                            {generatePreview(editedTemplates[treatment.id] || treatment.smsTemplate)}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 font-mono">
                          {treatment.smsTemplate}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{(editedTemplates[treatment.id] || treatment.smsTemplate).length} characters</span>
                        <span></span>
                        <span>{Math.ceil((editedTemplates[treatment.id] || treatment.smsTemplate).length / 160)} SMS segment(s)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Why Pre-Visit Prep Matters</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li> <strong>Better outcomes:</strong> Properly prepared patients have fewer complications and better results</li>
                <li> <strong>Reduced delays:</strong> Patients arrive ready, reducing prep time at the clinic</li>
                <li> <strong>Patient confidence:</strong> Clear instructions reduce anxiety and increase satisfaction</li>
                <li> <strong>Fewer cancellations:</strong> Patients who feel prepared are less likely to cancel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
