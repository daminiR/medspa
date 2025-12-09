'use client'

import React, { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { EnhancedFaceChart } from '@/components/billing/EnhancedFaceChart'
import { InjectableBilling } from '@/components/billing/InjectableBilling'
import {
  Camera,
  Upload,
  Save,
  FileText,
  Clock,
  User,
  Calendar,
  Syringe,
  Package,
  ChevronRight,
  Grid3x3,
  Image as ImageIcon,
  PenTool,
  History,
  Download,
  Printer
} from 'lucide-react'

export default function ChartingPage() {
  const [selectedPatient] = useState({ 
    id: 'PT-001', 
    name: 'Sarah Johnson',
    mrn: 'MRN-45678',
    lastVisit: '2024-01-15',
    upcomingAppt: '2024-02-10 at 2:00 PM'
  })
  const [activeTab, setActiveTab] = useState<'face-chart' | 'body-chart' | 'photos' | 'history'>('face-chart')
  const [showInjectableBilling, setShowInjectableBilling] = useState(false)
  const [treatmentNotes, setTreatmentNotes] = useState('')

  const tabs = [
    { id: 'face-chart', label: 'Face Charting', icon: Grid3x3 },
    { id: 'body-chart', label: 'Body Charting', icon: User },
    { id: 'photos', label: 'Before/After Photos', icon: Camera },
    { id: 'history', label: 'Treatment History', icon: History }
  ]

  const recentTreatments = [
    {
      date: '2024-01-15',
      provider: 'Dr. Amanda Chen',
      treatments: ['Botox - Forehead (20u)', 'Botox - Crow\'s Feet (24u)'],
      notes: 'Patient happy with results from last treatment. Maintaining same dosage.'
    },
    {
      date: '2023-12-10',
      provider: 'Dr. Amanda Chen',
      treatments: ['Lip Filler - 1ml Juvederm', 'Botox - Glabella (20u)'],
      notes: 'First time lip filler. Start conservative with 1ml.'
    },
    {
      date: '2023-10-05',
      provider: 'Dr. Michael Roberts',
      treatments: ['Chemical Peel - VI Peel', 'Botox - Forehead (20u)'],
      notes: 'Skin responding well to peels. Schedule follow-up in 6 weeks.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                SJ
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h1>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {selectedPatient.mrn}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Last visit: {selectedPatient.lastVisit}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Next: {selectedPatient.upcomingAppt}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <History className="w-4 h-4" />
                View Full Chart
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2">
                <PenTool className="w-4 h-4" />
                Start Treatment Note
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'face-chart' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Face Injection Charting</h2>
                  <button 
                    onClick={() => setShowInjectableBilling(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Syringe className="w-4 h-4" />
                    Open Injectable Billing
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">
                    Click on the face diagram to mark injection sites. Each point will be recorded with units/volume.
                  </p>
                </div>

                <EnhancedFaceChart
                  selectedZones={new Map()}
                  onZoneClick={(zone) => console.log('Zone clicked:', zone)}
                  productType="neurotoxin"
                  gender="female"
                />

                {/* Treatment Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Notes
                  </label>
                  <textarea
                    value={treatmentNotes}
                    onChange={(e) => setTreatmentNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={4}
                    placeholder="Enter treatment notes, technique used, patient feedback, etc."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between mt-6">
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Chart
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'body-chart' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Body Charting</h2>
                <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Body charting diagram will be displayed here</p>
                    <p className="text-sm text-gray-400 mt-2">Mark treatment areas, measurements, and notes</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Before/After Photos</h2>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Before</p>
                    <p className="text-sm text-gray-400 mt-1">Drop image or click to upload</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">After</p>
                    <p className="text-sm text-gray-400 mt-1">Drop image or click to upload</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Treatment History</h2>
                <div className="space-y-4">
                  {recentTreatments.map((treatment, idx) => (
                    <div key={idx} className="border-l-4 border-purple-500 pl-4 py-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{treatment.date}</p>
                          <p className="text-sm text-gray-600">Provider: {treatment.provider}</p>
                        </div>
                        <button className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm">
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-1">
                        {treatment.treatments.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Syringe className="w-3 h-3 text-purple-500" />
                            <span className="text-sm text-gray-700">{t}</span>
                          </div>
                        ))}
                      </div>
                      {treatment.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">Note: {treatment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Treatment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Visits</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Botox</span>
                  <span className="font-medium">6 weeks ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Filler</span>
                  <span className="font-medium">3 months ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Units (YTD)</span>
                  <span className="font-medium">164u</span>
                </div>
              </div>
            </div>

            {/* Products Used */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Common Products</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">Botox</span>
                  </div>
                  <span className="text-xs text-purple-600">Most Used</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Juvederm Ultra</span>
                  </div>
                  <span className="text-xs text-gray-500">2 times</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Dysport</span>
                  </div>
                  <span className="text-xs text-gray-500">1 time</span>
                </div>
              </div>
            </div>

            {/* Allergies & Alerts */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Allergies & Alerts</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>No known drug allergies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>Sensitive to lidocaine - use sparingly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600">•</span>
                  <span>Prefers ice packs for numbing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Injectable Billing Modal */}
        {showInjectableBilling && (
          <InjectableBilling
            patientName={selectedPatient.name}
            onClose={() => setShowInjectableBilling(false)}
          />
        )}
      </div>
    </div>
  )
}