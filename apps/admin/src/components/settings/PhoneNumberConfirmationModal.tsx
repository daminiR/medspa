'use client'

import { AlertCircle, Phone, CheckCircle } from 'lucide-react'

interface PhoneNumberConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  currentNumber: string
  newNumber: string
}

export default function PhoneNumberConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  currentNumber,
  newNumber
}: PhoneNumberConfirmationModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[calc(100vw-32px)] max-w-[500px]">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Confirm Phone Number Change</h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Please review the change carefully before confirming
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Current Number */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900">Current Number (Will be released)</span>
              </div>
              <p className="text-xl font-bold text-red-900 ml-6">{currentNumber}</p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="text-gray-400">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* New Number */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">New Number (Will be activated)</span>
              </div>
              <p className="text-xl font-bold text-green-900 ml-6">{newNumber}</p>
            </div>
          </div>

          {/* Warning Box */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-800 space-y-1.5 list-disc list-inside">
                  <li>Your current number will be released and cannot be recovered</li>
                  <li>All patients will need to be notified of the new number</li>
                  <li>Message history will be preserved but associated with the old number</li>
                  <li>The change may take a few minutes to propagate</li>
                  <li>You will be charged $1.00/month for the new number</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </>
  )
}
