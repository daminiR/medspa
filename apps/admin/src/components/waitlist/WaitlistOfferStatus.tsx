'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, X, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2, Wifi, WifiOff } from 'lucide-react'
import moment from 'moment'
import toast from 'react-hot-toast'
import { WaitlistOffer, WaitlistOfferStatus as OfferStatus } from '@/lib/waitlist'
import { useWaitlistOffersRealtime, websocketService } from '@/services/websocket'

interface WaitlistOfferStatusProps {
	isOpen: boolean
	onClose: () => void
	offers?: WaitlistOffer[]
	onRefresh?: () => Promise<WaitlistOffer[]>
	onCancelOffer?: (offerId: string) => Promise<void>
	onViewPatient?: (patientId: string) => void
	locationId?: string
}

// Mock offers for demo purposes (used when Firestore is not connected)
const mockOffers: WaitlistOffer[] = [
	{
		id: 'offer_1',
		waitlistEntryId: '1',
		patientId: '1',
		patientName: 'Emma Thompson',
		patientPhone: '(555) 123-4567',
		patientEmail: 'emma.t@example.com',
		appointmentSlot: {
			practitionerId: '1',
			practitionerName: 'Dr. Sarah Johnson',
			date: new Date(),
			startTime: new Date(new Date().setHours(14, 0, 0, 0)),
			endTime: new Date(new Date().setHours(14, 30, 0, 0)),
			serviceName: 'Botox Treatment',
			duration: 30
		},
		offerToken: 'abc123',
		expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min from now
		status: 'pending',
		sentAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
		sentVia: 'sms',
		cascadeLevel: 0
	},
	{
		id: 'offer_2',
		waitlistEntryId: '2',
		patientId: '2',
		patientName: 'Michael Chen',
		patientPhone: '(555) 234-5678',
		appointmentSlot: {
			practitionerId: '2',
			practitionerName: 'Dr. Emily Wilson',
			date: new Date(),
			startTime: new Date(new Date().setHours(15, 0, 0, 0)),
			endTime: new Date(new Date().setHours(16, 0, 0, 0)),
			serviceName: 'Chemical Peel',
			duration: 60
		},
		offerToken: 'def456',
		expiresAt: new Date(Date.now() + 25 * 60 * 1000), // 25 min from now
		status: 'pending',
		sentAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
		sentVia: 'both',
		cascadeLevel: 0
	}
]

