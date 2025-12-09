// src/components/calendar/TimeSlots.tsx
export default function TimeSlots() {
	const times = []
	for (let hour = 8; hour <= 20; hour++) {
		times.push(`${hour === 12 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`)
	}

	return (
		<div className="w-20 bg-gray-50 border-r flex-shrink-0">
			<div className="h-12 border-b"></div>
			{times.map((time) => (
				<div key={time} className="h-20 border-b flex items-start justify-end pr-2 pt-1">
					<span className="text-xs text-gray-500">{time}</span>
				</div>
			))}
		</div>
	)
}
