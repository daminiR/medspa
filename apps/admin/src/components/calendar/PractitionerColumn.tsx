// src/components/calendar/PractitionerColumn.tsx
'use client'

import AppointmentBlock from './AppointmentBlock'
import { getAppointmentsByPractitioner, type Practitioner, type Appointment } from '@/lib/data'

interface PractitionerColumnProps {
	practitioner: Practitioner
	onAppointmentClick: (appointment: Appointment) => void
}

export default function PractitionerColumn({ practitioner, onAppointmentClick }: PractitionerColumnProps) {
	const appointments = getAppointmentsByPractitioner(practitioner.id)

	return (
		<div className="flex-1 min-w-[180px] border-r">
			{/* Header */}
			<div className="h-12 border-b bg-white flex items-center justify-center px-2">
				<div className="text-center">
					<p className="text-xs font-medium text-gray-900">{practitioner.name}</p>
				</div>
			</div>

			{/* Time Grid */}
			<div className="relative">
				{/* Hour blocks */}
				{Array.from({ length: 13 }, (_, i) => (
					<div key={i} className="h-20 border-b"></div>
				))}

				{/* Appointments */}
				{appointments.map((appointment) => (
					<AppointmentBlock
						key={appointment.id}
						appointment={appointment}
						onClick={() => onAppointmentClick(appointment)}
					/>
				))}
			</div>
		</div>
	)
}
