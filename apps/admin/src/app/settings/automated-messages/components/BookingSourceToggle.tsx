interface BookingSourceToggleProps {
  onlineEnabled: boolean
  staffEnabled: boolean
  onOnlineChange: (enabled: boolean) => void
  onStaffChange: (enabled: boolean) => void
}

export function BookingSourceToggle({
  onlineEnabled,
  staffEnabled,
  onOnlineChange,
  onStaffChange
}: BookingSourceToggleProps) {
  return (
    <div className="space-y-4">
      {/* Online Bookings Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Online Bookings</h3>
          <p className="text-sm text-gray-600 mt-1">
            Send automated messages for appointments booked by patients online
          </p>
        </div>
        <button
          onClick={() => onOnlineChange(!onlineEnabled)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            onlineEnabled ? 'bg-purple-600' : 'bg-gray-300'
          }`}
          aria-label={`Toggle online bookings ${onlineEnabled ? 'off' : 'on'}`}
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
              onlineEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Staff-Made Bookings Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h3 className="font-medium text-gray-900">Staff-Made Bookings</h3>
          <p className="text-sm text-gray-600 mt-1">
            Send automated messages for appointments created by staff members
          </p>
        </div>
        <button
          onClick={() => onStaffChange(!staffEnabled)}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            staffEnabled ? 'bg-purple-600' : 'bg-gray-300'
          }`}
          aria-label={`Toggle staff-made bookings ${staffEnabled ? 'off' : 'on'}`}
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
              staffEnabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
