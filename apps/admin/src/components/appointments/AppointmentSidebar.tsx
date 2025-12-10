'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, Search, ChevronDown, ChevronLeft, Check, AlertCircle, MapPin, ChevronsRight, History } from 'lucide-react'
import moment from 'moment'
import { type Service, type Appointment, type Practitioner, services as allServices, practitioners } from '@/lib/data'
import { findAppointmentConflicts, getConflictMessage } from '@/utils/appointmentConflicts'
import { checkResourceAvailability, findAvailableResource } from '@/lib/mockResources'
import { mockResourcePools, mockRooms } from '@/lib/mockResources'
import { checkServiceCapabilityMatch, getBookingExplanation } from '@/utils/capabilityMatcher'
import RecurringAppointmentModal from './RecurringAppointmentModal'
import AppointmentHistory from './AppointmentHistory'
import { Shift } from '@/types/shifts'

interface AppointmentSidebarProps {
	isOpen: boolean
	onClose: () => void
	practitioner: {
		id: string
		name: string
		initials: string
	}
	selectedDate: Date
	startTime: {
		hour: number
		minute: number
	}
	selectedService?: Service
	initialDuration?: number // Duration from drag-to-create
	onSave: (appointmentData: any) => void
	onPreviewUpdate?: (duration: number) => void // Callback to update calendar preview
	getShiftForDate: (practitionerId: string, date: Date) => {
		startHour: number
		startMinute: number
		endHour: number
		endMinute: number
		room?: string
		startAt?: Date
		endAt?: Date
	} | null
	getAllShiftsForDate?: (practitionerId: string, date: Date) => Array<{
		startAt: Date
		endAt: Date
		room?: string
		id?: string
		practitionerId?: string
	}>
	existingAppointments: Appointment[]
	shifts?: Shift[]
	existingAppointment?: Appointment // For editing mode
}

// Sample existing clients
const existingClients = [
	{
		id: '1',
		name: 'Dylan Grewal',
		phone: '(833) 737-7205',
		email: 'dylan.grewal@example.com',
		lastVisit: 'April 23, 1977',
		appointments: 41,
		balance: 194.25
	},
	{
		id: '2',
		name: 'Sarah Johnson',
		phone: '(555) 123-4567',
		email: 'sarah.johnson@example.com',
		lastVisit: 'March 15, 2023',
		appointments: 12,
		balance: 0
	},
]

