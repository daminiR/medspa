'use client'

import { useState, useEffect } from 'react'
import { X, Clock, Calendar, Mail, Phone, User } from 'lucide-react'
import { type Practitioner } from '@/lib/data'

interface PractitionerEditModalProps {
	isOpen: boolean
	onClose: () => void
	practitioner: Practitioner
	onSave: (updatedPractitioner: Practitioner) => void
}

export default function PractitionerEditModal({
	isOpen,
	onClose,
	practitioner,
	onSave
}: PractitionerEditModalProps) {
	const [formData, setFormData] = useState<Practitioner>(practitioner)

	useEffect(() => {
		setFormData(practitioner)
	}, [practitioner])

	if (!isOpen) return null

	const handleSave = () => {
		onSave(formData)
		onClose()
	}

	const staggerOptions = [
		{ value: 0, label: 'No staggering' },
		{ value: 15, label: '15 minutes' },
		{ value: 30, label: '30 minutes' },
		{ value: 45, label: '45 minutes' },
		{ value: 60, label: '60 minutes' }
	]

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-25 z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[600px] max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="text-lg font-semibold">Edit Practitioner Settings</h3>
					<button
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-6">
						{/* Basic Info */}
						<div>
							<h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
								<User className="h-4 w-4 mr-2" />
								Basic Information
							</h4>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Name
									</label>
									<input
										type="text"
										value={formData.name}
										onChange={(e) => setFormData({ ...formData, name: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											<Mail className="inline h-3 w-3 mr-1" />
											Email
										</label>
										<input
											type="email"
											value={formData.email || ''}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											<Phone className="inline h-3 w-3 mr-1" />
											Phone
										</label>
										<input
											type="tel"
											value={formData.phone || ''}
											onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Discipline
									</label>
									<input
										type="text"
										value={formData.discipline}
										onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									/>
								</div>
							</div>
						</div>

						{/* Scheduling Settings */}
						<div className="border-t pt-6">
							<h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
								<Calendar className="h-4 w-4 mr-2" />
								Scheduling Settings
							</h4>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Status
									</label>
									<select
										value={formData.status}
										onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'on_leave' })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									>
										<option value="active">Active</option>
										<option value="inactive">Inactive</option>
										<option value="on_leave">On Leave</option>
									</select>
								</div>
							</div>
						</div>

						{/* Staggered Booking Settings */}
						<div className="border-t pt-6">
							<h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
								<Clock className="h-4 w-4 mr-2" />
								Staggered Booking Settings
							</h4>
							<div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
								<p className="text-sm text-blue-800">
									Staggered booking allows this practitioner to see multiple patients with overlapping appointment times in different rooms. 
									Appointments will only be available at the specified intervals.
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Online Booking Stagger Interval
								</label>
								<select
									value={formData.staggerOnlineBooking || 0}
									onChange={(e) => setFormData({ ...formData, staggerOnlineBooking: parseInt(e.target.value) })}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								>
									{staggerOptions.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<p className="mt-2 text-xs text-gray-500">
									{formData.staggerOnlineBooking && formData.staggerOnlineBooking > 0
										? `Appointments can only be booked at ${formData.staggerOnlineBooking}-minute intervals (e.g., 9:00, 9:${formData.staggerOnlineBooking}, ${formData.staggerOnlineBooking === 60 ? '10:00' : `10:${formData.staggerOnlineBooking === 30 ? '00' : formData.staggerOnlineBooking}`})`
										: 'Appointments can be booked at any available time slot (15-minute intervals)'
									}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t p-4 flex justify-end space-x-3">
					<button
						onClick={onClose}
						className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
					>
						Save Changes
					</button>
				</div>
			</div>
		</>
	)
}