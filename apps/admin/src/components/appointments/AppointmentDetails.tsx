// src/components/appointments/AppointmentDetails.tsx
'use client'

import { X, Phone, Mail, Calendar, Clock, DollarSign, FileText, Copy, MessageSquare, Star, Plus, Move, Edit2, ChevronsRight, Trash2, RefreshCw, Stethoscope } from 'lucide-react'
import { useState, useEffect } from 'react'
import moment from 'moment'
import { practitioners } from '@/lib/data'
import type { Note } from '@/lib/data'
import CancelReasonModal from './CancelReasonModal'
import CancelDeleteModal from './CancelDeleteModal'

interface AppointmentDetailsProps {
	appointment: {
		id: string
		patientId: string
		patientName: string
		serviceName: string
		serviceCategory: string
		practitionerId: string
		startTime: Date
		endTime: Date
		status: 'scheduled' | 'arrived' | 'completed' | 'no-show' | 'cancelled' | 'deleted'
		color: string
		duration: number
		phone?: string
		email?: string
		notes?: string
		notesList?: Note[]
		price?: number
		room?: string
		dob?: string
		accountOwing?: number
		accountCredit?: number
		cancellationReason?: string
		cancelledAt?: Date
		deletedAt?: Date
	}
	onClose: () => void
	onStatusChange?: (appointmentId: string, status: 'arrived' | 'no-show' | 'scheduled' | 'cancelled', cancellationReason?: string) => void
	onUncancel?: (appointmentId: string) => void
	onNotesUpdate?: (appointmentId: string, notes: Note[]) => void
	patientNotes?: Note[] // Patient-level notes passed from parent
	onMove?: () => void // New prop for move functionality
	onCopy?: () => void // New prop for copy functionality
	onEdit?: () => void // New prop for edit functionality
	upcomingAppointments?: {
		id: string
		serviceName: string
		startTime: Date
		endTime: Date
		status: string
	}[] // New prop for upcoming appointments
	onBulkDelete?: (appointmentIds: string[]) => void // New prop for bulk delete
	isRecurring?: boolean // New prop to indicate if this is part of a recurring series
	onUpdate?: (appointmentId: string, updates: { serviceName?: string; duration?: number; endTime?: Date }) => void // New prop for updating appointment
	onCancel?: (appointmentId: string, reason: string) => void // New prop for cancelling with reason
	onDelete?: (appointmentId: string) => void // New prop for deleting without notification
}

