/**
 * Internal Notification Demo Component
 *
 * This component demonstrates the internal staff notification system
 * Shows how notifications are triggered and provides visual feedback
 */

'use client'

import { useState } from 'react'
import { internalNotificationService, notifyStaff } from '@/services/internal-notifications'
import type { InternalNotificationEventType } from '@/types/notifications'
import {
  Bell,
  Send,
  Calendar,
  UserCheck,
  FileText,
  ShoppingBag,
  Gift,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react'

export function InternalNotificationDemo() {
  const [selectedEvent, setSelectedEvent] = useState<InternalNotificationEventType>('appointment_booked')
  const [isSending, setIsSending] = useState(false)

  // Demo data for different event types (partial - only common events shown)
  const eventDemoData: Partial<Record<InternalNotificationEventType, {
    icon: React.ReactNode
    label: string
    category: string
    payload: any
    context: any
  }>> = {
    appointment_booked: {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Appointment Booked',
      category: 'Appointments',
      payload: {
        patient: {
          id: 'pat-123',
          name: 'Sarah Johnson',
          phone: '(555) 123-4567',
          email: 'sarah@example.com'
        },
        appointment: {
          id: 'appt-456',
          date: 'January 15, 2026',
          time: '2:00 PM',
          service: 'Botox',
          provider: 'Dr. Emily Chen'
        }
      },
      context: {
        source: 'online' as const,
        bookingChannel: 'online_portal' as const,
        priority: 'normal' as const,
        actionUrls: {
          view: '/calendar?appointmentId=appt-456',
          edit: '/calendar/edit/appt-456'
        }
      }
    },
    online_booking: {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Online Booking',
      category: 'Appointments',
      payload: {
        patient: {
          id: 'pat-789',
          name: 'Michael Brown',
          phone: '(555) 987-6543',
          email: 'michael@example.com'
        },
        appointment: {
          id: 'appt-789',
          date: 'January 18, 2026',
          time: '10:30 AM',
          service: 'Dermal Fillers',
          provider: 'Dr. Sarah Martinez'
        }
      },
      context: {
        source: 'online' as const,
        bookingChannel: 'online_portal' as const,
        priority: 'high' as const,
        actionUrls: {
          view: '/calendar?appointmentId=appt-789'
        }
      }
    },
    appointment_canceled: {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Appointment Canceled',
      category: 'Appointments',
      payload: {
        patient: {
          id: 'pat-321',
          name: 'Jennifer Davis',
          phone: '(555) 321-7890'
        },
        appointment: {
          id: 'appt-321',
          date: 'January 12, 2026',
          time: '3:00 PM',
          service: 'Chemical Peel',
          provider: 'Dr. Emily Chen'
        },
        performedBy: {
          id: 'staff-1',
          name: 'Front Desk',
          role: 'Receptionist'
        }
      },
      context: {
        source: 'staff' as const,
        priority: 'normal' as const
      }
    },
    patient_checked_in: {
      icon: <UserCheck className="h-5 w-5" />,
      label: 'Patient Checked In',
      category: 'Check-In',
      payload: {
        patient: {
          id: 'pat-555',
          name: 'Lisa Anderson'
        },
        appointment: {
          id: 'appt-555',
          date: 'Today',
          time: '1:00 PM',
          provider: 'Dr. Sarah Martinez'
        }
      },
      context: {
        source: 'patient' as const,
        priority: 'normal' as const
      }
    },
    form_submitted: {
      icon: <FileText className="h-5 w-5" />,
      label: 'Form Submitted',
      category: 'Forms',
      payload: {
        patient: {
          id: 'pat-888',
          name: 'David Wilson',
          email: 'david@example.com'
        },
        metadata: {
          formType: 'Medical History',
          formId: 'form-123'
        }
      },
      context: {
        source: 'patient' as const,
        priority: 'normal' as const,
        actionUrls: {
          view: '/patients/pat-888/forms'
        }
      }
    },
    waitlist_match: {
      icon: <Clock className="h-5 w-5" />,
      label: 'Waitlist Match',
      category: 'Waitlist',
      payload: {
        patient: {
          id: 'pat-999',
          name: 'Amy Thompson',
          phone: '(555) 444-3333'
        },
        appointment: {
          id: 'appt-999',
          date: 'January 20, 2026',
          time: '11:00 AM',
          service: 'Laser Hair Removal',
          provider: 'Dr. Emily Chen'
        }
      },
      context: {
        source: 'system' as const,
        priority: 'high' as const,
        actionUrls: {
          view: '/waitlist'
        }
      }
    },
    sale_closed: {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: 'Sale Completed',
      category: 'Sales',
      payload: {
        patient: {
          id: 'pat-111',
          name: 'Rachel Green'
        },
        metadata: {
          amount: 450,
          services: 'Botox, Vitamin C Serum',
          invoiceId: 'inv-111'
        }
      },
      context: {
        source: 'staff' as const,
        priority: 'normal' as const,
        actionUrls: {
          view: '/billing/inv-111'
        }
      }
    },
    gift_card_purchased: {
      icon: <Gift className="h-5 w-5" />,
      label: 'Gift Card Purchased',
      category: 'Sales',
      payload: {
        patient: {
          id: 'pat-222',
          name: 'Monica Geller'
        },
        metadata: {
          amount: 200,
          giftCardCode: 'GC-2026-001',
          recipientName: 'Phoebe Buffay'
        }
      },
      context: {
        source: 'online' as const,
        priority: 'normal' as const
      }
    },
    membership_purchased: {
      icon: <CreditCard className="h-5 w-5" />,
      label: 'Membership Purchased',
      category: 'Memberships',
      payload: {
        patient: {
          id: 'pat-333',
          name: 'Ross Geller'
        },
        metadata: {
          membershipType: 'VIP Monthly',
          amount: 99,
          membershipId: 'mem-333'
        }
      },
      context: {
        source: 'staff' as const,
        priority: 'normal' as const
      }
    }
  }

  // Group events by category
  const eventsByCategory = Object.entries(eventDemoData).reduce((acc, [eventType, data]) => {
    const category = data.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push({ eventType: eventType as InternalNotificationEventType, ...data })
    return acc
  }, {} as Record<string, Array<{ eventType: InternalNotificationEventType } & typeof eventDemoData[keyof typeof eventDemoData]>>)

  const handleSendNotification = async () => {
    setIsSending(true)

    const data = eventDemoData[selectedEvent]
    if (!data) {
      console.warn('No demo data for event:', selectedEvent)
      setIsSending(false)
      return
    }

    try {
      await notifyStaff(
        selectedEvent,
        data.payload,
        data.context
      )

      // Success feedback is provided by the notification service itself
      console.log('Internal notification sent successfully')
    } catch (error) {
      console.error('Failed to send internal notification:', error)
    } finally {
      setIsSending(false)
    }
  }

  const stats = internalNotificationService.getStats()
  const selectedData = eventDemoData[selectedEvent] || {
    icon: <Bell className="h-5 w-5" />,
    label: selectedEvent.replace(/_/g, ' '),
    category: 'Other',
    payload: {},
    context: { source: 'system', priority: 'normal' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Internal Staff Notifications</h2>
            <p className="text-gray-600">
              Test the internal notification system. Select an event type below and click "Send Test Notification" to see how staff notifications work.
              These notifications are sent to configured staff members to keep them informed of important events.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Successful</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <Send className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Service Status</p>
              <p className="text-sm font-semibold text-green-600">
                {stats.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <Bell className={`h-8 w-8 ${stats.enabled ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Configured Events</p>
              <p className="text-2xl font-bold text-blue-600">{stats.configuredEvents.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Event Type</h3>
          <p className="text-sm text-gray-500">Choose an event type to simulate and send a test notification</p>
        </div>

        <div className="p-6 space-y-6">
          {Object.entries(eventsByCategory).map(([category, events]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {events.map(({ eventType, icon, label }) => (
                  <button
                    key={eventType}
                    onClick={() => setSelectedEvent(eventType)}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      selectedEvent === eventType
                        ? 'border-purple-500 bg-purple-50 shadow-sm'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      selectedEvent === eventType
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Preview</h3>
          <p className="text-sm text-gray-500">This is what staff members will be notified about</p>
        </div>

        <div className="p-6 space-y-4">
          {/* Event Info */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              {selectedData.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{selectedData.label}</h4>
              <p className="text-sm text-gray-500 mt-1">Source: {selectedData.context.source}</p>
              {selectedData.context.priority !== 'normal' && (
                <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded ${
                  selectedData.context.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                  selectedData.context.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedData.context.priority.toUpperCase()} PRIORITY
                </span>
              )}
            </div>
          </div>

          {/* Payload Data */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Notification Data:</p>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(selectedData.payload, null, 2)}
            </pre>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendNotification}
            disabled={isSending}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Sending Notification...
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Send Test Notification
              </>
            )}
          </button>

          <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How It Works</p>
              <p>
                When you click "Send Test Notification", the system will:
              </p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-700">
                <li>Log the notification details to the console</li>
                <li>Show a toast notification in the bottom-right corner</li>
                <li>Update the statistics above</li>
                <li>In production, this would also send emails to configured recipients</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      {stats.total > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Event Statistics</h3>
              <p className="text-sm text-gray-500">Breakdown of notifications by event type</p>
            </div>
            <button
              onClick={() => internalNotificationService.clearHistory()}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Clear History
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.byEventType).map(([eventType, count]) => (
                <div key={eventType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">
                    {eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="text-lg font-bold text-purple-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
