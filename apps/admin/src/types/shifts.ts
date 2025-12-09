export interface Shift {
	id: string
	practitionerId: string
	startAt: Date
	endAt: Date
	repeat: 'no-repeat' | 'weekly' | 'biweekly'
	repeatUntil?: Date
	seriesId?: string
	room?: string
	bookingOptions: 'bookable' | 'not-bookable' | 'contact-to-book'
	
	// NEW: Equipment & Service System
	availableEquipment?: string[] // Equipment available during this shift (e.g., ["CO2-laser", "IPL-machine"])
	assignedServices?: string[] // Optional list of service IDs this shift is dedicated to
	
	// LEGACY: Keep for backward compatibility
	tags?: string[] // Tags to restrict which services can be booked
	
	notes?: string
	createdBy?: string
	createdAt?: Date
	updatedBy?: string
	updatedAt?: Date
}

export interface ShiftSeries {
	id: string
	practitionerId: string
	startTime: { hour: number; minute: number }
	endTime: { hour: number; minute: number }
	dayOfWeek: number
	repeat: 'weekly' | 'biweekly'
	repeatUntil: Date
	room?: string
	bookingOptions: 'bookable' | 'not-bookable' | 'contact-to-book'
	
	// NEW: Equipment & Service System
	availableEquipment?: string[]
	assignedServices?: string[]
	
	// LEGACY: Keep for backward compatibility
	tags?: string[]
	
	notes?: string
}

export interface ShiftFormData {
	practitionerId: string
	startTime: { hour: number; minute: number }
	endTime: { hour: number; minute: number }
	date: Date
	repeat: 'no-repeat' | 'weekly' | 'biweekly'
	repeatUntil?: Date
	room?: string
	bookingOptions: 'bookable' | 'not-bookable' | 'contact-to-book'
	
	// NEW: Equipment & Service System
	availableEquipment?: string[]
	assignedServices?: string[]
	
	// LEGACY: Keep for backward compatibility
	tags?: string[]
	
	notes?: string
}
