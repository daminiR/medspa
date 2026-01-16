'use client'

import { useState } from 'react'
import {
	Clock,
	Send,
	Check,
	CheckCheck,
	X,
	Loader2,
	RotateCcw,
	AlertCircle
} from 'lucide-react'
import moment from 'moment'

type MessageStatusType = 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

interface MessageStatusProps {
	status: MessageStatusType
	timestamp?: Date
	errorMessage?: string
	onRetry?: () => void
}

export default function MessageStatus({
	status,
	timestamp,
	errorMessage,
	onRetry
}: MessageStatusProps) {
	const [showTimestamp, setShowTimestamp] = useState(false)
	const [showError, setShowError] = useState(false)

	const getStatusConfig = () => {
		switch (status) {
			case 'queued':
				return {
					icon: Clock,
					label: 'Queued',
					textColor: 'text-gray-500',
					iconColor: 'text-gray-400',
					bgColor: 'bg-gray-50',
					animate: false
				}
			case 'sending':
				return {
					icon: Loader2,
					label: 'Sending...',
					textColor: 'text-gray-500',
					iconColor: 'text-gray-400',
					bgColor: 'bg-gray-50',
					animate: true
				}
			case 'sent':
				return {
					icon: Check,
					label: 'Sent',
					textColor: 'text-gray-500',
					iconColor: 'text-gray-400',
					bgColor: 'bg-gray-50',
					animate: false
				}
			case 'delivered':
				return {
					icon: CheckCheck,
					label: 'Delivered',
					textColor: 'text-blue-600',
					iconColor: 'text-blue-500',
					bgColor: 'bg-blue-50',
					animate: false
				}
			case 'read':
				return {
					icon: CheckCheck,
					label: 'Read',
					textColor: 'text-green-600',
					iconColor: 'text-green-500',
					bgColor: 'bg-green-50',
					animate: false,
					filled: true
				}
			case 'failed':
				return {
					icon: X,
					label: 'Failed',
					textColor: 'text-red-600',
					iconColor: 'text-red-500',
					bgColor: 'bg-red-50',
					animate: false
				}
			default:
				return {
					icon: Clock,
					label: 'Unknown',
					textColor: 'text-gray-500',
					iconColor: 'text-gray-400',
					bgColor: 'bg-gray-50',
					animate: false
				}
		}
	}

	const config = getStatusConfig()
	const Icon = config.icon

	const formattedTime = timestamp ? moment(timestamp).format('HH:mm') : ''

	return (
		<div className="flex items-center gap-1">
			{/* Main status display */}
			<div
				className="relative flex items-center gap-1 px-2 py-1 rounded text-xs font-medium cursor-help"
				onMouseEnter={() => setShowTimestamp(true)}
				onMouseLeave={() => setShowTimestamp(false)}
			>
				{/* Icon */}
				<Icon
					className={`w-3.5 h-3.5 flex-shrink-0 ${config.iconColor} ${config.animate ? 'animate-spin' : ''} ${
						config.filled ? 'fill-current' : ''
					}`}
				/>

				{/* Label */}
				<span className={config.textColor}>{config.label}</span>

				{/* Timestamp tooltip */}
				{timestamp && showTimestamp && (
					<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
						{moment(timestamp).format('MMM D, HH:mm:ss')}
						<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-3 border-transparent border-t-gray-900"></div>
					</div>
				)}
			</div>

			{/* Error state - show error tooltip icon and retry button */}
			{status === 'failed' && (
				<div className="flex items-center gap-1">
					{/* Error info tooltip */}
					{errorMessage && (
						<div
							className="relative flex-shrink-0"
							onMouseEnter={() => setShowError(true)}
							onMouseLeave={() => setShowError(false)}
						>
							<AlertCircle className="w-3.5 h-3.5 text-red-500 cursor-help" />
							{showError && (
								<div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded max-w-xs z-50 pointer-events-none break-words">
									{errorMessage}
									<div className="absolute top-full right-2 border-3 border-transparent border-t-gray-900"></div>
								</div>
							)}
						</div>
					)}

					{/* Retry button */}
					{onRetry && (
						<button
							onClick={onRetry}
							className="flex-shrink-0 p-0.5 hover:bg-red-100 rounded transition-colors"
							title="Retry sending message"
						>
							<RotateCcw className="w-3.5 h-3.5 text-red-500 hover:text-red-600" />
						</button>
					)}
				</div>
			)}
		</div>
	)
}