export default function AppointmentSidebar({
	isOpen,
	onClose,
	practitioner,
	selectedDate,
	startTime,
	selectedService: preSelectedService,
	initialDuration,
	onSave,
	onPreviewUpdate,
	getShiftForDate,
	getAllShiftsForDate,
	existingAppointments,
	shifts = [],
	existingAppointment
}: AppointmentSidebarProps) {
	// Get only the services that the selected practitioner can perform
	const services = allServices.filter(service => 
		service.practitionerIds.includes(practitioner.id) && service.isActive
	)

	// For new appointments: always start with null (user must choose)
	// For existing appointments or pre-selected: use that service
	const getInitialService = (): Service | null => {
		if (existingAppointment) {
			const matchingService = services.find(s => s.name === existingAppointment.serviceName)
			return matchingService || services[0]
		} else if (preSelectedService) {
			const matchingService = services.find(s =>
				s.name === preSelectedService.name &&
				s.duration === preSelectedService.duration
			)
			return matchingService || null
		}
		return null // NEW appointments start with no service selected
	}

	const [selectedServiceState, setSelectedServiceState] = useState<Service | null>(getInitialService)

	// Reset service selection when sidebar opens for a NEW appointment (startTime changes)
	// This ensures each drag resets to "Choose a session"
	useEffect(() => {
		if (!existingAppointment && !preSelectedService) {
			setSelectedServiceState(null)
		}
	}, [startTime.hour, startTime.minute, existingAppointment, preSelectedService])

	const [selectedClient, setSelectedClient] = useState<typeof existingClients[0] | null>(
		existingAppointment ? existingClients.find(c => c.name === existingAppointment.patientName) || null : null
	)
	const [clientSearch, setClientSearch] = useState(existingAppointment?.patientName || '')
	const [showClientDropdown, setShowClientDropdown] = useState(false)
	const [notes, setNotes] = useState(existingAppointment?.notes || '')
	const [selectedStartTime, setSelectedStartTime] = useState(startTime)
	const [endTime, setEndTime] = useState({ hour: startTime.hour, minute: startTime.minute })

	// Sync selectedStartTime when startTime prop changes (user clicked elsewhere on calendar)
	useEffect(() => {
		setSelectedStartTime(startTime)
	}, [startTime.hour, startTime.minute])
	const [conflicts, setConflicts] = useState<Appointment[]>([])
	const [resourceAvailability, setResourceAvailability] = useState<{ available: boolean; resources: any[]; conflicts?: any[] }>({ available: true, resources: [] })
	const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
	const [overrideConflicts, setOverrideConflicts] = useState(false)
	const [enablePostTreatmentTime, setEnablePostTreatmentTime] = useState(false)
	const [showRecurringModal, setShowRecurringModal] = useState(false)
	const [activeTab, setActiveTab] = useState<'booking' | 'history'>('booking')

	// New client form state
	const [showNewClientForm, setShowNewClientForm] = useState(false)
	const [newClientData, setNewClientData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		province: '',
		postalCode: '',
		gender: '',
		preferredName: '',
		pronouns: ''
	})

	// Update selected service when pre-selected service changes
	useEffect(() => {
		if (preSelectedService) {
			const matchingService = services.find(s =>
				s.name === preSelectedService.name &&
				s.duration === preSelectedService.duration
			)
			if (matchingService) {
				setSelectedServiceState(matchingService)
				// Auto-enable post-treatment time if service has it
				if (matchingService.postTreatmentTime) {
					setEnablePostTreatmentTime(true)
				}
			}
		}
	}, [preSelectedService])

	// Update end time when service or start time changes
	useEffect(() => {
		if (!selectedServiceState) {
			// No service selected - keep current preview duration, just update end time to match start
			// DON'T call onPreviewUpdate - let the dragged duration stay
			setEndTime({ hour: selectedStartTime.hour, minute: selectedStartTime.minute })
			return
		}

		// Service IS selected - use service duration
		const endDate = new Date(selectedDate)
		endDate.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)
		const durationToBlock = selectedServiceState.scheduledDuration || selectedServiceState.duration
		endDate.setMinutes(endDate.getMinutes() + durationToBlock)

		setEndTime({
			hour: endDate.getHours(),
			minute: endDate.getMinutes()
		})

		// Update calendar preview ONLY when service is selected
		if (onPreviewUpdate) {
			onPreviewUpdate(durationToBlock)
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedServiceState, selectedStartTime, selectedDate]) // onPreviewUpdate excluded to prevent infinite loop

	// Check for conflicts whenever time, service, or room changes
	useEffect(() => {
		// Skip conflict check if no service selected
		if (!selectedServiceState) {
			setConflicts([])
			return
		}

		const startDateTime = new Date(selectedDate)
		startDateTime.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)

		const endDateTime = new Date(selectedDate)
		endDateTime.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)
		// For conflict checking, always use the full treatment duration
		endDateTime.setMinutes(endDateTime.getMinutes() + (selectedServiceState?.duration || 30))

		const foundConflicts = findAppointmentConflicts(
			{
				practitionerId: practitioner.id,
				startTime: startDateTime,
				endTime: endDateTime,
				roomId: selectedRoom || undefined,
				postTreatmentTime: enablePostTreatmentTime ? selectedServiceState?.postTreatmentTime : undefined,
				serviceName: selectedServiceState?.name || ''
			},
			existingAppointments
		)

		setConflicts(foundConflicts)
	}, [selectedStartTime, selectedServiceState, selectedDate, practitioner.id, existingAppointments, selectedRoom, enablePostTreatmentTime])

	// Check resource availability when service or time changes
	useEffect(() => {
		if (!selectedServiceState || !selectedServiceState.requiredResources || selectedServiceState.requiredResources.length === 0) {
			setResourceAvailability({ available: true, resources: [] })
			return
		}

		const startDateTime = new Date(selectedDate)
		startDateTime.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)

		const endDateTime = new Date(selectedDate)
		endDateTime.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)
		// For resource checking, use full treatment duration
		endDateTime.setMinutes(endDateTime.getMinutes() + (selectedServiceState?.duration || 30))

		// Check availability for each required resource pool
		const availableResources: any[] = []
		const resourceConflicts: any[] = []
		let allAvailable = true

		selectedServiceState.requiredResources.forEach(req => {
			const pool = mockResourcePools.find(p => p.id === req.resourcePoolId)
			const availability = checkResourceAvailability(
				req.resourcePoolId,
				startDateTime,
				endDateTime,
				existingAppointment?.id,
				existingAppointments
			)

			// Find available resources for this requirement
			const availableInPool = availability.filter(a => a.available)
			
			if (availableInPool.length >= req.quantity) {
				// We have enough available resources
				const assigned = availableInPool.slice(0, req.quantity)
				availableResources.push(...assigned.map(a => ({
					resourceId: a.resourceId,
					resourceName: a.resourceName,
					resourcePoolId: req.resourcePoolId,
					resourcePoolName: pool?.name || 'Unknown'
				})))
			} else {
				// Not enough available resources
				allAvailable = false
				
				// Collect conflict information
				const conflictInfo = {
					resourcePoolId: req.resourcePoolId,
					resourcePoolName: pool?.name || 'Unknown',
					required: req.quantity,
					available: availableInPool.length,
					conflicts: availability.filter(a => !a.available).map(a => ({
						resourceName: a.resourceName,
						conflicts: a.conflicts
					}))
				}
				resourceConflicts.push(conflictInfo)
			}
		})

		setResourceAvailability({ 
			available: allAvailable, 
			resources: availableResources,
			conflicts: resourceConflicts
		})
	}, [selectedServiceState, selectedStartTime, selectedDate])

	// Filter clients based on search
	const filteredClients = existingClients.filter(client =>
		client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
		client.phone.includes(clientSearch) ||
		client.email.toLowerCase().includes(clientSearch.toLowerCase())
	)

	const formatTime = (time: { hour: number; minute: number }) => {
		return moment().hour(time.hour).minute(time.minute).format('h:mm A')
	}

	const formatPhone = (phone: string) => {
		// Remove all non-numeric characters
		const cleaned = phone.replace(/\D/g, '')

		// Format as (XXX) XXX-XXXX
		if (cleaned.length >= 10) {
			return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
		}
		return phone
	}

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhone(e.target.value)
		setNewClientData({ ...newClientData, phone: formatted })
	}

	const handleCreateClient = () => {
		if (!newClientData.firstName || !newClientData.lastName) {
			alert('Please enter at least first and last name')
			return
		}

		// Create new client object
		const newClient = {
			id: Date.now().toString(),
			name: `${newClientData.firstName} ${newClientData.lastName}`,
			phone: newClientData.phone || 'No phone',
			email: newClientData.email || 'No email',
			lastVisit: 'New client',
			appointments: 0,
			balance: 0
		}

		// Add to existing clients (in real app, this would be an API call)
		existingClients.unshift(newClient)

		// Select the new client
		setSelectedClient(newClient)
		setClientSearch(newClient.name)

		// Reset form and close
		setShowNewClientForm(false)
		setNewClientData({
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			address: '',
			city: '',
			province: '',
			postalCode: '',
			gender: '',
			preferredName: '',
			pronouns: ''
		})
	}

	const handleSave = () => {
		// Validation checks
		if (!selectedClient) {
			alert('Please select a client')
			return
		}
		
		if (!selectedServiceState) {
			alert('Please select a service')
			return
		}

		// Check if appointment would extend beyond any shift (remove this check as it's now handled below)
		// The comprehensive check below handles both start and end time validation

		// First, validate shift hours (unless admin override is enabled)
		if (!overrideConflicts) {
			// Use getAllShiftsForDate if available, otherwise fall back to single shift
			const allShifts = getAllShiftsForDate ? getAllShiftsForDate(practitioner.id, selectedDate) : []
			const singleShift = getShiftForDate(practitioner.id, selectedDate)
			
			// If no shifts at all
			if (allShifts.length === 0 && !singleShift) {
				alert(`${practitioner.name} has no shifts scheduled for ${moment(selectedDate).format('MMMM D, YYYY')}.\n\nPlease select a different date or enable Administrative Override.`)
				return
			}
			
			// Check if the selected time is within ANY shift hours
			const selectedTimeMinutes = selectedStartTime.hour * 60 + selectedStartTime.minute
			const endTimeMinutes = endTime.hour * 60 + endTime.minute
			let isWithinShift = false
			let shiftMessages = []
			
			// Check split shifts if available
			if (allShifts.length > 0) {
				for (const shift of allShifts) {
					// Handle both Date objects and plain objects with hour/minute properties
					let shiftStartMinutes, shiftEndMinutes
					
					if (shift.startAt instanceof Date && shift.endAt instanceof Date) {
						shiftStartMinutes = shift.startAt.getHours() * 60 + shift.startAt.getMinutes()
						shiftEndMinutes = shift.endAt.getHours() * 60 + shift.endAt.getMinutes()
					} else if (shift.startAt && shift.endAt) {
						// Try to parse as Date if they're strings
						const startDate = new Date(shift.startAt)
						const endDate = new Date(shift.endAt)
						shiftStartMinutes = startDate.getHours() * 60 + startDate.getMinutes()
						shiftEndMinutes = endDate.getHours() * 60 + endDate.getMinutes()
					} else {
						continue
					}
					
					// Format shift message properly
					const shiftStartStr = `${Math.floor(shiftStartMinutes/60)}:${(shiftStartMinutes%60).toString().padStart(2, '0')}`
					const shiftEndStr = `${Math.floor(shiftEndMinutes/60)}:${(shiftEndMinutes%60).toString().padStart(2, '0')}`
					shiftMessages.push(`${moment(shiftStartStr, 'H:mm').format('h:mm A')} - ${moment(shiftEndStr, 'H:mm').format('h:mm A')}`)
					
					// Check if appointment fits within this shift
					if (selectedTimeMinutes >= shiftStartMinutes && endTimeMinutes <= shiftEndMinutes) {
						isWithinShift = true
						break
					}
				}
			} else if (singleShift) {
				// Fall back to single shift check
				const shiftStartMinutes = singleShift.startHour * 60 + singleShift.startMinute
				const shiftEndMinutes = singleShift.endHour * 60 + singleShift.endMinute
				
				shiftMessages.push(`${moment().hour(singleShift.startHour).minute(singleShift.startMinute).format('h:mm A')} - ${moment().hour(singleShift.endHour).minute(singleShift.endMinute).format('h:mm A')}`)
				
				if (selectedTimeMinutes >= shiftStartMinutes && endTimeMinutes <= shiftEndMinutes) {
					isWithinShift = true
				}
			}
			
			if (!isWithinShift) {
				const appointmentTimeStr = `${moment().hour(selectedStartTime.hour).minute(selectedStartTime.minute).format('h:mm A')} - ${moment().hour(endTime.hour).minute(endTime.minute).format('h:mm A')}`
				alert(`The selected appointment time (${appointmentTimeStr}) is outside of ${practitioner.name}'s scheduled shifts.\n\nShift hours:\n${shiftMessages.join('\n')}\n\nPlease select a time within these hours or enable Administrative Override.`)
				return
			}
		}

		// NEW: Check capability/equipment restrictions using new system
		if (selectedServiceState && ((selectedServiceState.requiredCapabilities?.length ?? 0) > 0 ||
			 (selectedServiceState.requiredEquipment?.length ?? 0) > 0 ||
			 (selectedServiceState.tags?.length ?? 0) > 0) && !overrideConflicts) {
			
			// Get the shift for this specific time slot
			const selectedDateTime = new Date(selectedDate)
			selectedDateTime.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)
			
			// Find all shifts for this practitioner on this date
			// Use getAllShiftsForDate which includes template-generated shifts
			const practitionerShifts = getAllShiftsForDate ? 
				getAllShiftsForDate(practitioner.id, selectedDate) :
				shifts.filter(s => 
					s.practitionerId === practitioner.id &&
					moment(s.startAt).isSame(selectedDate, 'day')
				)
			
			// Find the shift that contains this time slot
			const relevantShift = practitionerShifts.find(s => {
				const shiftStart = moment(s.startAt)
				const shiftEnd = moment(s.endAt)
				const appointmentTime = moment(selectedDateTime)
				return appointmentTime.isSameOrAfter(shiftStart) && appointmentTime.isBefore(shiftEnd)
			})
			
			if (!relevantShift) {
				// More helpful error message
				if (practitionerShifts.length === 0) {
					alert(`${practitioner.name} has no shifts scheduled for ${moment(selectedDate).format('MMMM D, YYYY')}.\n\nPlease select a different date.`)
				} else {
					// Show available shift times
					const shiftTimes = practitionerShifts.map(s => 
						`${moment(s.startAt).format('h:mm A')} - ${moment(s.endAt).format('h:mm A')}`
					).join(', ')
					alert(`The selected time (${selectedStartTime.hour}:${selectedStartTime.minute < 10 ? '0' : ''}${selectedStartTime.minute}) is outside of ${practitioner.name}'s scheduled shifts.\n\nAvailable shifts: ${shiftTimes}\n\nPlease select a time within these shifts.`)
				}
				return
			}
			
			// Use new capability matching system
			// Create a full practitioner object from the limited props (temporary fix)
			const fullPractitioner: Practitioner = {
				...practitioner,
				discipline: 'General' as any, // Default values for missing fields
				status: 'active' as any
			}
			// Convert relevantShift to full Shift type
			const fullShift: Shift = {
				...relevantShift,
				id: relevantShift.id || `shift-${Date.now()}`,
				practitionerId: relevantShift.practitionerId || practitioner.id,
				repeat: 'no-repeat',
				bookingOptions: 'bookable'
			}
			const capabilityMatch = checkServiceCapabilityMatch(selectedServiceState, fullPractitioner, fullShift)
			
			if (!capabilityMatch.canPerform) {
				const explanation = getBookingExplanation(capabilityMatch, selectedServiceState.name)
				
				// Find shifts where this service CAN be performed
				const compatibleShifts = practitionerShifts.filter(s => {
					const tempShift: Shift = {
						...s,
						id: s.id || `shift-${Date.now()}`,
						practitionerId: s.practitionerId || practitioner.id,
						repeat: 'no-repeat',
						bookingOptions: 'bookable'
					}
					const match = checkServiceCapabilityMatch(selectedServiceState, fullPractitioner, tempShift)
					return match.canPerform
				})
				
				let message = explanation
				
				if (compatibleShifts.length > 0) {
					const availableTimes = compatibleShifts.map(s => 
						`${moment(s.startAt).format('h:mm A')} - ${moment(s.endAt).format('h:mm A')}`
					).join(', ')
					message += `\n\n✓ Available times: ${availableTimes}`
				} else {
					message += `\n\n❌ ${practitioner.name} cannot perform this service on this date.`
				}
				
				message += `\n\nOptions:\n1. Select a different time slot\n2. Choose a different practitioner\n3. Enable "Administrative Override" below`
				
				alert(message)
				return
			}
		}

		// Don't save if there are conflicts (unless override is enabled)
		if (conflicts.length > 0 && !overrideConflicts) {
			alert(`Cannot book: ${getConflictMessage(conflicts, selectedRoom || undefined)}`)
			return
		}

		// Don't save if resources are not available (unless override is enabled)
		// Note: Resources must be available even if practitioner has stagger booking enabled
		// Each appointment needs its own resources, regardless of practitioner overlap
		if (selectedServiceState.requiredResources && selectedServiceState.requiredResources.length > 0 && !resourceAvailability.available && !overrideConflicts) {
			const conflictDetails = resourceAvailability.conflicts?.map(c => 
				`• ${c.resourcePoolName}: Only ${c.available} of ${c.required} available`
			).join('\n')
			
			alert(`⚠️ Resource Conflict\n\nThe required equipment is not available during this time slot.\n\n${conflictDetails || 'Required resources are in use.'}\n\nNote: Even with stagger booking enabled for ${practitioner.name}, each appointment requires its own resources.\n\nPlease select a different time or enable Administrative Override.`)
			return
		}

		onSave({
			appointmentId: existingAppointment?.id, // Include appointment ID if editing
			client: selectedClient,
			service: selectedServiceState,
			practitioner,
			startTime: selectedStartTime,
			endTime,
			notes,
			date: selectedDate,
			assignedResources: resourceAvailability.resources,
			roomId: selectedRoom,
			postTreatmentTime: enablePostTreatmentTime ? selectedServiceState.postTreatmentTime : undefined,
			overriddenConflicts: overrideConflicts && (conflicts.length > 0 || !resourceAvailability.available)
		})

		// Reset form
		setSelectedClient(null)
		setClientSearch('')
		setNotes('')
		onClose()
	}

	// Get shift info
	const shift = getShiftForDate(practitioner.id, selectedDate)
	
	// Initialize selected room from shift
	useEffect(() => {
		if (shift?.room && !selectedRoom) {
			setSelectedRoom(shift.room)
		}
	}, [shift])

	// NEW: Check capability/equipment mismatch
	let hasCapabilityMismatch = false
	let capabilityMatch = null
	
	if (((selectedServiceState?.requiredCapabilities?.length ?? 0) > 0 || 
		 (selectedServiceState?.requiredEquipment?.length ?? 0) > 0 ||
		 (selectedServiceState?.tags?.length ?? 0) > 0) && selectedStartTime) {
		// Get all shifts including template-generated ones
		const allShifts = getAllShiftsForDate ? 
			getAllShiftsForDate(practitioner.id, selectedDate) :
			shifts.filter(s => 
				s.practitionerId === practitioner.id &&
				moment(s.startAt).isSame(selectedDate, 'day')
			)
		
		// Create a moment for the selected time
		const selectedDateTime = new Date(selectedDate)
		selectedDateTime.setHours(selectedStartTime.hour, selectedStartTime.minute, 0, 0)
		const selectedMoment = moment(selectedDateTime)
		
		const relevantShift = allShifts.find(s => 
			selectedMoment.isSameOrAfter(moment(s.startAt)) && 
			selectedMoment.isBefore(moment(s.endAt))
		)
		
		if (relevantShift) {
			// Create a full practitioner object from the limited props  
			const fullPractitioner: Practitioner = {
				...practitioner,
				discipline: 'General' as any,
				status: 'active' as any
			}
			// Convert relevantShift to full Shift type
			const fullShift: Shift = {
				...relevantShift,
				id: relevantShift.id || `shift-${Date.now()}`,
				practitionerId: relevantShift.practitionerId || practitioner.id,
				repeat: 'no-repeat',
				bookingOptions: 'bookable'
			}
			capabilityMatch = checkServiceCapabilityMatch(selectedServiceState, fullPractitioner, fullShift)
			hasCapabilityMismatch = !capabilityMatch.canPerform
		}
	}

	// Check if save button should be disabled
	const isSaveDisabled = !selectedClient || !selectedServiceState ||
		(!overrideConflicts && (conflicts.length > 0 ||
		(selectedServiceState?.requiredResources && selectedServiceState.requiredResources.length > 0 && !resourceAvailability.available) ||
		hasCapabilityMismatch))

	return (
		<div className={`fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
			}`}>
			{/* New Client Form Overlay */}
			<div className={`absolute inset-0 bg-white transform transition-transform duration-300 z-10 ${showNewClientForm ? 'translate-x-0' : 'translate-x-full'
				}`}>
				<div className="h-full flex flex-col">
					{/* Header */}
					<div className="px-6 py-4 border-b bg-gray-50">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<button
									onClick={() => setShowNewClientForm(false)}
									className="p-1 hover:bg-gray-200 rounded-full transition-colors mr-3"
								>
									<ChevronLeft className="h-5 w-5" />
								</button>
								<h2 className="text-xl font-semibold">New Client</h2>
							</div>
						</div>
					</div>

					{/* Form Content */}
					<div className="flex-1 overflow-y-auto p-6">
						<div className="space-y-4">
							{/* Required Fields */}
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-gray-700">Client Information</h3>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-gray-600 mb-1">
											First Name <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											value={newClientData.firstName}
											onChange={(e) => setNewClientData({ ...newClientData, firstName: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											placeholder="First Name"
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-600 mb-1">
											Last Name <span className="text-red-500">*</span>
										</label>
										<input
											type="text"
											value={newClientData.lastName}
											onChange={(e) => setNewClientData({ ...newClientData, lastName: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											placeholder="Last Name"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm text-gray-600 mb-1">Preferred Name</label>
									<input
										type="text"
										value={newClientData.preferredName}
										onChange={(e) => setNewClientData({ ...newClientData, preferredName: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										placeholder="Preferred Name"
									/>
								</div>

								<div>
									<label className="block text-sm text-gray-600 mb-1">Pronouns</label>
									<input
										type="text"
										value={newClientData.pronouns}
										onChange={(e) => setNewClientData({ ...newClientData, pronouns: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										placeholder="e.g. they/them/theirs"
									/>
								</div>
							</div>

							{/* Contact Information */}
							<div className="space-y-4 pt-4 border-t">
								<h3 className="text-sm font-semibold text-gray-700">Contact Information</h3>

								<div>
									<label className="block text-sm text-gray-600 mb-1">Email</label>
									<input
										type="email"
										value={newClientData.email}
										onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										placeholder="Email Address"
									/>
								</div>

								<div>
									<label className="block text-sm text-gray-600 mb-1">Mobile Phone</label>
									<input
										type="tel"
										value={newClientData.phone}
										onChange={handlePhoneChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										placeholder="(555) 555-5555"
									/>
								</div>
							</div>

							{/* Address Information */}
							<div className="space-y-4 pt-4 border-t">
								<h3 className="text-sm font-semibold text-gray-700">Address</h3>

								<div>
									<label className="block text-sm text-gray-600 mb-1">Street Address</label>
									<input
										type="text"
										value={newClientData.address}
										onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										placeholder="Street Address"
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm text-gray-600 mb-1">City</label>
										<input
											type="text"
											value={newClientData.city}
											onChange={(e) => setNewClientData({ ...newClientData, city: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
											placeholder="City"
										/>
									</div>
									<div>
										<label className="block text-sm text-gray-600 mb-1">State</label>
										<select
											value={newClientData.province}
											onChange={(e) => setNewClientData({ ...newClientData, province: e.target.value })}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										>
											<option value="">Select State</option>
											<option value="AL">Alabama</option>
											<option value="AK">Alaska</option>
											<option value="AZ">Arizona</option>
											<option value="AR">Arkansas</option>
											<option value="CA">California</option>
											<option value="CO">Colorado</option>
											<option value="CT">Connecticut</option>
											<option value="DE">Delaware</option>
											<option value="FL">Florida</option>
											<option value="GA">Georgia</option>
											<option value="HI">Hawaii</option>
											<option value="ID">Idaho</option>
											<option value="IL">Illinois</option>
											<option value="IN">Indiana</option>
											<option value="IA">Iowa</option>
											<option value="KS">Kansas</option>
											<option value="KY">Kentucky</option>
											<option value="LA">Louisiana</option>
											<option value="ME">Maine</option>
											<option value="MD">Maryland</option>
											<option value="MA">Massachusetts</option>
											<option value="MI">Michigan</option>
											<option value="MN">Minnesota</option>
											<option value="MS">Mississippi</option>
											<option value="MO">Missouri</option>
											<option value="MT">Montana</option>
											<option value="NE">Nebraska</option>
											<option value="NV">Nevada</option>
											<option value="NH">New Hampshire</option>
											<option value="NJ">New Jersey</option>
											<option value="NM">New Mexico</option>
											<option value="NY">New York</option>
											<option value="NC">North Carolina</option>
											<option value="ND">North Dakota</option>
											<option value="OH">Ohio</option>
											<option value="OK">Oklahoma</option>
											<option value="OR">Oregon</option>
											<option value="PA">Pennsylvania</option>
											<option value="RI">Rhode Island</option>
											<option value="SC">South Carolina</option>
											<option value="SD">South Dakota</option>
											<option value="TN">Tennessee</option>
											<option value="TX">Texas</option>
											<option value="UT">Utah</option>
											<option value="VT">Vermont</option>
											<option value="VA">Virginia</option>
											<option value="WA">Washington</option>
											<option value="WV">West Virginia</option>
											<option value="WI">Wisconsin</option>
											<option value="WY">Wyoming</option>
										</select>
									</div>
								</div>

								<div>
									<label className="block text-sm text-gray-600 mb-1">Postal/Zip Code</label>
									<input
										type="text"
										value={newClientData.postalCode}
										onChange={(e) => setNewClientData({ ...newClientData, postalCode: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
										placeholder="12345"
									/>
								</div>
							</div>

							{/* Gender */}
							<div className="space-y-4 pt-4 border-t">
								<div>
									<label className="block text-sm text-gray-600 mb-1">Gender</label>
									<select
										value={newClientData.gender}
										onChange={(e) => setNewClientData({ ...newClientData, gender: e.target.value })}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									>
										<option value="">Select Gender</option>
										<option value="female">Female</option>
										<option value="male">Male</option>
										<option value="non-binary">Non-binary</option>
										<option value="other">Other</option>
										<option value="prefer-not-to-say">Prefer not to say</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="border-t bg-gray-50 px-6 py-4">
						<div className="flex justify-between">
							<button
								onClick={() => setShowNewClientForm(false)}
								className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
							>
								Cancel
							</button>
							<button
								onClick={handleCreateClient}
								disabled={!newClientData.firstName || !newClientData.lastName}
								className={`px-6 py-2 rounded-md font-medium transition-colors ${newClientData.firstName && newClientData.lastName
									? 'bg-teal-500 text-white hover:bg-teal-600'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
									}`}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Appointment Form */}
			<div className="h-full flex flex-col">
				{/* Header */}
				<div className="px-6 py-4 border-b bg-gray-50">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">{existingAppointment ? 'Edit Appointment' : 'New Appointment'}</h2>
						<div className="flex items-center space-x-2">
							{activeTab === 'booking' && (
								<>
									<button 
										onClick={handleSave}
										disabled={isSaveDisabled}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isSaveDisabled
											? 'bg-gray-300 text-gray-500 cursor-not-allowed'
											: 'bg-teal-500 text-white hover:bg-teal-600'
										}`}
									>
										{existingAppointment ? 'Update Appointment' : 'Book Appointment'}
									</button>
									<button
										onClick={() => setShowRecurringModal(true)}
										disabled={!selectedClient || !selectedServiceState}
										className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
											!selectedClient || !selectedServiceState
												? 'bg-gray-100 text-gray-400 cursor-not-allowed'
												: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
										}`}
										title="Create recurring appointments"
									>
										<ChevronsRight className="h-4 w-4 mr-1" />
										Recurring Booking
									</button>
								</>
							)}
							<button
								onClick={onClose}
								className="p-1 hover:bg-gray-200 rounded-full transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
					</div>
				</div>

				{/* Tab Navigation */}
				<div className="flex border-b border-gray-200">
					<button
						onClick={() => setActiveTab('booking')}
						className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
							activeTab === 'booking'
								? 'text-purple-600 bg-purple-50'
								: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
						}`}
					>
						<div className="flex items-center justify-center">
							<Calendar className="h-4 w-4 mr-2" />
							Booking Details
						</div>
						{activeTab === 'booking' && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
						)}
					</button>
					{existingAppointment && (
						<button
							onClick={() => setActiveTab('history')}
							className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
								activeTab === 'history'
									? 'text-purple-600 bg-purple-50'
									: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
							}`}
						>
							<div className="flex items-center justify-center">
								<History className="h-4 w-4 mr-2" />
								History & Activity
							</div>
							{activeTab === 'history' && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
							)}
						</button>
					)}
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto">
					{activeTab === 'booking' ? (
						<div className="p-6 space-y-6">
						{/* Conflict Warning */}
						{conflicts.length > 0 && (
							<div className="bg-red-50 border border-red-200 rounded-md p-4">
								<div className="flex items-start">
									<AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
									<div>
										<h4 className="text-sm font-semibold text-red-800 mb-1">
											Scheduling Conflict
										</h4>
										<p className="text-sm text-red-700">
											{getConflictMessage(conflicts, selectedRoom || undefined)}
										</p>
										{conflicts.length === 1 && (
											<div className="mt-2 text-xs text-red-600">
												<span className="font-medium">{conflicts[0].serviceName}</span>
												{' • '}
												{moment(conflicts[0].startTime).format('h:mm A')} - {moment(conflicts[0].endTime).format('h:mm A')}
												{conflicts[0].roomId === selectedRoom && selectedRoom && (
													<span className="block mt-1">
														<MapPin className="h-3 w-3 inline mr-1" />
														{mockRooms.find(r => r.id === selectedRoom)?.name}
													</span>
												)}
											</div>
										)}
									</div>
								</div>
								
								{/* Only show this if there are actual conflicts - moved to combined override section below */}
							</div>
						)}

						{/* Booking Info Section */}
						<div>
							<h3 className="text-sm font-semibold text-gray-700 mb-4">Booking Info</h3>

							{/* Service Selection */}
							<div className="mb-4">
								<label className="text-sm text-gray-600 mb-2 block">
									Session
									{preSelectedService && (
										<span className="ml-2 text-xs text-purple-600 font-medium">
											(Pre-selected from slot finder)
										</span>
									)}
								</label>
								<div className="relative">
									<select
										value={selectedServiceState?.id || ''}
										onChange={(e) => {
											if (e.target.value === '') {
												setSelectedServiceState(null)
											} else {
												const service = services.find(s => s.id === e.target.value)
												if (service) setSelectedServiceState(service)
											}
										}}
										className={`w-full px-4 py-2 border rounded-md appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
											!selectedServiceState ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-300'
										}`}
									>
										<option value="">Choose a session...</option>
										{services.map(service => (
											<option key={service.id} value={service.id}>
												{service.name} ({service.duration} min) - ${service.price}
											</option>
										))}
									</select>
									<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
								</div>
								{!selectedServiceState && (
									<div className="mt-1 text-xs text-purple-600 font-medium">
										👆 Please select a session to continue
									</div>
								)}
								{services.length === 0 && (
									<div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
										⚠️ {practitioner.name} has no services configured. Please configure services in settings.
									</div>
								)}
								
								{/* Shift availability check */}
								{(() => {
									// Use getShiftForDate to check for shifts (includes template-generated shifts)
									const shiftData = getShiftForDate(practitioner.id, selectedDate)
									
									if (!shiftData) {
										return (
											<div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200">
												<div className="flex items-start text-xs text-red-700">
													<svg className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<div>
														<span className="font-medium">No shifts scheduled</span>
														<p className="mt-0.5">{practitioner.name} has no shifts on {moment(selectedDate).format('MMMM D, YYYY')}.</p>
														<p className="mt-1 text-red-600">Please create a shift first using the Shifts mode.</p>
													</div>
												</div>
											</div>
										)
									}
									
									// Tag restrictions display
									if (selectedServiceState?.tags && selectedServiceState.tags.length > 0) {
										// For now, assume shift has matching tags if shift exists
										// This would need to be expanded if we need to check actual shift tags
										const hasMatchingShift = shiftData !== null
										
										return (
											<div className={`mt-2 p-2 rounded-md border ${hasMatchingShift ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
												<div className="flex items-start text-xs">
													<svg className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<div className={hasMatchingShift ? 'text-green-700' : 'text-amber-700'}>
														<span className="font-medium">{selectedServiceState.name} requires special equipment:</span>
														<div className="mt-1 flex flex-wrap gap-1">
															{selectedServiceState.tags.map((tag, index) => (
																<span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-white">
																	<svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
																	</svg>
																	{tag}
																</span>
															))}
														</div>
														{hasMatchingShift ? (
															<p className="mt-1 text-green-600">✓ Equipment available at certain times</p>
														) : (
															<p className="mt-1 text-amber-600">⚠️ No shifts with required equipment on this date</p>
														)}
													</div>
												</div>
											</div>
										)
									}
									
									return null
								})()}
							</div>

							{/* Client Selection */}
							<div className="mb-4">
								<label className="text-sm text-gray-600 mb-2 block">Client</label>
								<div className="space-y-2">
									<div className="text-sm text-gray-500">Add Client</div>
									<div className="flex gap-2">
										<div className="flex-1 relative">
											<input
												type="text"
												placeholder="Search clients..."
												value={clientSearch}
												onChange={(e) => {
													setClientSearch(e.target.value)
													setShowClientDropdown(true)
												}}
												onFocus={() => setShowClientDropdown(true)}
												className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
											/>
											<Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

											{/* Clear button */}
											{clientSearch && (
												<button
													onClick={() => {
														setClientSearch('')
														setSelectedClient(null)
													}}
													className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
												>
													<X className="h-4 w-4" />
												</button>
											)}

											{/* Client Dropdown */}
											{showClientDropdown && clientSearch && (
												<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-10">
													{filteredClients.map(client => (
														<button
															key={client.id}
															onClick={() => {
																setSelectedClient(client)
																setClientSearch(client.name)
																setShowClientDropdown(false)
															}}
															className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
														>
															<div className="font-medium">{client.name}</div>
															<div className="text-sm text-gray-500">
																{client.phone} • {client.email}
															</div>
														</button>
													))}
													{filteredClients.length === 0 && (
														<div className="px-4 py-3 text-sm text-gray-500">
															No clients found
														</div>
													)}
												</div>
											)}
										</div>
										<button
											onClick={() => setShowNewClientForm(true)}
											className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm whitespace-nowrap"
										>
											New Client
										</button>
									</div>

									{/* Selected Client Display */}
									{selectedClient ? (
										<div className="flex items-center space-x-2 text-sm">
											<span className="font-medium">{selectedClient.name}</span>
											<span className="text-gray-400">•</span>
											<Check className="h-4 w-4 text-green-500" />
										</div>
									) : (
										<div className="text-sm text-gray-500 italic">No client selected...</div>
									)}
								</div>
							</div>

							{/* No Packages/Memberships */}
							<div className="mb-4">
								<label className="text-sm text-gray-600 mb-2 block">Packages & Memberships</label>
								<div className="text-sm text-gray-500 italic">No Packages/Memberships</div>
							</div>

							{/* Time Selection */}
							<div className="mb-4">
								<label className="text-sm text-gray-600 mb-2 block">Time</label>
								<div className="relative">
									<select
										className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
										value={`${selectedStartTime.hour}:${selectedStartTime.minute}`}
										onChange={(e) => {
											const [hour, minute] = e.target.value.split(':').map(Number)
											setSelectedStartTime({ hour, minute })
										}}
									>
										{/* Generate time slots for the entire day */}
										{(() => {
											// Show all times from 8 AM to 8 PM (location hours)
											// In the future, this should come from location settings
											const locationStartHour = 8
											const locationEndHour = 20 // 8 PM
											
											// Get all shifts data to check availability
											const allShifts = getAllShiftsForDate ? getAllShiftsForDate(practitioner.id, selectedDate) : []
											const singleShift = getShiftForDate(practitioner.id, selectedDate)
											
											// Helper function to check if a time is within any shift
											const isTimeWithinAnyShift = (timeInMinutes: number): boolean => {
												if (allShifts.length > 0) {
													return allShifts.some(shift => {
														const shiftStartMinutes = shift.startAt.getHours() * 60 + shift.startAt.getMinutes()
														const shiftEndMinutes = shift.endAt.getHours() * 60 + shift.endAt.getMinutes()
														return timeInMinutes >= shiftStartMinutes && timeInMinutes < shiftEndMinutes
													})
												} else if (singleShift) {
													const shiftStartMinutes = singleShift.startHour * 60 + singleShift.startMinute
													const shiftEndMinutes = singleShift.endHour * 60 + singleShift.endMinute
													return timeInMinutes >= shiftStartMinutes && timeInMinutes < shiftEndMinutes
												}
												return false
											}
											
											// Get the full practitioner data to check stagger settings
											const fullPractitioner = practitioners.find(p => p.id === practitioner.id)
											const staggerInterval = fullPractitioner?.staggerOnlineBooking || 15 // Default to 15 min if not set
											
											const slots = []
											
											// ALWAYS add the currently selected time as the first option
											// This ensures the clicked time is always available and selected
											if (selectedStartTime.hour >= locationStartHour && selectedStartTime.hour < locationEndHour) {
												const selectedMinutes = selectedStartTime.hour * 60 + selectedStartTime.minute
												const isWithinShift = isTimeWithinAnyShift(selectedMinutes)
												
												slots.push(
													<option key={`selected-${selectedStartTime.hour}:${selectedStartTime.minute}`} value={`${selectedStartTime.hour}:${selectedStartTime.minute}`}>
														{moment().hour(selectedStartTime.hour).minute(selectedStartTime.minute).format('h:mm A')}
														{!isWithinShift && ' (Outside shift hours)'}
														{' (Selected time)'}
													</option>
												)
											}
											
											// Now add all regular interval times
											for (let h = locationStartHour; h < locationEndHour; h++) {
												for (let m = 0; m < 60; m += staggerInterval) {
													// Check if this time is within any of the practitioner's shifts
													const timeInMinutes = h * 60 + m
													const isWithinShift = isTimeWithinAnyShift(timeInMinutes)
													
													slots.push(
														<option key={`${h}:${m}`} value={`${h}:${m}`}>
															{moment().hour(h).minute(m).format('h:mm A')}
															{!isWithinShift && ' (Outside shift hours)'}
														</option>
													)
												}
											}
											// Add the last hour end time (8:00 PM)
											if (staggerInterval === 60) {
												const endTimeInMinutes = locationEndHour * 60
												const isEndTimeWithinShift = isTimeWithinAnyShift(endTimeInMinutes)
												slots.push(
													<option key={`${locationEndHour}:0`} value={`${locationEndHour}:0`}>
														{moment().hour(locationEndHour).minute(0).format('h:mm A')}
														{!isEndTimeWithinShift && ' (Outside shift hours)'}
													</option>
												)
											}
											
											// Don't include duplicates and sort by time
											const uniqueSlots = slots.filter((slot, index, self) => 
												index === self.findIndex(s => s.key === slot.key)
											)
											
											return uniqueSlots.sort((a, b) => {
												const [aHour, aMin] = (a.key?.toString() || '0:0').replace('selected-', '').split(':').map(Number)
												const [bHour, bMin] = (b.key?.toString() || '0:0').replace('selected-', '').split(':').map(Number)
												return (aHour * 60 + aMin) - (bHour * 60 + bMin)
											})
										})()}
									</select>
									<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
								</div>
								<div className="mt-2 text-sm text-gray-600">
									{moment(selectedDate).format('ddd, MMM D, YYYY')} {formatTime(selectedStartTime)} - {formatTime(endTime)}
								</div>
								
								{/* Warning if time is outside shift hours */}
								{(() => {
									const shiftData = getShiftForDate(practitioner.id, selectedDate)
									if (!shiftData) {
										return (
											<div className="mt-2 p-2 bg-red-50 rounded-md border border-red-200">
												<div className="flex items-start text-xs text-red-700">
													<svg className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
													<div>
														<span className="font-medium">No shift on this date</span>
														<p className="mt-0.5">{practitioner.name} is not scheduled to work on this date.</p>
													</div>
												</div>
											</div>
										)
									}
									
									const selectedTimeMinutes = selectedStartTime.hour * 60 + selectedStartTime.minute
									const shiftStartMinutes = shiftData.startHour * 60 + shiftData.startMinute
									const shiftEndMinutes = shiftData.endHour * 60 + shiftData.endMinute
									
									if (selectedTimeMinutes < shiftStartMinutes || selectedTimeMinutes >= shiftEndMinutes) {
										const shiftStartTime = moment().hour(shiftData.startHour).minute(shiftData.startMinute).format('h:mm A')
										const shiftEndTime = moment().hour(shiftData.endHour).minute(shiftData.endMinute).format('h:mm A')
										return (
											<div className="mt-2 p-2 bg-amber-50 rounded-md border border-amber-200">
												<div className="flex items-start text-xs text-amber-700">
													<svg className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
													</svg>
													<div>
														<span className="font-medium">Outside shift hours</span>
														<p className="mt-0.5">{practitioner.name}'s shift: {shiftStartTime} - {shiftEndTime}</p>
														{overrideConflicts && <p className="mt-1 text-amber-600 font-medium">Administrative Override enabled</p>}
													</div>
												</div>
											</div>
										)
									}
									
									// Also check if end time extends beyond shift
									const endTimeMinutes = endTime.hour * 60 + endTime.minute
									if (endTimeMinutes > shiftEndMinutes) {
										const shiftEndTime = moment().hour(shiftData.endHour).minute(shiftData.endMinute).format('h:mm A')
										return (
											<div className="mt-2 p-2 bg-amber-50 rounded-md border border-amber-200">
												<div className="flex items-start text-xs text-amber-700">
													<svg className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
													</svg>
													<div>
														<span className="font-medium">Appointment extends beyond shift</span>
														<p className="mt-0.5">Shift ends at {shiftEndTime}</p>
														{overrideConflicts && <p className="mt-1 text-amber-600 font-medium">Administrative Override enabled</p>}
													</div>
												</div>
											</div>
										)
									}
									
									return null
								})()}
								
								{/* Stagger booking indicator */}
								{(() => {
									const fullPractitioner = practitioners.find(p => p.id === practitioner.id)
									if (fullPractitioner?.staggerOnlineBooking && fullPractitioner.staggerOnlineBooking > 0) {
										return (
											<div className="mt-2 p-2 bg-blue-50 rounded-md">
												<div className="flex items-center text-xs text-blue-700">
													<svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
													</svg>
													<span className="font-medium">Staggered booking enabled</span>
												</div>
												<p className="text-xs text-blue-600 mt-1 ml-4.5">
													Appointments can only be booked every {fullPractitioner.staggerOnlineBooking} minutes
												</p>
											</div>
										)
									}
									return null
								})()}
								
								{/* Optional Post-Treatment Time */}
								{selectedServiceState?.postTreatmentTime && (
									<div className="mt-2 p-2 bg-yellow-50 rounded">
										<label className="flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={enablePostTreatmentTime}
												onChange={(e) => setEnablePostTreatmentTime(e.target.checked)}
												className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
											/>
											<div className="text-sm">
												<span className="font-medium text-yellow-800">Add sanitization time</span>
												<span className="text-xs text-yellow-700 ml-1">
													(+{selectedServiceState.postTreatmentTime} min)
												</span>
											</div>
										</label>
									</div>
								)}

								{/* Shift warning if appointment extends beyond shift */}
								{shift && (() => {
									const shiftEndMinutes = shift.endHour * 60 + shift.endMinute
									const appointmentEndMinutes = endTime.hour * 60 + endTime.minute

									if (appointmentEndMinutes > shiftEndMinutes) {
										return (
											<div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
												⚠️ This appointment extends beyond {practitioner.name}'s shift
												({shift.endHour}:{shift.endMinute.toString().padStart(2, '0')})
											</div>
										)
									}
									return null
								})()}
							</div>

							{/* Staff Member */}
							<div className="mb-4">
								<label className="text-sm text-gray-600 mb-2 block">Staff Member</label>
								<div className="text-sm font-medium">{practitioner.name}</div>
							</div>

							{/* Room Selection */}
							<div className="mb-4">
								<label className="text-sm text-gray-600 mb-2 block">Room</label>
								<div className="relative">
									<select
										value={selectedRoom || ''}
										onChange={(e) => setSelectedRoom(e.target.value || null)}
										className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
									>
										<option value="">No Room Assigned</option>
										{mockRooms.filter(room => room.isActive).map(room => (
											<option key={room.id} value={room.id}>
												{room.name}
											</option>
										))}
									</select>
									<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
								</div>
								{shift?.room && shift.room !== selectedRoom && (
									<div className="mt-2 text-xs text-yellow-600 flex items-center">
										<AlertCircle className="h-3 w-3 mr-1" />
										{practitioner.name} is scheduled in {mockRooms.find(r => r.id === shift.room)?.name || 'another room'}
									</div>
								)}
							</div>

							{/* Resources */}
							<div className="mb-4">
								<label className="text-sm text-gray-600 mb-2 block">Resources</label>
								{selectedServiceState?.requiredResources && selectedServiceState.requiredResources.length > 0 ? (
									<div className="space-y-2">
										{(practitioner as any).staggerOnlineBooking && (practitioner as any).staggerOnlineBooking > 0 && (
											<div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
												<div className="flex items-start">
													<AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
													<div>
														<div className="font-medium">Stagger Booking Active</div>
														<div className="mt-0.5">
															{practitioner.name} can see multiple clients every {(practitioner as any).staggerOnlineBooking} minutes, 
															but each appointment still requires its own resources.
														</div>
													</div>
												</div>
											</div>
										)}
										{selectedServiceState.requiredResources.map((req, idx) => {
											const pool = mockResourcePools.find(p => p.id === req.resourcePoolId)
											const isAvailable = resourceAvailability.available
											
											return (
												<div key={idx} className={`text-sm p-2 rounded-md border ${
													isAvailable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
												}`}>
													<div className="flex items-center justify-between">
														<span className="font-medium">{pool?.name || 'Unknown Resource'}</span>
														{isAvailable ? (
															<span className="text-green-600 text-xs">Available</span>
														) : (
															<span className="text-red-600 text-xs">Not Available</span>
														)}
													</div>
													{isAvailable && resourceAvailability.resources.length > 0 && (
														<div className="mt-1 text-xs text-gray-600">
															Assigned: {resourceAvailability.resources
																.filter(r => r.resourcePoolId === req.resourcePoolId)
																.map(r => r.resourceName)
																.join(', ')}
														</div>
													)}
												</div>
											)
										})}
										{!resourceAvailability.available && resourceAvailability.conflicts && (
											<div className="mt-2 space-y-2">
												{resourceAvailability.conflicts.map((conflict, idx) => (
													<div key={idx} className="p-2 bg-red-50 rounded text-xs">
														<div className="font-medium text-red-800 mb-1">
															⚠️ {conflict.resourcePoolName}: Only {conflict.available} of {conflict.required} available
														</div>
														{conflict.conflicts.length > 0 && (
															<div className="text-red-700 space-y-1">
																{conflict.conflicts.map((c: any, cIdx: number) => (
																	<div key={cIdx} className="ml-2">
																		• {c.resourceName} is in use
																		{c.conflicts && c.conflicts.length > 0 && (
																			<div className="ml-3 text-red-600">
																				{c.conflicts.map((conf: any, confIdx: number) => (
																					<div key={confIdx}>
																						{moment(conf.startTime).format('h:mm A')} - {moment(conf.endTime).format('h:mm A')}
																					</div>
																				))}
																			</div>
																		)}
																	</div>
																))}
															</div>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								) : (
									<div className="text-sm text-gray-500 italic">No resources required</div>
								)}
							</div>

							{/* Override Options */}
							{(hasCapabilityMismatch || 
							  conflicts.length > 0 || 
							  (selectedServiceState?.requiredResources && selectedServiceState.requiredResources.length > 0 && !resourceAvailability.available)) && (
								<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
									<label className="flex items-start cursor-pointer">
										<input
											type="checkbox"
											checked={overrideConflicts}
											onChange={(e) => setOverrideConflicts(e.target.checked)}
											className="mt-0.5 mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
										/>
										<div className="text-sm">
											<span className="font-medium text-yellow-800">Administrative Override</span>
											<div className="text-xs text-yellow-700 mt-1">
												Override the following restrictions:
												<ul className="mt-1 space-y-0.5 ml-2">
													{hasCapabilityMismatch && (
														<li>• Capability/equipment requirements</li>
													)}
													{conflicts.length > 0 && (
														<li>• Scheduling conflicts</li>
													)}
													{selectedServiceState?.requiredResources && selectedServiceState.requiredResources.length > 0 && !resourceAvailability.available && (
														<li>• Resource availability</li>
													)}
												</ul>
											</div>
										</div>
									</label>
								</div>
							)}

							{/* Notes */}
							<div>
								<label className="text-sm text-gray-600 mb-2 block">Notes</label>
								<textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Add notes..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
									rows={4}
								/>
							</div>
						</div>
						</div>
					) : (
						<AppointmentHistory
							appointmentId={existingAppointment?.id || ''}
							onEventClick={(event) => {
								console.log('Event clicked:', event)
								// Handle event click - could open details modal, etc.
							}}
						/>
					)}
				</div>

				{/* Footer - Only show for booking tab */}
				{activeTab === 'booking' && (
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
								disabled={isSaveDisabled}
								className={`px-6 py-2 rounded-md font-medium transition-colors ${isSaveDisabled
										? 'bg-gray-300 text-gray-500 cursor-not-allowed'
										: overrideConflicts && (conflicts.length > 0 || !resourceAvailability.available)
											? 'bg-yellow-600 text-white hover:bg-yellow-700'
											: 'bg-teal-500 text-white hover:bg-teal-600'
									}`}
								title={conflicts.length > 0 && !overrideConflicts ? 'Cannot book due to scheduling conflict' : ''}
							>
								{overrideConflicts && (conflicts.length > 0 || !resourceAvailability.available) 
									? existingAppointment ? 'Update with Override' : 'Book with Override' 
									: existingAppointment ? 'Update Appointment' : 'Book Appointment'}
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Recurring Appointment Modal */}
			{selectedClient && selectedServiceState && (
				<RecurringAppointmentModal
					isOpen={showRecurringModal}
					onClose={() => setShowRecurringModal(false)}
					practitioner={practitioner}
					client={selectedClient}
					service={selectedServiceState}
					selectedDate={selectedDate}
					startTime={selectedStartTime}
					selectedRoom={selectedRoom}
					enablePostTreatmentTime={enablePostTreatmentTime}
					getShiftForDate={getShiftForDate}
					existingAppointments={existingAppointments}
					onSave={(appointments) => {
						// Save each appointment
						appointments.forEach(appointmentData => {
							onSave(appointmentData)
						})
						// Reset form and close
						setSelectedClient(null)
						setClientSearch('')
						setNotes('')
						setShowRecurringModal(false)
						onClose()
					}}
				/>
			)}
		</div>
	)
}
