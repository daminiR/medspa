'use client'

import { useState, useEffect } from 'react'
import { X, Send, Clock, MessageSquare, Mail, Phone, Calendar, User, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import moment from 'moment'
import toast from 'react-hot-toast'
import { WaitlistPatient } from '@/lib/data/waitlist'
import { waitlistSmsTemplates, WaitlistTier } from '@/lib/waitlist'

interface AppointmentSlot {
	startTime: Date
	endTime: Date
	duration: number
	practitionerId: string
	practitionerName?: string
	serviceName?: string
}

interface WaitlistOfferModalProps {
	isOpen: boolean
	onClose: () => void
	patient: WaitlistPatient | null
	slot: AppointmentSlot | null
	practitioners?: Array<{ id: string; name: string }>
	onSendOffer: (data: {
		patient: WaitlistPatient
		slot: AppointmentSlot
		expiryMinutes: number
		sendEmail: boolean
		customMessage?: string
	}) => Promise<void>
}

export default function WaitlistOfferModal({
	isOpen,
	onClose,
	patient,
	slot,
	practitioners = [],
	onSendOffer
}: WaitlistOfferModalProps) {
	const [expiryMinutes, setExpiryMinutes] = useState<number>(30)
	const [sendEmail, setSendEmail] = useState<boolean>(false)
	const [customMessage, setCustomMessage] = useState<string>('')
	const [useCustomMessage, setUseCustomMessage] = useState<boolean>(false)
	const [isSending, setIsSending] = useState<boolean>(false)

	// Reset state when modal opens with new patient
	useEffect(() => {
		if (isOpen && patient) {
			setExpiryMinutes(30)
			setSendEmail(!!patient.email)
			setCustomMessage('')
			setUseCustomMessage(false)
			setIsSending(false)
		}
	}, [isOpen, patient])

	if (!isOpen || !patient || !slot) return null

	// Get practitioner name
	const practitioner = practitioners.find(p => p.id === slot.practitionerId)
	const practitionerName = slot.practitionerName || practitioner?.name || 'Your Provider'

	// Format slot details
	const slotDate = moment(slot.startTime).format('MMMM D, YYYY')
	const slotTime = moment(slot.startTime).format('h:mm A')
	const serviceName = slot.serviceName || patient.requestedService

	// Generate SMS preview
	const smsPreview = useCustomMessage && customMessage
		? customMessage
		: waitlistSmsTemplates.slotOffer(
			patient.name.split(' ')[0],
			serviceName,
			moment(slot.startTime).format('MMM D'),
			slotTime,
			practitionerName,
			expiryMinutes,
			'[link]'
		)

	// Mask phone number for display
	const maskedPhone = patient.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) ***-$3')

	// Handle send offer
	const handleSendOffer = async () => {
		setIsSending(true)

		try {
			await onSendOffer({
				patient,
				slot,
				expiryMinutes,
				sendEmail,
				customMessage: useCustomMessage ? customMessage : undefined
			})

			toast.success(`Offer sent to ${patient.name}!`, {
				duration: 4000,
				icon: '📱'
			})

			onClose()
		} catch (error) {
			console.error('Failed to send offer:', error)
			toast.error('Failed to send offer. Please try again.', {
				duration: 4000
			})
		} finally {
			setIsSending(false)
		}
	}

	// Get tier badge color
	const getTierBadgeColor = (tier?: WaitlistTier) => {
		switch (tier) {
			case 'platinum': return 'bg-purple-100 text-purple-700'
			case 'gold': return 'bg-yellow-100 text-yellow-700'
			case 'silver': return 'bg-gray-100 text-gray-600'
			default: return 'bg-gray-100 text-gray-600'
		}
	}

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black bg-opacity-50 z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[500px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2 text-white">
							<MessageSquare className="h-5 w-5" />
							<h2 className="text-lg font-semibold">Send SMS Offer</h2>
						</div>
						<button
							onClick={onClose}
							className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
						>
							<X className="h-5 w-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 space-y-6">
					{/* Patient Info Card */}
					<div className="bg-gray-50 rounded-lg p-4">
						<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
							<User className="h-4 w-4" />
							Patient Information
						</h3>
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="font-medium text-gray-900">{patient.name}</span>
								{patient.tier && (
									<span className={`text-xs px-2 py-0.5 rounded ${getTierBadgeColor(patient.tier)}`}>
										{patient.tier.charAt(0).toUpperCase() + patient.tier.slice(1)}
									</span>
								)}
							</div>
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<Phone className="h-3 w-3" />
								<span>{maskedPhone}</span>
							</div>
							{patient.email && (
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Mail className="h-3 w-3" />
									<span>{patient.email}</span>
								</div>
							)}
						</div>
					</div>

					{/* Slot Details Card */}
					<div className="bg-blue-50 rounded-lg p-4">
						<h3 className="text-sm font-medium text-blue-700 mb-3 flex items-center gap-2">
							<Calendar className="h-4 w-4" />
							Appointment Slot
						</h3>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-600">Service:</span>
								<span className="font-medium text-gray-900">{serviceName}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Date:</span>
								<span className="font-medium text-gray-900">{slotDate}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Time:</span>
								<span className="font-medium text-gray-900">{slotTime}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Duration:</span>
								<span className="font-medium text-gray-900">{slot.duration} minutes</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Provider:</span>
								<span className="font-medium text-gray-900">{practitionerName}</span>
							</div>
						</div>
					</div>

					{/* Offer Settings */}
					<div>
						<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Offer Expiry Time
						</h3>
						<div className="flex gap-2">
							{[15, 30, 60].map((minutes) => (
								<button
									key={minutes}
									onClick={() => setExpiryMinutes(minutes)}
									className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
										expiryMinutes === minutes
											? 'bg-blue-600 text-white'
											: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
									}`}
								>
									{minutes} min
								</button>
							))}
						</div>
						<p className="text-xs text-gray-500 mt-2">
							Offer will expire at {moment().add(expiryMinutes, 'minutes').format('h:mm A')}
						</p>
					</div>

					{/* Email Option */}
					{patient.email && (
						<div className="flex items-center gap-3">
							<input
								type="checkbox"
								id="sendEmail"
								checked={sendEmail}
								onChange={(e) => setSendEmail(e.target.checked)}
								className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
							/>
							<label htmlFor="sendEmail" className="flex items-center gap-2 text-sm text-gray-700">
								<Mail className="h-4 w-4" />
								Also send email notification
							</label>
						</div>
					)}

					{/* SMS Preview */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-sm font-medium text-gray-700">SMS Preview</h3>
							<button
								onClick={() => setUseCustomMessage(!useCustomMessage)}
								className="text-xs text-blue-600 hover:text-blue-700"
							>
								{useCustomMessage ? 'Use default message' : 'Customize message'}
							</button>
						</div>

						{useCustomMessage ? (
							<textarea
								value={customMessage}
								onChange={(e) => setCustomMessage(e.target.value)}
								placeholder="Enter custom message..."
								className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
								rows={4}
							/>
						) : (
							<div className="bg-gray-100 rounded-lg p-3">
								<div className="bg-white rounded-lg p-3 shadow-sm">
									<p className="text-sm text-gray-700 leading-relaxed">{smsPreview}</p>
								</div>
								<div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
									<CheckCircle className="h-3 w-3" />
									<span>{smsPreview.length} characters</span>
								</div>
							</div>
						)}
					</div>

					{/* Warning if offer already pending */}
					{patient.pendingOffer && (
						<div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
							<AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-yellow-800">Pending offer exists</p>
								<p className="text-xs text-yellow-700 mt-1">
									This patient already has a pending offer. Sending a new offer will supersede the existing one.
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t bg-gray-50 px-6 py-4 rounded-b-lg">
					<div className="flex justify-between items-center">
						<button
							onClick={onClose}
							className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
							disabled={isSending}
						>
							Cancel
						</button>
						<button
							onClick={handleSendOffer}
							disabled={isSending || (useCustomMessage && !customMessage.trim())}
							className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
						>
							{isSending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Sending...
								</>
							) : (
								<>
									<Send className="h-4 w-4" />
									Send Offer
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</>
	)
}
