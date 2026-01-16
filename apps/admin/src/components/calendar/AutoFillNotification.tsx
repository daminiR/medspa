// src/components/calendar/AutoFillNotification.tsx
'use client'

import { X, UserPlus, Clock, CheckCircle, MessageSquare } from 'lucide-react'
import moment from 'moment'
import { WaitlistPatient } from '@/lib/data/waitlist'
import { AutoFillSuggestion, WaitlistMatch } from '@/utils/waitlistAutoFill'
import { Appointment } from '@/lib/data'

interface CancelledAppointmentSlot {
	startTime: Date
	endTime: Date
	duration: number
	practitionerId: string
	practitionerName?: string
	serviceName?: string
}

interface AutoFillNotificationProps {
	suggestion: AutoFillSuggestion | null
	onBook: (patient: WaitlistPatient) => void
	onDismiss: () => void
	onViewWaitlist: () => void
	onSendOffer?: (patient: WaitlistPatient, slot: CancelledAppointmentSlot) => void
}

export default function AutoFillNotification({
	suggestion,
	onBook,
	onDismiss,
	onViewWaitlist,
	onSendOffer
}: AutoFillNotificationProps) {
	if (!suggestion || !suggestion.topMatch) return null

	const { topMatch, cancelledAppointment, matches } = suggestion
	const { patient, matchReasons } = topMatch
	const time = moment(cancelledAppointment.startTime).format('h:mm A')
	const date = moment(cancelledAppointment.startTime).format('MMM D')

	// Create slot object for onSendOffer
	const appointmentSlot: CancelledAppointmentSlot = {
		startTime: cancelledAppointment.startTime,
		endTime: cancelledAppointment.endTime,
		duration: cancelledAppointment.duration,
		practitionerId: cancelledAppointment.practitionerId,
		serviceName: cancelledAppointment.serviceName
	}

	return (
		<div className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 animate-slide-up">
			<div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-[384px] ml-auto overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-2 text-white">
						<UserPlus className="h-5 w-5" />
						<span className="font-semibold">Waitlist Match Found</span>
					</div>
					<button
						onClick={onDismiss}
						className="text-white/80 hover:text-white transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Content */}
				<div className="p-4">
					{/* Slot info */}
					<div className="text-sm text-gray-500 mb-3 flex items-center gap-1">
						<Clock className="h-4 w-4" />
						<span>Cancelled slot: {date} at {time} ({cancelledAppointment.duration}min)</span>
					</div>

					{/* Patient card */}
					<div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
						<div className="flex items-start justify-between">
							<div>
								<h4 className="font-semibold text-gray-900">{patient.name}</h4>
								<p className="text-sm text-gray-600">{patient.requestedService}</p>
								<p className="text-xs text-gray-500 mt-1">{patient.serviceDuration} minutes</p>
							</div>
							<div className={`px-2 py-0.5 rounded text-xs font-medium ${
								patient.priority === 'high' ? 'bg-red-100 text-red-700' :
								patient.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
								'bg-gray-100 text-gray-700'
							}`}>
								{patient.priority}
							</div>
						</div>

						{/* Match reasons */}
						<div className="flex flex-wrap gap-1 mt-2">
							{matchReasons.slice(0, 3).map((reason, idx) => (
								<span key={idx} className="inline-flex items-center gap-1 text-xs bg-white rounded px-2 py-0.5 text-purple-700 border border-purple-200">
									<CheckCircle className="h-3 w-3" />
									{reason}
								</span>
							))}
						</div>
					</div>

					{/* Additional matches indicator */}
					{matches.length > 1 && (
						<p className="text-xs text-gray-500 mt-2 text-center">
							+{matches.length - 1} other potential match{matches.length > 2 ? 'es' : ''} on waitlist
						</p>
					)}
				</div>

				{/* Actions */}
				<div className="border-t border-gray-100 px-4 py-3 flex gap-2">
					<button
						onClick={() => onBook(patient)}
						className="flex-1 bg-purple-600 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
					>
						<UserPlus className="h-4 w-4" />
						Book {patient.name.split(' ')[0]}
					</button>
					{onSendOffer && (
						<button
							onClick={() => onSendOffer(patient, appointmentSlot)}
							className="flex-1 bg-blue-600 text-white rounded-md py-2 px-4 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
						>
							<MessageSquare className="h-4 w-4" />
							Send SMS Offer
						</button>
					)}
					<button
						onClick={onViewWaitlist}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
					>
						View All
					</button>
				</div>
			</div>
		</div>
	)
}
