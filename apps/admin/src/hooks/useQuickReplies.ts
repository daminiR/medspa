/**
 * Quick Replies Hook
 *
 * Fetches and manages quick replies from the backend API.
 * Falls back to localStorage if API is unavailable.
 */

import { useState, useEffect, useCallback } from 'react';

interface QuickReply {
  id: string;
  category: string;
  content: string;
  order: number;
  isSystem: boolean;
  useCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QuickReplyCategory {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  order: number;
  icon: string | null;
  isSystem: boolean;
}

interface UseQuickRepliesResult {
  // Data
  quickReplies: Record<string, string[]>;
  categories: QuickReplyCategory[];
  rawReplies: QuickReply[];

  // State
  isLoading: boolean;
  error: string | null;
  isOnline: boolean;

  // Actions
  addReply: (category: string, content: string) => Promise<void>;
  updateReply: (id: string, content: string) => Promise<void>;
  deleteReply: (id: string) => Promise<void>;
  addCategory: (name: string, displayName: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  trackUsage: (id: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  refresh: () => Promise<void>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Default quick replies for offline/fallback
const DEFAULT_QUICK_REPLIES: Record<string, string[]> = {
  appointment: [
    'Your appointment is confirmed. See you soon!',
    'Please call us at 555-0100 to reschedule.',
    'Reply C to confirm or R to reschedule your appointment.',
  ],
  postCare: [
    "That's normal. Apply ice if needed and keep the area moisturized.",
    'Some tightness is normal. Use gentle cleanser and moisturize well.',
    'Avoid sun exposure and use SPF 30+ daily.',
  ],
  general: [
    "Thank you for your message. We'll respond shortly.",
    'Please call us at 555-0100 for immediate assistance.',
    'Our office hours are Mon-Fri 9AM-6PM, Sat 10AM-4PM.',
  ],
  smsReminderTemplates: [
    'Hi {{firstName}}, reminder: {{serviceName}} tomorrow at {{appointmentTime}} with {{providerName}}. Reply C to confirm, R to reschedule.',
    '{{firstName}}, your {{serviceName}} is in 1 hour! See you soon at {{locationName}}.',
    'Hi {{firstName}}! Appt confirmed: {{appointmentDate}} at {{appointmentTime}} with {{providerName}}. Questions? {{locationPhone}}',
    'Hi {{firstName}}, we have an opening on {{appointmentDate}} at {{appointmentTime}}. Reply Y to book or call {{locationPhone}}.',
    'Hi {{firstName}}, how are you feeling after your {{serviceName}}? Any concerns, call us at {{locationPhone}}. We care about your results!',
  ],
};

export function useQuickReplies(): UseQuickRepliesResult {
  const [rawReplies, setRawReplies] = useState<QuickReply[]>([]);
  const [categories, setCategories] = useState<QuickReplyCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Transform raw replies to grouped format
  const quickReplies: Record<string, string[]> = rawReplies.reduce((acc, reply) => {
    if (!acc[reply.category]) {
      acc[reply.category] = [];
    }
    acc[reply.category].push(reply.content);
    return acc;
  }, {} as Record<string, string[]>);

  // Fetch all quick replies
  const fetchReplies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/quick-replies`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quick replies');
      }

      const data = await response.json();

      if (data.success) {
        // Flatten the grouped data into a single array
        const allReplies: QuickReply[] = [];
        Object.entries(data.data as Record<string, QuickReply[]>).forEach(([, replies]) => {
          allReplies.push(...replies);
        });
        setRawReplies(allReplies);
        setIsOnline(true);

        // Also sync to localStorage as cache
        const grouped = allReplies.reduce((acc, reply) => {
          if (!acc[reply.category]) {
            acc[reply.category] = [];
          }
          acc[reply.category].push(reply.content);
          return acc;
        }, {} as Record<string, string[]>);
        localStorage.setItem('quickReplies', JSON.stringify(grouped));
      }
    } catch (err) {
      console.error('Error fetching quick replies:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsOnline(false);

      // Fall back to localStorage
      const saved = localStorage.getItem('quickReplies');
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, string[]>;
        const fallbackReplies: QuickReply[] = [];
        Object.entries(parsed).forEach(([category, contents]) => {
          contents.forEach((content, index) => {
            fallbackReplies.push({
              id: `local-${category}-${index}`,
              category,
              content,
              order: index,
              isSystem: false,
              useCount: 0,
              lastUsedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });
        });
        setRawReplies(fallbackReplies);
      } else {
        // Use defaults
        const defaultReplies: QuickReply[] = [];
        Object.entries(DEFAULT_QUICK_REPLIES).forEach(([category, contents]) => {
          contents.forEach((content, index) => {
            defaultReplies.push({
              id: `default-${category}-${index}`,
              category,
              content,
              order: index,
              isSystem: true,
              useCount: 0,
              lastUsedAt: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });
        });
        setRawReplies(defaultReplies);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/quick-replies/categories`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Use default categories
      setCategories([
        { id: 'default-1', name: 'appointment', displayName: 'Appointment', description: null, order: 1, icon: 'Calendar', isSystem: true },
        { id: 'default-2', name: 'postCare', displayName: 'Post-Care', description: null, order: 2, icon: 'Heart', isSystem: true },
        { id: 'default-3', name: 'general', displayName: 'General', description: null, order: 3, icon: 'MessageCircle', isSystem: true },
        { id: 'default-4', name: 'smsReminderTemplates', displayName: 'SMS Reminder Templates', description: 'Automated SMS reminder templates with tokens', order: 4, icon: 'Bell', isSystem: true },
      ]);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchReplies();
    fetchCategories();
  }, [fetchReplies, fetchCategories]);

  // Add a new reply
  const addReply = useCallback(async (category: string, content: string) => {
    if (!isOnline) {
      // Offline mode - update localStorage only
      const current = { ...quickReplies };
      if (!current[category]) {
        current[category] = [];
      }
      current[category].push(content);
      localStorage.setItem('quickReplies', JSON.stringify(current));

      // Update local state
      setRawReplies(prev => [...prev, {
        id: `local-${Date.now()}`,
        category,
        content,
        order: current[category].length - 1,
        isSystem: false,
        useCount: 0,
        lastUsedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]);

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('quickRepliesUpdated', { detail: current }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/quick-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reply');
      }

      await fetchReplies(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add reply');
      throw err;
    }
  }, [isOnline, quickReplies, fetchReplies]);

  // Update a reply
  const updateReply = useCallback(async (id: string, content: string) => {
    if (!isOnline || id.startsWith('local-') || id.startsWith('default-')) {
      // Offline mode - not supported, would need to track pending changes
      console.warn('Updating replies in offline mode is not fully supported');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/quick-replies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to update reply');
      }

      await fetchReplies(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reply');
      throw err;
    }
  }, [isOnline, fetchReplies]);

  // Delete a reply
  const deleteReply = useCallback(async (id: string) => {
    if (!isOnline || id.startsWith('local-') || id.startsWith('default-')) {
      // Offline mode - update localStorage only
      const reply = rawReplies.find(r => r.id === id);
      if (reply) {
        const current = { ...quickReplies };
        current[reply.category] = current[reply.category].filter(c => c !== reply.content);
        localStorage.setItem('quickReplies', JSON.stringify(current));
        setRawReplies(prev => prev.filter(r => r.id !== id));
        window.dispatchEvent(new CustomEvent('quickRepliesUpdated', { detail: current }));
      }
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/quick-replies/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reply');
      }

      await fetchReplies(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reply');
      throw err;
    }
  }, [isOnline, rawReplies, quickReplies, fetchReplies]);

  // Add a new category
  const addCategory = useCallback(async (name: string, displayName: string) => {
    if (!isOnline) {
      // Offline mode - update localStorage only
      const current = { ...quickReplies };
      current[name] = [];
      localStorage.setItem('quickReplies', JSON.stringify(current));
      setCategories(prev => [...prev, {
        id: `local-${Date.now()}`,
        name,
        displayName,
        description: null,
        order: prev.length + 1,
        icon: null,
        isSystem: false,
      }]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/quick-replies/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, displayName }),
      });

      if (!response.ok) {
        throw new Error('Failed to add category');
      }

      await fetchCategories(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      throw err;
    }
  }, [isOnline, quickReplies, fetchCategories]);

  // Delete a category
  const deleteCategory = useCallback(async (name: string) => {
    if (!isOnline) {
      // Offline mode - update localStorage only
      const current = { ...quickReplies };
      delete current[name];
      localStorage.setItem('quickReplies', JSON.stringify(current));
      setRawReplies(prev => prev.filter(r => r.category !== name));
      setCategories(prev => prev.filter(c => c.name !== name));
      window.dispatchEvent(new CustomEvent('quickRepliesUpdated', { detail: current }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/quick-replies/categories/${name}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      await fetchReplies();
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  }, [isOnline, quickReplies, fetchReplies, fetchCategories]);

  // Track usage of a reply
  const trackUsage = useCallback(async (id: string) => {
    if (!isOnline || id.startsWith('local-') || id.startsWith('default-')) {
      return; // Can't track usage offline or for local replies
    }

    try {
      await fetch(`${API_BASE}/quick-replies/${id}/use`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      // Silent failure - usage tracking is not critical
      console.warn('Failed to track usage:', err);
    }
  }, [isOnline]);

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    if (!isOnline) {
      // Offline mode - reset localStorage to defaults
      localStorage.setItem('quickReplies', JSON.stringify(DEFAULT_QUICK_REPLIES));
      const defaultReplies: QuickReply[] = [];
      Object.entries(DEFAULT_QUICK_REPLIES).forEach(([category, contents]) => {
        contents.forEach((content, index) => {
          defaultReplies.push({
            id: `default-${category}-${index}`,
            category,
            content,
            order: index,
            isSystem: true,
            useCount: 0,
            lastUsedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
      });
      setRawReplies(defaultReplies);
      window.dispatchEvent(new CustomEvent('quickRepliesUpdated', { detail: DEFAULT_QUICK_REPLIES }));
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/quick-replies/reset`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to reset to defaults');
      }

      await fetchReplies();
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset');
      throw err;
    }
  }, [isOnline, fetchReplies, fetchCategories]);

  return {
    quickReplies,
    categories,
    rawReplies,
    isLoading,
    error,
    isOnline,
    addReply,
    updateReply,
    deleteReply,
    addCategory,
    deleteCategory,
    trackUsage,
    resetToDefaults,
    refresh: fetchReplies,
  };
}

export type { QuickReply, QuickReplyCategory };