export default function WaitlistOfferStatusPanel({
	isOpen,
	onClose,
	offers: initialOffers,
	onRefresh,
	onCancelOffer,
	onViewPatient,
	locationId = 'default'
}: WaitlistOfferStatusProps) {
	// Use real-time Firestore listener for offer updates
	const { offers: realtimeOffers, isConnected } = useWaitlistOffersRealtime(locationId)

	const [offers, setOffers] = useState<WaitlistOffer[]>(initialOffers || mockOffers)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [cancellingId, setCancellingId] = useState<string | null>(null)
	const [countdown, setCountdown] = useState<Record<string, string>>({})
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

	// Sync real-time offers with local state
	useEffect(() => {
		if (isConnected && realtimeOffers.length > 0) {
			// Merge real-time offers with initial offers, converting to WaitlistOffer format
			const formattedOffers = realtimeOffers.map((offer: any) => ({
				...offer,
				appointmentSlot: {
					...offer.appointmentSlot,
					date: new Date(offer.appointmentSlot?.date),
					startTime: new Date(offer.appointmentSlot?.startTime),
					endTime: new Date(offer.appointmentSlot?.endTime)
				}
			})) as WaitlistOffer[]
			setOffers(formattedOffers)
			setLastUpdated(new Date())
		}
	}, [realtimeOffers, isConnected])

	// Listen for individual offer status changes
	useEffect(() => {
		const unsubscribe = websocketService.on('waitlistOffers.updated', (data) => {
			if (data.locationId === locationId && data.offers) {
				setOffers(data.offers as WaitlistOffer[])
				setLastUpdated(new Date())
			}
		})

		return () => {
			unsubscribe()
		}
	}, [locationId])

	// Calculate countdown timers
	useEffect(() => {
		const updateCountdowns = () => {
			const newCountdowns: Record<string, string> = {}
			offers.forEach(offer => {
				if (offer.status === 'pending') {
					const now = moment()
					const expiry = moment(offer.expiresAt)
					const diff = expiry.diff(now)

					if (diff > 0) {
						const duration = moment.duration(diff)
						const minutes = Math.floor(duration.asMinutes())
						const seconds = duration.seconds()
						newCountdowns[offer.id] = `${minutes}:${seconds.toString().padStart(2, '0')}`
					} else {
						newCountdowns[offer.id] = 'Expired'
					}
				}
			})
			setCountdown(newCountdowns)
		}

		updateCountdowns()
		const interval = setInterval(updateCountdowns, 1000)
		return () => clearInterval(interval)
	}, [offers])

	// Manual refresh (fallback when real-time is not available)
	const handleRefresh = useCallback(async () => {
		if (!onRefresh) return

		setIsRefreshing(true)
		try {
			const updatedOffers = await onRefresh()
			setOffers(updatedOffers)
			setLastUpdated(new Date())
			toast.success('Status refreshed')
		} catch (error) {
			console.error('Refresh failed:', error)
			toast.error('Failed to refresh status')
		} finally {
			setIsRefreshing(false)
		}
	}, [onRefresh])

	// Cancel offer
	const handleCancelOffer = useCallback(async (offerId: string) => {
		if (!onCancelOffer) return

		setCancellingId(offerId)
		try {
			await onCancelOffer(offerId)
			// If not using real-time, update local state
			if (!isConnected) {
				setOffers(prev => prev.map(o =>
					o.id === offerId ? { ...o, status: 'superseded' as OfferStatus } : o
				))
			}
			toast.success('Offer cancelled')
		} catch (error) {
			console.error('Cancel failed:', error)
			toast.error('Failed to cancel offer')
		} finally {
			setCancellingId(null)
		}
	}, [onCancelOffer, isConnected])

	// Get status icon and color
	const getStatusDisplay = (status: OfferStatus) => {
		switch (status) {
			case 'pending':
				return {
					icon: <Clock className="h-4 w-4" />,
					color: 'text-blue-600 bg-blue-100',
					label: 'Pending'
				}
			case 'accepted':
				return {
					icon: <CheckCircle className="h-4 w-4" />,
					color: 'text-green-600 bg-green-100',
					label: 'Accepted'
				}
			case 'declined':
				return {
					icon: <XCircle className="h-4 w-4" />,
					color: 'text-red-600 bg-red-100',
					label: 'Declined'
				}
			case 'expired':
				return {
					icon: <AlertCircle className="h-4 w-4" />,
					color: 'text-gray-600 bg-gray-100',
					label: 'Expired'
				}
			case 'superseded':
				return {
					icon: <AlertCircle className="h-4 w-4" />,
					color: 'text-yellow-600 bg-yellow-100',
					label: 'Superseded'
				}
			default:
				return {
					icon: <Clock className="h-4 w-4" />,
					color: 'text-gray-600 bg-gray-100',
					label: status
				}
		}
	}

	// Group offers by status
	const pendingOffers = offers.filter(o => o.status === 'pending')
	const completedOffers = offers.filter(o => o.status !== 'pending')

	if (!isOpen) return null

	return (
		<div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-full max-w-[400px] bg-white shadow-2xl z-30 transform transition-transform duration-300">
			<div className="h-full flex flex-col">
				{/* Header */}
				<div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="h-5 w-5" />
							<h2 className="text-lg font-semibold">Offer Status</h2>
							<span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
								{pendingOffers.length} pending
							</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={handleRefresh}
								disabled={isRefreshing}
								className="p-2 hover:bg-white/20 rounded-md transition-colors"
								title="Refresh status"
							>
								<RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
							</button>
							<button
								onClick={onClose}
								className="p-1 hover:bg-white/20 rounded transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>
					</div>
					<div className="flex items-center justify-between mt-2">
						<div className="flex items-center gap-2">
							{isConnected ? (
								<>
									<Wifi className="h-3 w-3 text-green-300" />
									<span className="text-xs text-green-200">Live updates enabled</span>
								</>
							) : (
								<>
									<WifiOff className="h-3 w-3 text-yellow-300" />
									<span className="text-xs text-yellow-200">Offline mode</span>
								</>
							)}
						</div>
						<span className="text-xs text-white/70">
							Updated {moment(lastUpdated).format('h:mm:ss A')}
						</span>
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					{/* Pending Offers */}
					{pendingOffers.length > 0 && (
						<div className="mb-6">
							<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
								<span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
								Pending Offers
							</h3>
							<div className="space-y-3">
								{pendingOffers.map(offer => {
									const statusDisplay = getStatusDisplay(offer.status)
									const isExpiringSoon = countdown[offer.id] &&
										!countdown[offer.id].includes('Expired') &&
										parseInt(countdown[offer.id].split(':')[0]) < 5

									return (
										<div
											key={offer.id}
											className={`border rounded-lg p-4 ${isExpiringSoon ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}
										>
											{/* Patient Info */}
											<div className="flex items-start justify-between mb-3">
												<div>
													<h4 className="font-medium text-gray-900">{offer.patientName}</h4>
													<p className="text-sm text-gray-500">{offer.patientPhone}</p>
												</div>
												<div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${statusDisplay.color}`}>
													{statusDisplay.icon}
													{statusDisplay.label}
												</div>
											</div>

											{/* Slot Info */}
											<div className="text-sm text-gray-600 space-y-1 mb-3">
												<p>{offer.appointmentSlot.serviceName}</p>
												<p>
													{moment(offer.appointmentSlot.startTime).format('MMM D')} at{' '}
													{moment(offer.appointmentSlot.startTime).format('h:mm A')}
												</p>
												<p className="text-xs text-gray-400">
													with {offer.appointmentSlot.practitionerName}
												</p>
											</div>

											{/* Countdown Timer */}
											<div className={`flex items-center justify-between p-2 rounded ${
												isExpiringSoon ? 'bg-orange-100' : 'bg-gray-100'
											}`}>
												<div className="flex items-center gap-2 text-sm">
													<Clock className={`h-4 w-4 ${isExpiringSoon ? 'text-orange-600' : 'text-gray-500'}`} />
													<span className={isExpiringSoon ? 'text-orange-700 font-medium' : 'text-gray-600'}>
														{countdown[offer.id] === 'Expired' ? 'Expired' : `Expires in ${countdown[offer.id]}`}
													</span>
												</div>
												<span className="text-xs text-gray-500">
													Sent via {offer.sentVia === 'both' ? 'SMS + Email' : offer.sentVia.toUpperCase()}
												</span>
											</div>

											{/* Actions */}
											<div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
												{onViewPatient && (
													<button
														onClick={() => onViewPatient(offer.patientId)}
														className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
													>
														<ExternalLink className="h-3 w-3" />
														View Patient
													</button>
												)}
												{onCancelOffer && (
													<button
														onClick={() => handleCancelOffer(offer.id)}
														disabled={cancellingId === offer.id}
														className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
													>
														{cancellingId === offer.id ? (
															<Loader2 className="h-3 w-3 animate-spin" />
														) : (
															<XCircle className="h-3 w-3" />
														)}
														Cancel Offer
													</button>
												)}
											</div>
										</div>
									)
								})}
							</div>
						</div>
					)}

					{/* Completed Offers */}
					{completedOffers.length > 0 && (
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-3">Recent Activity</h3>
							<div className="space-y-2">
								{completedOffers.slice(0, 5).map(offer => {
									const statusDisplay = getStatusDisplay(offer.status)

									return (
										<div
											key={offer.id}
											className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
										>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<span className="font-medium text-sm text-gray-900">{offer.patientName}</span>
													<span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${statusDisplay.color}`}>
														{statusDisplay.icon}
														{statusDisplay.label}
													</span>
												</div>
												<p className="text-xs text-gray-500 mt-1">
													{offer.appointmentSlot.serviceName} -{' '}
													{moment(offer.respondedAt || offer.expiresAt).fromNow()}
												</p>
											</div>
											{onViewPatient && (
												<button
													onClick={() => onViewPatient(offer.patientId)}
													className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
												>
													<ExternalLink className="h-4 w-4" />
												</button>
											)}
										</div>
									)
								})}
							</div>
						</div>
					)}

					{/* Empty State */}
					{offers.length === 0 && (
						<div className="text-center py-12">
							<Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
							<h3 className="font-medium text-gray-900 mb-1">No active offers</h3>
							<p className="text-sm text-gray-500">
								Send offers to waitlist patients to see them here
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="border-t bg-gray-50 px-4 py-3">
					<div className="flex items-center justify-between text-xs text-gray-500">
						<div className="flex items-center gap-2">
							{isConnected ? (
								<span className="flex items-center gap-1">
									<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
									Real-time
								</span>
							) : (
								<span className="flex items-center gap-1">
									<span className="w-2 h-2 rounded-full bg-gray-400" />
									Manual refresh
								</span>
							)}
						</div>
						<span>{offers.length} total offers tracked</span>
					</div>
				</div>
			</div>
		</div>
	)
}
