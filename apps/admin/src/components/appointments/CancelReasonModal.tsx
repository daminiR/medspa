'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface CancelReasonModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: (reason: string) => void
	appointmentDetails: {
		patientName: string
		serviceName: string
		dateTime: string
	}
}

const predefinedReasons = [
	'Patient request - schedule conflict',
	'Patient request - illness',
	'Patient request - personal emergency',
	'Practitioner unavailable',
	'Weather conditions',
	'Clinic closure',
	'Equipment unavailable',
	'Other reason'
]

export default function CancelReasonModal({
	isOpen,
	onClose,
	onConfirm,
	appointmentDetails
}: CancelReasonModalProps) {
	const [selectedReason, setSelectedReason] = useState('')
	const [customReason, setCustomReason] = useState('')
	const [showCustomInput, setShowCustomInput] = useState(false)

	if (!isOpen) return null

	const handleReasonSelect = (reason: string) => {
		setSelectedReason(reason)
		if (reason === 'Other reason') {
			setShowCustomInput(true)
		} else {
			setShowCustomInput(false)
			setCustomReason('')
		}
	}

	const handleConfirm = () => {
		const finalReason = showCustomInput ? customReason : selectedReason
		if (finalReason.trim()) {
			onConfirm(finalReason)
			// Reset state
			setSelectedReason('')
			setCustomReason('')
			setShowCustomInput(false)
		}
	}

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-25 z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[500px] max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="text-lg font-semibold">Cancel Appointment</h3>
					<button
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					<div className="mb-4">
						<p className="text-sm text-gray-600 mb-2">
							Cancelling appointment for:
						</p>
						<div className="bg-gray-50 p-3 rounded-md">
							<p className="font-medium text-gray-900">{appointmentDetails.patientName}</p>
							<p className="text-sm text-gray-600">{appointmentDetails.serviceName}</p>
							<p className="text-sm text-gray-600">{appointmentDetails.dateTime}</p>
						</div>
					</div>

					<div>
						<p className="text-sm font-medium text-gray-700 mb-3">
							Please select a cancellation reason:
						</p>
						<div className="space-y-2">
							{predefinedReasons.map((reason) => (
								<label
									key={reason}
									className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
								>
									<input
										type="radio"
										name="cancelReason"
										value={reason}
										checked={selectedReason === reason}
										onChange={() => handleReasonSelect(reason)}
										className="h-4 w-4 text-purple-600 focus:ring-purple-500"
									/>
									<span className="ml-3 text-sm text-gray-900">{reason}</span>
								</label>
							))}
						</div>

						{showCustomInput && (
							<div className="mt-4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Please specify:
								</label>
								<textarea
									value={customReason}
									onChange={(e) => setCustomReason(e.target.value)}
									placeholder="Enter cancellation reason..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									rows={3}
									autoFocus
								/>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="border-t bg-gray-50 px-4 py-3">
					<div className="flex justify-between">
						<button
							onClick={onClose}
							className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
						>
							Keep Appointment
						</button>
						<button
							onClick={handleConfirm}
							disabled={!selectedReason || (showCustomInput && !customReason.trim())}
							className={`px-4 py-2 rounded-md font-medium transition-colors ${
								!selectedReason || (showCustomInput && !customReason.trim())
									? 'bg-gray-300 text-gray-500 cursor-not-allowed'
									: 'bg-red-600 text-white hover:bg-red-700'
							}`}
						>
							Cancel Appointment
						</button>
					</div>
				</div>
			</div>
		</>
	)
}