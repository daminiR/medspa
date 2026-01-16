'use client'

import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import moment from 'moment'
import { Clock, Move, ChevronLeft, ChevronRight, Calendar, MapPin, FileText, AlertTriangle } from 'lucide-react'
import { CalendarViewProps, CalendarViewType } from '@/types/calendar'
import { useCalendarState } from '@/hooks/useCalendarState'
import { getWeekDates, getTimeSlotHeight, mergeSlotsIntoContinuousBlocks } from '@/utils/calendarHelpers'
import { practitioners, appointments as initialAppointments, Break, Appointment, locations, AVAILABLE_TAGS, services } from '@/lib/data'
import { mockRooms } from '@/lib/mockResources'
import CalendarHeader from './CalendarHeader'
import CalendarToolbar from './CalendarToolbar'
import StatusLegend from './StatusLegend'
import CalendarGrid from './CalendarGrid'
import TimeColumn from './TimeColumn'
import AppointmentDetailView from '../appointments/AppointmentDetailView'
import AppointmentDetails from '../appointments/AppointmentDetails'
import AppointmentSidebar from '../appointments/AppointmentSidebar'
import BreakDetails from '../appointments/BreakDetails'
import GoToDateModal from './GoToDateModal'
import CalendarSettingsModal from './CalendarSettingsModal'
import WaitlistPanel from './WaitlistPanel'
import { mockWaitlistPatients, WaitlistPatient } from '@/lib/data/waitlist'
import AutoFillNotification from './AutoFillNotification'
import { createAutoFillSuggestion, AutoFillSuggestion } from '@/utils/waitlistAutoFill'
import ShiftEditPanel from '../shifts/ShiftEditPanel'
import ShiftDeleteModal from '../shifts/ShiftDeleteModal'
import ManageShiftsModalV2 from '../shifts/ManageShiftsModalV2'
import ResourcesPanel from './ResourcesPanel'
import RoomsPanel from './RoomsPanel'
import { findAvailableSlots } from '@/utils/slotFinder'
import type { Note } from '@/lib/data'
import { patients } from '@/lib/data'
import { hasConflicts, getConflictMessage, findAppointmentConflicts, findBreakConflicts, getBreakConflictMessage } from '@/utils/appointmentConflicts'
import { Shift, ShiftFormData } from '@/types/shifts'
import { generateShiftsFromForm } from '@/utils/shiftHelpers'
import PractitionerEditModal from '../practitioners/PractitionerEditModal'
import ExpressBookingModal from '../appointments/ExpressBookingModal'
import GroupBookingModal from '../appointments/GroupBookingModal'
import GroupBookingDetails from '../appointments/GroupBookingDetails'
import GroupsPanel from './GroupsPanel'
import MonthView from './MonthView'
import WalkInModal from '../appointments/WalkInModal'
import { exportData, columnPresets, formatters, ExportColumn } from '@/lib/export'

