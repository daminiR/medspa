'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, Phone, Mail, FileText, AlertCircle, ChevronDown } from 'lucide-react'
import moment from 'moment'
import { services } from '@/lib/data'

interface AddWaitlistModalProps {
	isOpen: boolean
	onClose: () => void
	practitioners: Array<{ id: string; name: string; initials: string }>
	onSave: (patient: any) => void
	editingPatient?: any
}

export default function AddWaitlistModal({
	isOpen,
	onClose,
	practitioners,
	onSave,
	editingPatient
}: AddWaitlistModalProps) {
	const [patientName, setPatientName] = useState('')
	const [phone, setPhone] = useState('')
	const [email, setEmail] = useState('')
	const [selectedService, setSelectedService] = useState('')
	const [preferredPractitioner, setPreferredPractitioner] = useState<string>('')
	const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
	const [notes, setNotes] = useState('')
	
	// Availability settings
	const [availabilityType, setAvailabilityType] = useState<'specific' | 'anytime-week' | 'anytime-month'>('specific')
	const [availableDate, setAvailableDate] = useState(moment().format('YYYY-MM-DD'))
	const [availableStartTime, setAvailableStartTime] = useState('09:00')
	const [availableEndTime, setAvailableEndTime] = useState('17:00')
	const [availableDays, setAvailableDays] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri by default
	
	// Form validation
	const [errors, setErrors] = useState<Record<string, string>>({})

	// Initialize form when editing
	useEffect(() => {
		if (editingPatient && isOpen) {
			setPatientName(editingPatient.name || '')
			setPhone(editingPatient.phone || '')
			setEmail(editingPatient.email || '')
			setSelectedService(editingPatient.requestedService || '')
			setPreferredPractitioner(editingPatient.practitionerId || '')
			setPriority(editingPatient.priority || 'medium')
			setNotes(editingPatient.notes || '')
			
			// Set availability based on existing data
			if (editingPatient.availabilityStart && editingPatient.availabilityEnd) {
				const start = moment(editingPatient.availabilityStart)
				const end = moment(editingPatient.availabilityEnd)
				setAvailableDate(start.format('YYYY-MM-DD'))
				setAvailableStartTime(start.format('HH:mm'))
				setAvailableEndTime(end.format('HH:mm'))
			}
		} else if (!isOpen) {
			// Reset form when closing
			resetForm()
		}
	}, [editingPatient, isOpen])

	const resetForm = () => {
		setPatientName('')
		setPhone('')
		setEmail('')
		setSelectedService('')
		setPreferredPractitioner('')
		setPriority('medium')
		setNotes('')
		setAvailabilityType('specific')
		setAvailableDate(moment().format('YYYY-MM-DD'))
		setAvailableStartTime('09:00')
		setAvailableEndTime('17:00')
		setAvailableDays([1, 2, 3, 4, 5])
		setErrors({})
	}

	const formatPhone = (value: string) => {
		const cleaned = value.replace(/\D/g, '')
		if (cleaned.length >= 10) {
			return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
		}
		return value
	}

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhone(e.target.value)
		setPhone(formatted)
	}

	const validateForm = () => {
		const newErrors: Record<string, string> = {}
		
		if (!patientName.trim()) {
			newErrors.name = 'Patient name is required'
		}
		
		if (!phone.trim()) {
			newErrors.phone = 'Phone number is required'
		}
		
		if (!selectedService) {
			newErrors.service = 'Please select a service'
		}
		
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSave = () => {
		if (!validateForm()) return

		// Calculate availability dates based on type
		let availabilityStart: Date
		let availabilityEnd: Date

		if (availabilityType === 'anytime-week') {
			availabilityStart = moment().startOf('day').toDate()
			availabilityEnd = moment().add(7, 'days').endOf('day').toDate()
		} else if (availabilityType === 'anytime-month') {
			availabilityStart = moment().startOf('day').toDate()
			availabilityEnd = moment().add(30, 'days').endOf('day').toDate()
		} else {
			// Specific date and time
			availabilityStart = moment(`${availableDate} ${availableStartTime}`).toDate()
			availabilityEnd = moment(`${availableDate} ${availableEndTime}`).toDate()
		}

		// Find selected service details
		const service = services.find(s => s.name === selectedService)
		
		const waitlistData = {
			id: editingPatient?.id || `waitlist-${Date.now()}`,
			name: patientName,
			phone,
			email,
			requestedService: selectedService,
			serviceCategory: service?.category || 'other',
			serviceDuration: service?.duration || 60,
			preferredPractitioner: practitioners.find(p => p.id === preferredPractitioner)?.name,
			practitionerId: preferredPractitioner || undefined,
			availabilityStart,
			availabilityEnd,
			availableDays: availabilityType === 'specific' ? undefined : availableDays,
			waitingSince: editingPatient?.waitingSince || new Date(),
			priority,
			notes,
			hasCompletedForms: editingPatient?.hasCompletedForms || false,
			deposit: editingPatient?.deposit || 0
		}

		onSave(waitlistData)
		resetForm()
		onClose()
	}

	const daysOfWeek = [
		{ value: 0, label: 'Sun' },
		{ value: 1, label: 'Mon' },
		{ value: 2, label: 'Tue' },
		{ value: 3, label: 'Wed' },
		{ value: 4, label: 'Thu' },
		{ value: 5, label: 'Fri' },
		{ value: 6, label: 'Sat' }
	]

	if (!isOpen) return null

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={onClose} />

			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[600px] max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="px-6 py-4 border-b bg-gray-50">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">
							{editingPatient ? 'Edit Waitlist Entry' : 'Add to Waitlist'}
						</h2>
						<button
							onClick={onClose}
							className="p-1 hover:bg-gray-200 rounded-full transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-6">
						{/* Patient Information */}
						<div>
							<h3 className="text-sm font-semibold text-gray-700 mb-3">Patient Information</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										Patient Name <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={patientName}
										onChange={(e) => setPatientName(e.target.value)}
										className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
											errors.name ? 'border-red-300' : 'border-gray-300'
										}`}
										placeholder="Enter patient name"
									/>
									{errors.name && (
										<p className="mt-1 text-xs text-red-600">{errors.name}</p>
									)}
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-gray-600 mb-1">
											Phone <span className="text-red-500">*</span>
										</label>
										<input
											type="tel"
											value={phone}
											onChange={handlePhoneChange}
											className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
												errors.phone ? 'border-red-300' : 'border-gray-300'
											}`}
											placeholder="(555) 555-5555"
										/>
										{errors.phone && (
											<p className="mt-1 text-xs text-red-600">{errors.phone}</p>
										)}
									</div>
									<div>
										<label className="block text-sm text-gray-600 mb-1">Email</label>
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											placeholder="email@example.com"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Service Selection */}
						<div>
							<h3 className="text-sm font-semibold text-gray-700 mb-3">Service & Practitioner</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm text-gray-600 mb-1">
										Requested Service <span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<select
											value={selectedService}
											onChange={(e) => setSelectedService(e.target.value)}
											className={`w-full px-3 py-2 border rounded-md appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
												errors.service ? 'border-red-300' : 'border-gray-300'
											}`}
										>
											<option value="">Select a service</option>
											{services.filter(s => s.isActive).map(service => (
												<option key={service.id} value={service.name}>
													{service.name} ({service.duration} min)
												</option>
											))}
										</select>
										<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
									</div>
									{errors.service && (
										<p className="mt-1 text-xs text-red-600">{errors.service}</p>
									)}
								</div>

								<div>
									<label className="block text-sm text-gray-600 mb-1">Preferred Practitioner</label>
									<div className="relative">
										<select
											value={preferredPractitioner}
											onChange={(e) => setPreferredPractitioner(e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
										>
											<option value="">No preference</option>
											{practitioners.map(practitioner => (
												<option key={practitioner.id} value={practitioner.id}>
													{practitioner.name}
												</option>
											))}
										</select>
										<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
									</div>
								</div>

								<div>
									<label className="block text-sm text-gray-600 mb-1">Priority</label>
									<div className="flex space-x-2">
										{['low', 'medium', 'high'].map((p) => (
											<button
												key={p}
												onClick={() => setPriority(p as any)}
												className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
													priority === p
														? p === 'high' ? 'bg-red-600 text-white' :
														  p === 'medium' ? 'bg-yellow-600 text-white' :
														  'bg-green-600 text-white'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												}`}
											>
												{p.charAt(0).toUpperCase() + p.slice(1)}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Availability */}
						<div>
							<h3 className="text-sm font-semibold text-gray-700 mb-3">Availability</h3>
							
							{/* Quick Options */}
							<div className="grid grid-cols-3 gap-2 mb-4">
								<button
									onClick={() => setAvailabilityType('specific')}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										availabilityType === 'specific'
											? 'bg-purple-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									Specific Date
								</button>
								<button
									onClick={() => setAvailabilityType('anytime-week')}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										availabilityType === 'anytime-week'
											? 'bg-purple-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									Anytime for a Week
								</button>
								<button
									onClick={() => setAvailabilityType('anytime-month')}
									className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										availabilityType === 'anytime-month'
											? 'bg-purple-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									Anytime for a Month
								</button>
							</div>

							{/* Specific Date/Time */}
							{availabilityType === 'specific' && (
								<div className="space-y-4">
									<div>
										<label className="block text-sm text-gray-600 mb-1">Date</label>
										<input
											type="date"
											value={availableDate}
											onChange={(e) => setAvailableDate(e.target.value)}
											min={moment().format('YYYY-MM-DD')}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm text-gray-600 mb-1">From</label>
											<input
												type="time"
												value={availableStartTime}
												onChange={(e) => setAvailableStartTime(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											/>
										</div>
										<div>
											<label className="block text-sm text-gray-600 mb-1">To</label>
											<input
												type="time"
												value={availableEndTime}
												onChange={(e) => setAvailableEndTime(e.target.value)}
												className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											/>
										</div>
									</div>
								</div>
							)}

							{/* Anytime Options - Day Selection */}
							{(availabilityType === 'anytime-week' || availabilityType === 'anytime-month') && (
								<div>
									<label className="block text-sm text-gray-600 mb-2">Available Days</label>
									<div className="flex gap-1">
										{daysOfWeek.map(day => (
											<button
												key={day.value}
												onClick={() => {
													if (availableDays.includes(day.value)) {
														setAvailableDays(availableDays.filter(d => d !== day.value))
													} else {
														setAvailableDays([...availableDays, day.value].sort())
													}
												}}
												className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
													availableDays.includes(day.value)
														? 'bg-purple-600 text-white'
														: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
												}`}
											>
												{day.label}
											</button>
										))}
									</div>
									<p className="text-xs text-gray-500 mt-2">
										Patient will be available {availabilityType === 'anytime-week' ? 'for the next 7 days' : 'for the next 30 days'} on selected days
									</p>
								</div>
							)}
						</div>

						{/* Notes */}
						<div>
							<label className="block text-sm text-gray-600 mb-1">Notes</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
								rows={3}
								placeholder="Add any special notes or preferences..."
							/>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t bg-gray-50 px-6 py-4">
					<div className="flex justify-between">
						<button
							onClick={onClose}
							className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleSave}
							className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
						>
							{editingPatient ? 'Update' : 'Add to Waitlist'}
						</button>
					</div>
				</div>
			</div>
		</>
	)
}