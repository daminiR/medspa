'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, Check, Calendar, User, Clock, MapPin } from 'lucide-react'
import moment from 'moment'
import { type Service, type Appointment } from '@/lib/data'
import { findAppointmentConflicts, getConflictMessage } from '@/utils/appointmentConflicts'
import { checkResourceAvailability } from '@/lib/mockResources'
import { mockRooms } from '@/lib/mockResources'

interface RecurringAppointmentModalProps {
	isOpen: boolean
	onClose: () => void
	practitioner: {
		id: string
		name: string
		initials: string
	}
	client: {
		id: string
		name: string
		phone: string
		email: string
	}
	service: Service
	selectedDate: Date
	startTime: {
		hour: number
		minute: number
	}
	selectedRoom: string | null
	enablePostTreatmentTime: boolean
	getShiftForDate: (practitionerId: string, date: Date) => any
	existingAppointments: Appointment[]
	onSave: (appointments: any[]) => void
}

interface RecurringAppointment {
	date: Date
	status: 'available' | 'conflict' | 'no-shift'
	conflicts?: Appointment[]
	resourcesAvailable?: boolean
}

export default function RecurringAppointmentModal({
	isOpen,
	onClose,
	practitioner,
	client,
	service,
	selectedDate,
	startTime,
	selectedRoom,
	enablePostTreatmentTime,
	getShiftForDate,
	existingAppointments,
	onSave
}: RecurringAppointmentModalProps) {
	const [selectedDays, setSelectedDays] = useState<number[]>([moment(selectedDate).day()])
	const [endDate, setEndDate] = useState(() => {
		// Default to 3 months from now
		return moment(selectedDate).add(3, 'months').toDate()
	})
	const [recurringAppointments, setRecurringAppointments] = useState<RecurringAppointment[]>([])
	const [showOnlyConflicts, setShowOnlyConflicts] = useState(false)
	const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set())
	const [overrideConflicts, setOverrideConflicts] = useState(false)

	const daysOfWeek = [
		{ value: 0, label: 'Sun' },
		{ value: 1, label: 'Mon' },
		{ value: 2, label: 'Tue' },
		{ value: 3, label: 'Wed' },
		{ value: 4, label: 'Thu' },
		{ value: 5, label: 'Fri' },
		{ value: 6, label: 'Sat' }
	]

	// Calculate recurring appointments whenever days or end date changes
	useEffect(() => {
		if (!isOpen) return

		const appointments: RecurringAppointment[] = []
		const currentDate = moment(selectedDate).startOf('day')
		const endMoment = moment(endDate).endOf('day')

		// Start from the selected date and go forward
		while (currentDate.isSameOrBefore(endMoment)) {
			// Check if this day is selected
			if (selectedDays.includes(currentDate.day())) {
				const appointmentDate = currentDate.toDate()
				const shift = getShiftForDate(practitioner.id, appointmentDate)

				if (!shift) {
					appointments.push({
						date: appointmentDate,
						status: 'no-shift'
					})
				} else {
					// Create appointment times
					const appointmentStart = new Date(appointmentDate)
					appointmentStart.setHours(startTime.hour, startTime.minute, 0, 0)
					
					const appointmentEnd = new Date(appointmentStart)
					// Use scheduledDuration if available for staggered booking
					const durationToBlock = service.scheduledDuration || service.duration
					appointmentEnd.setMinutes(appointmentEnd.getMinutes() + durationToBlock)

					// Check for conflicts
					const conflicts = findAppointmentConflicts(
						{
							practitionerId: practitioner.id,
							startTime: appointmentStart,
							endTime: appointmentEnd,
							roomId: selectedRoom || undefined,
							postTreatmentTime: enablePostTreatmentTime ? service.postTreatmentTime : undefined,
							serviceName: service.name
						},
						existingAppointments
					)

					// Check resource availability if needed
					let resourcesAvailable = true
					if (service.requiredResources && service.requiredResources.length > 0) {
						const resources = service.requiredResources.every(req => {
							const availability = checkResourceAvailability(
								req.resourcePoolId,
								appointmentStart,
								appointmentEnd
							)
							return availability.length >= req.quantity
						})
						resourcesAvailable = resources
					}

					appointments.push({
						date: appointmentDate,
						status: conflicts.length > 0 || !resourcesAvailable ? 'conflict' : 'available',
						conflicts: conflicts.length > 0 ? conflicts : undefined,
						resourcesAvailable
					})
				}
			}
			currentDate.add(1, 'day')
		}

		setRecurringAppointments(appointments)
		
		// Auto-select all available appointments
		const available = appointments
			.filter(apt => apt.status === 'available')
			.map(apt => apt.date.toISOString())
		setSelectedAppointments(new Set(available))
	}, [selectedDays, endDate, isOpen])

	const handleDayToggle = (day: number) => {
		if (selectedDays.includes(day)) {
			setSelectedDays(selectedDays.filter(d => d !== day))
		} else {
			setSelectedDays([...selectedDays, day].sort())
		}
	}

	const handleAppointmentToggle = (dateStr: string) => {
		const newSelected = new Set(selectedAppointments)
		if (newSelected.has(dateStr)) {
			newSelected.delete(dateStr)
		} else {
			newSelected.add(dateStr)
		}
		setSelectedAppointments(newSelected)
	}

	const handleSelectAll = () => {
		const available = recurringAppointments
			.filter(apt => apt.status === 'available' || (overrideConflicts && apt.status === 'conflict'))
			.map(apt => apt.date.toISOString())
		setSelectedAppointments(new Set(available))
	}

	const handleDeselectAll = () => {
		setSelectedAppointments(new Set())
	}

	const handleSave = () => {
		const appointmentsToBook = recurringAppointments
			.filter(apt => selectedAppointments.has(apt.date.toISOString()))
			.map(apt => {
				const appointmentStart = new Date(apt.date)
				appointmentStart.setHours(startTime.hour, startTime.minute, 0, 0)
				
				const appointmentEnd = new Date(appointmentStart)
				// Use scheduledDuration if available for staggered booking
				const durationToBlock = service.scheduledDuration || service.duration
				appointmentEnd.setMinutes(appointmentEnd.getMinutes() + durationToBlock)

				return {
					client,
					service,
					practitioner,
					startTime: { hour: startTime.hour, minute: startTime.minute },
					endTime: { 
						hour: appointmentEnd.getHours(), 
						minute: appointmentEnd.getMinutes() 
					},
					date: apt.date,
					roomId: selectedRoom,
					postTreatmentTime: enablePostTreatmentTime ? service.postTreatmentTime : undefined,
					overriddenConflicts: overrideConflicts && apt.status === 'conflict',
					isRecurring: true
				}
			})

		onSave(appointmentsToBook)
		onClose()
	}

	const availableCount = recurringAppointments.filter(apt => apt.status === 'available').length
	const conflictCount = recurringAppointments.filter(apt => apt.status === 'conflict').length
	const noShiftCount = recurringAppointments.filter(apt => apt.status === 'no-shift').length
	const selectedCount = selectedAppointments.size

	const filteredAppointments = showOnlyConflicts 
		? recurringAppointments.filter(apt => apt.status === 'conflict')
		: recurringAppointments

	if (!isOpen) return null

	return (
		<>
			{/* Backdrop */}
			<div className="fixed inset-0 bg-black bg-opacity-25 z-50" onClick={onClose} />

			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[800px] max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="px-6 py-4 border-b bg-gray-50">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">Recurring Appointments</h2>
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
					{/* Appointment Info */}
					<div className="mb-6 p-4 bg-gray-50 rounded-lg">
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<div className="flex items-center text-gray-600 mb-1">
									<User className="h-4 w-4 mr-2" />
									Client
								</div>
								<div className="font-medium">{client.name}</div>
							</div>
							<div>
								<div className="flex items-center text-gray-600 mb-1">
									<Calendar className="h-4 w-4 mr-2" />
									Service
								</div>
								<div className="font-medium">{service.name} ({service.duration} min)</div>
							</div>
							<div>
								<div className="flex items-center text-gray-600 mb-1">
									<User className="h-4 w-4 mr-2" />
									Practitioner
								</div>
								<div className="font-medium">{practitioner.name}</div>
							</div>
							<div>
								<div className="flex items-center text-gray-600 mb-1">
									<Clock className="h-4 w-4 mr-2" />
									Time
								</div>
								<div className="font-medium">{moment().hour(startTime.hour).minute(startTime.minute).format('h:mm A')}</div>
							</div>
							{selectedRoom && (
								<div>
									<div className="flex items-center text-gray-600 mb-1">
										<MapPin className="h-4 w-4 mr-2" />
										Room
									</div>
									<div className="font-medium">{mockRooms.find(r => r.id === selectedRoom)?.name}</div>
								</div>
							)}
						</div>
					</div>

					{/* Recurrence Settings */}
					<div className="mb-6">
						<h3 className="text-sm font-semibold text-gray-700 mb-3">Recurrence Pattern</h3>
						
						{/* Days of Week */}
						<div className="mb-4">
							<label className="text-sm text-gray-600 mb-2 block">Repeat on</label>
							<div className="flex gap-2">
								{daysOfWeek.map(day => (
									<button
										key={day.value}
										onClick={() => handleDayToggle(day.value)}
										className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
											selectedDays.includes(day.value)
												? 'bg-purple-600 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										}`}
									>
										{day.label}
									</button>
								))}
							</div>
						</div>

						{/* End Date */}
						<div>
							<label className="text-sm text-gray-600 mb-2 block">Repeat until</label>
							<input
								type="date"
								value={moment(endDate).format('YYYY-MM-DD')}
								onChange={(e) => setEndDate(new Date(e.target.value))}
								max={moment().add(1, 'year').format('YYYY-MM-DD')}
								className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Maximum 1 year in advance
							</p>
						</div>
					</div>

					{/* Summary Stats */}
					<div className="mb-4 grid grid-cols-4 gap-4">
						<div className="text-center p-3 bg-green-50 rounded-lg">
							<div className="text-2xl font-semibold text-green-600">{availableCount}</div>
							<div className="text-xs text-green-700">Available</div>
						</div>
						<div className="text-center p-3 bg-red-50 rounded-lg">
							<div className="text-2xl font-semibold text-red-600">{conflictCount}</div>
							<div className="text-xs text-red-700">Conflicts</div>
						</div>
						<div className="text-center p-3 bg-gray-50 rounded-lg">
							<div className="text-2xl font-semibold text-gray-600">{noShiftCount}</div>
							<div className="text-xs text-gray-700">No Shift</div>
						</div>
						<div className="text-center p-3 bg-purple-50 rounded-lg">
							<div className="text-2xl font-semibold text-purple-600">{selectedCount}</div>
							<div className="text-xs text-purple-700">Selected</div>
						</div>
					</div>

					{/* Filter and Actions */}
					<div className="mb-4 flex items-center justify-between">
						<label className="flex items-center">
							<input
								type="checkbox"
								checked={showOnlyConflicts}
								onChange={(e) => setShowOnlyConflicts(e.target.checked)}
								className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
							/>
							<span className="text-sm text-gray-700">Show only conflicts</span>
						</label>
						<div className="space-x-2">
							<button
								onClick={handleSelectAll}
								className="text-sm text-purple-600 hover:text-purple-700"
							>
								Select All
							</button>
							<span className="text-gray-400">|</span>
							<button
								onClick={handleDeselectAll}
								className="text-sm text-purple-600 hover:text-purple-700"
							>
								Deselect All
							</button>
						</div>
					</div>

					{/* Appointments List */}
					<div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
						{filteredAppointments.map((appointment) => {
							const dateStr = appointment.date.toISOString()
							const isSelected = selectedAppointments.has(dateStr)
							const canSelect = appointment.status === 'available' || (overrideConflicts && appointment.status === 'conflict')

							return (
								<div
									key={dateStr}
									className={`p-3 ${
										appointment.status === 'conflict' ? 'bg-red-50' :
										appointment.status === 'no-shift' ? 'bg-gray-50' :
										'hover:bg-gray-50'
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => handleAppointmentToggle(dateStr)}
												disabled={!canSelect}
												className={`h-4 w-4 rounded border-gray-300 ${
													canSelect
														? 'text-purple-600 focus:ring-purple-500'
														: 'text-gray-400 cursor-not-allowed'
												}`}
											/>
											<div>
												<div className="font-medium text-sm">
													{moment(appointment.date).format('dddd, MMMM D, YYYY')}
												</div>
												<div className="text-xs text-gray-600">
													{moment().hour(startTime.hour).minute(startTime.minute).format('h:mm A')}
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											{appointment.status === 'available' && (
												<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
													<Check className="h-3 w-3 mr-1" />
													Available
												</span>
											)}
											{appointment.status === 'conflict' && (
												<div className="flex items-center space-x-2">
													<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
														<AlertCircle className="h-3 w-3 mr-1" />
														Conflict
													</span>
													{appointment.conflicts && appointment.conflicts.length > 0 && (
														<span className="text-xs text-red-600">
															{getConflictMessage(appointment.conflicts, selectedRoom || undefined)}
														</span>
													)}
													{appointment.resourcesAvailable === false && (
														<span className="text-xs text-red-600">
															Resources unavailable
														</span>
													)}
												</div>
											)}
											{appointment.status === 'no-shift' && (
												<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
													Staff Unavailable
												</span>
											)}
										</div>
									</div>
								</div>
							)
						})}
					</div>

					{/* Administrative Override */}
					{conflictCount > 0 && (
						<div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
							<label className="flex items-start cursor-pointer">
								<input
									type="checkbox"
									checked={overrideConflicts}
									onChange={(e) => setOverrideConflicts(e.target.checked)}
									className="mt-0.5 mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
								/>
								<div className="text-sm">
									<span className="font-medium text-yellow-800">Administrative Override</span>
									<p className="text-xs text-yellow-700 mt-0.5">
										Allow booking appointments with conflicts. Use only when necessary.
									</p>
								</div>
							</label>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t bg-gray-50 px-6 py-4">
					<div className="flex justify-between items-center">
						<div className="text-sm text-gray-600">
							{selectedCount} appointment{selectedCount !== 1 ? 's' : ''} selected
						</div>
						<div className="space-x-3">
							<button
								onClick={onClose}
								className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={selectedCount === 0}
								className={`px-6 py-2 rounded-md font-medium transition-colors ${
									selectedCount === 0
										? 'bg-gray-300 text-gray-500 cursor-not-allowed'
										: overrideConflicts && selectedAppointments.size > availableCount
											? 'bg-yellow-600 text-white hover:bg-yellow-700'
											: 'bg-teal-500 text-white hover:bg-teal-600'
								}`}
							>
								Book {selectedCount} Appointment{selectedCount !== 1 ? 's' : ''}
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}