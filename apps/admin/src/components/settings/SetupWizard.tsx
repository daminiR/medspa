'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, Calendar, MessageSquare, DollarSign, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'

interface SetupWizardProps {
  onComplete: (config: WizardConfig) => void
  onSkip: () => void
}

export interface WizardConfig {
  appointmentReminders: boolean
  confirmationRequests: boolean
  thankYouMessages: boolean
}

const WIZARD_STORAGE_KEY = 'setupWizardCompleted'
const WIZARD_CONFIG_KEY = 'setupWizardConfig'

export function isWizardCompleted(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(WIZARD_STORAGE_KEY) === 'true'
}

export function markWizardCompleted(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WIZARD_STORAGE_KEY, 'true')
}

export function getWizardConfig(): WizardConfig | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(WIZARD_CONFIG_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function saveWizardConfig(config: WizardConfig): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WIZARD_CONFIG_KEY, JSON.stringify(config))
}

export function SetupWizard({ onComplete, onSkip }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<WizardConfig>({
    appointmentReminders: true,
    confirmationRequests: true,
    thankYouMessages: true,
  })

  const totalSteps = 3

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - complete the wizard
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    saveWizardConfig(config)
    markWizardCompleted()
    onComplete(config)
  }

  const handleSkip = () => {
    markWizardCompleted()
    onSkip()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Quick Setup Wizard</h2>
                <p className="text-purple-100 text-sm mt-1">Get your automated messages running in 30 seconds</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close wizard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Appointment Reminders */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Enable Appointment Reminders?</h3>
                  <p className="text-gray-600 text-sm mt-1">Reduce no-shows by up to 50%</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <p className="text-gray-700 mb-4">This will automatically enable:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">24-hour reminder</p>
                      <p className="text-sm text-gray-600">Sent 1 day before appointment</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">2-hour reminder</p>
                      <p className="text-sm text-gray-600">Final reminder on appointment day</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setConfig({ ...config, appointmentReminders: false })
                    handleNext()
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  No, Skip This
                </button>
                <button
                  onClick={() => {
                    setConfig({ ...config, appointmentReminders: true })
                    handleNext()
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Yes, Enable
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation Requests */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Enable Confirmation Requests?</h3>
                  <p className="text-gray-600 text-sm mt-1">Get patients to confirm their appointments</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <p className="text-gray-700 mb-4">This will automatically enable:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">48-hour confirmation request</p>
                      <p className="text-sm text-gray-600">Sent 2 days before appointment</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Reply-to-confirm via SMS</p>
                      <p className="text-sm text-gray-600">Patients reply "C" to confirm or "R" to reschedule</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Pro tip:</strong> Confirmation requests help you know which patients are coming and identify cancellations early.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    setConfig({ ...config, confirmationRequests: false })
                    handleNext()
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  No, Skip This
                </button>
                <button
                  onClick={() => {
                    setConfig({ ...config, confirmationRequests: true })
                    handleNext()
                  }}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Yes, Enable
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Thank You Messages */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-pink-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-pink-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Send Thank You After Checkout?</h3>
                  <p className="text-gray-600 text-sm mt-1">Build loyalty and encourage repeat visits</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <p className="text-gray-700 mb-4">This will automatically enable:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Thank you message after checkout</p>
                      <p className="text-sm text-gray-600">Sent immediately when payment is completed</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Receipt link included</p>
                      <p className="text-sm text-gray-600">Easy access to transaction details</p>
                    </div>
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                  <p className="text-sm text-pink-800">
                    <strong>Pro tip:</strong> Thank you messages show appreciation and keep your clinic top-of-mind for future bookings.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <button
                  onClick={() => {
                    setConfig({ ...config, thankYouMessages: false })
                    handleComplete()
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  No, Skip This
                </button>
                <button
                  onClick={() => {
                    setConfig({ ...config, thankYouMessages: true })
                    handleComplete()
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Yes, Enable & Finish
                  <CheckCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Skip - I'll configure manually
          </button>
        </div>
      </div>
    </div>
  )
}
