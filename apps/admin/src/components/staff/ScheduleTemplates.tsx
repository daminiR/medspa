'use client';

import React, { useState } from 'react';
import { Clock, Copy, Users, Calendar, Check } from 'lucide-react';
import { StaffRole } from '@/types/staff';

interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  role: StaffRole;
  schedule: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  }[];
  hoursPerWeek: number;
}

const templates: ScheduleTemplate[] = [
  {
    id: 'full-time-provider',
    name: 'Full-Time Provider',
    description: 'Standard Mon-Fri schedule for medical providers',
    role: 'Physician',
    schedule: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
      { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' },
    ],
    hoursPerWeek: 40
  },
  {
    id: 'part-time-aesthetician',
    name: 'Part-Time Aesthetician',
    description: 'Tue/Thu/Sat schedule for aestheticians',
    role: 'Aesthetician',
    schedule: [
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00', breakStart: '14:00', breakEnd: '14:30' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00', breakStart: '14:00', breakEnd: '14:30' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
    ],
    hoursPerWeek: 21
  },
  {
    id: 'injector-specialist',
    name: 'Injection Specialist',
    description: 'Wed-Sat schedule optimized for cosmetic appointments',
    role: 'Injection Specialist',
    schedule: [
      { dayOfWeek: 3, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
      { dayOfWeek: 4, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '16:00', breakStart: '12:30', breakEnd: '13:00' },
    ],
    hoursPerWeek: 30
  },
  {
    id: 'front-desk-morning',
    name: 'Front Desk - Morning Shift',
    description: 'Early shift for front desk coverage',
    role: 'Front Desk',
    schedule: [
      { dayOfWeek: 1, startTime: '07:00', endTime: '15:30', breakStart: '11:30', breakEnd: '12:00' },
      { dayOfWeek: 2, startTime: '07:00', endTime: '15:30', breakStart: '11:30', breakEnd: '12:00' },
      { dayOfWeek: 3, startTime: '07:00', endTime: '15:30', breakStart: '11:30', breakEnd: '12:00' },
      { dayOfWeek: 4, startTime: '07:00', endTime: '15:30', breakStart: '11:30', breakEnd: '12:00' },
      { dayOfWeek: 5, startTime: '07:00', endTime: '15:30', breakStart: '11:30', breakEnd: '12:00' },
    ],
    hoursPerWeek: 40
  },
  {
    id: 'front-desk-evening',
    name: 'Front Desk - Evening Shift',
    description: 'Late shift for front desk coverage',
    role: 'Front Desk',
    schedule: [
      { dayOfWeek: 1, startTime: '11:30', endTime: '20:00', breakStart: '15:30', breakEnd: '16:00' },
      { dayOfWeek: 2, startTime: '11:30', endTime: '20:00', breakStart: '15:30', breakEnd: '16:00' },
      { dayOfWeek: 3, startTime: '11:30', endTime: '20:00', breakStart: '15:30', breakEnd: '16:00' },
      { dayOfWeek: 4, startTime: '11:30', endTime: '20:00', breakStart: '15:30', breakEnd: '16:00' },
      { dayOfWeek: 5, startTime: '11:30', endTime: '20:00', breakStart: '15:30', breakEnd: '16:00' },
    ],
    hoursPerWeek: 40
  },
  {
    id: 'weekend-laser-tech',
    name: 'Weekend Laser Tech',
    description: 'Friday-Sunday schedule for laser treatments',
    role: 'Laser Technician',
    schedule: [
      { dayOfWeek: 5, startTime: '10:00', endTime: '19:00', breakStart: '14:00', breakEnd: '15:00' },
      { dayOfWeek: 6, startTime: '09:00', endTime: '18:00', breakStart: '13:00', breakEnd: '14:00' },
      { dayOfWeek: 0, startTime: '10:00', endTime: '17:00', breakStart: '13:00', breakEnd: '13:30' },
    ],
    hoursPerWeek: 23.5
  }
];

interface ScheduleTemplatesProps {
  onApplyTemplate: (template: ScheduleTemplate, staffIds: string[]) => void;
  selectedStaffIds?: string[];
}

export default function ScheduleTemplates({ onApplyTemplate, selectedStaffIds = [] }: ScheduleTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [appliedTemplates, setAppliedTemplates] = useState<Set<string>>(new Set());

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const handleApply = (template: ScheduleTemplate) => {
    onApplyTemplate(template, selectedStaffIds);
    setAppliedTemplates(prev => new Set(prev).add(template.id));
    setTimeout(() => {
      setAppliedTemplates(prev => {
        const next = new Set(prev);
        next.delete(template.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Schedule Templates</h3>
            <p className="text-sm text-gray-600 mt-1">Quick-apply common schedules to staff members</p>
          </div>
          {selectedStaffIds.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              <Users className="w-4 h-4" />
              {selectedStaffIds.length} staff selected
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTemplate(template.id === selectedTemplate ? null : template.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {template.role}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.hoursPerWeek} hrs/week
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply(template);
                }}
                disabled={selectedStaffIds.length === 0}
                className={`flex items-center gap-1 px-3 py-1 rounded text-sm transition-all ${
                  appliedTemplates.has(template.id)
                    ? 'bg-green-600 text-white'
                    : selectedStaffIds.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {appliedTemplates.has(template.id) ? (
                  <>
                    <Check className="w-4 h-4" />
                    Applied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Apply
                  </>
                )}
              </button>
            </div>

            {selectedTemplate === template.id && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((day, idx) => {
                    const daySchedule = template.schedule.find(s => s.dayOfWeek === idx);
                    return (
                      <div
                        key={day}
                        className={`p-2 rounded text-center ${
                          daySchedule ? 'bg-white border border-gray-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-600 mb-1">{day}</div>
                        {daySchedule ? (
                          <div className="space-y-1">
                            <div className="text-xs font-medium">
                              {formatTime(daySchedule.startTime)}
                            </div>
                            <div className="text-xs text-gray-500">to</div>
                            <div className="text-xs font-medium">
                              {formatTime(daySchedule.endTime)}
                            </div>
                            {daySchedule.breakStart && (
                              <div className="text-xs text-gray-400 pt-1 border-t">
                                Break {formatTime(daySchedule.breakStart)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 py-4">Off</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            <Calendar className="w-4 h-4 inline mr-1" />
            Templates can be customized after applying
          </div>
          <button className="text-blue-600 hover:text-blue-700">
            Create Custom Template →
          </button>
        </div>
      </div>
    </div>
  );
}