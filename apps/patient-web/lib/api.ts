/**
 * API Client for Patient Web Portal
 * Type-safe API calls with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, timeout = 30000 } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: 'include',
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError('Unauthorized', 401);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      0
    );
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};

// Types
export interface Appointment {
  id: string;
  serviceName: string;
  serviceCategory: string;
  providerName: string;
  providerTitle?: string;
  locationName: string;
  locationAddress: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  price: number;
  patientNotes?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  categoryName: string;
  duration: number;
  price: number;
  priceRange?: { min: number; max: number };
  imageUrl?: string;
  onlineBookable: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  services: Service[];
}

export interface Provider {
  id: string;
  name: string;
  title: string;
  bio?: string;
  avatarUrl?: string;
  specialties: string[];
}

export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  providerId: string;
  providerName: string;
  available: boolean;
}

export interface Message {
  id: string;
  content: string;
  sender: 'patient' | 'staff';
  senderName: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  participants: { name: string; role: string }[];
}

export interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  type: 'before' | 'after';
  serviceId?: string;
  serviceName?: string;
  takenAt: string;
  notes?: string;
}

export interface PhotoPair {
  id: string;
  beforePhoto: Photo;
  afterPhoto?: Photo;
  serviceName: string;
  treatmentDate: string;
}

// API endpoints
export const appointmentsApi = {
  getUpcoming: () => api.get<Appointment[]>('/appointments?status=upcoming'),
  getPast: () => api.get<Appointment[]>('/appointments?status=past'),
  getById: (id: string) => api.get<Appointment>('/appointments/' + id),
  cancel: (id: string, reason: string) =>
    api.post('/appointments/' + id + '/cancel', { reason }),
  reschedule: (id: string, newStartTime: string) =>
    api.post('/appointments/' + id + '/reschedule', { newStartTime }),
};

export const servicesApi = {
  getAll: () => api.get<Service[]>('/services'),
  getCategories: () => api.get<ServiceCategory[]>('/services/categories'),
  getById: (id: string) => api.get<Service>('/services/' + id),
};

export const providersApi = {
  getAll: () => api.get<Provider[]>('/providers'),
  getById: (id: string) => api.get<Provider>('/providers/' + id),
  getAvailability: (providerId: string, serviceId: string, date: string) =>
    api.get<AppointmentSlot[]>(
      '/providers/' + providerId + '/availability?serviceId=' + serviceId + '&date=' + date
    ),
};

export const bookingApi = {
  getSlots: (serviceId: string, date: string, providerId?: string) => {
    let url = '/booking/slots?serviceId=' + serviceId + '&date=' + date;
    if (providerId) {
      url += '&providerId=' + providerId;
    }
    return api.get<AppointmentSlot[]>(url);
  },
  create: (data: {
    serviceId: string;
    providerId: string;
    startTime: string;
    locationId: string;
    patientNotes?: string;
  }) => api.post<Appointment>('/booking', data),
};

export const messagesApi = {
  getConversations: () => api.get<Conversation[]>('/messages/conversations'),
  getMessages: (conversationId: string) =>
    api.get<Message[]>('/messages/conversations/' + conversationId),
  sendMessage: (conversationId: string, content: string) =>
    api.post<Message>('/messages/conversations/' + conversationId, { content }),
  startConversation: (subject: string, content: string) =>
    api.post<Conversation>('/messages/conversations', { subject, content }),
  markAsRead: (conversationId: string) =>
    api.post('/messages/conversations/' + conversationId + '/read'),
};

export const photosApi = {
  getAll: () => api.get<Photo[]>('/photos'),
  getPairs: () => api.get<PhotoPair[]>('/photos/pairs'),
  upload: (file: File, type: 'before' | 'after', serviceId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (serviceId) formData.append('serviceId', serviceId);
    
    return fetch(API_BASE_URL + '/photos/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then((res) => res.json() as Promise<Photo>);
  },
  delete: (id: string) => api.delete('/photos/' + id),
};

export const profileApi = {
  get: () => api.get<{
    id: string;
    email: string;
    phone?: string;
    fullName: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    address?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    marketingOptIn: boolean;
    smsOptIn: boolean;
  }>('/profile'),
  update: (data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    marketingOptIn: boolean;
    smsOptIn: boolean;
  }>) => api.patch('/profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(API_BASE_URL + '/profile/avatar', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then((res) => res.json() as Promise<{ avatarUrl: string }>);
  },
};

export default api;
