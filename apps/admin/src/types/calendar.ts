import { Appointment, Break, Service } from '@/lib/data'

// Shift interface
export interface Shift {
	practitionerId: string
	dayOfWeek: number // 0-6
	startHour: number
	startMinute: number
	endHour: number
	endMinute: number
}

// Available slot interface
export interface AvailableSlot {
	practitionerId: string
	date: Date
	startTime: Date
	endTime: Date
	duration: number
}

// Continuous slot block for better visualization
export interface ContinuousSlotBlock {
	practitionerId: string
	date: Date
	startTime: Date
	endTime: Date
	slots: AvailableSlot[]
}

// Calendar Settings interface
export interface CalendarSettings {
	showStaffPhotos: boolean
	showWeekends: boolean
	groupByDiscipline: boolean
	zoomLevel: number
	showServiceIcons: boolean
	showDuration: boolean
	compactView: boolean
	timeSlotHeight: string
	colorByService: boolean
	showPhoneNumbers: boolean
	autoRefresh: boolean
	refreshInterval: number
	startHour: number
	endHour: number
	showCancelledAppointments: boolean
	showDeletedAppointments: boolean
}

// New appointment data interface
export interface NewAppointmentData {
	practitioner: any
	startTime: { hour: number; minute: number }
	date: Date
	selectedService?: Service
	existingAppointment?: any
	draggedDuration?: number
}

// Drag state interface
export interface DragState {
	practitionerId: string
	y: number
	time: { hour: number; minute: number }
}

// Toast notification interface
export interface Toast {
	message: string
	visible: boolean
}

// Time adjustment result
export interface TimeAdjustmentResult {
	startTime: { hour: number; minute: number }
	duration: number
	adjusted: boolean
	shiftInfo?: {
		start: string
		end: string
	}
}

// Reserved slot interface (for showing slot being booked)
export interface ReservedSlot {
	practitionerId: string
	startTime: Date
	endTime: Date
	date: Date
}

// Calendar view props
export interface CalendarViewProps {
	selectedPractitionerIds?: string[]
	viewMode?: 'all' | 'single'
	singlePractitionerId?: string | null
	onShowAll?: () => void
	onUpdateSelectedPractitioners?: (ids: string[]) => void
	selectedServiceFromSidebar?: { practitionerId: string; service: Service } | null
	onClearServiceSelection?: () => void
	createMode?: CreateMode
	onCreateModeChange?: (mode: CreateMode) => void
	breakType?: BreakType
	onBreakTypeChange?: (type: BreakType) => void
}

// View modes
export type ViewMode = 'day' | 'week' | 'month'

// Month view specific types
export interface MonthViewDayCell {
	date: Date
	isCurrentMonth: boolean
	isToday: boolean
	isWeekend: boolean
	appointments: Appointment[]
	breaks: Break[]
}
export type CalendarViewType = 'practitioners' | 'rooms'
export type CreateMode = 'appointment' | 'break' | 'none'
export type BreakType = 'lunch' | 'personal' | 'meeting' | 'training' | 'out_of_office' | 'other'
