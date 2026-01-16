import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { NotificationItem } from '@/components/notifications/NotificationItem'
import type { Notification, NotificationType } from '@/types/notifications'

// Mock next/navigation
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}))

describe('NotificationItem Component', () => {
  // Base notification for tests
  const createNotification = (overrides: Partial<Notification> = {}): Notification => ({
    id: 'test-notif-1',
    type: 'appointment',
    title: 'Test Notification',
    body: 'This is a test notification body',
    read: false,
    createdAt: new Date(),
    channel: 'in_app',
    priority: 'normal',
    actionUrl: '/calendar',
    ...overrides,
  })

  const defaultProps = {
    notification: createNotification(),
    onMarkAsRead: vi.fn(),
    onDelete: vi.fn(),
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Helper to render with default props
  const renderItem = (overrideProps: Partial<typeof defaultProps> = {}) => {
    return render(
      <NotificationItem
        {...defaultProps}
        {...overrideProps}
      />
    )
  }

  // ===================
  // Props Handling Tests
  // ===================
  describe('Props Handling', () => {
    it('should render notification title', () => {
      renderItem()
      expect(screen.getByText('Test Notification')).toBeDefined()
    })

    it('should render notification body', () => {
      renderItem()
      expect(screen.getByText('This is a test notification body')).toBeDefined()
    })

    it('should pass all required props correctly', () => {
      const customProps = {
        notification: createNotification({
          id: 'custom-id',
          title: 'Custom Title',
          body: 'Custom Body',
        }),
        onMarkAsRead: vi.fn(),
        onDelete: vi.fn(),
        onClose: vi.fn(),
      }

      renderItem(customProps)

      expect(screen.getByText('Custom Title')).toBeDefined()
      expect(screen.getByText('Custom Body')).toBeDefined()
    })

    it('should handle notification without actionUrl', () => {
      const notification = createNotification({ actionUrl: undefined })
      renderItem({ notification })

      const item = screen.getByRole('listitem')
      fireEvent.click(item)

      // Should not attempt to navigate
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  // ===================
  // Click Handling Tests
  // ===================
  describe('Click Handling', () => {
    it('should mark unread notification as read on click', () => {
      const onMarkAsRead = vi.fn()
      const notification = createNotification({ read: false })

      renderItem({ notification, onMarkAsRead })

      const item = screen.getByRole('listitem')
      fireEvent.click(item)

      expect(onMarkAsRead).toHaveBeenCalledWith('test-notif-1')
    })

    it('should not call onMarkAsRead for already read notification', () => {
      const onMarkAsRead = vi.fn()
      const notification = createNotification({ read: true })

      renderItem({ notification, onMarkAsRead })

      const item = screen.getByRole('listitem')
      fireEvent.click(item)

      expect(onMarkAsRead).not.toHaveBeenCalled()
    })

    it('should navigate when actionUrl exists', () => {
      const onClose = vi.fn()
      const notification = createNotification({ actionUrl: '/messages' })

      renderItem({ notification, onClose })

      const item = screen.getByRole('listitem')
      fireEvent.click(item)

      expect(mockPush).toHaveBeenCalledWith('/messages')
      expect(onClose).toHaveBeenCalled()
    })

    it('should not navigate when actionUrl is undefined', () => {
      const onClose = vi.fn()
      const notification = createNotification({ actionUrl: undefined })

      renderItem({ notification, onClose })

      const item = screen.getByRole('listitem')
      fireEvent.click(item)

      expect(mockPush).not.toHaveBeenCalled()
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should call both onMarkAsRead and navigate for unread notification with actionUrl', () => {
      const onMarkAsRead = vi.fn()
      const onClose = vi.fn()
      const notification = createNotification({
        read: false,
        actionUrl: '/patients',
      })

      renderItem({ notification, onMarkAsRead, onClose })

      const item = screen.getByRole('listitem')
      fireEvent.click(item)

      expect(onMarkAsRead).toHaveBeenCalledWith('test-notif-1')
      expect(mockPush).toHaveBeenCalledWith('/patients')
      expect(onClose).toHaveBeenCalled()
    })
  })

  // ===================
  // Keyboard Navigation Tests
  // ===================
  describe('Keyboard Navigation', () => {
    it('should trigger click handler on Enter key', () => {
      const onMarkAsRead = vi.fn()
      const notification = createNotification({ read: false })

      renderItem({ notification, onMarkAsRead })

      const item = screen.getByRole('listitem')
      fireEvent.keyDown(item, { key: 'Enter' })

      expect(onMarkAsRead).toHaveBeenCalledWith('test-notif-1')
    })

    it('should trigger click handler on Space key', () => {
      const onMarkAsRead = vi.fn()
      const notification = createNotification({ read: false })

      renderItem({ notification, onMarkAsRead })

      const item = screen.getByRole('listitem')
      fireEvent.keyDown(item, { key: ' ' })

      expect(onMarkAsRead).toHaveBeenCalledWith('test-notif-1')
    })

    it('should prevent default on Enter key', () => {
      const onMarkAsRead = vi.fn()
      const notification = createNotification({ read: false })

      renderItem({ notification, onMarkAsRead })

      const item = screen.getByRole('listitem')

      // Create an event with a mockable preventDefault
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      item.dispatchEvent(event)

      // The handler calls e.preventDefault() for Enter key
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should prevent default on Space key', () => {
      const onMarkAsRead = vi.fn()
      const notification = createNotification({ read: false })

      renderItem({ notification, onMarkAsRead })

      const item = screen.getByRole('listitem')

      // Create an event with a mockable preventDefault
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      item.dispatchEvent(event)

      // The handler calls e.preventDefault() for Space key
      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should not trigger on other keys', () => {
      const onMarkAsRead = vi.fn()
      const notification = createNotification({ read: false })

      renderItem({ notification, onMarkAsRead })

      const item = screen.getByRole('listitem')
      fireEvent.keyDown(item, { key: 'Tab' })
      fireEvent.keyDown(item, { key: 'Escape' })
      fireEvent.keyDown(item, { key: 'a' })

      expect(onMarkAsRead).not.toHaveBeenCalled()
    })

    it('should navigate on keyboard Enter with actionUrl', () => {
      const onClose = vi.fn()
      const notification = createNotification({ actionUrl: '/billing' })

      renderItem({ notification, onClose })

      const item = screen.getByRole('listitem')
      fireEvent.keyDown(item, { key: 'Enter' })

      expect(mockPush).toHaveBeenCalledWith('/billing')
      expect(onClose).toHaveBeenCalled()
    })
  })

  // ===================
  // Delete Button Tests
  // ===================
  describe('Delete Button', () => {
    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn()

      renderItem({ onDelete })

      const deleteButton = screen.getByTitle('Delete notification')
      fireEvent.click(deleteButton)

      // Advance timers for the 150ms delay
      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(onDelete).toHaveBeenCalledWith('test-notif-1')
    })

    it('should stop event propagation on delete button click', () => {
      const onMarkAsRead = vi.fn()
      const onDelete = vi.fn()
      const notification = createNotification({ read: false })

      renderItem({ notification, onMarkAsRead, onDelete })

      const deleteButton = screen.getByTitle('Delete notification')
      fireEvent.click(deleteButton)

      // onMarkAsRead should NOT be called because stopPropagation was used
      expect(onMarkAsRead).not.toHaveBeenCalled()
    })

    it('should stop event propagation on delete button keyDown', () => {
      const onMarkAsRead = vi.fn()
      const notification = createNotification({ read: false })

      renderItem({ notification, onMarkAsRead })

      const deleteButton = screen.getByTitle('Delete notification')
      fireEvent.keyDown(deleteButton, { key: 'Enter' })

      // onMarkAsRead should NOT be called
      expect(onMarkAsRead).not.toHaveBeenCalled()
    })

    it('should have proper aria-label on delete button', () => {
      const notification = createNotification({ title: 'My Appointment' })
      renderItem({ notification })

      const deleteButton = screen.getByLabelText('Delete notification: My Appointment')
      expect(deleteButton).toBeDefined()
    })
  })

  // ===================
  // Hover State Tests
  // ===================
  describe('Hover States', () => {
    it('should show hover state on mouseEnter', () => {
      const { container } = renderItem()

      const item = screen.getByRole('listitem')
      fireEvent.mouseEnter(item)

      expect(item.className).toContain('bg-gray-50')
    })

    it('should remove hover state on mouseLeave', () => {
      const { container } = renderItem()

      const item = screen.getByRole('listitem')
      fireEvent.mouseEnter(item)
      fireEvent.mouseLeave(item)

      // Check it does not have the hover class anymore
      // Note: bg-gray-50 is only added when isHovered is true
      expect(item.className).not.toContain('bg-gray-50')
    })

    it('should show hover state on focus', () => {
      renderItem()

      const item = screen.getByRole('listitem')
      fireEvent.focus(item)

      expect(item.className).toContain('bg-gray-50')
    })

    it('should remove hover state on blur', () => {
      renderItem()

      const item = screen.getByRole('listitem')
      fireEvent.focus(item)
      fireEvent.blur(item)

      expect(item.className).not.toContain('bg-gray-50')
    })

    it('should show delete button on hover', () => {
      renderItem()

      const item = screen.getByRole('listitem')
      const deleteButton = screen.getByTitle('Delete notification')

      // Initially hidden (opacity-0)
      expect(deleteButton.className).toContain('opacity-0')

      // On hover, becomes visible
      fireEvent.mouseEnter(item)
      expect(deleteButton.className).toContain('opacity-100')
    })
  })

  // ===================
  // Time Formatting Tests
  // ===================
  describe('Time Formatting (formatTimeAgo)', () => {
    it('should display "Just now" for less than 60 seconds ago', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 30 * 1000), // 30 seconds ago
      })

      renderItem({ notification })

      expect(screen.getByText('Just now')).toBeDefined()
    })

    it('should display minutes ago for 1-59 minutes', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      })

      renderItem({ notification })

      expect(screen.getByText('15m ago')).toBeDefined()
    })

    it('should display hours ago for 1-23 hours', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      })

      renderItem({ notification })

      expect(screen.getByText('5h ago')).toBeDefined()
    })

    it('should display days ago for 1-6 days', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      })

      renderItem({ notification })

      expect(screen.getByText('3d ago')).toBeDefined()
    })

    it('should display weeks ago for 1-3 weeks', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      })

      renderItem({ notification })

      expect(screen.getByText('2w ago')).toBeDefined()
    })

    it('should display formatted date for 4+ weeks ago', () => {
      const oldDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago

      const notification = createNotification({
        createdAt: oldDate,
      })

      renderItem({ notification })

      // Should show the formatted date (e.g., "Nov 21")
      const expectedFormat = oldDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      expect(screen.getByText(expectedFormat)).toBeDefined()
    })

    it('should handle edge case of exactly 60 seconds (1 minute)', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 60 * 1000), // exactly 60 seconds
      })

      renderItem({ notification })

      expect(screen.getByText('1m ago')).toBeDefined()
    })

    it('should handle edge case of exactly 24 hours (1 day)', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // exactly 24 hours
      })

      renderItem({ notification })

      expect(screen.getByText('1d ago')).toBeDefined()
    })

    it('should handle edge case of exactly 7 days (1 week)', () => {
      const notification = createNotification({
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // exactly 7 days
      })

      renderItem({ notification })

      expect(screen.getByText('1w ago')).toBeDefined()
    })
  })

  // ===================
  // Notification Types Tests (all 17 types)
  // ===================
  describe('Notification Types', () => {
    const notificationTypes: NotificationType[] = [
      // Base types
      'appointment',
      'message',
      'alert',
      'system',
      // Appointment types
      'appointment_reminder',
      'appointment_confirmation',
      'appointment_cancelled',
      'appointment_rescheduled',
      // Message types
      'message_received',
      // Treatment/clinical
      'treatment_followup',
      // Billing types
      'billing_reminder',
      'payment_received',
      // Membership
      'membership_renewal',
      // Marketing
      'marketing_promotion',
      // System
      'system_alert',
      // Waitlist
      'waitlist_offer',
      // Forms
      'form_required',
    ]

    // Expected colors for each type
    const expectedColors: Record<NotificationType, string> = {
      appointment: 'bg-blue-100 text-blue-600',
      message: 'bg-green-100 text-green-600',
      alert: 'bg-amber-100 text-amber-600',
      system: 'bg-purple-100 text-purple-600',
      appointment_reminder: 'bg-blue-100 text-blue-600',
      appointment_confirmation: 'bg-emerald-100 text-emerald-600',
      appointment_cancelled: 'bg-red-100 text-red-600',
      appointment_rescheduled: 'bg-orange-100 text-orange-600',
      message_received: 'bg-green-100 text-green-600',
      treatment_followup: 'bg-teal-100 text-teal-600',
      billing_reminder: 'bg-amber-100 text-amber-600',
      payment_received: 'bg-emerald-100 text-emerald-600',
      membership_renewal: 'bg-pink-100 text-pink-600',
      marketing_promotion: 'bg-violet-100 text-violet-600',
      system_alert: 'bg-red-100 text-red-600',
      waitlist_offer: 'bg-cyan-100 text-cyan-600',
      form_required: 'bg-indigo-100 text-indigo-600',
    }

    notificationTypes.forEach((type) => {
      it(`should render correct icon and color for ${type} type`, () => {
        const notification = createNotification({
          type,
          title: `${type} notification`,
        })

        const { container } = renderItem({ notification })

        // Check that the icon container has the correct color classes
        const iconContainer = container.querySelector('.rounded-full.w-9.h-9')
        expect(iconContainer).toBeDefined()
        expect(iconContainer).not.toBeNull()

        const colorClasses = expectedColors[type]
        colorClasses.split(' ').forEach((cls) => {
          expect(iconContainer?.className).toContain(cls)
        })
      })
    })

    it('should render Calendar icon for appointment type', () => {
      const notification = createNotification({ type: 'appointment' })
      const { container } = renderItem({ notification })

      // Icon should be rendered inside the container
      const svg = container.querySelector('.rounded-full.w-9.h-9 svg')
      expect(svg).toBeDefined()
      expect(svg).not.toBeNull()
    })

    it('should render MessageSquare icon for message type', () => {
      const notification = createNotification({ type: 'message' })
      const { container } = renderItem({ notification })

      const svg = container.querySelector('.rounded-full.w-9.h-9 svg')
      expect(svg).toBeDefined()
      expect(svg).not.toBeNull()
    })

    it('should render AlertTriangle icon for alert type', () => {
      const notification = createNotification({ type: 'alert' })
      const { container } = renderItem({ notification })

      const svg = container.querySelector('.rounded-full.w-9.h-9 svg')
      expect(svg).toBeDefined()
      expect(svg).not.toBeNull()
    })
  })

  // ===================
  // Unread Styling Tests
  // ===================
  describe('Unread Styling', () => {
    it('should have purple background for unread notification', () => {
      const notification = createNotification({ read: false })

      renderItem({ notification })

      const item = screen.getByRole('listitem')
      expect(item.className).toContain('bg-purple-50/50')
    })

    it('should have white background for read notification', () => {
      const notification = createNotification({ read: true })

      renderItem({ notification })

      const item = screen.getByRole('listitem')
      expect(item.className).toContain('bg-white')
      expect(item.className).not.toContain('bg-purple-50/50')
    })

    it('should show purple dot indicator for unread notification', () => {
      const notification = createNotification({ read: false })

      const { container } = renderItem({ notification })

      const unreadDot = container.querySelector('.bg-purple-500.rounded-full.w-2.h-2')
      expect(unreadDot).toBeDefined()
      expect(unreadDot).not.toBeNull()
    })

    it('should not show purple dot for read notification', () => {
      const notification = createNotification({ read: true })

      const { container } = renderItem({ notification })

      const unreadDot = container.querySelector('.bg-purple-500.rounded-full.w-2.h-2')
      expect(unreadDot).toBeNull()
    })

    it('should have bold title for unread notification', () => {
      const notification = createNotification({ read: false })

      renderItem({ notification })

      const title = screen.getByText('Test Notification')
      expect(title.className).toContain('font-medium')
    })

    it('should not have bold title for read notification', () => {
      const notification = createNotification({ read: true })

      renderItem({ notification })

      const title = screen.getByText('Test Notification')
      expect(title.className).not.toContain('font-medium')
    })
  })

  // ===================
  // Delete Animation Tests
  // ===================
  describe('Delete Animation', () => {
    it('should set isDeleting state immediately on delete click', () => {
      const onDelete = vi.fn()

      const { container } = renderItem({ onDelete })

      const deleteButton = screen.getByTitle('Delete notification')
      fireEvent.click(deleteButton)

      // Should show deleting state immediately (before setTimeout resolves)
      const item = screen.getByRole('listitem')
      expect(item.className).toContain('opacity-50')
      expect(item.className).toContain('scale-95')
    })

    it('should call onDelete after 150ms delay', () => {
      const onDelete = vi.fn()

      renderItem({ onDelete })

      const deleteButton = screen.getByTitle('Delete notification')
      fireEvent.click(deleteButton)

      // Should not be called immediately
      expect(onDelete).not.toHaveBeenCalled()

      // Advance timers by 149ms - still not called
      act(() => {
        vi.advanceTimersByTime(149)
      })
      expect(onDelete).not.toHaveBeenCalled()

      // Advance one more ms to 150ms total
      act(() => {
        vi.advanceTimersByTime(1)
      })
      expect(onDelete).toHaveBeenCalledWith('test-notif-1')
    })

    it('should pass correct notification id to onDelete', () => {
      const onDelete = vi.fn()
      const notification = createNotification({ id: 'specific-id-123' })

      renderItem({ notification, onDelete })

      const deleteButton = screen.getByTitle('Delete notification')
      fireEvent.click(deleteButton)

      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(onDelete).toHaveBeenCalledWith('specific-id-123')
    })
  })

  // ===================
  // Accessibility Tests
  // ===================
  describe('Accessibility', () => {
    it('should have tabIndex of 0 for keyboard navigation', () => {
      renderItem()

      const item = screen.getByRole('listitem')
      expect(item.getAttribute('tabindex')).toBe('0')
    })

    it('should have role="listitem"', () => {
      renderItem()

      const item = screen.getByRole('listitem')
      expect(item).toBeDefined()
    })

    it('should have aria-label with title and body for read notification', () => {
      const notification = createNotification({
        read: true,
        title: 'Read Title',
        body: 'Read body text',
      })

      renderItem({ notification })

      const item = screen.getByRole('listitem')
      expect(item.getAttribute('aria-label')).toBe('Read Title. Read body text')
    })

    it('should have aria-label with "Unread:" prefix for unread notification', () => {
      const notification = createNotification({
        read: false,
        title: 'Unread Title',
        body: 'Unread body text',
      })

      renderItem({ notification })

      const item = screen.getByRole('listitem')
      expect(item.getAttribute('aria-label')).toBe('Unread: Unread Title. Unread body text')
    })

    it('should have title attribute on delete button', () => {
      renderItem()

      const deleteButton = screen.getByTitle('Delete notification')
      expect(deleteButton).toBeDefined()
    })

    it('should have aria-label on delete button including notification title', () => {
      const notification = createNotification({ title: 'Important Alert' })

      renderItem({ notification })

      const deleteButton = screen.getByLabelText('Delete notification: Important Alert')
      expect(deleteButton).toBeDefined()
    })

    it('should have focus ring on delete button', () => {
      renderItem()

      const deleteButton = screen.getByTitle('Delete notification')
      expect(deleteButton.className).toContain('focus:ring-2')
      expect(deleteButton.className).toContain('focus:ring-red-500')
    })

    it('should make delete button visible on focus', () => {
      renderItem()

      const deleteButton = screen.getByTitle('Delete notification')
      expect(deleteButton.className).toContain('focus:opacity-100')
    })
  })

  // ===================
  // Edge Cases
  // ===================
  describe('Edge Cases', () => {
    it('should handle empty title', () => {
      const notification = createNotification({ title: '' })

      renderItem({ notification })

      // Should still render the component without crashing
      expect(screen.getByRole('listitem')).toBeDefined()
    })

    it('should handle empty body', () => {
      const notification = createNotification({ body: '' })

      renderItem({ notification })

      expect(screen.getByRole('listitem')).toBeDefined()
    })

    it('should handle very long title', () => {
      const notification = createNotification({
        title: 'A'.repeat(500),
      })

      renderItem({ notification })

      const item = screen.getByRole('listitem')
      expect(item).toBeDefined()
    })

    it('should handle very long body (truncated with line-clamp-2)', () => {
      const notification = createNotification({
        body: 'B'.repeat(1000),
      })

      const { container } = renderItem({ notification })

      // Body should have line-clamp-2 class
      const bodyElement = container.querySelector('.line-clamp-2')
      expect(bodyElement).toBeDefined()
      expect(bodyElement).not.toBeNull()
    })

    it('should handle special characters in title and body', () => {
      const notification = createNotification({
        title: '<script>alert("xss")</script>',
        body: '& < > " \' / \\',
      })

      renderItem({ notification })

      // React should escape these characters
      expect(screen.getByText('<script>alert("xss")</script>')).toBeDefined()
      expect(screen.getByText('& < > " \' / \\')).toBeDefined()
    })

    it('should handle Date object for createdAt', () => {
      const notification = createNotification({
        createdAt: new Date('2024-01-15T10:00:00Z'),
      })

      // Should not crash
      expect(() => renderItem({ notification })).not.toThrow()
    })

    it('should throw when createdAt is a string instead of Date', () => {
      // The formatTimeAgo function expects a Date object and calls date.getTime()
      // Passing a string will cause an error - this tests that behavior
      const notification = createNotification({
        createdAt: '2024-01-15T10:00:00Z' as unknown as Date,
      })

      // The component will throw because formatTimeAgo calls date.getTime()
      // which doesn't exist on strings
      expect(() => renderItem({ notification })).toThrow('date.getTime is not a function')
    })
  })

  // ===================
  // Transition Classes Tests
  // ===================
  describe('Transition Classes', () => {
    it('should have transition-all class', () => {
      renderItem()

      const item = screen.getByRole('listitem')
      expect(item.className).toContain('transition-all')
    })

    it('should have duration-150 class', () => {
      renderItem()

      const item = screen.getByRole('listitem')
      expect(item.className).toContain('duration-150')
    })

    it('should have cursor-pointer class', () => {
      renderItem()

      const item = screen.getByRole('listitem')
      expect(item.className).toContain('cursor-pointer')
    })
  })

  // ===================
  // Combined State Tests
  // ===================
  describe('Combined States', () => {
    it('should handle hover on unread notification', () => {
      const notification = createNotification({ read: false })

      renderItem({ notification })

      const item = screen.getByRole('listitem')
      fireEvent.mouseEnter(item)

      // Should have both unread background and hover state
      // The hover state (bg-gray-50) takes precedence visually
      expect(item.className).toContain('bg-purple-50/50')
      expect(item.className).toContain('bg-gray-50')
    })

    it('should handle hover on read notification', () => {
      const notification = createNotification({ read: true })

      renderItem({ notification })

      const item = screen.getByRole('listitem')
      fireEvent.mouseEnter(item)

      expect(item.className).toContain('bg-white')
      expect(item.className).toContain('bg-gray-50')
    })

    it('should handle delete while hovering', () => {
      const onDelete = vi.fn()

      renderItem({ onDelete })

      const item = screen.getByRole('listitem')
      fireEvent.mouseEnter(item)

      const deleteButton = screen.getByTitle('Delete notification')
      fireEvent.click(deleteButton)

      // Should show deleting state
      expect(item.className).toContain('opacity-50')
      expect(item.className).toContain('scale-95')

      act(() => {
        vi.advanceTimersByTime(150)
      })

      expect(onDelete).toHaveBeenCalled()
    })
  })
})
