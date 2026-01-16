'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createEventFromAppointment,
  downloadICS,
  getGoogleCalendarUrl,
  getOutlookUrl,
  getYahooCalendarUrl,
  type AppointmentForCalendar,
} from '@/lib/wallet/icsGenerator';

interface AddToCalendarButtonProps {
  appointment: AppointmentForCalendar;
  className?: string;
}

export default function AddToCalendarButton({
  appointment,
  className = '',
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const event = createEventFromAppointment(appointment);

  const handleGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(event), '_blank');
    setIsOpen(false);
  };

  const handleOutlook = () => {
    window.open(getOutlookUrl(event), '_blank');
    setIsOpen(false);
  };

  const handleYahoo = () => {
    window.open(getYahooCalendarUrl(event), '_blank');
    setIsOpen(false);
  };

  const handleAppleCalendar = () => {
    downloadICS(event, `appointment-${appointment.id}.ics`);
    setIsOpen(false);
  };

  const handleDownloadICS = () => {
    downloadICS(event, `appointment-${appointment.id}.ics`);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="w-full justify-between"
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span>Add to Calendar</span>
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
            {/* Google Calendar */}
            <button
              onClick={handleGoogleCalendar}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="24" rx="4" fill="#4285F4" />
                <path d="M18 8H6V18H18V8Z" fill="white" />
                <path d="M17 6H7V7H17V6Z" fill="#EA4335" />
                <path d="M17 18H7V19H17V18Z" fill="#34A853" />
                <path d="M6 7H7V18H6V7Z" fill="#FBBC05" />
                <path d="M17 7H18V18H17V7Z" fill="#4285F4" />
              </svg>
              <span className="flex-1">Google Calendar</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>

            {/* Outlook */}
            <button
              onClick={handleOutlook}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="24" rx="4" fill="#0078D4" />
                <path d="M6 8L12 12L18 8V16H6V8Z" fill="white" />
                <path d="M6 8H18L12 12L6 8Z" fill="#50D9FF" />
              </svg>
              <span className="flex-1">Outlook.com</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>

            {/* Yahoo Calendar */}
            <button
              onClick={handleYahoo}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="24" rx="4" fill="#6001D2" />
                <text x="7" y="17" fill="white" fontSize="12" fontWeight="bold">Y!</text>
              </svg>
              <span className="flex-1">Yahoo Calendar</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>

            {/* Apple Calendar */}
            <button
              onClick={handleAppleCalendar}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="24" height="24" rx="4" fill="#FF3B30" />
                <rect x="5" y="5" width="14" height="14" rx="2" fill="white" />
                <rect x="8" y="3" width="2" height="4" rx="1" fill="#FF3B30" />
                <rect x="14" y="3" width="2" height="4" rx="1" fill="#FF3B30" />
                <text x="7" y="16" fill="#FF3B30" fontSize="8" fontWeight="bold">15</text>
              </svg>
              <span className="flex-1">Apple Calendar</span>
              <Download className="w-4 h-4 text-gray-400" />
            </button>

            <div className="border-t border-gray-200 my-2" />

            {/* Download ICS */}
            <button
              onClick={handleDownloadICS}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span className="flex-1">Download .ics file</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
