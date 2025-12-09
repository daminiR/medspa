'use client'

import { useState } from 'react'
import { X, AlertCircle, Trash2, Ban } from 'lucide-react'

interface CancelDeleteModalProps {
	isOpen: boolean
	onClose: () => void
	onCancel: () => void
	onDelete: () => void
	appointmentDetails: {
		patientName: string
		serviceName: string
		dateTime: string
	}
}

export default function CancelDeleteModal({
	isOpen,
	onClose,
	onCancel,
	onDelete,
	appointmentDetails
}: CancelDeleteModalProps) {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	if (!isOpen) return null

	const handleDelete = () => {
		if (!showDeleteConfirm) {
			setShowDeleteConfirm(true)
		} else {
			onDelete()
			setShowDeleteConfirm(false)
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
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[450px]">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="text-lg font-semibold">Cancel or Delete Appointment</h3>
					<button
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-4">
					<div className="mb-4">
						<div className="bg-gray-50 p-3 rounded-md">
							<p className="font-medium text-gray-900">{appointmentDetails.patientName}</p>
							<p className="text-sm text-gray-600">{appointmentDetails.serviceName}</p>
							<p className="text-sm text-gray-600">{appointmentDetails.dateTime}</p>
						</div>
					</div>

					{!showDeleteConfirm ? (
						<div className="space-y-3">
							<button
								onClick={onCancel}
								className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors group"
							>
								<div className="flex items-start">
									<Ban className="h-5 w-5 text-gray-600 mt-0.5 mr-3" />
									<div className="flex-1">
										<p className="font-medium text-gray-900">Cancel with Notification</p>
										<p className="text-sm text-gray-600 mt-1">
											Client will receive a cancellation email. You'll be prompted to select a reason.
										</p>
									</div>
								</div>
							</button>

							<button
								onClick={handleDelete}
								className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-red-50 hover:border-red-200 transition-colors group"
							>
								<div className="flex items-start">
									<Trash2 className="h-5 w-5 text-gray-600 group-hover:text-red-600 mt-0.5 mr-3" />
									<div className="flex-1">
										<p className="font-medium text-gray-900 group-hover:text-red-900">
											Delete Appointment (Without notification)
										</p>
										<p className="text-sm text-gray-600 group-hover:text-red-700 mt-1">
											Remove from schedule without notifying the client. Use for bookings made in error.
										</p>
									</div>
								</div>
							</button>
						</div>
					) : (
						<div>
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
								<div className="flex items-start">
									<AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
									<div>
										<p className="text-sm font-medium text-red-800">
											Are you sure you want to delete this appointment?
										</p>
										<p className="text-sm text-red-700 mt-1">
											This will remove the appointment without sending any notification to the client.
										</p>
									</div>
								</div>
							</div>
							<div className="flex justify-end space-x-3">
								<button
									onClick={() => setShowDeleteConfirm(false)}
									className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
								>
									Go Back
								</button>
								<button
									onClick={handleDelete}
									className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
								>
									Delete Appointment
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	)
}