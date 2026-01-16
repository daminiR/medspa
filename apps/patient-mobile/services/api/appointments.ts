/**
 * Appointments API Service
 * Handles all appointment-related API calls
 */

import { apiClient, ApiResponse } from './client';

// Types
interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  serviceId?: string;
  locationId: string;
  serviceName: string;
  serviceCategory: string;
  providerName: string;
  providerTitle?: string;
  locationName: string;
  locationAddress: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  status: string;
  confirmedAt?: string;
  checkedInAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  bookedAt: string;
  bookedBy: string;
  bookingSource: string;
  price: number;
  depositRequired: boolean;
  depositAmount?: number;
  depositPaid: boolean;
  paymentStatus: string;
  patientNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentSlot {
  startTime: string;
  endTime: string;
  providerId: string;
  providerName: string;
  available: boolean;
}

interface BookAppointmentRequest {
  serviceId: string;
  providerId?: string;
  locationId: string;
  startTime: string;
  patientNotes?: string;
  paymentMethodId?: string;
}

interface ListAppointmentsParams {
  page?: number;
  limit?: number;
  status?: string;
  upcoming?: boolean;
  past?: boolean;
  startDate?: string;
  endDate?: string;
}

interface AvailableSlotsParams {
  serviceId: string;
  providerId?: string;
  locationId: string;
  date: string; // YYYY-MM-DD
}

/**
 * Appointments Service
 */
class AppointmentsService {
  /**
   * Get list of appointments
   */
  async list(params?: ListAppointmentsParams): Promise<ApiResponse<Appointment[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.upcoming) searchParams.set('upcoming', 'true');
    if (params?.past) searchParams.set('past', 'true');
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/patient/appointments?${queryString}`
      : '/api/patient/appointments';

    return apiClient.get<Appointment[]>(endpoint);
  }

  /**
   * Get upcoming appointments
   */
  async getUpcoming(limit?: number): Promise<ApiResponse<Appointment[]>> {
    return this.list({ upcoming: true, limit });
  }

  /**
   * Get past appointments
   */
  async getPast(page?: number, limit?: number): Promise<ApiResponse<Appointment[]>> {
    return this.list({ past: true, page, limit });
  }

  /**
   * Get single appointment by ID
   */
  async get(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.get<Appointment>(`/api/patient/appointments/${id}`);
  }

  /**
   * Book a new appointment
   */
  async book(data: BookAppointmentRequest): Promise<ApiResponse<{
    message: string;
    appointment: Appointment;
    confirmationNumber: string;
    depositRequired: boolean;
    depositAmount?: number;
  }>> {
    return apiClient.post('/api/patient/appointments/book', data);
  }

  /**
   * Reschedule an appointment
   */
  async reschedule(
    id: string,
    newStartTime: string,
    reason?: string
  ): Promise<ApiResponse<{
    message: string;
    appointment: any;
    rescheduleFee?: number;
  }>> {
    return apiClient.patch(`/api/patient/appointments/${id}/reschedule`, {
      newStartTime,
      reason,
    });
  }

  /**
   * Cancel an appointment
   */
  async cancel(
    id: string,
    reason: string
  ): Promise<ApiResponse<{
    message: string;
    appointment: any;
    cancellationFee?: number;
    refundAmount?: number;
  }>> {
    return apiClient.delete(`/api/patient/appointments/${id}`, { reason });
  }

  /**
   * Get available appointment slots
   */
  async getAvailableSlots(params: AvailableSlotsParams): Promise<ApiResponse<{
    date: string;
    service: { id: string; name: string; duration: number; price: number };
    location: { id: string; name: string; address?: string } | null;
    providers: Array<{ id: string; name: string; title?: string }>;
    slots: AppointmentSlot[];
    availableCount: number;
    totalCount: number;
  }>> {
    const searchParams = new URLSearchParams({
      serviceId: params.serviceId,
      locationId: params.locationId,
      date: params.date,
    });
    if (params.providerId) {
      searchParams.set('providerId', params.providerId);
    }

    return apiClient.get(`/api/patient/appointments/available-slots?${searchParams.toString()}`);
  }

  /**
   * Confirm appointment check-in
   */
  async checkIn(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/api/patient/appointments/${id}/check-in`);
  }
}

export const appointmentsService = new AppointmentsService();
export default appointmentsService;
