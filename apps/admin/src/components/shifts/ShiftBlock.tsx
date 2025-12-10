import React from 'react'
import moment from 'moment'
import { ChevronDown, ChevronRight, FileText, User, Tag, Play, Square } from 'lucide-react'
import { Shift } from '@/types/shifts'

interface ShiftBlockProps {
  shift: Shift
  timeSlotHeight: number
  style?: React.CSSProperties
  onClick?: (shift: Shift) => void
  isSelected?: boolean
  showDetails?: boolean
  prominentDisplay?: boolean
}

export default function ShiftBlock({
  shift,
  timeSlotHeight,
  style,
  onClick,
  isSelected = false,
  showDetails = false,
  prominentDisplay = false
}: ShiftBlockProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick?.(shift)
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const startTime = moment(shift.startAt).format('h:mm A')
  const endTime = moment(shift.endAt).format('h:mm A')
  const hasNotes = shift.notes && shift.notes.trim().length > 0

  // Calculate shift height to determine if we show full or compact indicators
  const shiftHeight = style?.height ? parseInt(String(style.height)) : 0
  const isCompact = shiftHeight < 120

  const backgroundStyle = prominentDisplay
    ? isSelected
      ? 'border-purple-600 bg-purple-500'
      : 'border-purple-500 bg-purple-500 hover:bg-purple-600'
    : isSelected
      ? 'border-purple-500 bg-purple-50'
      : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'

  const textStyle = prominentDisplay ? 'text-white' : 'text-gray-700'

  return (
    <div
      className={`absolute border-2 ${prominentDisplay ? 'border-solid' : 'border-dashed'} rounded-md cursor-pointer transition-all ${backgroundStyle}`}
      style={{
        ...style,
        height: isExpanded && hasNotes ? 'auto' : style?.height,
        minHeight: isExpanded && hasNotes ? style?.height : undefined,
        zIndex: isExpanded ? 10 : (style?.zIndex || 2)
      }}
      onClick={handleClick}
      title={`Shift: ${startTime} - ${endTime}`}
    >
      {/* Shift Start Indicator - sticky note style at top */}
      <div
        className={`absolute -top-0.5 left-2 right-2 flex items-center justify-center ${
          prominentDisplay ? 'text-white' : 'text-green-700'
        }`}
      >
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-b-md text-[10px] font-semibold shadow-sm ${
          prominentDisplay
            ? 'bg-green-500 text-white'
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          <Play className="h-2.5 w-2.5 fill-current" />
          <span>{startTime}</span>
        </div>
      </div>

      <div className="p-2 pt-5 pb-5 text-xs h-full flex flex-col">
        <div className="flex items-start justify-between flex-1">
          <div className="flex-1">
            {!isCompact && (
              <div className={`font-medium ${textStyle} mb-1`}>
                {startTime} - {endTime}
              </div>
            )}
            {shift.room && (
              <div className={`${isCompact ? 'text-[10px]' : 'mt-1'} ${prominentDisplay ? 'text-purple-100' : 'text-gray-500'}`}>
                {isCompact ? shift.room : `Room: ${shift.room}`}
              </div>
            )}
            {shift.tags && shift.tags.length > 0 && !isCompact && (
              <div className="mt-1 flex flex-wrap gap-1">
                {shift.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                      prominentDisplay
                        ? 'bg-purple-400 bg-opacity-30 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <Tag className="h-2.5 w-2.5 mr-0.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {showDetails && hasNotes && (
            <button
              onClick={handleToggleExpand}
              className={`p-1 rounded transition-colors ${
                prominentDisplay ? 'hover:bg-purple-600' : 'hover:bg-gray-200'
              }`}
              title={isExpanded ? "Hide notes" : "Show notes"}
            >
              {isExpanded ? (
                <ChevronDown className={`h-3 w-3 ${prominentDisplay ? 'text-white' : 'text-gray-600'}`} />
              ) : (
                <ChevronRight className={`h-3 w-3 ${prominentDisplay ? 'text-white' : 'text-gray-600'}`} />
              )}
            </button>
          )}
        </div>

        {/* Notes section - shown when expanded */}
        {showDetails && isExpanded && hasNotes && (
          <div className={`mt-2 pt-2 border-t ${prominentDisplay ? 'border-purple-400' : 'border-gray-200'}`}>
            <div className="flex items-start space-x-1">
              <FileText className={`h-3 w-3 mt-0.5 flex-shrink-0 ${prominentDisplay ? 'text-purple-200' : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className={`whitespace-pre-wrap break-words ${prominentDisplay ? 'text-white' : 'text-gray-600'}`}>
                  {shift.notes}
                </div>
                {shift.updatedBy && (
                  <div className={`flex items-center mt-1 ${prominentDisplay ? 'text-purple-200' : 'text-gray-400'}`}>
                    <User className="h-3 w-3 mr-1" />
                    <span className="text-[10px]">
                      {shift.updatedBy}
                      {shift.updatedAt && ` • ${moment(shift.updatedAt).format('MMM D, h:mm A')}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shift End Indicator - sticky note style at bottom */}
      <div
        className={`absolute -bottom-0.5 left-2 right-2 flex items-center justify-center ${
          prominentDisplay ? 'text-white' : 'text-red-700'
        }`}
      >
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-t-md text-[10px] font-semibold shadow-sm ${
          prominentDisplay
            ? 'bg-red-500 text-white'
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          <Square className="h-2.5 w-2.5 fill-current" />
          <span>{endTime}</span>
        </div>
      </div>
    </div>
  )
}