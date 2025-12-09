// src/lib/constants.ts
export const SERVICE_COLORS = {
	'botox': { bg: 'bg-purple-200', border: 'border-purple-500', text: 'text-purple-900' },
	'filler': { bg: 'bg-pink-200', border: 'border-pink-500', text: 'text-pink-900' },
	'laser': { bg: 'bg-blue-200', border: 'border-blue-500', text: 'text-blue-900' },
	'facial': { bg: 'bg-green-200', border: 'border-green-500', text: 'text-green-900' },
	'massage': { bg: 'bg-yellow-200', border: 'border-yellow-500', text: 'text-yellow-900' },
	'consultation': { bg: 'bg-gray-200', border: 'border-gray-500', text: 'text-gray-900' },
}

export const APPOINTMENT_STATUSES = {
	'scheduled': { label: 'Scheduled', color: 'gray' },
	'confirmed': { label: 'Confirmed', color: 'blue' },
	'arrived': { label: 'Arrived', color: 'green' },
	'in-progress': { label: 'In Progress', color: 'yellow' },
	'completed': { label: 'Completed', color: 'gray' },
	'cancelled': { label: 'Cancelled', color: 'red' },
	'no-show': { label: 'No Show', color: 'red' },
}
