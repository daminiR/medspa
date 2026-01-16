'use client'

import { useState, useMemo } from 'react'
import { AlertCircle, MessageCircle } from 'lucide-react'

interface SMSCharacterCounterProps {
	text: string
	maxSegments?: number
}

interface CharacterAnalysis {
	count: number
	hasUnicode: boolean
	charLimitPerSegment: number
	segments: number
	isOverLimit: boolean
	color: string
	tooltip: string
}

export default function SMSCharacterCounter({
	text,
	maxSegments = 3
}: SMSCharacterCounterProps) {
	const [showTooltip, setShowTooltip] = useState(false)

	// Analyze the text for unicode/emoji characters
	const analysis = useMemo((): CharacterAnalysis => {
		const isEmpty = text.length === 0

		// Detect unicode characters and emojis
		// Regex to detect characters outside basic ASCII range
		const hasUnicode = /[^\x00-\x7F]/.test(text)

		const charLimitPerSegment = hasUnicode ? 70 : 160

		// Calculate number of segments needed
		const segments =
			isEmpty ? 0 : Math.ceil(text.length / charLimitPerSegment)

		const isOverLimit = segments > maxSegments

		// Determine color coding
		let color = 'text-green-600' // under limit
		if (isEmpty) {
			color = 'text-gray-400'
		} else if (isOverLimit) {
			color = 'text-red-600' // over maxSegments
		} else if (hasUnicode) {
			// Unicode messages are always more expensive, so higher warning
			if (segments === 1) {
				color = 'text-yellow-600' // 1 segment unicode
			} else {
				color = 'text-orange-600' // 2+ segments unicode
			}
		} else {
			// ASCII messages
			if (segments === 1) {
				color = 'text-green-600' // 1 segment
			} else if (segments === 2) {
				color = 'text-yellow-600' // 2 segments
			} else if (segments === 3) {
				color = 'text-orange-600' // 3 segments
			}
		}

		let tooltip = ''
		if (hasUnicode && !isEmpty) {
			tooltip = 'Emojis reduce message length to 70 characters per segment'
		} else if (segments > 1 && !isEmpty) {
			tooltip = 'Messages over 160 characters are sent as multiple segments and cost more'
		}

		return {
			count: text.length,
			hasUnicode,
			charLimitPerSegment,
			segments,
			isOverLimit,
			color,
			tooltip
		}
	}, [text, maxSegments])

	const displayLimit = analysis.charLimitPerSegment * analysis.segments

	return (
		<div className="flex items-center gap-2 text-sm">
			{/* Character count display */}
			<div className="flex items-center gap-1">
				<MessageCircle className="w-4 h-4 text-gray-500" />
				<span className={`font-semibold ${analysis.color}`}>
					{analysis.count}/{displayLimit}
				</span>
				{analysis.segments > 0 && (
					<span className={`text-xs font-medium ${analysis.color}`}>
						({analysis.segments} segment{analysis.segments !== 1 ? 's' : ''})
					</span>
				)}
			</div>

			{/* Warnings */}
			{analysis.isOverLimit && (
				<div className="flex items-center gap-1 ml-2">
					<AlertCircle className="w-4 h-4 text-red-600" />
					<span className="text-red-600 text-xs font-medium">
						Over {maxSegments} segments
					</span>
				</div>
			)}

			{/* Warning tooltip info icon */}
			{analysis.tooltip && !analysis.isOverLimit && (
				<div
					className="relative"
					onMouseEnter={() => setShowTooltip(true)}
					onMouseLeave={() => setShowTooltip(false)}
				>
					<AlertCircle className="w-4 h-4 text-yellow-500 cursor-help flex-shrink-0" />
					{showTooltip && (
						<div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
							{analysis.tooltip}
							<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
						</div>
					)}
				</div>
			)}

			{/* Emoji warning */}
			{analysis.hasUnicode && analysis.segments > 0 && (
				<div
					className="relative"
					onMouseEnter={() => setShowTooltip(true)}
					onMouseLeave={() => setShowTooltip(false)}
				>
					<span className="text-xs text-purple-600 font-medium">😀</span>
					{showTooltip && analysis.hasUnicode && (
						<div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50 pointer-events-none">
							Emojis detected
							<div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