export default function CalendarView({
	selectedPractitionerIds,
	viewMode = 'all',
	singlePractitionerId,
	onShowAll,
	onUpdateSelectedPractitioners,
	selectedServiceFromSidebar,
	onClearServiceSelection,
	createMode: externalCreateMode,
	onCreateModeChange: externalSetCreateMode,
	breakType: externalBreakType,
	onBreakTypeChange: externalSetBreakType
}: CalendarViewProps) {
	// For demo purposes, using August 17, 2023 as "today"
	const TODAY = new Date() // Current date

	// Use our custom hook for state management
	const {
		selectedDate,
		setSelectedDate,
		view,
		setView,
		createMode: internalCreateMode,
		setCreateMode: internalSetCreateMode,
		pendingBreakType,
		setPendingBreakType,
		selectedAppointment,
		setSelectedAppointment,
		selectedBreak,
		setSelectedBreak,
		showAppointmentSidebar,
		setShowAppointmentSidebar,
		newAppointmentData,
		setNewAppointmentData,
		showGoToDate,
		setShowGoToDate,
		showSettings,
		setShowSettings,
		showWaitlist,
		setShowWaitlist,
		showShiftsOnly,
		setShowShiftsOnly,
		waitlistCount,
		setWaitlistCount,
		isDragging,
		setIsDragging,
		dragStart,
		setDragStart,
		dragEnd,
		setDragEnd,
		isDraggingWaitlistPatient,
		setIsDraggingWaitlistPatient,
		toast,
		showToast,
		calendarSettings,
		setCalendarSettings,
		doubleBookingMode,
		setDoubleBookingMode,
		handleNavigate,
		clearSelections
	} = useCalendarState(TODAY)

	const calendarRef = useRef<HTMLDivElement>(null)
	
	// Use external createMode if provided, otherwise use internal
	const createMode = externalCreateMode ?? internalCreateMode
	const setCreateMode = externalSetCreateMode ?? internalSetCreateMode

	// Use external breakType if provided, otherwise use internal
	// Also sync internal state when external changes
	const breakType = externalBreakType ?? pendingBreakType
	const setBreakType = (type: typeof pendingBreakType) => {
		setPendingBreakType(type)
		externalSetBreakType?.(type)
	}

	// Shift-specific state
	const [shiftMode, setShiftMode] = useState(false)
	const [showShiftPanel, setShowShiftPanel] = useState(false)

	// Double-Booking Mode State (Override Mode)
	// Allows booking conflicting appointments when enabled
	const [showOverrideDialog, setShowOverrideDialog] = useState(false)
	const [modeTimeoutId, setModeTimeoutId] = useState<NodeJS.Timeout | null>(null)
	const [modeWarningTimeoutId, setModeWarningTimeoutId] = useState<NodeJS.Timeout | null>(null)
	const lastInteractionRef = useRef<number>(Date.now())

	// Express Booking state
	const [showExpressBooking, setShowExpressBooking] = useState(false)
	const [expressBookingPractitioner, setExpressBookingPractitioner] = useState<typeof practitioners[0] | null>(null)
	const [expressBookingTime, setExpressBookingTime] = useState({ hour: 9, minute: 0 })

	// Group Booking state
	const [showGroupBooking, setShowGroupBooking] = useState(false)

	// Walk-In state
	const [showWalkInModal, setShowWalkInModal] = useState(false)

	// Recurring shift templates - synced with practitioner schedules from data.ts
	const [shiftTemplates] = useState([
		// Jo-Ellen McKay (ID '1') - Monday to Friday, 8:00-17:00
		{
			id: 'template-joellen-weekdays',
			practitionerId: '1',
			daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
			startHour: 8,
			startMinute: 0,
			endHour: 17,
			endMinute: 0,
			room: 'Treatment Room 1',
			tags: [],
			isActive: true
		},
		// D.O. Demo Owner (ID '2') - Monday to Saturday, 9:00-18:00
		{
			id: 'template-demo-owner',
			practitionerId: '2',
			daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon-Sat
			startHour: 9,
			startMinute: 0,
			endHour: 18,
			endMinute: 0,
			room: 'Treatment Room 2',
			tags: [],
			isActive: true
		},
		// Dr. Marcus Gregory (ID '3') - Monday to Friday, 8:30-16:30
		{
			id: 'template-marcus-weekdays',
			practitionerId: '3',
			daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
			startHour: 8,
			startMinute: 30,
			endHour: 16,
			endMinute: 30,
			room: 'Suite 1',
			tags: [],
			isActive: true
		},
		// Susan Lo (ID '4') - Tuesday to Saturday, 10:00-19:00
		{
			id: 'template-susan-aesthetic',
			practitionerId: '4',
			daysOfWeek: [2, 3, 4, 5, 6], // Tue-Sat
			startHour: 10,
			startMinute: 0,
			endHour: 19,
			endMinute: 0,
			room: 'Aesthetics Suite',
			availableEquipment: [
				'injection-station',
				'numbing-system',
				'CO2-laser',
				'IPL-machine',
				'sterilization-unit'
			],
			tags: [],
			isActive: true
		}
	])

	// Initialize with empty shifts, clearing any problematic manual shifts
	const [shifts, setShifts] = useState<Shift[]>(() => {
		// Clear any manual shifts for Susan Lo (practitioner ID '4') on initialization
		// This is a temporary fix to resolve the issue where invalid manual shifts block templates
		return []
	})
	const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
	const [previousShowShiftsOnly, setPreviousShowShiftsOnly] = useState(false)
	const [shiftDragData, setShiftDragData] = useState<{
		practitionerId: string
		startTime: { hour: number; minute: number }
		endTime: { hour: number; minute: number }
		date: Date
	} | null>(null)
	const [showShiftDeleteModal, setShowShiftDeleteModal] = useState(false)
	const [shiftToDelete, setShiftToDelete] = useState<{ shift: Shift; deleteAll: boolean } | null>(null)
	const [showManageShifts, setShowManageShifts] = useState(false)

	// Move appointment state
	const [moveMode, setMoveMode] = useState(false)
	const [movingAppointment, setMovingAppointment] = useState<Appointment | null>(null)
	const [selectedLocationId, setSelectedLocationId] = useState<string>('loc-1') // Default to first location
	const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | null>(null) // Service filter

	// Copy/paste state
	const [copiedAppointment, setCopiedAppointment] = useState<Appointment | null>(null)
	
	// Drag and drop state
	const [isDraggingAppointment, setIsDraggingAppointment] = useState(false)
	const [draggingAppointment, setDraggingAppointment] = useState<Appointment | null>(null)

	// Appointment preview state - persists while sidebar is open, updates with service changes
	const [appointmentPreview, setAppointmentPreview] = useState<{
		practitionerId: string
		startTime: { hour: number; minute: number }
		duration: number // in minutes
		date: Date
	} | null>(null)

	// Resource state
	const [showResources, setShowResources] = useState(false)
	const [showRoomsPanel, setShowRoomsPanel] = useState(false)
	const [showGroupsPanel, setShowGroupsPanel] = useState(false)

	// Auto-fill suggestion for waitlist
	const [autoFillSuggestion, setAutoFillSuggestion] = useState<AutoFillSuggestion | null>(null)

	// Calendar view type (practitioners vs rooms)
	const [calendarViewType, setCalendarViewType] = useState<CalendarViewType>('practitioners')

	// Local state for appointments and breaks - update some to current week for demo
	const [appointmentsState, setAppointments] = useState<Appointment[]>(() => {
		const updatedAppointments = [...initialAppointments]
		const today = new Date()
		
		// Update first few appointments to this week so we can see them
		if (updatedAppointments.length > 0) {
			// Today - Dr. Sarah Johnson
			updatedAppointments[0] = {
				...updatedAppointments[0],
				startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
				endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30)
			}
			
			// Today - Dr. Marcus Gregory  
			if (updatedAppointments[1]) {
				updatedAppointments[1] = {
					...updatedAppointments[1],
					startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0),
					endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30)
				}
			}
			
			// Tomorrow - Susan Lo
			if (updatedAppointments[2]) {
				const tomorrow = new Date(today)
				tomorrow.setDate(tomorrow.getDate() + 1)
				updatedAppointments[2] = {
					...updatedAppointments[2],
					startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0),
					endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 45)
				}
			}
		}
		
		return updatedAppointments
	})
	const [patientNotes, setPatientNotes] = useState<Record<string, Note[]>>({})
	
	// Practitioner edit modal state
	const [showPractitionerEdit, setShowPractitionerEdit] = useState(false)
	const [editingPractitioner, setEditingPractitioner] = useState<any>(null)
	
	const [breaks, setBreaks] = useState<Break[]>([
		// Sample break data
		{
			id: 'break-1',
			practitionerId: '1',
			practitionerName: 'Dr. Sarah Johnson',
			type: 'lunch',
			startTime: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 12, 0),
			endTime: new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 13, 0),
			duration: 60,
			isRecurring: true,
			recurringDays: [1, 2, 3, 4, 5], // Mon-Fri
			availableForEmergencies: true,
			notes: 'Usually at the cafe downstairs'
		}
	])

	// Slot finder state - now controlled by sidebar
	const [highlightedSlots, setHighlightedSlots] = useState<any[]>([])
	const [continuousSlotBlocks, setContinuousSlotBlocks] = useState<any[]>([])

	// Calculate week dates
	const weekDates = useMemo(() => getWeekDates(selectedDate, calendarSettings.showWeekends), [selectedDate, calendarSettings.showWeekends])

	// Calculate time slot height
	const timeSlotHeight = getTimeSlotHeight(calendarSettings.timeSlotHeight)

	const visiblePractitioners = useMemo(() => {
		if (!practitioners || !selectedPractitionerIds) return []
		return practitioners.filter(p => selectedPractitionerIds.includes(p.id))
	}, [selectedPractitionerIds])

	// Get visible entities based on calendar view type
	const visibleEntities = useMemo(() => {
		if (calendarViewType === 'rooms') {
			// In room view, show active rooms
			return mockRooms.filter(room => room.isActive).map(room => ({
				id: room.id,
				name: room.name,
				type: 'room' as const
			}))
		} else {
			// In practitioner view, show selected practitioners
			return visiblePractitioners.map(p => ({
				id: p.id,
				name: p.name,
				type: 'practitioner' as const
			}))
		}
	}, [calendarViewType, visiblePractitioners])

	// Unified function to get all shifts for a practitioner on a specific date
	const getAllShiftsForDate = useCallback((practitionerId: string, date: Date): Shift[] => {
		const dayOfWeek = date.getDay()
		const dateString = moment(date).format('YYYY-MM-DD')
		

		// Get new format shifts for this date
		const newShifts = shifts.filter(shift =>
			shift.practitionerId === practitionerId &&
			moment(shift.startAt).format('YYYY-MM-DD') === dateString
		)

		// Check if we have VALID manual shifts (not empty or placeholder shifts)
		const validManualShifts = newShifts.filter(shift => 
			shift.startAt && shift.endAt && 
			shift.startAt < shift.endAt &&
			shift.bookingOptions !== 'not-bookable' // Exclude non-bookable shifts
		)
		
		// If we have valid manual shifts for this day, use only those (override templates)
		if (validManualShifts.length > 0) {
			return validManualShifts
		}

		// No manual shifts found, proceed to templates

		// Generate shifts from recurring templates
		const applicableTemplates = shiftTemplates.filter(template =>
			template.practitionerId === practitionerId &&
			template.isActive &&
			template.daysOfWeek.includes(dayOfWeek)
		)
		
		
		const generateShiftFromTemplate = (template: any, date: Date): Shift => {
			const startAt = new Date(date)
			startAt.setHours(template.startHour, template.startMinute, 0, 0)
			
			const endAt = new Date(date)
			endAt.setHours(template.endHour, template.endMinute, 0, 0)
			
			return {
				id: `${template.id}-${moment(date).format('YYYY-MM-DD')}`,
				practitionerId: template.practitionerId,
				startAt,
				endAt,
				repeat: 'weekly' as const,
				room: template.room,
				bookingOptions: 'bookable' as const,
				availableEquipment: template.availableEquipment || [],
				tags: template.tags || [],
				createdBy: 'System',
				createdAt: new Date()
			}
		}
		
		const generatedShifts = applicableTemplates.map(template => generateShiftFromTemplate(template, date))
		
		return generatedShifts
	}, [shifts, shiftTemplates])

	// Updated getShiftForDate to return new format shift
	const getShiftForDate = useCallback((practitionerId: string, date: Date): any => {
		const shiftsForDate = getAllShiftsForDate(practitionerId, date)
		const shift = shiftsForDate[0]
		if (!shift) return null
		
		// Return the shift data in the format expected by AppointmentSidebar
		return {
			startHour: shift.startAt.getHours(),
			startMinute: shift.startAt.getMinutes(),
			endHour: shift.endAt.getHours(),
			endMinute: shift.endAt.getMinutes(),
			room: shift.room,
			startAt: shift.startAt,
			endAt: shift.endAt
		}
	}, [getAllShiftsForDate])

	// Handle Staff Today button
	const handleStaffToday = () => {
		setSelectedDate(TODAY)

		// Get practitioners working today
		const workingTodayIds = practitioners
			.filter(p => {
				const shifts = getAllShiftsForDate(p.id, TODAY)
				return shifts.length > 0
			})
			.map(p => p.id)

		if (onUpdateSelectedPractitioners && workingTodayIds.length > 0) {
			onUpdateSelectedPractitioners(workingTodayIds)
		}

		if (viewMode === 'single' && onShowAll) {
			onShowAll()
		}
	}

	// Count of working staff today
	const workingTodayCount = practitioners.filter(p => getAllShiftsForDate(p.id, TODAY).length > 0).length

	// Check if showing staff today
	const isShowingStaffToday = useMemo(() => {
		const isViewingToday = moment(selectedDate).isSame(TODAY, 'day')
		if (!isViewingToday) return false

		const workingTodayIds = practitioners
			.filter(p => getAllShiftsForDate(p.id, TODAY).length > 0)
			.map(p => p.id)
			.sort()

		const currentIds = [...(selectedPractitionerIds || [])].sort()

		return workingTodayIds.length === currentIds.length &&
			workingTodayIds.every((id, index) => id === currentIds[index])
	}, [selectedPractitionerIds, selectedDate, getAllShiftsForDate])

	const handleShiftAction = (action: 'edit' | 'manage') => {
		if (action === 'edit') {
			// Save current show/hide state before entering shift mode
			setPreviousShowShiftsOnly(showShiftsOnly)
			// Always show shifts only in edit mode
			setShowShiftsOnly(true)
			setShiftMode(true)
			clearSelections()

			// Immediately open the shift panel with defaults
			const defaultPractitioner = singlePractitionerId
				? visiblePractitioners.find(p => p.id === singlePractitionerId)
				: visiblePractitioners[0]

			if (defaultPractitioner) {
				setShiftDragData({
					practitionerId: defaultPractitioner.id,
					startTime: { hour: 9, minute: 0 },
					endTime: { hour: 17, minute: 0 },
					date: selectedDate
				})
				setShowShiftPanel(true)
			}

			// Show helpful toast
			showToast('💡 Tip: You can also click and drag on the calendar to create shifts')
		} else {
			// Handle manage shifts
			// Save current show/hide state before entering manage mode
			setPreviousShowShiftsOnly(showShiftsOnly)
			// Always show shifts only in manage mode
			setShowShiftsOnly(true)
			setShowManageShifts(true)
		}
	}

	// Handle applying shifts from ManageShiftsModal
	const handleApplyShifts = (data: any) => {
		const { schedule, startDate, endDate, location, selectedStaff } = data
		
		// Calculate all dates in range
		const start = moment(startDate)
		const end = moment(endDate)
		const newShifts: Shift[] = []
		
		// Generate shifts for each week in the range
		let currentWeek = start.clone().startOf('week')
		
		while (currentWeek.isSameOrBefore(end)) {
			// For each day of the week
			Object.entries(schedule).forEach(([dayName, dayData]: [string, any]) => {
				if (!dayData.enabled || dayData.timeSlots.length === 0) return
				
				// Get the date for this day in the current week
				const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(dayName)
				const shiftDate = currentWeek.clone().day(dayIndex)
				
				// Skip if date is outside our range
				if (shiftDate.isBefore(start, 'day') || shiftDate.isAfter(end, 'day')) return
				
				// Create shifts for each selected staff member
				selectedStaff.forEach((practitionerId: string) => {
					// Create shifts for each time slot
					dayData.timeSlots.forEach((slot: any) => {
						const shiftStartAt = shiftDate.clone()
						const [startHour, startMinute] = moment(slot.startTime, 'h:mm A').format('HH:mm').split(':')
						shiftStartAt.hours(parseInt(startHour)).minutes(parseInt(startMinute)).seconds(0)
						
						const shiftEndAt = shiftDate.clone()
						const [endHour, endMinute] = moment(slot.endTime, 'h:mm A').format('HH:mm').split(':')
						shiftEndAt.hours(parseInt(endHour)).minutes(parseInt(endMinute)).seconds(0)
						
						const newShift: Shift = {
							id: `shift-${Date.now()}-${Math.random()}`,
							practitionerId,
							startAt: shiftStartAt.toDate(),
							endAt: shiftEndAt.toDate(),
							room: location,
							bookingOptions: slot.bookingOption === 'bookable' ? 'bookable' :
										   slot.bookingOption === 'contact-to-book' ? 'contact-to-book' : 'not-bookable',
							repeat: 'no-repeat',
							createdBy: 'Current User', // In a real app, this would come from auth context
							createdAt: new Date()
						}
						
						newShifts.push(newShift)
					})
				})
			})
			
			// Move to next week
			currentWeek.add(1, 'week')
		}
		
		// Remove existing shifts in the date range for selected practitioners
		setShifts(prevShifts => {
			const filteredShifts = prevShifts.filter(shift => {
				const shiftDate = moment(shift.startAt)
				const isInDateRange = shiftDate.isSameOrAfter(start, 'day') && shiftDate.isSameOrBefore(end, 'day')
				const isSelectedPractitioner = selectedStaff.includes(shift.practitionerId)
				
				// Keep shift if it's outside date range OR not for selected practitioners
				return !(isInDateRange && isSelectedPractitioner)
			})
			
			return [...filteredShifts, ...newShifts]
		})
		
		showToast(`✓ ${newShifts.length} shifts created successfully`)
		setShowManageShifts(false)
	}

	// Handle shift save
	const handleShiftSave = (formData: ShiftFormData) => {
		const dateString = moment(formData.date).format('YYYY-MM-DD')
		
		if (selectedShift) {
			// Editing existing shift - update only the selected shift
			const updatedShift: Shift = {
				...selectedShift,
				practitionerId: formData.practitionerId,
				startAt: new Date(formData.date),
				endAt: new Date(formData.date),
				room: formData.room,
				bookingOptions: formData.bookingOptions,
				notes: formData.notes,
				repeat: formData.repeat,
				repeatUntil: formData.repeatUntil,
				updatedBy: 'Current User', // In a real app, this would come from auth context
				updatedAt: new Date()
			}
			
			// Set the correct times
			updatedShift.startAt.setHours(formData.startTime.hour, formData.startTime.minute, 0, 0)
			updatedShift.endAt.setHours(formData.endTime.hour, formData.endTime.minute, 0, 0)
			
			// Update the shift in state
			setShifts(prevShifts =>
				prevShifts.map(s => s.id === selectedShift.id ? updatedShift : s)
			)
			
			showToast(`✓ Shift updated successfully`)
		} else {
			// Creating new shift - first remove any overlapping shifts for this practitioner
			setShifts(prevShifts => {
				// Helper function to check if two shifts overlap
				const shiftsOverlap = (shift1: Shift, shift2: Shift) => {
					const start1 = moment(shift1.startAt)
					const end1 = moment(shift1.endAt)
					const start2 = moment(shift2.startAt)
					const end2 = moment(shift2.endAt)
					
					// Check if shifts are on the same date and time ranges overlap
					if (!start1.isSame(start2, 'day')) return false
					
					return (start1.isBefore(end2) && end1.isAfter(start2))
				}
				
				// Generate the new shifts first to check for overlaps
				const newShifts = generateShiftsFromForm(formData)
				
				// Remove existing shifts that overlap with any of the new shifts
				const filteredShifts = prevShifts.filter(existingShift => {
					// Skip if different practitioner
					if (existingShift.practitionerId !== formData.practitionerId) return true
					
					// Check if this existing shift overlaps with any new shift
					const overlapsWithNew = newShifts.some(newShift => 
						shiftsOverlap(existingShift, newShift)
					)
					
					// Keep the shift only if it doesn't overlap
					return !overlapsWithNew
				})
				
				return [...filteredShifts, ...newShifts]
			})
			
			showToast(`✓ Shift created successfully`)
		}

		setShowShiftPanel(false)
		setSelectedShift(null)
		setShiftDragData(null)
	}

	// Handle shift delete
	const handleShiftDelete = (shiftId: string, deleteAll: boolean) => {
		const shift = shifts.find(s => s.id === shiftId)
		if (!shift) return

		if (deleteAll && shift.seriesId) {
			// Delete all shifts in series
			setShifts(prevShifts => prevShifts.filter(s => s.seriesId !== shift.seriesId))
			showToast('✓ All shifts in series deleted')
		} else {
			// Delete single shift
			setShifts(prevShifts => prevShifts.filter(s => s.id !== shiftId))
			showToast('✓ Shift deleted')
		}

		setShowShiftPanel(false)
		setSelectedShift(null)
		setShowShiftDeleteModal(false)
		setShiftToDelete(null)
	}

	useEffect(() => {
		// In a real app, this would fetch from API
		// For now, initialize with mock data
		const notesMap: Record<string, Note[]> = {}

		// Example: Add some mock patient-level notes
		notesMap['p1'] = [
			{
				id: 'patient-note-1',
				content: 'Always arrives 10 minutes late',
				authorId: 'staff-1',
				authorName: 'Admin Staff',
				createdAt: new Date(2023, 7, 1),
				isImportant: true,
				appointmentId: undefined
			}
		]

		setPatientNotes(notesMap)
	}, [])

	const handleNotesUpdate = (appointmentId: string, notes: Note[]) => {
		// Update appointment notes
		setAppointments(prevAppointments =>
			prevAppointments.map(apt =>
				apt.id === appointmentId
					? { ...apt, notesList: notes }
					: apt
			)
		)

		// If there's a selected appointment, update it too
		if (selectedAppointment && selectedAppointment.id === appointmentId) {
			setSelectedAppointment({ ...selectedAppointment, notesList: notes })
		}

		// Update patient notes for important ones
		const appointment = appointmentsState.find(apt => apt.id === appointmentId)
		if (appointment) {
			const importantNotes = notes.filter(note => note.isImportant)
			setPatientNotes(prev => ({
				...prev,
				[appointment.patientId]: [
					...(prev[appointment.patientId] || []).filter(n => n.appointmentId !== appointmentId),
					...importantNotes
				]
			}))
		}
	}

	// Update highlighted slots when service is selected from sidebar
	useEffect(() => {
		if (selectedServiceFromSidebar) {
			const { practitionerId, service } = selectedServiceFromSidebar
			const datesToCheck = view === 'week' ? weekDates : [selectedDate]
			// Find the practitioner object
			const practitioner = practitioners.find(p => p.id === practitionerId)
			if (!practitioner) return
			
			const slots = findAvailableSlots(
				service,
				practitioner,
				datesToCheck,
				appointmentsState,
				breaks,
				shifts
			)
			setHighlightedSlots(slots)

			// Create continuous blocks for better visualization
			const blocks = mergeSlotsIntoContinuousBlocks(slots)
			setContinuousSlotBlocks(blocks)
		} else {
			setHighlightedSlots([])
			setContinuousSlotBlocks([])
		}
	}, [selectedServiceFromSidebar, view, selectedDate, appointmentsState, breaks])

	// Handle appointment status change
	const handleAppointmentStatusChange = (appointmentId: string, status: 'arrived' | 'no_show' | 'scheduled' | 'cancelled', cancellationReason?: string) => {
		setAppointments(prevAppointments =>
			prevAppointments.map(apt =>
				apt.id === appointmentId
					? { 
						...apt, 
						status: status,
						...(status === 'cancelled' && {
							cancellationReason,
							cancelledAt: new Date(),
							cancelledBy: 'Current User' // In real app, get from auth
						})
					}
					: apt
			)
		)
		if (selectedAppointment && selectedAppointment.id === appointmentId) {
			setSelectedAppointment({ 
				...selectedAppointment, 
				status: status,
				...(status === 'cancelled' && {
					cancellationReason,
					cancelledAt: new Date(),
					cancelledBy: 'Current User'
				})
			})
		}
		showToast(
			status === 'arrived' ? '✓ Patient marked as arrived' :
			status === 'no_show' ? '✗ Marked as no-show' :
			status === 'cancelled' ? '✗ Appointment cancelled' :
			'↺ Status reset'
		)

		// Auto-fill: Check for waitlist matches when appointment is cancelled
		if (status === 'cancelled') {
			const cancelledAppointment = appointmentsState.find(apt => apt.id === appointmentId)
			if (cancelledAppointment) {
				const suggestion = createAutoFillSuggestion(cancelledAppointment, mockWaitlistPatients)
				if (suggestion.topMatch) {
					// Delay showing notification so cancellation toast shows first
					setTimeout(() => {
						setAutoFillSuggestion(suggestion)
					}, 500)
				}
			}
		}
	}

	// Handle appointment uncancellation
	const handleAppointmentUncancel = (appointmentId: string) => {
		setAppointments(prevAppointments =>
			prevAppointments.map(apt =>
				apt.id === appointmentId
					? { 
						...apt, 
						status: 'scheduled',
						cancellationReason: undefined,
						cancelledAt: undefined,
						cancelledBy: undefined
					}
					: apt
			)
		)
		if (selectedAppointment && selectedAppointment.id === appointmentId) {
			setSelectedAppointment({ 
				...selectedAppointment, 
				status: 'scheduled',
				cancellationReason: undefined,
				cancelledAt: undefined,
				cancelledBy: undefined
			})
		}
		showToast('↺ Appointment restored successfully')
	}

	// Handle appointment cancellation with reason
	const handleAppointmentCancel = (appointmentId: string, reason: string) => {
		handleAppointmentStatusChange(appointmentId, 'cancelled', reason)
	}

	// Handle appointment delete (without notification)
	const handleAppointmentDelete = (appointmentId: string) => {
		setAppointments(prevAppointments =>
			prevAppointments.map(apt =>
				apt.id === appointmentId
					? { ...apt, status: 'deleted' as const, deletedAt: new Date() }
					: apt
			)
		)
		showToast('✓ Appointment deleted')
		setSelectedAppointment(null)
	}

	// Handle bulk delete of appointments
	const handleBulkDelete = (appointmentIds: string[]) => {
		setAppointments(prevAppointments =>
			prevAppointments.map(apt =>
				appointmentIds.includes(apt.id)
					? { ...apt, status: 'deleted' as const, deletedAt: new Date() }
					: apt
			)
		)
		showToast(`✓ ${appointmentIds.length} appointments deleted`)
		setSelectedAppointment(null)
	}

	// Handle appointment update (duration, service name, etc)
	const handleAppointmentUpdate = (appointmentId: string, updates: { serviceName?: string; duration?: number; endTime?: Date }) => {
		setAppointments(prevAppointments =>
			prevAppointments.map(apt =>
				apt.id === appointmentId
					? { 
						...apt, 
						serviceName: updates.serviceName || apt.serviceName,
						duration: updates.duration || apt.duration,
						endTime: updates.endTime || apt.endTime
					}
					: apt
			)
		)
		
		// Update the selected appointment if it's the one being updated
		if (selectedAppointment && selectedAppointment.id === appointmentId) {
			setSelectedAppointment({
				...selectedAppointment,
				serviceName: updates.serviceName || selectedAppointment.serviceName,
				duration: updates.duration || selectedAppointment.duration,
				endTime: updates.endTime || selectedAppointment.endTime
			})
		}
		
		showToast('✓ Appointment updated')
	}

	// Handle save appointment
	// Respects doubleBookingMode to allow conflicting appointments when enabled
	const handleSaveAppointment = (appointmentData: any) => {
		const startTime = new Date(appointmentData.date)
		startTime.setHours(appointmentData.startTime.hour, appointmentData.startTime.minute, 0, 0)

		const endTime = new Date(appointmentData.date)
		endTime.setHours(appointmentData.endTime.hour, appointmentData.endTime.minute, 0, 0)

		// Use the room selected in the appointment sidebar, or fall back to shift room
		const roomId = appointmentData.roomId || (() => {
			const practitionerShift = shifts.find(shift =>
				shift.practitionerId === appointmentData.practitioner.id &&
				moment(shift.startAt).isSameOrBefore(startTime) &&
				moment(shift.endAt).isSameOrAfter(endTime)
			)
			return practitionerShift?.room
		})()

		// Check if we're updating an existing appointment
		const isUpdate = appointmentData.appointmentId !== undefined

		// Check for conflicts before saving (including room conflicts)
		// Exclude the current appointment from conflict check if updating
		const appointmentsToCheck = isUpdate
			? appointmentsState.filter(apt => apt.id !== appointmentData.appointmentId)
			: appointmentsState

		const conflicts = findAppointmentConflicts(
			{
				practitionerId: appointmentData.practitioner.id,
				startTime,
				endTime,
				roomId
			},
			appointmentsToCheck
		)

		// Check for break/time block conflicts
		const breakConflicts = findBreakConflicts(
			{
				practitionerId: appointmentData.practitioner.id,
				startTime,
				endTime
			},
			breaks
		)

		// Determine if we should allow this booking despite conflicts
		const hasConflicts = conflicts.length > 0 || breakConflicts.length > 0
		const shouldOverride = doubleBookingMode || appointmentData.overriddenConflicts

		// If conflicts exist and not overriding, block the booking
		if (conflicts.length > 0 && !shouldOverride) {
			// Show conflict warning
			const message = getConflictMessage(conflicts, roomId)
			showToast(`⚠️ Cannot book: ${message}`)
			// Don't close the sidebar so user can pick a different time
			return
		}

		if (breakConflicts.length > 0 && !shouldOverride) {
			const breakMessage = getBreakConflictMessage(breakConflicts)
			showToast(`⚠️ Cannot book: ${breakMessage}`)
			return
		}

		// If doubleBookingMode is active and there are conflicts, show warning but allow booking
		if (hasConflicts && doubleBookingMode) {
			if (conflicts.length > 0) {
				const message = getConflictMessage(conflicts, roomId)
				showToast(`⚠️ Warning: ${message} - Booking allowed due to override mode`)
			}
			if (breakConflicts.length > 0) {
				const breakMessage = getBreakConflictMessage(breakConflicts)
				showToast(`⚠️ Warning: ${breakMessage} - Booking allowed due to override mode`)
			}
		}

		const appointmentId = isUpdate ? appointmentData.appointmentId : `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

		// Set overriddenConflicts flag if booking with conflicts via doubleBookingMode
		const wasOverridden = hasConflicts && shouldOverride

		const newAppointment: Appointment = {
			id: appointmentId,
			patientId: appointmentData.client.id || '',
			patientName: appointmentData.client.name,
			serviceName: appointmentData.service.name,
			serviceCategory: 'aesthetics',
			practitionerId: appointmentData.practitioner.id,
			startTime: startTime,
			endTime: endTime,
			status: 'scheduled',
			color: '#8B5CF6',
			duration: appointmentData.service.duration,
			phone: appointmentData.client.phone,
			email: appointmentData.client.email,
			notes: appointmentData.notes,
			notesList: appointmentData.notes ? [{
				id: `note-${Date.now()}`,
				content: appointmentData.notes,
				authorId: 'user-1',
				authorName: 'Emily Roberts',
				createdAt: new Date(),
				appointmentId: appointmentId,
				isImportant: false
			}] : [],
			createdAt: new Date(),
			updatedAt: new Date(),
			assignedResources: appointmentData.assignedResources,
			roomId: roomId, // Assign room from shift
			postTreatmentTime: appointmentData.postTreatmentTime,
			overriddenConflicts: wasOverridden || appointmentData.overriddenConflicts
		}

		// Audit logging for double-booked appointments
		if (wasOverridden) {
			console.log(`[AUDIT] Double-booking mode: Allowed conflicting appointment [${appointmentId}]`, {
				timestamp: new Date().toISOString(),
				user: 'Current User', // In real app, get from auth context
				appointmentId,
				patientName: newAppointment.patientName,
				practitionerId: newAppointment.practitionerId,
				startTime: newAppointment.startTime.toISOString(),
				endTime: newAppointment.endTime.toISOString(),
				conflictsOverridden: {
					appointmentConflicts: conflicts.map(c => ({
						id: c.id,
						patientName: c.patientName,
						time: `${c.startTime.toISOString()} - ${c.endTime.toISOString()}`
					})),
					breakConflicts: breakConflicts.map(b => ({
						id: b.id,
						type: b.type,
						time: `${b.startTime.toISOString()} - ${b.endTime.toISOString()}`
					}))
				}
			})
			// TODO: Send to audit log service
		}

		if (isUpdate) {
			// Update existing appointment
			setAppointments(prevAppointments =>
				prevAppointments.map(apt =>
					apt.id === appointmentId ? newAppointment : apt
				)
			)
			showToast('✓ Appointment updated successfully')
		} else {
			// Add new appointment
			setAppointments([...appointmentsState, newAppointment])
			// Show appropriate toast message
			if (wasOverridden) {
				showToast('✓ Appointment booked (conflicts overridden)')
			} else if (appointmentData.assignedResources && appointmentData.assignedResources.length > 0) {
				const resourceNames = appointmentData.assignedResources.map((r: any) => r.resourceName).join(', ')
				showToast(`✓ Appointment booked with resources: ${resourceNames}`)
			} else {
				showToast('✓ Appointment booked successfully')
			}
		}

		setShowAppointmentSidebar(false)
		setNewAppointmentData(null)
		setAppointmentPreview(null) // Clear preview when sidebar closes
	}

	// Handle appointment drop from waitlist or drag
	const handleAppointmentDrop = (appointment: Appointment) => {
		// If this is an existing appointment being dragged, update it
		if (appointmentsState.find(apt => apt.id === appointment.id)) {
			setAppointments(prevAppointments =>
				prevAppointments.map(apt =>
					apt.id === appointment.id ? appointment : apt
				)
			)
			return
		}
		
		// Otherwise, it's a new appointment from waitlist
		// Note: Conflict checking is already done in CalendarGrid before calling this

		// If the appointment has notes text but no notesList, convert it
		const appointmentWithNotes = {
			...appointment,
			notesList: appointment.notesList || []
		}

		// If there are notes but no notesList, create the initial note
		if (appointment.notes && !appointment.notesList?.length) {
			const initialNote = {
				id: `note-${Date.now()}`,
				content: appointment.notes,
				authorId: 'user-1',
				authorName: 'Emily Roberts',
				createdAt: new Date(),
				appointmentId: appointment.id,
				isImportant: false
			}
			appointmentWithNotes.notesList = [initialNote]
		}

		setAppointments([...appointmentsState, appointmentWithNotes])
		setShowWaitlist(false)
		// Decrement waitlist count when booking from waitlist
		setWaitlistCount(prev => Math.max(0, prev - 1))
		// Clear the drag state to remove the "drop patient here" indicator
		setIsDraggingWaitlistPatient(false)
		showToast('✓ Appointment booked from waitlist')
	}

	// Handle starting appointment move
	const handleStartMoveAppointment = () => {
		if (selectedAppointment) {
			setMovingAppointment(selectedAppointment)
			setMoveMode(true)
			setSelectedAppointment(null)
			clearSelections()
			showToast(`Moving appointment for ${selectedAppointment.patientName}`)
		}
	}

	// Toggle move mode from toolbar
	const handleToggleMoveMode = () => {
		if (moveMode) {
			// Exit move mode
			setMoveMode(false)
			setMovingAppointment(null)
			showToast('Move mode disabled')
		} else {
			// Enter move mode - user will need to click an appointment to start moving
			setMoveMode(true)
			showToast('Click an appointment to move it')
		}
	}

	// ========== Print & Export Functions ==========

	// Get appointments for the current view (day or week)
	const getVisibleAppointments = useCallback(() => {
		const startOfDay = moment(selectedDate).startOf('day')
		const endOfDay = view === 'week'
			? moment(selectedDate).add(6, 'days').endOf('day')
			: moment(selectedDate).endOf('day')

		return appointmentsState.filter(apt => {
			const aptDate = moment(apt.startTime)
			return aptDate.isSameOrAfter(startOfDay) && aptDate.isSameOrBefore(endOfDay) && apt.status !== 'cancelled' && apt.status !== 'deleted'
		}).sort((a, b) => moment(a.startTime).valueOf() - moment(b.startTime).valueOf())
	}, [appointmentsState, selectedDate, view])

	// Print calendar
	const handlePrint = useCallback(() => {
		window.print()
		showToast('Opening print dialog...')
	}, [showToast])

	// Export to CSV
	const handleExportCSV = useCallback(() => {
		const visibleAppointments = getVisibleAppointments()
		const dateStr = moment(selectedDate).format('YYYY-MM-DD')
		const viewLabel = view === 'week' ? 'week' : 'day'

		const columns: ExportColumn[] = [
			{ key: 'date', header: 'Date', formatter: formatters.date },
			{ key: 'time', header: 'Time' },
			{ key: 'patientName', header: 'Patient' },
			{ key: 'serviceName', header: 'Service' },
			{ key: 'practitionerName', header: 'Provider' },
			{ key: 'duration', header: 'Duration (min)', formatter: formatters.number },
			{ key: 'status', header: 'Status' },
			{ key: 'roomId', header: 'Room' },
		]

		const data = visibleAppointments.map(apt => ({
			date: apt.startTime,
			time: moment(apt.startTime).format('h:mm A'),
			patientName: apt.patientName,
			serviceName: apt.serviceName,
			practitionerName: practitioners.find(p => p.id === apt.practitionerId)?.name || 'Unknown',
			duration: apt.duration,
			status: apt.status,
			roomId: apt.roomId || '-',
		}))

		const result = exportData({
			filename: `calendar-${viewLabel}-${dateStr}`,
			format: 'csv',
			columns,
			data,
			title: `Calendar Schedule - ${moment(selectedDate).format('MMMM D, YYYY')}${view === 'week' ? ' (Week View)' : ''}`,
			dateRange: view === 'week' ? {
				start: moment(selectedDate).format('MMM D, YYYY'),
				end: moment(selectedDate).add(6, 'days').format('MMM D, YYYY')
			} : undefined
		})

		if (result.success) {
			showToast(`Exported ${data.length} appointments to CSV`)
		} else {
			showToast('Export failed: ' + result.error)
		}
	}, [getVisibleAppointments, selectedDate, view, showToast])

	// Export to Excel
	const handleExportExcel = useCallback(() => {
		const visibleAppointments = getVisibleAppointments()
		const dateStr = moment(selectedDate).format('YYYY-MM-DD')
		const viewLabel = view === 'week' ? 'week' : 'day'

		const columns: ExportColumn[] = [
			{ key: 'date', header: 'Date', formatter: formatters.date },
			{ key: 'time', header: 'Time' },
			{ key: 'patientName', header: 'Patient' },
			{ key: 'serviceName', header: 'Service' },
			{ key: 'practitionerName', header: 'Provider' },
			{ key: 'duration', header: 'Duration (min)', formatter: formatters.number },
			{ key: 'status', header: 'Status' },
			{ key: 'roomId', header: 'Room' },
		]

		const data = visibleAppointments.map(apt => ({
			date: apt.startTime,
			time: moment(apt.startTime).format('h:mm A'),
			patientName: apt.patientName,
			serviceName: apt.serviceName,
			practitionerName: practitioners.find(p => p.id === apt.practitionerId)?.name || 'Unknown',
			duration: apt.duration,
			status: apt.status,
			roomId: apt.roomId || '-',
		}))

		const result = exportData({
			filename: `calendar-${viewLabel}-${dateStr}`,
			format: 'xlsx',
			columns,
			data,
			title: `Calendar Schedule - ${moment(selectedDate).format('MMMM D, YYYY')}${view === 'week' ? ' (Week View)' : ''}`,
			dateRange: view === 'week' ? {
				start: moment(selectedDate).format('MMM D, YYYY'),
				end: moment(selectedDate).add(6, 'days').format('MMM D, YYYY')
			} : undefined
		})

		if (result.success) {
			showToast(`Exported ${data.length} appointments to Excel`)
		} else {
			showToast('Export failed: ' + result.error)
		}
	}, [getVisibleAppointments, selectedDate, view, showToast])

	// ========== Double-Booking Override Mode Functions ==========
	// TESTING CHECKLIST:
	// [ ] Press D → Dialog appears
	// [ ] Confirm → Mode enabled, badge shows
	// [ ] Badge visible and clickable
	// [ ] After 10 min → Mode auto-disables
	// [ ] Press D again → Mode disables with confirmation
	// [ ] Book conflicting appointment → Allowed when mode active
	// [ ] Book conflicting appointment → Blocked when mode inactive

	const OVERRIDE_MODE_TIMEOUT = 10 * 60 * 1000 // 10 minutes in milliseconds
	const OVERRIDE_WARNING_TIME = 30 * 1000 // 30 seconds before expiration

	// Reset interaction timer (called on calendar interactions)
	const resetOverrideModeTimer = useCallback(() => {
		if (!doubleBookingMode) return

		lastInteractionRef.current = Date.now()

		// Clear existing timers
		if (modeTimeoutId) {
			clearTimeout(modeTimeoutId)
		}
		if (modeWarningTimeoutId) {
			clearTimeout(modeWarningTimeoutId)
		}

		// Set warning timer (30 seconds before expiration)
		const warningId = setTimeout(() => {
			showToast('⚠️ Override mode expiring soon. Press D to extend.')
		}, OVERRIDE_MODE_TIMEOUT - OVERRIDE_WARNING_TIME)
		setModeWarningTimeoutId(warningId)

		// Set expiration timer (10 minutes)
		const timeoutId = setTimeout(() => {
			setDoubleBookingMode(false)
			showToast('Override mode disabled due to inactivity')
			setModeTimeoutId(null)
			setModeWarningTimeoutId(null)
		}, OVERRIDE_MODE_TIMEOUT)
		setModeTimeoutId(timeoutId)
	}, [doubleBookingMode, modeTimeoutId, modeWarningTimeoutId, showToast, setDoubleBookingMode])

	// Enable override mode with timeout
	const handleEnableOverrideMode = useCallback(() => {
		setDoubleBookingMode(true)
		setShowOverrideDialog(false)
		showToast('Override mode enabled - conflicting appointments allowed')

		// Log for audit purposes
		console.log('[AUDIT] Double-booking override mode ENABLED', {
			timestamp: new Date().toISOString(),
			user: 'Current User' // In real app, get from auth context
		})
		// TODO: Send to audit log service

		// Start the timeout
		lastInteractionRef.current = Date.now()

		// Set warning timer (30 seconds before expiration)
		const warningId = setTimeout(() => {
			showToast('⚠️ Override mode expiring soon. Press D to extend.')
		}, OVERRIDE_MODE_TIMEOUT - OVERRIDE_WARNING_TIME)
		setModeWarningTimeoutId(warningId)

		// Set expiration timer (10 minutes)
		const timeoutId = setTimeout(() => {
			setDoubleBookingMode(false)
			showToast('Override mode disabled due to inactivity')
			setModeTimeoutId(null)
			setModeWarningTimeoutId(null)
		}, OVERRIDE_MODE_TIMEOUT)
		setModeTimeoutId(timeoutId)
	}, [showToast, setDoubleBookingMode])

	// Disable override mode
	const handleDisableOverrideMode = useCallback(() => {
		// Clear timers
		if (modeTimeoutId) {
			clearTimeout(modeTimeoutId)
			setModeTimeoutId(null)
		}
		if (modeWarningTimeoutId) {
			clearTimeout(modeWarningTimeoutId)
			setModeWarningTimeoutId(null)
		}

		setDoubleBookingMode(false)
		showToast('Override mode disabled')

		// Log for audit purposes
		console.log('[AUDIT] Double-booking override mode DISABLED', {
			timestamp: new Date().toISOString(),
			user: 'Current User' // In real app, get from auth context
		})
		// TODO: Send to audit log service
	}, [modeTimeoutId, modeWarningTimeoutId, showToast, setDoubleBookingMode])

	// Toggle override mode (called from toolbar badge click)
	const handleToggleOverrideMode = useCallback(() => {
		if (doubleBookingMode) {
			handleDisableOverrideMode()
		} else {
			setShowOverrideDialog(true)
		}
	}, [doubleBookingMode, handleDisableOverrideMode])

	// Cleanup timeouts on unmount
	useEffect(() => {
		return () => {
			if (modeTimeoutId) {
				clearTimeout(modeTimeoutId)
			}
			if (modeWarningTimeoutId) {
				clearTimeout(modeWarningTimeoutId)
			}
		}
	}, [modeTimeoutId, modeWarningTimeoutId])

	// Reset timer on calendar interactions when override mode is active
	useEffect(() => {
		if (!doubleBookingMode) return

		const handleInteraction = () => {
			resetOverrideModeTimer()
		}

		// Listen for various interaction events
		document.addEventListener('click', handleInteraction)
		document.addEventListener('keydown', handleInteraction)
		document.addEventListener('scroll', handleInteraction, true)

		return () => {
			document.removeEventListener('click', handleInteraction)
			document.removeEventListener('keydown', handleInteraction)
			document.removeEventListener('scroll', handleInteraction, true)
		}
	}, [doubleBookingMode, resetOverrideModeTimer])
	// ========== End Double-Booking Override Mode Functions ==========

	// Handle copying appointment
	const handleCopyAppointment = () => {
		if (selectedAppointment) {
			setCopiedAppointment(selectedAppointment)
			setSelectedAppointment(null)
			clearSelections()
			showToast(`Copied appointment for ${selectedAppointment.patientName}`)
		}
	}

	// Handle editing appointment
	const handleEditAppointment = () => {
		if (selectedAppointment) {
			const practitioner = practitioners.find(p => p.id === selectedAppointment.practitionerId)
			if (!practitioner) return

			// Extract service from existing appointment
			const service = services.find(s => s.name === selectedAppointment.serviceName)

			setNewAppointmentData({
				practitioner,
				startTime: {
					hour: selectedAppointment.startTime.getHours(),
					minute: selectedAppointment.startTime.getMinutes()
				},
				date: selectedAppointment.startTime,
				selectedService: service,
				existingAppointment: selectedAppointment // Pass the existing appointment for editing
			})
			setSelectedAppointment(null)
			setShowAppointmentSidebar(true)
		}
	}

	// Handle appointment drag start
	const handleAppointmentDragStart = (appointment: Appointment) => {
		setIsDraggingAppointment(true)
		setDraggingAppointment(appointment)
	}

	// Handle appointment drag end
	const handleAppointmentDragEnd = () => {
		setIsDraggingAppointment(false)
		setDraggingAppointment(null)
	}

	// Handle completing appointment move
	const handleCompleteMove = (practitionerId: string, date: Date, time: { hour: number; minute: number }) => {
		if (!movingAppointment) return

		const newStartTime = new Date(date)
		newStartTime.setHours(time.hour, time.minute, 0, 0)
		
		const newEndTime = new Date(date)
		newEndTime.setTime(newStartTime.getTime() + movingAppointment.duration * 60 * 1000)

		// Check for conflicts at new time
		const conflicts = findAppointmentConflicts(
			{
				practitionerId,
				startTime: newStartTime,
				endTime: newEndTime
			},
			appointmentsState.filter(apt => apt.id !== movingAppointment.id)
		)

		if (conflicts.length > 0) {
			const message = getConflictMessage(conflicts)
			showToast(`⚠️ Cannot move: ${message}`)
			return
		}

		// Check for break/time block conflicts
		const breakConflicts = findBreakConflicts(
			{ practitionerId, startTime: newStartTime, endTime: newEndTime },
			breaks
		)

		if (breakConflicts.length > 0) {
			const breakMessage = getBreakConflictMessage(breakConflicts)
			showToast(`⚠️ Cannot move: ${breakMessage}`)
			return
		}

		// Update the appointment
		const updatedAppointment = {
			...movingAppointment,
			practitionerId,
			locationId: selectedLocationId,
			startTime: newStartTime,
			endTime: newEndTime
		}

		setAppointments(prevAppointments =>
			prevAppointments.map(apt =>
				apt.id === movingAppointment.id ? updatedAppointment : apt
			)
		)

		const location = locations.find(loc => loc.id === selectedLocationId)
		showToast(`✓ Appointment moved to ${location?.name || 'Unknown location'}`)
		setMoveMode(false)
		setMovingAppointment(null)
	}

	// Handle break update and delete
	const handleBreakUpdate = (breakId: string, updates: Partial<Break>) => {
		setBreaks(prevBreaks =>
			prevBreaks.map(b => b.id === breakId ? { ...b, ...updates } : b)
		)
		if (selectedBreak && selectedBreak.id === breakId) {
			setSelectedBreak({ ...selectedBreak, ...updates })
		}
	}

	const handleBreakDelete = (breakId: string) => {
		setBreaks(prevBreaks => prevBreaks.filter(b => b.id !== breakId))
		setSelectedBreak(null)
	}

	// Auto-refresh effect
	useEffect(() => {
		if (!calendarSettings.autoRefresh) return

		const interval = setInterval(() => {
			// In a real app, this would refetch data from the server
			console.log('Auto-refreshing calendar data...')
		}, calendarSettings.refreshInterval * 60 * 1000)

		return () => clearInterval(interval)
	}, [calendarSettings.autoRefresh, calendarSettings.refreshInterval])

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't trigger shortcuts when typing in inputs
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return
			}

			// Location switching shortcut (L key)
			if (e.key === 'l' || e.key === 'L') {
				if (moveMode && movingAppointment) {
					// Cycle through locations
					const currentIndex = locations.findIndex(loc => loc.id === selectedLocationId)
					const nextIndex = (currentIndex + 1) % locations.length
					setSelectedLocationId(locations[nextIndex].id)
					showToast(`Location changed to ${locations[nextIndex].name}`)
				}
			}

			// Double booking mode (D key) - Show confirmation dialog
			// Only trigger on standalone D press, not when combined with Ctrl/Cmd
			if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey) {
				e.preventDefault()
				// Don't trigger if typing in an input field
				const target = e.target as HTMLElement
				if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
					return
				}
				// If mode is already active, pressing D again will disable it
				if (doubleBookingMode) {
					handleDisableOverrideMode()
				} else {
					// Show confirmation dialog before enabling
					if (!showOverrideDialog) {
						setShowOverrideDialog(true)
					}
				}
			}

			// Cancel move mode (Escape key)
			if (e.key === 'Escape') {
				if (moveMode) {
					setMoveMode(false)
					setMovingAppointment(null)
					showToast('Move cancelled')
				}
				// Also close any open panels
				if (selectedAppointment) setSelectedAppointment(null)
				if (selectedBreak) setSelectedBreak(null)
				if (showAppointmentSidebar) {
					setShowAppointmentSidebar(false)
					setAppointmentPreview(null) // Clear preview on Escape
				}
				if (showShiftPanel) setShowShiftPanel(false)
			}

			// Navigation shortcuts (arrow keys)
			if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
				if (e.key === 'ArrowLeft') {
					e.preventDefault()
					handleNavigate('PREV')
				} else if (e.key === 'ArrowRight') {
					e.preventDefault()
					handleNavigate('NEXT')
				}
			}

			// Quick actions
			if (e.ctrlKey || e.metaKey) {
				switch(e.key) {
					case 'm':
					case 'M':
						e.preventDefault()
						if (selectedAppointment && !moveMode) {
							handleStartMoveAppointment()
						}
						break
					case 'c':
					case 'C':
						if (e.ctrlKey || e.metaKey) {
							e.preventDefault()
							if (selectedAppointment) {
								handleCopyAppointment()
							}
						}
						break
					case 'd':
					case 'D':
						e.preventDefault()
						setView(view === 'day' ? 'week' : 'day')
						break
					case 'g':
					case 'G':
						e.preventDefault()
						setShowGoToDate(true)
						break
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [moveMode, movingAppointment, selectedLocationId, selectedAppointment, selectedBreak,
		showAppointmentSidebar, showShiftPanel, view, handleNavigate, setView,
		handleStartMoveAppointment, setShowGoToDate, setSelectedAppointment,
		setSelectedBreak, setShowAppointmentSidebar, setShowShiftPanel,
		doubleBookingMode, showOverrideDialog, handleDisableOverrideMode])

	// Filter appointments by service category
	const filteredAppointments = useMemo(() => {
		if (!selectedServiceCategory) return appointmentsState
		return appointmentsState.filter(apt => apt.serviceCategory === selectedServiceCategory)
	}, [appointmentsState, selectedServiceCategory])

	// Get all shifts for the current view
	const allShiftsForView = useMemo(() => {
		const datesToCheck = view === 'week' ? weekDates : [selectedDate]
		const shiftsForView: Shift[] = []

		visiblePractitioners.forEach(practitioner => {
			datesToCheck.forEach(date => {
				const shiftsForDate = getAllShiftsForDate(practitioner.id, date)
				shiftsForView.push(...shiftsForDate)
			})
		})

		return shiftsForView
	}, [view, weekDates, selectedDate, visiblePractitioners, getAllShiftsForDate])

	// Calculate waitlist counts by practitioner
	const waitlistCountsByPractitioner = useMemo(() => {
		const counts: Record<string, number> = {}
		// Initialize all practitioners with 0
		practitioners.forEach(p => {
			counts[p.id] = 0
		})
		
		// This would come from actual waitlist data
		// For now, using mock data
		const mockWaitlistData = [
			{ practitionerId: '1', count: 2 },
			{ practitionerId: '2', count: 1 },
			{ practitionerId: '3', count: 0 },
			{ practitionerId: '4', count: 3 }
		]
		
		mockWaitlistData.forEach(item => {
			if (counts.hasOwnProperty(item.practitionerId)) {
				counts[item.practitionerId] = item.count
			}
		})
		
		return counts
	}, [practitioners])
	
	// Update the existing waitlistCount with the total from all practitioners
	useEffect(() => {
		const totalCount = Object.values(waitlistCountsByPractitioner).reduce((sum, count) => sum + count, 0)
		setWaitlistCount(totalCount)
	}, [waitlistCountsByPractitioner, setWaitlistCount])

	// Handle break mode when activated from command bar
	useEffect(() => {
		if (createMode === 'break' && view === 'week') {
			// Switch to day view for easier break creation
			setView('day')
		}
	}, [createMode, view, setView])

	// Show toast message when in break mode and day view
	useEffect(() => {
		if (createMode === 'break' && view === 'day') {
			showToast('📍 Click and drag on the calendar to add a break')
		}
	}, [createMode, view, showToast])

	return (
		<div className="h-full w-full flex relative bg-gray-50 calendar-grid overflow-hidden">
			{/* Overlay when sidebar is open */}
			{(selectedAppointment || selectedBreak) && (
				<div 
					className="fixed inset-0 bg-black bg-opacity-10 z-40 transition-opacity duration-300"
					onClick={() => {
						setSelectedAppointment(null)
						setSelectedBreak(null)
					}}
				/>
			)}
			{/* Toast Notification */}
			{toast.visible && (
				<div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-out">
					<div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
						<svg className="h-4 w-4 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						{toast.message}
					</div>
				</div>
			)}

			{/* Override Mode Confirmation Dialog */}
			{showOverrideDialog && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center"
					onClick={() => setShowOverrideDialog(false)}
					role="dialog"
					aria-modal="true"
					aria-labelledby="override-dialog-title"
				>
					<div
						className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Dialog Header */}
						<div className="p-6 pb-4">
							<div className="flex items-center gap-3 mb-4">
								<div className="p-3 bg-orange-100 rounded-full">
									<AlertTriangle className="h-6 w-6 text-orange-600" />
								</div>
								<h2 id="override-dialog-title" className="text-xl font-semibold text-gray-900">
									Override Mode Enabled
								</h2>
							</div>
							<p className="text-gray-600 leading-relaxed">
								You can now book conflicting appointments. This will be logged for audit purposes.
							</p>
							<div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
								<p className="text-sm text-amber-800">
									<strong>Note:</strong> Override mode will automatically disable after 10 minutes of inactivity.
								</p>
							</div>
						</div>

						{/* Dialog Footer */}
						<div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
							<button
								onClick={() => setShowOverrideDialog(false)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
								aria-label="Cancel override mode"
							>
								Cancel
							</button>
							<button
								onClick={handleEnableOverrideMode}
								className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
								aria-label="Enable override mode"
								autoFocus
							>
								Enable Override
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Main Calendar Area */}
			<div className="flex-1 min-w-0 flex flex-col transition-all duration-300 overflow-hidden">
				<CalendarHeader
					selectedDate={selectedDate}
					view={view}
					viewMode={viewMode}
					singlePractitionerId={singlePractitionerId}
					weekDates={weekDates}
					today={TODAY}
					practitioners={practitioners}
					showWaitlist={showWaitlist}
					showShiftsOnly={showShiftsOnly}
					shiftMode={shiftMode}
					waitlistCount={waitlistCount}
					waitlistCountsByPractitioner={waitlistCountsByPractitioner}
					showResources={showResources}
					calendarViewType={calendarViewType}
					onShowAll={onShowAll}
					onShowWaitlist={() => {
						setShowWaitlist(true)
						setShowResources(false)
						clearSelections()
					}}
					onToggleShifts={() => setShowShiftsOnly(!showShiftsOnly)}
					onShiftAction={handleShiftAction}
					onShowResources={() => {
						setShowResources(!showResources)
						setShowWaitlist(false)
						clearSelections()
					}}
					onCalendarViewTypeChange={(type) => {
						setCalendarViewType(type)
						clearSelections()
					}}
				/>
				{copiedAppointment && (
					<div className="bg-purple-50 border-b border-purple-200 px-4 py-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<div className="bg-purple-400 text-white rounded-full p-1 mr-2">
									<FileText className="h-4 w-4" />
								</div>
								<span className="text-sm text-purple-800">
									Copied appointment for <strong>{copiedAppointment.patientName}</strong> - Click on a time slot to paste
								</span>
							</div>
							<button
								onClick={() => {
									setCopiedAppointment(null)
									showToast('Copy cancelled')
								}}
								className="text-sm text-purple-600 hover:text-purple-700 font-medium"
							>
								Cancel
							</button>
						</div>
					</div>
				)}
				{shiftMode && !showShiftPanel && (
					<div className="bg-orange-50 border-b border-orange-200 px-4 py-2 flex items-center justify-between">
						<div className="flex items-center">
							<div className="bg-orange-400 text-white rounded-full p-1 mr-2">
								<Clock className="h-4 w-4" />
							</div>
							<span className="text-sm text-orange-800">
								Shift Edit Mode: Click and drag on the calendar to create shifts, or click existing shifts to edit
							</span>
						</div>
						<button
							onClick={() => {
								setShiftMode(false)
								setSelectedShift(null)
								// Restore previous show/hide state
								setShowShiftsOnly(previousShowShiftsOnly)
								showToast('Exited shift edit mode')
							}}
							className="px-4 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium flex items-center"
						>
							Exit Edit Mode
						</button>
					</div>
				)}
				{moveMode && movingAppointment && (
					<div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<div className="bg-blue-400 text-white rounded-full p-1 mr-2">
									<Move className="h-4 w-4" />
								</div>
								<span className="text-sm text-blue-800">
									Moving appointment for <strong>{movingAppointment.patientName}</strong>
								</span>
							</div>
							<div className="flex items-center space-x-2">
								{/* Location Selector */}
								<div className="flex items-center space-x-1 mr-2">
									<MapPin className="h-4 w-4 text-blue-600" />
									<select
										value={selectedLocationId}
										onChange={(e) => setSelectedLocationId(e.target.value)}
										className="text-sm border border-blue-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
										{locations.map(location => (
											<option key={location.id} value={location.id}>
												{location.name}
											</option>
										))}
									</select>
								</div>
								
								{view === 'day' && (
									<div className="flex items-center space-x-1 mr-2 border-l border-blue-300 pl-2">
										<button
											onClick={() => handleNavigate('PREV')}
											className="p-1 hover:bg-blue-100 rounded transition-colors"
											title="Previous day"
										>
											<ChevronLeft className="h-4 w-4 text-blue-600" />
										</button>
										<span className="text-sm text-blue-700 px-2">
											{moment(selectedDate).format('MMM D')}
										</span>
										<button
											onClick={() => handleNavigate('NEXT')}
											className="p-1 hover:bg-blue-100 rounded transition-colors"
											title="Next day"
										>
											<ChevronRight className="h-4 w-4 text-blue-600" />
										</button>
									</div>
								)}
								<button
									onClick={() => setShowGoToDate(true)}
									className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium flex items-center"
								>
									<Calendar className="h-4 w-4 mr-1" />
									Go to Date
								</button>
								<button
									onClick={() => {
										setMoveMode(false)
										setMovingAppointment(null)
										showToast('Move cancelled')
									}}
									className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
								>
									Cancel Move
								</button>
							</div>
						</div>
						<div className="text-xs text-blue-600 mt-1">
							Click on any available time slot to move the appointment • Press <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">L</kbd> to switch location • <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Esc</kbd> to cancel
						</div>
					</div>
				)}

				<div
					className="flex-1 bg-white flex flex-col relative overflow-hidden transition-all duration-300"
					ref={calendarRef}
					style={{ zoom: `${calendarSettings.zoomLevel}%` }}
				>
					{/* Main scrollable container */}
					<div className="absolute inset-0 overflow-auto">
						{view === 'month' ? (
							<MonthView
								selectedDate={selectedDate}
								today={TODAY}
								appointments={filteredAppointments}
								breaks={breaks}
								calendarSettings={calendarSettings}
								visiblePractitionerIds={visiblePractitioners.map(p => p.id)}
								onDateSelect={(date) => {
									setSelectedDate(date)
									setView('day')
								}}
								onAppointmentClick={(apt) => setSelectedAppointment(apt)}
								onNavigate={(direction) => {
									const newDate = direction === 'prev'
										? moment(selectedDate).subtract(1, 'month').toDate()
										: moment(selectedDate).add(1, 'month').toDate()
									setSelectedDate(newDate)
								}}
							/>
						) : (
						<>
						{/* Sticky header row */}
						<div className="sticky top-0 z-20 bg-white flex">
							{/* Time column header */}
							<div className="w-20 h-16 bg-gray-50 border-r border-b border-gray-200 flex-shrink-0"></div>
							
							{/* Practitioner/Room headers - match exact grid layout */}
							<div className="flex flex-1">
								{(visibleEntities || visiblePractitioners).map((entity) => {
									const isPractitioner = !visibleEntities
									const name = entity.name
									const initials = isPractitioner && 'initials' in entity ? (entity as any).initials : entity.name.substring(0, 2).toUpperCase()
									const hasStaggerBooking = isPractitioner && 'staggerOnlineBooking' in entity && (entity as any).staggerOnlineBooking > 0
									
									return (
										<div 
											key={entity.id} 
											className={`h-16 flex-1 min-w-[200px] border-r border-b border-gray-200 ${hasStaggerBooking ? 'bg-blue-50' : 'bg-gray-50'} flex items-center justify-center px-2 ${
												isPractitioner ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''
											} relative`}
											onClick={() => {
												if (isPractitioner) {
													setEditingPractitioner(entity)
													setShowPractitionerEdit(true)
												}
											}}
										>
											{/* Stagger indicator background pattern */}
											{hasStaggerBooking && (
												<div className="absolute inset-0 opacity-10">
													<svg width="100%" height="100%" className="absolute inset-0">
														<defs>
															<pattern id={`stagger-${entity.id}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
																<rect x="0" y="0" width="10" height="10" fill="#3B82F6" />
																<rect x="10" y="10" width="10" height="10" fill="#3B82F6" />
															</pattern>
														</defs>
														<rect width="100%" height="100%" fill={`url(#stagger-${entity.id})`} />
													</svg>
												</div>
											)}
											<div className="flex items-center space-x-2 relative z-10">
												<div className="relative">
													{calendarSettings.showStaffPhotos ? (
														<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center text-xs font-medium shadow-sm">
															{initials}
														</div>
													) : (
														<div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-medium">
															{initials}
														</div>
													)}
													{/* Waitlist count bubble */}
													{isPractitioner && waitlistCountsByPractitioner[entity.id] > 0 && (
														<div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm">
															{waitlistCountsByPractitioner[entity.id]}
														</div>
													)}
												</div>
												<div className="flex flex-col">
													<span className={`${calendarSettings.compactView ? 'text-xs' : 'text-sm'} font-medium text-gray-700 truncate max-w-[100px]`} title={name}>
														{name.replace(/^Dr\.\s/, '')}
													</span>
													{hasStaggerBooking && (
														<span 
															className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-0.5"
															title={`Appointments can be booked every ${entity.staggerOnlineBooking} minutes with overlapping times`}
														>
															<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
															</svg>
															{(entity as any).staggerOnlineBooking}min stagger
														</span>
													)}
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</div>
						
						{/* Content area with time column and grid */}
						<div className="flex flex-1">
							{/* Sticky time column */}
							<div className="sticky left-0 z-10 bg-white">
								<TimeColumn 
									timeSlotHeight={timeSlotHeight} 
									startHour={calendarSettings.startHour}
									endHour={calendarSettings.endHour}
									headerHeight={view === 'week' ? 64 : 0} // 64px header only for week view
								/>
							</div>
							
							{/* Calendar grid */}
							<CalendarGrid
							view={view}
							visiblePractitioners={visiblePractitioners}
							visibleEntities={visibleEntities}
							calendarViewType={calendarViewType}
							selectedDate={selectedDate}
							weekDates={weekDates}
							appointments={filteredAppointments}
							breaks={breaks}
							shifts={allShiftsForView}
							calendarSettings={calendarSettings}
							timeSlotHeight={timeSlotHeight}
							showShiftsOnly={showShiftsOnly}
							createMode={createMode}
							pendingBreakType={breakType}
							shiftMode={shiftMode}
							moveMode={moveMode}
							movingAppointment={movingAppointment}
							isDragging={isDragging}
							dragStart={dragStart}
							dragEnd={dragEnd}
							isDraggingWaitlistPatient={isDraggingWaitlistPatient}
							continuousSlotBlocks={continuousSlotBlocks}
							highlightedSlots={highlightedSlots}
							selectedShift={selectedShift}
							today={TODAY}
							calendarRef={calendarRef as React.RefObject<HTMLDivElement>}
							getShiftForDate={getShiftForDate}
							appointmentPreview={appointmentPreview}
							doubleBookingMode={doubleBookingMode}
							onAppointmentClick={(apt) => {
								if (!shiftMode) {
									if (moveMode && !movingAppointment) {
										// In move mode, clicking an appointment starts moving it
										setMovingAppointment(apt)
										showToast(`Moving appointment for ${apt.patientName}`)
									} else if (!moveMode) {
										// Normal click - show appointment details
										setSelectedAppointment(apt)
										setSelectedBreak(null)
										setShowAppointmentSidebar(false)
										setAppointmentPreview(null) // Clear preview when viewing existing appointment
									}
								}
							}}
							onBreakClick={(brk) => {
								if (!shiftMode) {
									setSelectedBreak(brk)
									setSelectedAppointment(null)
									setShowAppointmentSidebar(false)
								}
							}}
							onShiftClick={(shift) => {
								if (shiftMode && !(shift as any).isLegacy) {
									setSelectedShift(shift)
									setShowShiftPanel(true)
								} else if (shiftMode && (shift as any).isLegacy) {
									// For legacy shifts, create a new shift instead of editing
									setShiftDragData({
										practitionerId: shift.practitionerId,
										startTime: { hour: shift.startAt.getHours(), minute: shift.startAt.getMinutes() },
										endTime: { hour: shift.endAt.getHours(), minute: shift.endAt.getMinutes() },
										date: shift.startAt
									})
									setShowShiftPanel(true)
								}
							}}
							onTimeSlotClick={(practitioner, date, time, draggedDuration) => {
								if (shiftMode) {
									// Don't do anything on single click in shift mode
									return
								}
								if (moveMode && movingAppointment) {
									// Handle appointment move
									handleCompleteMove(practitioner.id, date, time)
									return
								}

								// Check for break conflicts before allowing appointment creation
								if (createMode === 'appointment') {
									const slotStart = new Date(date)
									slotStart.setHours(time.hour, time.minute, 0, 0)
									const slotEnd = new Date(slotStart)
									slotEnd.setMinutes(slotEnd.getMinutes() + 30) // minimum slot check

									const breakConflicts = findBreakConflicts(
										{ practitionerId: practitioner.id, startTime: slotStart, endTime: slotEnd },
										breaks
									)

									if (breakConflicts.length > 0) {
										const breakMessage = getBreakConflictMessage(breakConflicts)
										showToast(`⚠️ ${breakMessage}`)
										return // Don't open sidebar
									}
								}

								// In appointment mode - always update position (even if sidebar already open)
								if (createMode === 'appointment') {
									// Show blue preview with EXACT drag duration - no snapping
									const rawDuration = draggedDuration && draggedDuration >= 15 ? draggedDuration : 30
									setAppointmentPreview({
										practitionerId: practitioner.id,
										startTime: time,
										duration: rawDuration,
										date: date
									})
									// Update sidebar data with dragged duration
									// Duration will adjust ONLY when user picks a service
									setNewAppointmentData({
										practitioner,
										startTime: time,
										date: date,
										draggedDuration: rawDuration
									})
									setShowAppointmentSidebar(true)
									return
								}

								// Handle paste if there's a copied appointment
								if (copiedAppointment) {
									const startTime = new Date(date)
									startTime.setHours(time.hour, time.minute, 0, 0)
									
									const endTime = new Date(startTime)
									endTime.setMinutes(endTime.getMinutes() + copiedAppointment.duration)
									
									// Check for conflicts
									const conflicts = findAppointmentConflicts(
										{
											practitionerId: practitioner.id,
											startTime: startTime,
											endTime: endTime
										},
										appointmentsState
									)
									
									if (conflicts.length > 0) {
										const message = getConflictMessage(conflicts)
										showToast(`⚠️ Cannot paste: ${message}`)
										return
									}

									// Check for break/time block conflicts
									const breakConflicts = findBreakConflicts(
										{ practitionerId: practitioner.id, startTime, endTime },
										breaks
									)

									if (breakConflicts.length > 0) {
										const breakMessage = getBreakConflictMessage(breakConflicts)
										showToast(`⚠️ Cannot paste: ${breakMessage}`)
										return
									}

									// Create new appointment from copied data
									const newAppointment: Appointment = {
										...copiedAppointment,
										id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
										practitionerId: practitioner.id,
										startTime: startTime,
										endTime: endTime,
										status: 'scheduled',
										createdAt: new Date(),
										updatedAt: new Date()
									}
									
									setAppointments([...appointmentsState, newAppointment])
									setCopiedAppointment(null) // Clear copied appointment
									showToast(`✓ Appointment pasted for ${newAppointment.patientName}`)
									return
								}
							}}
							onSlotClick={(slot) => {
								if (!shiftMode) {
									const practitioner = practitioners.find(p => p.id === slot.practitionerId)
									if (!practitioner) return

									setHighlightedSlots([])
									setContinuousSlotBlocks([])
									onClearServiceSelection?.()

									setNewAppointmentData({
										practitioner,
										startTime: {
											hour: slot.startTime.getHours(),
											minute: slot.startTime.getMinutes()
										},
										date: slot.date,
										selectedService: selectedServiceFromSidebar?.service
									})
									setShowAppointmentSidebar(true)
								}
							}}
							onDragStart={setDragStart}
							onDragEnd={setDragEnd}
							onDragging={setIsDragging}
							onBreakCreate={(breakData) => {
								setBreaks([...breaks, breakData])
								setSelectedBreak(breakData)
							}}
							onShiftDragComplete={(data) => {
								setShiftDragData(data)
								setShowShiftPanel(true)
							}}
							onAppointmentDrop={handleAppointmentDrop}
							showToast={showToast}
							onAppointmentDragStart={handleAppointmentDragStart}
							onAppointmentDragEnd={handleAppointmentDragEnd}
						/>
						</div>
					</>
					)}
					</div>
				</div>

				<CalendarToolbar
					selectedDate={selectedDate}
					today={TODAY}
					view={view}
					onNavigate={handleNavigate}
					onViewChange={setView}
					onGoToDate={() => setShowGoToDate(true)}
					selectedLocation={selectedLocationId}
					onLocationChange={setSelectedLocationId}
					selectedServiceCategory={selectedServiceCategory}
					onServiceCategoryChange={setSelectedServiceCategory}
					createMode={createMode}
					onCreateModeChange={(mode) => {
						setCreateMode(mode)
						// Clear preview and sidebar when exiting appointment mode
						if (mode === 'none') {
							setAppointmentPreview(null)
							setShowAppointmentSidebar(false)
							setNewAppointmentData(null)
						}
					}}
					pendingBreakType={breakType}
					onNewAppointment={() => setCreateMode('appointment')}
					onWalkIn={() => setShowWalkInModal(true)}
					onExpressBooking={() => {
						const defaultPractitioner = practitioners[0]
						setExpressBookingPractitioner(defaultPractitioner)
						setExpressBookingTime({ hour: 10, minute: 0 })
						setShowExpressBooking(true)
					}}
					onGroupBooking={() => setShowGroupBooking(true)}
					onAddBreak={(type) => {
						// Map toolbar button types to break types
						const breakTypeMap: Record<string, typeof pendingBreakType> = {
							'lunch': 'lunch',
							'break': 'personal',
							'meeting': 'meeting'
						}
						const mappedBreakType = breakTypeMap[type] || 'personal'
						setBreakType(mappedBreakType)
						setCreateMode('break')

						const labels: Record<string, string> = {
							'lunch': '🍽️ Lunch Break',
							'personal': '👤 Personal Break',
							'meeting': '👥 Meeting'
						}
						showToast(`${labels[mappedBreakType] || 'Break'} mode: Click and drag on the calendar`)
					}}
					onBlockTime={() => {
						setBreakType('out_of_office')
						setCreateMode('break')
						showToast('🏖️ Block Time mode: Click and drag to block off time')
					}}
					moveMode={moveMode}
					onToggleMoveMode={handleToggleMoveMode}
					onFindSlot={() => {
						// Could open find slot modal
					}}
					onSettings={() => setShowSettings(true)}
					staffCount={workingTodayCount}
					waitlistCount={waitlistCount}
					isStaffPanelOpen={isShowingStaffToday}
					isWaitlistOpen={showWaitlist}
					isRoomsPanelOpen={showRoomsPanel}
					isResourcesPanelOpen={showResources}
					onToggleStaffPanel={handleStaffToday}
					onToggleWaitlist={() => {
						setShowWaitlist(!showWaitlist)
						setShowResources(false)
						setShowRoomsPanel(false)
						setShowGroupsPanel(false)
					}}
					onToggleRoomsPanel={() => {
						setShowRoomsPanel(!showRoomsPanel)
						setShowResources(false)
						setShowWaitlist(false)
						setShowGroupsPanel(false)
					}}
					onToggleResourcesPanel={() => {
						setShowResources(!showResources)
						setShowRoomsPanel(false)
						setShowWaitlist(false)
						setShowGroupsPanel(false)
					}}
					isGroupsPanelOpen={showGroupsPanel}
					onToggleGroupsPanel={() => {
						setShowGroupsPanel(!showGroupsPanel)
						setShowResources(false)
						setShowRoomsPanel(false)
						setShowWaitlist(false)
					}}
					appointments={appointmentsState}
					onAppointmentSelect={(apt) => setSelectedAppointment(apt)}
					onNavigateToDate={(date) => setSelectedDate(date)}
					calendarViewType={calendarViewType}
					onCalendarViewTypeChange={(type) => {
						setCalendarViewType(type)
						clearSelections()
					}}
					doubleBookingMode={doubleBookingMode}
					onToggleDoubleBookingMode={handleToggleOverrideMode}
					onPrint={handlePrint}
					onExportCSV={handleExportCSV}
					onExportExcel={handleExportExcel}
				/>
				<StatusLegend />
			</div>

			{/* Appointment Details Panel - Shows GroupBookingDetails for group appointments */}
			<div className={`fixed right-0 top-0 h-full bg-white shadow-2xl transform transition-transform duration-300 z-50 w-full ${
				selectedAppointment ? 'translate-x-0' : 'translate-x-full'
			} ${selectedAppointment?.groupBookingId ? 'max-w-[420px]' : 'max-w-[480px]'}`}>
				{selectedAppointment && (
					selectedAppointment.groupBookingId ? (
						<GroupBookingDetails
							groupId={selectedAppointment.groupBookingId}
							onClose={() => setSelectedAppointment(null)}
							onAddParticipant={() => {
								// Could open add participant modal here
								console.log('Add participant to group')
							}}
							onSendSMS={async (type) => {
								try {
									const response = await fetch('/api/sms/group', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({
											groupId: selectedAppointment.groupBookingId,
											type
										})
									})
									const result = await response.json()
									if (result.success) {
										showToast(`SMS sent to ${result.totalSent} participants`)
									} else {
										showToast('Failed to send SMS: ' + result.error)
									}
								} catch (error) {
									showToast('Error sending SMS')
								}
							}}
							onRefresh={() => {
								// Refresh appointments
								setAppointments([...appointmentsState])
							}}
						/>
					) : (
						<AppointmentDetailView
							appointment={selectedAppointment}
							isOpen={true}
							onClose={() => setSelectedAppointment(null)}
							onEdit={handleEditAppointment}
						/>
					)
				)}
			</div>

			{/* Break Details Panel */}
			<div className={`fixed right-0 top-0 h-full w-full max-w-[384px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
				selectedBreak ? 'translate-x-0' : 'translate-x-full'
			}`}>
				{selectedBreak && (
					<BreakDetails
						breakItem={{...selectedBreak, availableForEmergencies: selectedBreak.availableForEmergencies ?? false}}
						onClose={() => setSelectedBreak(null)}
						onUpdate={handleBreakUpdate}
						onDelete={handleBreakDelete}
					/>
				)}
			</div>

			{showAppointmentSidebar && newAppointmentData && (
					<AppointmentSidebar
						isOpen={showAppointmentSidebar}
						onClose={() => {
							setShowAppointmentSidebar(false)
							setNewAppointmentData(null)
							setAppointmentPreview(null) // Clear preview when sidebar closes
						}}
					practitioner={newAppointmentData.practitioner}
					selectedDate={newAppointmentData.date}
					startTime={newAppointmentData.startTime}
					selectedService={newAppointmentData.selectedService}
					initialDuration={newAppointmentData.draggedDuration}
					onSave={handleSaveAppointment}
					onPreviewUpdate={(duration: number) => {
						// Create or update preview when service is selected
						// This is the moment the preview appears - when user picks a service
						if (newAppointmentData) {
							setAppointmentPreview({
								practitionerId: newAppointmentData.practitioner.id,
								startTime: newAppointmentData.startTime,
								duration,
								date: newAppointmentData.date
							})
						}
					}}
					getShiftForDate={getShiftForDate}
					getAllShiftsForDate={getAllShiftsForDate}
					existingAppointments={appointmentsState}
					shifts={shifts}
					existingAppointment={newAppointmentData.existingAppointment}
				/>
			)}

			{/* Shift Edit Panel */}
			<ShiftEditPanel
				isOpen={showShiftPanel}
				onClose={() => {
					setShowShiftPanel(false)
					setSelectedShift(null)
					setShiftDragData(null)
					// Don't restore show/hide state here, keep showing shifts
				}}
				onSave={handleShiftSave}
				onDelete={handleShiftDelete}
				initialDate={shiftDragData?.date || selectedDate}
				initialPractitionerId={shiftDragData?.practitionerId}
				initialStartTime={shiftDragData?.startTime}
				initialEndTime={shiftDragData?.endTime}
				editingShift={selectedShift}
			/>

			{/* Modals */}
			<GoToDateModal
				isOpen={showGoToDate}
				onClose={() => setShowGoToDate(false)}
				onSelectDate={(date) => {
					setSelectedDate(date)
					if (view === 'week') {
						const weekStart = moment(date).startOf('week')
						const weekEnd = moment(date).endOf('week')
						const currentWeekStart = moment(weekDates[0])
						const currentWeekEnd = moment(weekDates[weekDates.length - 1])

						if (!moment(date).isBetween(currentWeekStart, currentWeekEnd, 'day', '[]')) {
							setSelectedDate(date)
						}
					}
				}}
				currentDate={selectedDate}
			/>

			<CalendarSettingsModal
				isOpen={showSettings}
				onClose={() => setShowSettings(false)}
				settings={calendarSettings}
				onUpdateSettings={setCalendarSettings}
			/>

			<WaitlistPanel
				isOpen={showWaitlist}
				onClose={() => {
					setShowWaitlist(false)
					// Clear drag state if closing while dragging
					setIsDraggingWaitlistPatient(false)
				}}
				practitioners={practitioners}
				onDragStart={() => setIsDraggingWaitlistPatient(true)}
				onDragEnd={() => setIsDraggingWaitlistPatient(false)}
				onPatientBooked={(patientId) => {
					// Decrement the waitlist count when a patient is booked
					setWaitlistCount(prev => Math.max(0, prev - 1))
				}}
				onBookPatient={(patient, practitionerId, startTime) => {
					const endTime = new Date(startTime)
					endTime.setMinutes(endTime.getMinutes() + patient.serviceDuration)

					const categoryColors = {
						injectables: '#8B5CF6',
						facial: '#F59E0B',
						laser: '#10B981',
						wellness: '#EC4899'
					}

					const newAppointment: Appointment = {
						id: Date.now().toString(),
						patientName: patient.name,
						serviceName: patient.requestedService,
						serviceCategory: patient.serviceCategory as 'physiotherapy' | 'chiropractic' | 'aesthetics' | 'massage',
						practitionerId: practitionerId,
						startTime: startTime,
						endTime: endTime,
						status: 'scheduled',
						color: categoryColors[patient.serviceCategory as keyof typeof categoryColors] || '#8B5CF6',
						duration: patient.serviceDuration,
						phone: patient.phone,
						email: patient.email,
						notes: `Booked from waitlist. ${patient.notes || ''}`,
						patientId: '',
						createdAt: new Date(),
						updatedAt: new Date()
					}

					setAppointments([...appointmentsState, newAppointment])
					setShowWaitlist(false)
					// Clear the drag state after booking to remove the "drop patient here" indicator
					setIsDraggingWaitlistPatient(false)
				}}
			/>

			<ResourcesPanel
				isOpen={showResources}
				onClose={() => setShowResources(false)}
				selectedDate={selectedDate}
				view={view}
				weekDates={weekDates}
			/>

			<RoomsPanel
				isOpen={showRoomsPanel}
				onClose={() => setShowRoomsPanel(false)}
				selectedDate={selectedDate}
				view={view}
				weekDates={weekDates}
			/>

			<GroupsPanel
				isOpen={showGroupsPanel}
				onClose={() => setShowGroupsPanel(false)}
				selectedDate={selectedDate}
				onCreateGroup={() => {
					setShowGroupsPanel(false)
					setShowGroupBooking(true)
				}}
				showToast={showToast}
			/>

			{/* Shift Delete Modal */}
			<ShiftDeleteModal
				isOpen={showShiftDeleteModal}
				onClose={() => {
					setShowShiftDeleteModal(false)
					setShiftToDelete(null)
				}}
				onDeleteSingle={() => {
					if (shiftToDelete) {
						handleShiftDelete(shiftToDelete.shift.id, false)
					}
				}}
				onDeleteAll={() => {
					if (shiftToDelete) {
						handleShiftDelete(shiftToDelete.shift.id, true)
					}
				}}
				shiftInfo={{
					date: shiftToDelete ? moment(shiftToDelete.shift.startAt).format('MMM DD, YYYY') : '',
					time: shiftToDelete ? moment(shiftToDelete.shift.startAt).format('h:mm A') : ''
				}}
			/>

			{/* Manage Shifts Modal */}
			<ManageShiftsModalV2
				isOpen={showManageShifts}
				onClose={() => {
					setShowManageShifts(false)
					// Restore previous show/hide state when closing without applying
					setShowShiftsOnly(previousShowShiftsOnly)
				}}
				onApply={(data) => {
					handleApplyShifts(data)
					// Keep showing shifts after applying
					setShowManageShifts(false)
					// Don't restore previous state, keep showing shifts
				}}
			/>

			{/* Practitioner Edit Modal */}
			{editingPractitioner && (
				<PractitionerEditModal
					isOpen={showPractitionerEdit}
					onClose={() => {
						setShowPractitionerEdit(false)
						setEditingPractitioner(null)
					}}
					practitioner={editingPractitioner}
					onSave={(updatedPractitioner) => {
						// In a real app, this would update the practitioner in the database
						// For now, just update the local practitioners array
						const practitionerIndex = practitioners.findIndex(p => p.id === updatedPractitioner.id)
						if (practitionerIndex !== -1) {
							practitioners[practitionerIndex] = updatedPractitioner
						}
						showToast(`✓ ${updatedPractitioner.name}'s settings updated`)
						setShowPractitionerEdit(false)
						setEditingPractitioner(null)
					}}
				/>
			)}

			{/* Express Booking Modal */}
			{expressBookingPractitioner && (
				<ExpressBookingModal
					isOpen={showExpressBooking}
					onClose={() => {
						setShowExpressBooking(false)
						setExpressBookingPractitioner(null)
					}}
					practitioner={expressBookingPractitioner}
					selectedDate={selectedDate}
					startTime={expressBookingTime}
					onSuccess={(data) => {
						showToast(`✓ Express booking sent to ${data.appointment.patientName}`)
						// Refresh appointments to show the new pending appointment
						setAppointments([...appointmentsState])
					}}
				/>
			)}

			{/* Group Booking Modal */}
			<GroupBookingModal
				isOpen={showGroupBooking}
				onClose={() => setShowGroupBooking(false)}
				selectedDate={selectedDate}
				onSuccess={(groupId) => {
					showToast(`✓ Group booking created successfully!`)
					// Refresh appointments to show the new group appointments
					setAppointments([...appointmentsState])
				}}
			/>

			{/* Walk-In Modal */}
			<WalkInModal
				isOpen={showWalkInModal}
				onClose={() => setShowWalkInModal(false)}
				selectedDate={selectedDate}
				selectedLocationId={selectedLocationId}
				existingAppointments={appointmentsState}
				onSuccess={(appointment) => {
					setAppointments([...appointmentsState, appointment])
					showToast(`✓ Walk-in added for ${appointment.patientName}`)
				}}
			/>

			{/* Auto-Fill Notification for Waitlist */}
			<AutoFillNotification
				suggestion={autoFillSuggestion}
				onBook={(patient) => {
					if (!autoFillSuggestion?.cancelledAppointment) return

					const cancelledApt = autoFillSuggestion.cancelledAppointment
					const endTime = new Date(cancelledApt.startTime)
					endTime.setMinutes(endTime.getMinutes() + patient.serviceDuration)

					const categoryColors: Record<string, string> = {
						injectables: '#8B5CF6',
						facial: '#F59E0B',
						laser: '#10B981',
						wellness: '#EC4899'
					}

					const newAppointment: Appointment = {
						id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
						patientName: patient.name,
						serviceName: patient.requestedService,
						serviceCategory: patient.serviceCategory as 'physiotherapy' | 'chiropractic' | 'aesthetics' | 'massage',
						practitionerId: cancelledApt.practitionerId,
						startTime: cancelledApt.startTime,
						endTime: endTime,
						status: 'scheduled',
						color: categoryColors[patient.serviceCategory] || '#8B5CF6',
						duration: patient.serviceDuration,
						phone: patient.phone,
						email: patient.email,
						notes: `Booked from waitlist (auto-fill). ${patient.notes || ''}`,
						patientId: patient.id,
						createdAt: new Date(),
						updatedAt: new Date()
					}

					setAppointments([...appointmentsState, newAppointment])
					setAutoFillSuggestion(null)
					setWaitlistCount(prev => Math.max(0, prev - 1))
					showToast(`✓ ${patient.name} booked from waitlist!`)
				}}
				onDismiss={() => setAutoFillSuggestion(null)}
				onViewWaitlist={() => {
					setAutoFillSuggestion(null)
					setShowWaitlist(true)
				}}
			/>
		</div>
	)
}
