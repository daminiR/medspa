// src/components/calendar/AppointmentBlock.tsx
'use client'

import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface AppointmentBlockProps {
	appointment: any
	onClick: () => void
}

export default function AppointmentBlock({ appointment, onClick }: AppointmentBlockProps) {
	const getStatusIcon = () => {
		switch (appointment.status) {
			case 'arrived':
				return <CheckCircle className="h-3 w-3 text-green-600" />
			case 'late':
				return <AlertCircle className="h-3 w-3 text-red-600" />
			default:
				return null
		}
	}

	// Calculate position based on time
	const getTopPosition = () => {
		const [time, period] = appointment.time.split(' ')
		const [hours, minutes] = time.split(':').map(Number)
		const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : hours
		const totalMinutes = (hour24 - 8) * 60 + minutes
		return (totalMinutes / 60) * 80 // 80px per hour
	}

	const height = (appointment.duration / 60) * 80 // 80px per hour

	return (
		<div
			className={`absolute left-1 right-1 ${appointment.color} ${appointment.borderColor} border-l-4 rounded cursor-pointer hover:shadow-md transition-shadow p-2`}
			style={{
				top: `${getTopPosition()}px`,
				height: `${height - 4}px`
			}}
			onClick={onClick}
		>
			<div className="flex items-start justify-between">
				<div className="flex-1 min-w-0">
					<p className="text-xs font-medium text-gray-900 truncate">
						{appointment.patientName}
					</p>
					<p className="text-xs text-gray-600 truncate">
						{appointment.service}
					</p>
				</div>
				{getStatusIcon()}
			</div>
			{appointment.duration > 30 && (
				<div className="flex items-center mt-1">
					<Clock className="h-3 w-3 mr-1 text-gray-500" />
					<span className="text-xs text-gray-500">{appointment.duration} min</span>
				</div>
			)}
		</div>
	)
}
