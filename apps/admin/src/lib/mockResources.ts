import {
  Resource,
  ResourcePool,
  Room,
  ResourceAssignment,
  ResourceAvailability,
  RoomAssignment,
  RoomAvailability,
  AvailabilityCheckOptions,
  TimeValidationResult,
  BookingAvailabilityResult
} from '@/types/resources'

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default buffer time in minutes between appointments if not specified */
const DEFAULT_BUFFER_MINUTES = 0

/** Minimum appointment duration in minutes */
const MIN_APPOINTMENT_DURATION_MINUTES = 5

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockResources: Resource[] = [
  {
    id: 'res-1',
    name: 'CO2 Laser 1',
    resourcePoolId: 'pool-1',
    locationId: 'loc-1',
    isActive: true,
    bufferMinutes: 10, // 10 min cleanup between uses
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'res-2',
    name: 'CO2 Laser 2',
    resourcePoolId: 'pool-1',
    locationId: 'loc-1',
    isActive: true,
    bufferMinutes: 10,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'res-3',
    name: 'X-Ray Machine',
    resourcePoolId: 'pool-2',
    locationId: 'loc-1',
    isActive: true,
    bufferMinutes: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'res-4',
    name: 'IPL Device',
    resourcePoolId: 'pool-3',
    locationId: 'loc-1',
    isActive: true,
    bufferMinutes: 15, // Longer cooldown for IPL
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
]

export const mockResourcePools: ResourcePool[] = [
  {
    id: 'pool-1',
    name: 'CO2 Lasers',
    description: 'Carbon dioxide laser machines for skin resurfacing',
    locationId: 'loc-1',
    resources: mockResources.filter(r => r.resourcePoolId === 'pool-1'),
    defaultBufferMinutes: 10,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'pool-2',
    name: 'X-Ray',
    description: 'X-Ray imaging equipment',
    locationId: 'loc-1',
    resources: mockResources.filter(r => r.resourcePoolId === 'pool-2'),
    defaultBufferMinutes: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'pool-3',
    name: 'IPL Devices',
    description: 'Intense Pulsed Light devices for various treatments',
    locationId: 'loc-1',
    resources: mockResources.filter(r => r.resourcePoolId === 'pool-3'),
    defaultBufferMinutes: 15,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
]

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: 'Treatment Room 1',
    locationId: 'loc-1',
    capacity: 1,
    isActive: true,
    bufferMinutes: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'room-2',
    name: 'Treatment Room 2',
    locationId: 'loc-1',
    capacity: 1,
    isActive: true,
    bufferMinutes: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'room-3',
    name: 'Treatment Room 3',
    locationId: 'loc-1',
    capacity: 1,
    isActive: true,
    bufferMinutes: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: 'room-4',
    name: 'Laser Suite',
    locationId: 'loc-1',
    capacity: 1,
    isActive: true,
    bufferMinutes: 10, // Longer buffer for laser room
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
]

// Mock static assignments (for demo purposes)
export const mockResourceAssignments: ResourceAssignment[] = [
  {
    resourceId: 'res-1',
    resourceName: 'CO2 Laser 1',
    resourcePoolId: 'pool-1',
    appointmentId: 'apt-1',
    startTime: new Date(2023, 7, 17, 10, 0),
    endTime: new Date(2023, 7, 17, 11, 0)
  },
  {
    resourceId: 'res-2',
    resourceName: 'CO2 Laser 2',
    resourcePoolId: 'pool-1',
    appointmentId: 'apt-2',
    startTime: new Date(2023, 7, 17, 10, 30),
    endTime: new Date(2023, 7, 17, 11, 30)
  }
]

// Mock room assignments
export const mockRoomAssignments: RoomAssignment[] = []

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates that the time range is valid (endTime > startTime, minimum duration)
 */
export function validateTimeRange(startTime: Date, endTime: Date): TimeValidationResult {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()

  if (isNaN(start) || isNaN(end)) {
    return { valid: false, error: 'Invalid date format' }
  }

  if (end <= start) {
    return { valid: false, error: 'End time must be after start time' }
  }

  const durationMinutes = (end - start) / (1000 * 60)
  if (durationMinutes < MIN_APPOINTMENT_DURATION_MINUTES) {
    return { valid: false, error: `Appointment must be at least ${MIN_APPOINTMENT_DURATION_MINUTES} minutes` }
  }

  return { valid: true }
}

/**
 * Checks if two time intervals overlap, accounting for buffer time
 * Uses the standard interval overlap formula: A.start < B.end AND A.end > B.start
 */
export function checkTimeOverlap(
  interval1Start: Date,
  interval1End: Date,
  interval2Start: Date,
  interval2End: Date,
  bufferMinutes: number = 0
): boolean {
  const start1 = new Date(interval1Start).getTime()
  const end1 = new Date(interval1End).getTime() + (bufferMinutes * 60 * 1000) // Add buffer to end
  const start2 = new Date(interval2Start).getTime()
  const end2 = new Date(interval2End).getTime()

  return start1 < end2 && end1 > start2
}

// ============================================================================
// RESOURCE AVAILABILITY
// ============================================================================

/**
 * Checks availability for all resources in a pool
 * @param resourcePoolId - The pool to check
 * @param startTime - Requested start time
 * @param endTime - Requested end time
 * @param options - Additional options for the check
 */
export function checkResourceAvailability(
  resourcePoolId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string,
  existingAppointments?: any[],
  options?: Partial<AvailabilityCheckOptions>
): ResourceAvailability[] {
  // Merge options with defaults
  const opts: AvailabilityCheckOptions = {
    includeInactive: false,
    bufferMinutes: undefined,
    excludeAppointmentId: excludeAppointmentId,
    existingAppointments: existingAppointments,
    ...options
  }

  // Validate time range first
  const timeValidation = validateTimeRange(startTime, endTime)
  if (!timeValidation.valid) {
    console.warn(`[ResourceAvailability] Invalid time range: ${timeValidation.error}`)
    return []
  }

  const pool = mockResourcePools.find(p => p.id === resourcePoolId)
  if (!pool) {
    console.warn(`[ResourceAvailability] Pool not found: ${resourcePoolId}`)
    return []
  }

  return pool.resources.map(resource => {
    // Check if resource is active
    if (!resource.isActive) {
      return {
        resourceId: resource.id,
        resourceName: resource.name,
        available: opts.includeInactive ? false : false,
        isActive: false,
        conflicts: [],
        unavailableReason: 'inactive' as const
      }
    }

    // Determine buffer time: option > resource > pool > default
    const bufferMinutes = opts.bufferMinutes ??
      resource.bufferMinutes ??
      pool.defaultBufferMinutes ??
      DEFAULT_BUFFER_MINUTES

    // Check static assignments
    const staticConflicts = mockResourceAssignments.filter(assignment => {
      if (assignment.resourceId !== resource.id) return false
      if (opts.excludeAppointmentId && assignment.appointmentId === opts.excludeAppointmentId) return false

      return checkTimeOverlap(
        startTime,
        endTime,
        assignment.startTime,
        assignment.endTime,
        bufferMinutes
      )
    })

    // Check actual appointments with assigned resources
    const appointmentConflicts: ResourceAssignment[] = []
    if (opts.existingAppointments) {
      opts.existingAppointments.forEach(apt => {
        if (apt.id === opts.excludeAppointmentId) return
        if (apt.status === 'cancelled' || apt.status === 'deleted' || apt.status === 'no_show') return
        if (!apt.assignedResources) return

        apt.assignedResources.forEach((res: any) => {
          if (res.resourceId === resource.id) {
            const hasOverlap = checkTimeOverlap(
              startTime,
              endTime,
              new Date(apt.startTime),
              new Date(apt.endTime),
              bufferMinutes
            )

            if (hasOverlap) {
              appointmentConflicts.push({
                resourceId: resource.id,
                resourceName: resource.name,
                resourcePoolId: resourcePoolId,
                appointmentId: apt.id,
                startTime: new Date(apt.startTime),
                endTime: new Date(apt.endTime)
              })
            }
          }
        })
      })
    }

    const allConflicts = [...staticConflicts, ...appointmentConflicts]

    return {
      resourceId: resource.id,
      resourceName: resource.name,
      available: allConflicts.length === 0,
      isActive: resource.isActive,
      conflicts: allConflicts,
      unavailableReason: allConflicts.length > 0 ? 'conflict' as const : undefined
    }
  }).filter(r => opts.includeInactive || r.isActive) // Filter inactive unless requested
}

/**
 * Finds an available resource from a pool
 */
export function findAvailableResource(
  resourcePoolId: string,
  startTime: Date,
  endTime: Date,
  options?: Partial<AvailabilityCheckOptions>
): Resource | null {
  const availabilities = checkResourceAvailability(
    resourcePoolId,
    startTime,
    endTime,
    options?.excludeAppointmentId,
    options?.existingAppointments,
    options
  )

  const availableResource = availabilities.find(a => a.available && a.isActive)

  if (!availableResource) return null

  return mockResources.find(r => r.id === availableResource.resourceId) || null
}

// ============================================================================
// ROOM AVAILABILITY
// ============================================================================

/**
 * Checks availability for a specific room
 */
export function checkRoomAvailability(
  roomId: string,
  startTime: Date,
  endTime: Date,
  options?: Partial<AvailabilityCheckOptions>
): RoomAvailability | null {
  // Validate time range
  const timeValidation = validateTimeRange(startTime, endTime)
  if (!timeValidation.valid) {
    console.warn(`[RoomAvailability] Invalid time range: ${timeValidation.error}`)
    return null
  }

  const room = mockRooms.find(r => r.id === roomId)
  if (!room) {
    console.warn(`[RoomAvailability] Room not found: ${roomId}`)
    return null
  }

  // Check if room is active
  if (!room.isActive) {
    return {
      roomId: room.id,
      roomName: room.name,
      available: false,
      isActive: false,
      conflicts: [],
      unavailableReason: 'inactive'
    }
  }

  const bufferMinutes = options?.bufferMinutes ?? room.bufferMinutes ?? DEFAULT_BUFFER_MINUTES

  // Check static room assignments
  const staticConflicts = mockRoomAssignments.filter(assignment => {
    if (assignment.roomId !== room.id) return false
    if (options?.excludeAppointmentId && assignment.appointmentId === options.excludeAppointmentId) return false

    return checkTimeOverlap(
      startTime,
      endTime,
      assignment.startTime,
      assignment.endTime,
      bufferMinutes
    )
  })

  // Check appointments with assigned rooms
  const appointmentConflicts: RoomAssignment[] = []
  if (options?.existingAppointments) {
    options.existingAppointments.forEach(apt => {
      if (apt.id === options.excludeAppointmentId) return
      if (apt.status === 'cancelled' || apt.status === 'deleted' || apt.status === 'no_show') return
      if (apt.roomId !== room.id) return

      const hasOverlap = checkTimeOverlap(
        startTime,
        endTime,
        new Date(apt.startTime),
        new Date(apt.endTime),
        bufferMinutes
      )

      if (hasOverlap) {
        appointmentConflicts.push({
          roomId: room.id,
          roomName: room.name,
          appointmentId: apt.id,
          startTime: new Date(apt.startTime),
          endTime: new Date(apt.endTime)
        })
      }
    })
  }

  const allConflicts = [...staticConflicts, ...appointmentConflicts]

  return {
    roomId: room.id,
    roomName: room.name,
    available: allConflicts.length === 0,
    isActive: room.isActive,
    conflicts: allConflicts,
    unavailableReason: allConflicts.length > 0 ? 'conflict' : undefined
  }
}

/**
 * Finds an available room from the list
 */
export function findAvailableRoom(
  startTime: Date,
  endTime: Date,
  options?: Partial<AvailabilityCheckOptions> & { preferredRoomIds?: string[] }
): Room | null {
  const activeRooms = mockRooms.filter(r => r.isActive)

  // Sort by preference if provided
  const sortedRooms = options?.preferredRoomIds
    ? [
      ...activeRooms.filter(r => options.preferredRoomIds!.includes(r.id)),
      ...activeRooms.filter(r => !options.preferredRoomIds!.includes(r.id))
    ]
    : activeRooms

  for (const room of sortedRooms) {
    const availability = checkRoomAvailability(room.id, startTime, endTime, options)
    if (availability?.available) {
      return room
    }
  }

  return null
}

// ============================================================================
// COMPREHENSIVE BOOKING CHECK
// ============================================================================

/**
 * Comprehensive availability check for booking - checks both resources and room
 */
export function checkBookingAvailability(
  resourceRequirements: { resourcePoolId: string; quantity: number }[],
  roomId: string | null,
  startTime: Date,
  endTime: Date,
  options?: Partial<AvailabilityCheckOptions>
): BookingAvailabilityResult {
  const errors: string[] = []

  // Validate time range
  const timeValidation = validateTimeRange(startTime, endTime)
  if (!timeValidation.valid) {
    return {
      resourcesAvailable: false,
      roomAvailable: false,
      allAvailable: false,
      resources: [],
      errors: [timeValidation.error!]
    }
  }

  // Check resources
  const allResourceAvailabilities: ResourceAvailability[] = []
  let resourcesAvailable = true

  for (const req of resourceRequirements) {
    const poolAvailability = checkResourceAvailability(
      req.resourcePoolId,
      startTime,
      endTime,
      options?.excludeAppointmentId,
      options?.existingAppointments,
      options
    )

    allResourceAvailabilities.push(...poolAvailability)

    const availableInPool = poolAvailability.filter(a => a.available && a.isActive)
    if (availableInPool.length < req.quantity) {
      resourcesAvailable = false
      const pool = mockResourcePools.find(p => p.id === req.resourcePoolId)
      errors.push(
        `Insufficient ${pool?.name || 'resources'}: need ${req.quantity}, only ${availableInPool.length} available`
      )
    }
  }

  // Check room if specified
  let roomAvailability: RoomAvailability | undefined
  let roomAvailable = true

  if (roomId) {
    const roomCheck = checkRoomAvailability(roomId, startTime, endTime, options)
    if (roomCheck) {
      roomAvailability = roomCheck
      roomAvailable = roomCheck.available
      if (!roomAvailable) {
        const room = mockRooms.find(r => r.id === roomId)
        errors.push(`${room?.name || 'Room'} is not available at this time`)
      }
    } else {
      roomAvailable = false
      errors.push('Room not found')
    }
  }

  return {
    resourcesAvailable,
    roomAvailable,
    allAvailable: resourcesAvailable && roomAvailable,
    resources: allResourceAvailabilities,
    room: roomAvailability,
    errors
  }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Get all active resources
 */
export function getActiveResources(): Resource[] {
  return mockResources.filter(r => r.isActive)
}

/**
 * Get all active rooms
 */
export function getActiveRooms(): Room[] {
  return mockRooms.filter(r => r.isActive)
}

/**
 * Get resource by ID
 */
export function getResourceById(resourceId: string): Resource | null {
  return mockResources.find(r => r.id === resourceId) || null
}

/**
 * Get room by ID
 */
export function getRoomById(roomId: string): Room | null {
  return mockRooms.find(r => r.id === roomId) || null
}

/**
 * Get pool by ID
 */
export function getPoolById(poolId: string): ResourcePool | null {
  return mockResourcePools.find(p => p.id === poolId) || null
}
