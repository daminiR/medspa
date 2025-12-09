'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, MapPin, AlertCircle, ChevronLeft, ChevronRight,
  Plus, Copy, Trash2, Edit, Check, X, Users, Coffee
} from 'lucide-react';
import { StaffMember, Schedule, TimeOff } from '@/types/staff';
import moment from 'moment';

interface StaffScheduleProps {
  staff: StaffMember;
  onEditSchedule?: (scheduleId: string) => void;
  onAddShift?: () => void;
  onApproveTimeOff?: (requestId: string) => void;
  onDenyTimeOff?: (requestId: string) => void;
}

export default function StaffSchedule({ 
  staff, 
  onEditSchedule, 
  onAddShift,
  onApproveTimeOff,
  onDenyTimeOff
}: StaffScheduleProps) {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [localTimeOffRequests, setLocalTimeOffRequests] = useState<TimeOff[]>(staff.timeOffRequests);

  const weekDays = useMemo(() => {
    const startOfWeek = currentDate.clone().startOf('week');
    return Array.from({ length: 7 }, (_, i) => startOfWeek.clone().add(i, 'days'));
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const days = [];
    const current = startOfMonth.clone();
    
    while (current.isSameOrBefore(endOfMonth)) {
      days.push(current.clone());
      current.add(1, 'day');
    }
    
    return days;
  }, [currentDate]);

  const getScheduleForDay = (date: moment.Moment) => {
    const dayOfWeek = date.day();
    return staff.schedules.find(s => s.dayOfWeek === dayOfWeek);
  };

  const getTimeOffForDay = (date: moment.Moment): TimeOff | undefined => {
    return localTimeOffRequests.find(request => {
      const start = moment(request.startDate);
      const end = moment(request.endDate);
      return date.isSameOrAfter(start, 'day') && date.isSameOrBefore(end, 'day');
    });
  };

  const handleApproveTimeOff = (requestId: string) => {
    setLocalTimeOffRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const }
          : req
      )
    );
    onApproveTimeOff?.(requestId);
  };

  const handleDenyTimeOff = (requestId: string) => {
    setLocalTimeOffRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'denied' as const }
          : req
      )
    );
    onDenyTimeOff?.(requestId);
  };

  const formatTime = (time: string) => {
    return moment(time, 'HH:mm').format('h:mm A');
  };

  const calculateWeeklyHours = () => {
    return staff.schedules.reduce((total, schedule) => {
      const start = moment(schedule.startTime, 'HH:mm');
      const end = moment(schedule.endTime, 'HH:mm');
      const hours = end.diff(start, 'hours', true);
      const breakHours = schedule.breakEnd && schedule.breakStart ? 
        moment(schedule.breakEnd, 'HH:mm').diff(moment(schedule.breakStart, 'HH:mm'), 'hours', true) : 0;
      return total + (hours - breakHours);
    }, 0);
  };

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => prev.clone().subtract(1, 'week'));
    } else {
      setCurrentDate(prev => prev.clone().subtract(1, 'month'));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => prev.clone().add(1, 'week'));
    } else {
      setCurrentDate(prev => prev.clone().add(1, 'month'));
    }
  };

  const handleToday = () => {
    setCurrentDate(moment());
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Schedule Overview</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{calculateWeeklyHours()} hrs/week</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded ${
                viewMode === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Month
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <button
              onClick={onAddShift}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Shift
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Today
            </button>
          </div>
          <h4 className="text-sm font-medium">
            {viewMode === 'week' 
              ? `${weekDays[0].format('MMM D')} - ${weekDays[6].format('MMM D, YYYY')}`
              : currentDate.format('MMMM YYYY')
            }
          </h4>
        </div>
      </div>

      {viewMode === 'week' ? (
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const schedule = getScheduleForDay(day);
              const timeOff = getTimeOffForDay(day);
              const isToday = day.isSame(moment(), 'day');
              const isPast = day.isBefore(moment(), 'day');

              return (
                <div
                  key={idx}
                  className={`border rounded-lg p-3 ${
                    isToday ? 'border-blue-500 bg-blue-50' : 
                    isPast ? 'bg-gray-50' : 'bg-white'
                  } ${timeOff ? 'opacity-60' : ''}`}
                >
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    {day.format('ddd')}
                    <span className="ml-1 text-gray-900">{day.format('D')}</span>
                  </div>

                  {timeOff ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        <span className="capitalize">{timeOff.type}</span>
                      </div>
                      {timeOff.status === 'pending' && (
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => handleApproveTimeOff(timeOff.id)}
                            className="p-0.5 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDenyTimeOff(timeOff.id)}
                            className="p-0.5 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : schedule ? (
                    <div className="space-y-1">
                      <div className="text-xs font-medium">
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </div>
                      {schedule.breakStart && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Coffee className="w-3 h-3" />
                          {formatTime(schedule.breakStart)} - {formatTime(schedule.breakEnd!)}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{schedule.location}</span>
                      </div>
                      {schedule.room && (
                        <div className="text-xs text-gray-500 truncate">
                          {schedule.room}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Off</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: monthDays[0].day() }, (_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {monthDays.map((day, idx) => {
              const schedule = getScheduleForDay(day);
              const timeOff = getTimeOffForDay(day);
              const isToday = day.isSame(moment(), 'day');
              const isCurrentMonth = day.isSame(currentDate, 'month');

              return (
                <div
                  key={idx}
                  className={`border rounded p-2 h-20 ${
                    isToday ? 'border-blue-500 bg-blue-50' : 
                    !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                  } ${timeOff ? 'bg-amber-50' : ''}`}
                >
                  <div className="text-xs font-medium mb-1">{day.format('D')}</div>
                  {timeOff ? (
                    <div className="text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Off
                    </div>
                  ) : schedule ? (
                    <div className="text-xs">
                      <div className="text-green-600 font-medium">Working</div>
                      <div className="text-gray-500 truncate">
                        {formatTime(schedule.startTime).replace(' AM', 'a').replace(' PM', 'p')} - 
                        {formatTime(schedule.endTime).replace(' AM', 'a').replace(' PM', 'p')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">Off</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded" />
              <span className="text-gray-600">Working</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-100 border border-amber-300 rounded" />
              <span className="text-gray-600">Time Off</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded" />
              <span className="text-gray-600">Off Day</span>
            </div>
          </div>
          <button 
            onClick={() => {
              alert('Schedule synced with calendar system');
            }}
            className="text-blue-600 hover:text-blue-700">
            Sync with Calendar →
          </button>
        </div>
      </div>
    </div>
  );
}