export default function AppointmentDetails({
	appointment,
	onClose,
	onStatusChange,
	onNotesUpdate,
	patientNotes = [],
	onMove,
	onCopy,
	onEdit,
	upcomingAppointments = [],
	onBulkDelete,
	isRecurring = false,
	onUpdate,
	onUncancel,
	onCancel,
	onDelete
}: AppointmentDetailsProps) {
	const [newNoteContent, setNewNoteContent] = useState('')
	const [notes, setNotes] = useState<Note[]>([])
	const [showNoteInput, setShowNoteInput] = useState(false)
	const [isEditingService, setIsEditingService] = useState(false)
	const [editedServiceName, setEditedServiceName] = useState(appointment.serviceName)
	const [editedDuration, setEditedDuration] = useState(appointment.duration.toString())
	const [showUpcomingAppointments, setShowUpcomingAppointments] = useState(false)
	const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set())
	const [showCancelModal, setShowCancelModal] = useState(false)
	const [showCancelDeleteModal, setShowCancelDeleteModal] = useState(false)

	// Initialize notes - combine patient-level and appointment-specific notes
	useEffect(() => {
		const appointmentNotes = appointment.notesList || []
		const importantPatientNotes = patientNotes.filter(note => note.isImportant && !note.appointmentId)
		const allNotes = [...importantPatientNotes, ...appointmentNotes]

		// Sort with important notes first, then by date
		allNotes.sort((a, b) => {
			if (a.isImportant && !b.isImportant) return -1
			if (!a.isImportant && b.isImportant) return 1
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		})

		setNotes(allNotes)
	}, [appointment.notesList, patientNotes])

	// Find practitioner details
	const practitioner = practitioners.find(p => p.id === appointment.practitionerId)

	// Format date and time
	const appointmentDate = moment(appointment.startTime).format('dddd MMMM D, YYYY')
	const startTime = moment(appointment.startTime).format('h:mm A')
	const endTime = moment(appointment.endTime).format('h:mm A')

	// Extract patient info
	const patientPhone = appointment.phone || '(555) 123-4567'
	const patientEmail = appointment.email || `${appointment.patientName.toLowerCase().replace(' ', '.')}@example.com`
	const patientDOB = appointment.dob || 'May 12, 1981'

	// Financial info
	const accountOwing = appointment.accountOwing || 50.00
	const accountCredit = appointment.accountCredit || 0.00
	const servicePrice = appointment.price || 50.00

	const handleStatusChange = (status: 'arrived' | 'no-show') => {
		if (onStatusChange) {
			const newStatus = appointment.status === status ? 'scheduled' : status
			onStatusChange(appointment.id, newStatus)
		}
	}


	const handleAddNote = () => {
		if (!newNoteContent.trim()) return

		const newNote: Note = {
			id: `note-${Date.now()}`,
			content: newNoteContent.trim(),
			authorId: 'current-user', // In real app, get from auth
			authorName: 'Current User', // In real app, get from auth
			createdAt: new Date(),
			appointmentId: appointment.id,
			isImportant: false
		}

		const updatedNotes = [newNote, ...notes.filter(n => n.appointmentId === appointment.id)]
		setNotes([...notes.filter(n => n.isImportant && !n.appointmentId), ...updatedNotes])
		setNewNoteContent('')
		setShowNoteInput(false)

		// Notify parent component
		if (onNotesUpdate) {
			onNotesUpdate(appointment.id, updatedNotes)
		}
	}

	const handleToggleImportant = (noteId: string) => {
		const updatedNotes = notes.map(note =>
			note.id === noteId ? { ...note, isImportant: !note.isImportant } : note
		)
		setNotes(updatedNotes)

		if (onNotesUpdate) {
			onNotesUpdate(appointment.id, updatedNotes.filter(n => n.appointmentId === appointment.id))
		}
	}

	const handleDeleteNote = (noteId: string) => {
		const noteToDelete = notes.find(n => n.id === noteId)
		// Only allow deleting appointment-specific notes, not patient-level important notes
		if (noteToDelete && noteToDelete.appointmentId === appointment.id) {
			const updatedNotes = notes.filter(note => note.id !== noteId)
			setNotes(updatedNotes)

			if (onNotesUpdate) {
				onNotesUpdate(appointment.id, updatedNotes.filter(n => n.appointmentId === appointment.id))
			}
		}
	}

	const formatNoteDate = (date: Date) => {
		const noteDate = moment(date)
		const today = moment()

		if (noteDate.isSame(today, 'day')) {
			return `Today at ${noteDate.format('h:mm A')}`
		} else if (noteDate.isSame(today.subtract(1, 'day'), 'day')) {
			return `Yesterday at ${noteDate.format('h:mm A')}`
		} else if (noteDate.isAfter(moment().subtract(7, 'days'))) {
			return noteDate.format('dddd [at] h:mm A')
		} else {
			return noteDate.format('MMM D, YYYY [at] h:mm A')
		}
	}

	const handleToggleAppointment = (appointmentId: string) => {
		const newSelected = new Set(selectedAppointments)
		if (newSelected.has(appointmentId)) {
			newSelected.delete(appointmentId)
		} else {
			newSelected.add(appointmentId)
		}
		setSelectedAppointments(newSelected)
	}

	const handleSelectAll = () => {
		const allIds = new Set([appointment.id, ...upcomingAppointments.map(apt => apt.id)])
		setSelectedAppointments(allIds)
	}

	const handleDeselectAll = () => {
		setSelectedAppointments(new Set())
	}

	const handleBulkDelete = () => {
		if (selectedAppointments.size > 0 && onBulkDelete) {
			if (confirm(`Are you sure you want to delete ${selectedAppointments.size} appointment${selectedAppointments.size > 1 ? 's' : ''}?`)) {
				onBulkDelete(Array.from(selectedAppointments))
				setSelectedAppointments(new Set())
				setShowUpcomingAppointments(false)
			}
		}
	}

	return (
		<div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col">
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b">
				<h2 className="text-lg font-semibold text-gray-900">Appointment</h2>
				<button
					onClick={onClose}
					className="p-1 hover:bg-gray-100 rounded transition-colors"
				>
					<X className="h-5 w-5 text-gray-400" />
				</button>
			</div>

			{/* Action Buttons */}
			<div className="p-4 border-b">
				{appointment.status === 'deleted' ? (
					<div className="bg-gray-100 border border-gray-300 rounded-md p-3">
						<p className="text-sm font-medium text-gray-700">Appointment Deleted</p>
						<p className="text-xs text-gray-600 mt-1">
							This appointment was removed from the schedule
							{appointment.deletedAt && (
								<span className="block mt-0.5">
									on {moment(appointment.deletedAt).format('MMM D, YYYY [at] h:mm A')}
								</span>
							)}
						</p>
					</div>
				) : appointment.status === 'cancelled' ? (
					<>
						<div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
							<p className="text-sm font-medium text-red-900">Appointment Cancelled</p>
							{appointment.cancellationReason && (
								<p className="text-sm text-red-700 mt-1">Reason: {appointment.cancellationReason}</p>
							)}
							{appointment.cancelledAt && (
								<p className="text-xs text-red-600 mt-1">
									Cancelled on {moment(appointment.cancelledAt).format('MMM D, YYYY [at] h:mm A')}
								</p>
							)}
						</div>
						<button
							onClick={() => onUncancel && onUncancel(appointment.id)}
							className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors flex items-center justify-center"
						>
							<RefreshCw className="h-4 w-4 mr-1" />
							Uncancel Appointment
						</button>
					</>
				) : (
					<>
						<div className="flex space-x-2 mb-2">
							<button
								onClick={() => handleStatusChange('arrived')}
								className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${appointment.status === 'arrived'
									? 'bg-green-600 text-white hover:bg-green-700'
									: 'bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white'
									}`}
								title={appointment.status === 'arrived' ? 'Click to undo arrived status' : 'Mark as arrived'}
							>
								{appointment.status === 'arrived' ? '✓ Arrived' : 'Arrived'}
							</button>
							<button
								onClick={() => handleStatusChange('no-show')}
								className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${appointment.status === 'no-show'
									? 'bg-red-600 text-white hover:bg-red-700'
									: 'bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white'
									}`}
								title={appointment.status === 'no-show' ? 'Click to undo no-show status' : 'Mark as no-show'}
							>
								{appointment.status === 'no-show' ? '✗ No Show' : 'No Show'}
							</button>
							<button className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium transition-colors">
								Pay
							</button>
						</div>
						<div className="flex space-x-2">
							<button
								onClick={() => alert('This will open in the Provider Tablet app for in-room charting')}
								className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 text-sm font-medium transition-all flex items-center justify-center"
								title="Opens in Provider Tablet app"
							>
								<Stethoscope className="h-4 w-4 mr-1" />
								Chart
							</button>
							<button
								onClick={onEdit}
								className="flex-1 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium transition-colors flex items-center justify-center"
							>
								<Edit2 className="h-4 w-4 mr-1" />
								Edit
							</button>
							<button
								onClick={onMove}
								className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium transition-colors flex items-center justify-center"
							>
								<Move className="h-4 w-4 mr-1" />
								Move
							</button>
							<button
								onClick={onCopy}
								className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm font-medium transition-colors flex items-center justify-center"
							>
								<FileText className="h-4 w-4 mr-1" />
								Copy
							</button>
						</div>
						{/* Recurring Appointments Button */}
						{isRecurring && upcomingAppointments.length > 0 && (
							<div className="mt-2">
								<button
									onClick={() => setShowUpcomingAppointments(!showUpcomingAppointments)}
									className="flex items-center justify-center w-full px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm font-medium transition-colors"
								>
									<ChevronsRight className={`h-4 w-4 mr-1 transition-transform ${showUpcomingAppointments ? 'rotate-90' : ''}`} />
									{showUpcomingAppointments ? 'Hide' : 'Show'} All Upcoming Appointments ({upcomingAppointments.length + 1})
								</button>
							</div>
						)}
						<div className="flex mt-2">
							<button
								onClick={() => setShowCancelDeleteModal(true)}
								className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium transition-colors"
							>
								Cancel/Delete
							</button>
						</div>
						{(appointment.status === 'arrived' || appointment.status === 'no-show') && (
							<p className="text-xs text-gray-500 text-center mt-2">Click again to undo</p>
						)}
					</>
				)}
			</div>

			{/* Upcoming Appointments List */}
			{showUpcomingAppointments && (
				<div className="border-b bg-gray-50">
					<div className="p-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold text-gray-900">Recurring Appointments</h3>
							<div className="space-x-2 text-xs">
								<button
									onClick={handleSelectAll}
									className="text-purple-600 hover:text-purple-700"
								>
									Select All
								</button>
								<span className="text-gray-400">|</span>
								<button
									onClick={handleDeselectAll}
									className="text-purple-600 hover:text-purple-700"
								>
									Deselect All
								</button>
							</div>
						</div>

						{/* Appointments List */}
						<div className="space-y-1 max-h-64 overflow-y-auto">
							{/* Current Appointment */}
							<label className="flex items-center p-2 hover:bg-white rounded cursor-pointer">
								<input
									type="checkbox"
									checked={selectedAppointments.has(appointment.id)}
									onChange={() => handleToggleAppointment(appointment.id)}
									className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
								/>
								<div className="flex-1">
									<div className="text-sm font-medium text-gray-900">
										{moment(appointment.startTime).format('ddd, MMM D')} - {appointment.serviceName}
									</div>
									<div className="text-xs text-gray-600">
										{moment(appointment.startTime).format('h:mm A')} - {moment(appointment.endTime).format('h:mm A')}
										<span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">Current</span>
									</div>
								</div>
							</label>

							{/* Upcoming Appointments */}
							{upcomingAppointments.map((apt) => (
								<label key={apt.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer">
									<input
										type="checkbox"
										checked={selectedAppointments.has(apt.id)}
										onChange={() => handleToggleAppointment(apt.id)}
										className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
									/>
									<div className="flex-1">
										<div className="text-sm font-medium text-gray-900">
											{moment(apt.startTime).format('ddd, MMM D')} - {apt.serviceName}
										</div>
										<div className="text-xs text-gray-600">
											{moment(apt.startTime).format('h:mm A')} - {moment(apt.endTime).format('h:mm A')}
											{apt.status !== 'scheduled' && (
												<span className={`ml-2 px-1 py-0.5 rounded text-xs ${
													apt.status === 'arrived' ? 'bg-green-100 text-green-700' :
													apt.status === 'no-show' ? 'bg-red-100 text-red-700' :
													'bg-gray-100 text-gray-700'
												}`}>
													{apt.status}
												</span>
											)}
										</div>
									</div>
								</label>
							))}
						</div>

						{/* Bulk Delete Button */}
						{selectedAppointments.size > 0 && (
							<div className="mt-3 pt-3 border-t">
								<button
									onClick={handleBulkDelete}
									className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition-colors flex items-center justify-center"
								>
									<Trash2 className="h-4 w-4 mr-1" />
									Delete {selectedAppointments.size} Appointment{selectedAppointments.size > 1 ? 's' : ''}
								</button>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				<div className="p-4 space-y-4">
					{/* Patient Info */}
					<div>
						<h3 className="text-sm font-medium text-gray-900 mb-2">Booking Info</h3>
						<div className="space-y-2">
							<div>
								<p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
								<div className="flex items-center space-x-4 mt-1">
									<a href={`tel:${patientPhone}`} className="flex items-center text-sm text-purple-600 hover:text-purple-700">
										<Phone className="h-3 w-3 mr-1" />
										{patientPhone}
									</a>
									<span className="text-sm text-gray-500">D.O.B: {patientDOB}</span>
								</div>
								<a href={`mailto:${patientEmail}`} className="text-sm text-purple-600 hover:text-purple-700">
									{patientEmail}
								</a>
							</div>
						</div>
					</div>

					{/* Account Info */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm text-gray-500">Account Owing</span>
							<span className="text-sm font-medium text-gray-900">${accountOwing.toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span className="text-sm text-gray-500">Account Credit</span>
							<span className="text-sm font-medium text-gray-900">${accountCredit.toFixed(2)}</span>
						</div>
					</div>

					{/* Appointment Details */}
					<div className="pt-4 border-t space-y-2">
						<div className="flex items-start">
							<Calendar className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
							<div className="text-sm">
								<p className="font-medium text-gray-900">{appointmentDate}</p>
								<p className="text-gray-600">{startTime} - {endTime}</p>
								<p className="text-gray-600">The Village{appointment.room ? `, ${appointment.room}` : ''}</p>
							</div>
						</div>

						<div className="flex items-start">
							<FileText className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
							<div className="flex-1">
								{isEditingService ? (
									<div className="space-y-2">
										<input
											type="text"
											value={editedServiceName}
											onChange={(e) => setEditedServiceName(e.target.value)}
											className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
											placeholder="Service name"
										/>
										<div className="flex items-center space-x-2">
											<input
												type="number"
												value={editedDuration}
												onChange={(e) => setEditedDuration(e.target.value)}
												className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
												placeholder="Duration"
												min="15"
												step="15"
											/>
											<span className="text-sm text-gray-600">minutes</span>
										</div>
										<div className="flex space-x-2 mt-2">
											<button
												onClick={() => {
													const newDuration = parseInt(editedDuration)
													if (onUpdate && newDuration > 0) {
														// Calculate new end time based on the edited duration
														const newEndTime = new Date(appointment.startTime)
														newEndTime.setMinutes(newEndTime.getMinutes() + newDuration)
														
														onUpdate(appointment.id, {
															serviceName: editedServiceName,
															duration: newDuration,
															endTime: newEndTime
														})
													}
													setIsEditingService(false)
												}}
												className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
											>
												Save
											</button>
											<button
												onClick={() => {
													setEditedServiceName(appointment.serviceName)
													setEditedDuration(appointment.duration.toString())
													setIsEditingService(false)
												}}
												className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
											>
												Cancel
											</button>
										</div>
									</div>
								) : (
									<div className="text-sm">
										<div className="flex items-center">
											<p className="font-medium text-gray-900">{appointment.serviceName} (${servicePrice.toFixed(2)})</p>
											<button
												onClick={() => setIsEditingService(true)}
												className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
												title="Edit service details"
											>
												<Edit2 className="h-3 w-3 text-gray-400" />
											</button>
										</div>
										<p className="text-gray-600">{practitioner?.name || 'Unknown Practitioner'}</p>
										<p className="text-xs text-gray-500 mt-1">{appointment.duration} minutes</p>
									</div>
								)}
							</div>
						</div>
					</div>


					{/* Notes Section */}
					<div className="pt-4 border-t">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-medium text-gray-900 flex items-center">
								<MessageSquare className="h-4 w-4 mr-1" />
								Notes
								{notes.length > 0 && (
									<span className="ml-2 text-xs text-gray-500">({notes.length})</span>
								)}
							</h3>
							{!showNoteInput && (
								<button
									onClick={() => setShowNoteInput(true)}
									className="text-sm text-purple-600 hover:text-purple-700 font-medium"
								>
									Add
								</button>
							)}
						</div>

						{/* Add Note Input */}
						{showNoteInput && (
							<div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
								<textarea
									className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
									rows={3}
									placeholder="Add a note..."
									value={newNoteContent}
									onChange={(e) => setNewNoteContent(e.target.value)}
									autoFocus
								/>
								<div className="flex justify-end space-x-2 mt-2">
									<button
										onClick={() => {
											setShowNoteInput(false)
											setNewNoteContent('')
										}}
										className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
									>
										Cancel
									</button>
									<button
										onClick={handleAddNote}
										disabled={!newNoteContent.trim()}
										className={`px-3 py-1 text-sm rounded-md font-medium ${newNoteContent.trim()
											? 'bg-blue-600 text-white hover:bg-blue-700'
											: 'bg-gray-300 text-gray-500 cursor-not-allowed'
											}`}
									>
										Add
									</button>
								</div>
							</div>
						)}

						{/* Notes List */}
						<div className="space-y-2">
							{notes.length === 0 ? (
								<p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
							) : (
								notes.map((note) => (
									<div
										key={note.id}
										className={`p-3 rounded-lg border ${note.isImportant
											? 'bg-orange-50 border-orange-200'
											: 'bg-gray-50 border-gray-200'
											}`}
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<p className="text-sm text-gray-800 whitespace-pre-wrap">{note.content}</p>
												<div className="flex items-center mt-2 text-xs text-gray-500">
													<span>{note.authorName}</span>
													<span className="mx-1">•</span>
													<span>{formatNoteDate(note.createdAt)}</span>
													{!note.appointmentId && (
														<>
															<span className="mx-1">•</span>
															<span className="text-orange-600 font-medium">Patient Note</span>
														</>
													)}
												</div>
											</div>
											<div className="flex items-center ml-2 space-x-1">
												{note.appointmentId === appointment.id && (
													<button
														onClick={() => handleToggleImportant(note.id)}
														className={`p-1 rounded hover:bg-gray-200 transition-colors ${note.isImportant ? 'text-orange-500' : 'text-gray-400'
															}`}
														title={note.isImportant ? 'Remove from important' : 'Mark as important'}
													>
														<Star className={`h-4 w-4 ${note.isImportant ? 'fill-current' : ''}`} />
													</button>
												)}
												{note.appointmentId === appointment.id && (
													<button
														onClick={() => handleDeleteNote(note.id)}
														className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-red-600"
														title="Delete note"
													>
														<X className="h-4 w-4" />
													</button>
												)}
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>

					{/* Service Color Indicator */}
					<div className="pt-4 border-t">
						<div className="flex items-center space-x-2">
							<div
								className="w-4 h-4 rounded"
								style={{ backgroundColor: appointment.color }}
							/>
							<span className="text-sm text-gray-600">
								{appointment.serviceCategory} - {appointment.serviceName}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Cancel Reason Modal */}
			<CancelReasonModal
				isOpen={showCancelModal}
				onClose={() => setShowCancelModal(false)}
				onConfirm={(reason) => {
					if (onCancel) {
						onCancel(appointment.id, reason)
					}
					setShowCancelModal(false)
				}}
				appointmentDetails={{
					patientName: appointment.patientName,
					serviceName: appointment.serviceName,
					dateTime: `${appointmentDate} at ${startTime}`
				}}
			/>

			{/* Cancel/Delete Options Modal */}
			<CancelDeleteModal
				isOpen={showCancelDeleteModal}
				onClose={() => setShowCancelDeleteModal(false)}
				onCancel={() => {
					setShowCancelDeleteModal(false)
					setShowCancelModal(true)
				}}
				onDelete={() => {
					if (onDelete) {
						onDelete(appointment.id)
					}
					setShowCancelDeleteModal(false)
				}}
				appointmentDetails={{
					patientName: appointment.patientName,
					serviceName: appointment.serviceName,
					dateTime: `${appointmentDate} at ${startTime}`
				}}
			/>
		</div>
	)
}
