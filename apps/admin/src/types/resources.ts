export interface Resource {
  id: string
  name: string
  resourcePoolId: string
  locationId: string
  isActive: boolean
  /** Buffer time in minutes needed after use (cleanup/reset) */
  bufferMinutes?: number
  createdAt: Date
  updatedAt: Date
}

export interface ResourcePool {
  id: string
  name: string
  description?: string
  locationId: string
  resources: Resource[]
  /** Default buffer time for all resources in this pool (can be overridden per resource) */
  defaultBufferMinutes?: number
  createdAt: Date
  updatedAt: Date
}

export interface ResourceRequirement {
  resourcePoolId: string
  quantity: number
}

export interface ResourceAssignment {
  resourceId: string
  resourceName: string
  resourcePoolId: string
  appointmentId: string
  startTime: Date
  endTime: Date
}

export interface ResourceAvailability {
  resourceId: string
  resourceName: string
  available: boolean
  isActive: boolean
  conflicts: ResourceAssignment[]
  /** Reason why resource is unavailable (if not available) */
  unavailableReason?: 'conflict' | 'inactive' | 'maintenance'
}

export interface Room {
  id: string
  name: string
  locationId: string
  capacity?: number
  isActive: boolean
  /** Buffer time in minutes needed between appointments */
  bufferMinutes?: number
  createdAt: Date
  updatedAt: Date
}

export interface RoomAssignment {
  roomId: string
  roomName?: string
  appointmentId: string
  practitionerId?: string
  startTime: Date
  endTime: Date
  serviceName?: string
}

export interface RoomAvailability {
  roomId: string
  roomName: string
  available: boolean
  isActive: boolean
  conflicts: RoomAssignment[]
  unavailableReason?: 'conflict' | 'inactive' | 'maintenance'
}

/**
 * Configuration options for availability checking
 */
export interface AvailabilityCheckOptions {
  /** Buffer time in minutes to add after each booking (overrides resource/pool default) */
  bufferMinutes?: number
  /** Whether to include inactive resources in results (default: false) */
  includeInactive?: boolean
  /** Appointment ID to exclude from conflict checking (for editing existing appointments) */
  excludeAppointmentId?: string
  /** Existing appointments to check against */
  existingAppointments?: any[]
}

/**
 * Result of a time validation check
 */
export interface TimeValidationResult {
  valid: boolean
  error?: string
}

/**
 * Comprehensive availability result for booking
 */
export interface BookingAvailabilityResult {
  resourcesAvailable: boolean
  roomAvailable: boolean
  allAvailable: boolean
  resources: ResourceAvailability[]
  room?: RoomAvailability
  errors: string[]
}