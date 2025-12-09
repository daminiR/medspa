import { useState, useCallback } from 'react'
import moment from 'moment'
import {
	CalendarSettings,
	ViewMode,
	CreateMode,
	Toast,
	NewAppointmentData,
	DragState
} from '@/types/calendar'
import { Appointment, Break } from '@/lib/data'

export const useCalendarState = (initialDate: Date) => {
	// Date and view state
	const [selectedDate, setSelectedDate] = useState(initialDate)
	const [view, setView] = useState<ViewMode>('day')
	const [createMode, setCreateMode] = useState<CreateMode>('appointment')

	// Selection state
	const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
	const [selectedBreak, setSelectedBreak] = useState<Break | null>(null)

	// Modal states
	const [showAppointmentSidebar, setShowAppointmentSidebar] = useState(false)
	const [newAppointmentData, setNewAppointmentData] = useState<NewAppointmentData | null>(null)
	const [showGoToDate, setShowGoToDate] = useState(false)
	const [showSettings, setShowSettings] = useState(false)
	const [showWaitlist, setShowWaitlist] = useState(false)
	const [showShiftsOnly, setShowShiftsOnly] = useState(false)
	const [waitlistCount, setWaitlistCount] = useState(3) // Initialize with 3 for demo

	// Drag states
	const [isDragging, setIsDragging] = useState(false)
	const [dragStart, setDragStart] = useState<DragState | null>(null)
	const [dragEnd, setDragEnd] = useState<{ y: number; time: { hour: number; minute: number } } | null>(null)
	const [isDraggingWaitlistPatient, setIsDraggingWaitlistPatient] = useState(false)
	const [dropTargetInfo, setDropTargetInfo] = useState<{ practitionerId: string; time: Date } | null>(null)
	
	// Double booking mode
	const [doubleBookingMode, setDoubleBookingMode] = useState(false)

	// Toast state
	const [toast, setToast] = useState<Toast>({ message: '', visible: false })

	// Calendar settings
	const [calendarSettings, setCalendarSettings] = useState<CalendarSettings>({
		showStaffPhotos: false,
		showWeekends: true,
		groupByDiscipline: false,
		zoomLevel: 100,
		showServiceIcons: true,
		showDuration: true,
		compactView: false,
		timeSlotHeight: 'medium',
		colorByService: true,
		showPhoneNumbers: false,
		autoRefresh: false,
		refreshInterval: 5,
		startHour: 8,
		endHour: 20,
		showCancelledAppointments: true,
		showDeletedAppointments: false
	})

	// Navigation handlers
	const handleNavigate = useCallback((action: 'PREV' | 'NEXT' | 'TODAY') => {
		if (action === 'PREV') {
			setSelectedDate(moment(selectedDate).subtract(1, view === 'week' ? 'week' : 'day').toDate())
		} else if (action === 'NEXT') {
			setSelectedDate(moment(selectedDate).add(1, view === 'week' ? 'week' : 'day').toDate())
		} else {
			setSelectedDate(initialDate)
		}
	}, [selectedDate, view, initialDate])

	// Show toast notification
	const showToast = useCallback((message: string) => {
		setToast({ message, visible: true })
		setTimeout(() => setToast({ message: '', visible: false }), 3000)
	}, [])

	// Clear all selections
	const clearSelections = useCallback(() => {
		setSelectedAppointment(null)
		setSelectedBreak(null)
		setShowAppointmentSidebar(false)
		setNewAppointmentData(null)
	}, [])

	return {
		// Date and view
		selectedDate,
		setSelectedDate,
		view,
		setView,
		createMode,
		setCreateMode,

		// Selections
		selectedAppointment,
		setSelectedAppointment,
		selectedBreak,
		setSelectedBreak,

		// Modals
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

		// Drag state
		isDragging,
		setIsDragging,
		dragStart,
		setDragStart,
		dragEnd,
		setDragEnd,
		isDraggingWaitlistPatient,
		setIsDraggingWaitlistPatient,
		dropTargetInfo,
		setDropTargetInfo,

		// Toast
		toast,
		showToast,

		// Settings
		calendarSettings,
		setCalendarSettings,
		
		// Double booking mode
		doubleBookingMode,
		setDoubleBookingMode,

		// Methods
		handleNavigate,
		clearSelections
	}
}
