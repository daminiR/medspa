'use client'

import { useMemo } from 'react'
import moment from 'moment'
import { Appointment, Break } from '@/lib/data'
import { MonthViewDayCell, CalendarSettings } from '@/types/calendar'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthViewProps {
  selectedDate: Date
  today: Date
  appointments: Appointment[]
  breaks: Break[]
  calendarSettings: CalendarSettings
  visiblePractitionerIds: string[]
  onDateSelect: (date: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
  onNavigate: (direction: 'prev' | 'next') => void
}

// Status colors matching existing calendar
const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  scheduled: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  arrived: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  'in-progress': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-400', border: 'border-red-200' },
  'no-show': { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
}

export default function MonthView({
  selectedDate,
  today,
  appointments,
  breaks,
  calendarSettings,
  visiblePractitionerIds,
  onDateSelect,
  onAppointmentClick,
  onNavigate
}: MonthViewProps) {
  // Generate month grid (6 weeks x 7 days)
  const monthData = useMemo(() => {
    const startOfMonth = moment(selectedDate).startOf('month')
    const endOfMonth = moment(selectedDate).endOf('month')

    // Start from the Sunday of the week containing the 1st
    const calendarStart = moment(startOfMonth).startOf('week')
    // End on the Saturday of the week containing the last day
    const calendarEnd = moment(endOfMonth).endOf('week')

    const weeks: MonthViewDayCell[][] = []
    let currentDay = calendarStart.clone()

    while (currentDay.isSameOrBefore(calendarEnd)) {
      const week: MonthViewDayCell[] = []

      for (let i = 0; i < 7; i++) {
        const dateStr = currentDay.format('YYYY-MM-DD')

        // Filter appointments for this day and visible practitioners
        const dayAppointments = appointments.filter(apt => {
          const aptDate = moment(apt.startTime).format('YYYY-MM-DD')
          const isVisible = visiblePractitionerIds.length === 0 ||
                           visiblePractitionerIds.includes(apt.practitionerId)
          const notCancelled = calendarSettings.showCancelledAppointments || apt.status !== 'cancelled'
          return aptDate === dateStr && isVisible && notCancelled
        })

        // Filter breaks for this day
        const dayBreaks = breaks.filter(brk => {
          const brkDate = moment(brk.startTime).format('YYYY-MM-DD')
          const isVisible = visiblePractitionerIds.length === 0 ||
                           visiblePractitionerIds.includes(brk.practitionerId)
          return brkDate === dateStr && isVisible
        })

        week.push({
          date: currentDay.toDate(),
          isCurrentMonth: currentDay.month() === moment(selectedDate).month(),
          isToday: currentDay.isSame(today, 'day'),
          isWeekend: currentDay.day() === 0 || currentDay.day() === 6,
          appointments: dayAppointments.sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          ),
          breaks: dayBreaks
        })

        currentDay.add(1, 'day')
      }

      weeks.push(week)
    }

    return weeks
  }, [selectedDate, today, appointments, breaks, visiblePractitionerIds, calendarSettings])

  // Stats for the month
  const monthStats = useMemo(() => {
    const startOfMonth = moment(selectedDate).startOf('month')
    const endOfMonth = moment(selectedDate).endOf('month')

    const monthAppointments = appointments.filter(apt => {
      const aptDate = moment(apt.startTime)
      const isVisible = visiblePractitionerIds.length === 0 ||
                       visiblePractitionerIds.includes(apt.practitionerId)
      return aptDate.isBetween(startOfMonth, endOfMonth, null, '[]') && isVisible && apt.status !== 'cancelled'
    })

    const confirmed = monthAppointments.filter(a => a.status === 'confirmed').length
    const scheduled = monthAppointments.filter(a => a.status === 'scheduled').length

    return {
      total: monthAppointments.length,
      confirmed,
      scheduled,
      pending: scheduled
    }
  }, [selectedDate, appointments, visiblePractitionerIds])

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Month Header with Stats */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {moment(selectedDate).format('MMMM YYYY')}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigate('prev')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-gray-600">{monthStats.total} appointments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-gray-600">{monthStats.confirmed} confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="text-gray-600">{monthStats.pending} pending</span>
          </div>
        </div>
      </div>

      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day, idx) => (
          <div
            key={day}
            className={`py-2 text-center text-sm font-medium ${
              idx === 0 || idx === 6 ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 h-full" style={{ gridAutoRows: '1fr' }}>
          {monthData.flat().map((day, idx) => (
            <DayCell
              key={idx}
              day={day}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              onAppointmentClick={onAppointmentClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Day Cell Component
function DayCell({
  day,
  selectedDate,
  onDateSelect,
  onAppointmentClick
}: {
  day: MonthViewDayCell
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onAppointmentClick: (appointment: Appointment) => void
}) {
  const isSelected = moment(day.date).isSame(selectedDate, 'day')
  const maxVisible = 3
  const hasMore = day.appointments.length > maxVisible
  const visibleAppointments = day.appointments.slice(0, maxVisible)

  return (
    <div
      className={`min-h-[100px] border-r border-b p-1 cursor-pointer transition-colors ${
        !day.isCurrentMonth ? 'bg-gray-50' : ''
      } ${day.isWeekend && day.isCurrentMonth ? 'bg-gray-25' : ''} ${
        day.isToday ? 'bg-blue-50' : ''
      } ${isSelected ? 'ring-2 ring-inset ring-purple-500' : ''} hover:bg-gray-100`}
      onClick={() => onDateSelect(day.date)}
    >
      {/* Date Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
            day.isToday
              ? 'bg-purple-600 text-white'
              : day.isCurrentMonth
              ? 'text-gray-900'
              : 'text-gray-400'
          }`}
        >
          {moment(day.date).date()}
        </span>

        {/* Break indicator */}
        {day.breaks.length > 0 && (
          <span className="text-xs text-orange-500" title={`${day.breaks.length} break(s)`}>
            ☕
          </span>
        )}
      </div>

      {/* Appointments */}
      <div className="space-y-0.5">
        {visibleAppointments.map((apt) => {
          const colors = STATUS_COLORS[apt.status] || STATUS_COLORS.scheduled
          return (
            <div
              key={apt.id}
              className={`text-xs px-1 py-0.5 rounded truncate ${colors.bg} ${colors.text} border ${colors.border}`}
              onClick={(e) => {
                e.stopPropagation()
                onAppointmentClick(apt)
              }}
              title={`${apt.patientName} - ${apt.serviceName} (${moment(apt.startTime).format('h:mm A')})`}
            >
              <span className="font-medium">{moment(apt.startTime).format('h:mm')}</span>
              {' '}
              <span className="opacity-80">{apt.patientName?.split(' ')[0]}</span>
            </div>
          )
        })}

        {/* More indicator */}
        {hasMore && (
          <div className="text-xs text-gray-500 px-1 font-medium">
            +{day.appointments.length - maxVisible} more
          </div>
        )}
      </div>
    </div>
  )
}
