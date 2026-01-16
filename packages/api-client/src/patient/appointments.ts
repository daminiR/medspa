/**
 * Appointments API Functions
 */

import type { ApiClient } from '../client';
import type {
  Appointment,
  BookAppointmentRequest,
  RescheduleRequest,
  CancelRequest,
  AvailableSlotsResponse,
} from './types';
import { patientEndpoints } from './index';

export interface AppointmentsApi {
  /**
   * Get list of appointments
   */
  list(params?: {
    page?: number;
    limit?: number;
    status?: string;
    upcoming?: boolean;
    past?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    appointments: Appointment[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>;

  /**
   * Get single appointment by ID
   */
  get(id: string): Promise<Appointment>;

  /**
   * Book a new appointment
   */
  book(data: BookAppointmentRequest): Promise<{
    message: string;
    appointment: Appointment;
    confirmationNumber: string;
    depositRequired: boolean;
    depositAmount?: number;
  }>;

  /**
   * Reschedule an appointment
   */
  reschedule(
    id: string,
    data: RescheduleRequest
  ): Promise<{
    message: string;
    appointment: {
      id: string;
      serviceName: string;
      providerName: string;
      locationName: string;
      originalStartTime: string;
      originalEndTime: string;
      newStartTime: string;
      newEndTime: string;
      duration: number;
      status: string;
    };
    rescheduleFee?: number;
  }>;

  /**
   * Cancel an appointment
   */
  cancel(
    id: string,
    data: CancelRequest
  ): Promise<{
    message: string;
    appointment: {
      id: string;
      status: string;
      cancelledAt: string;
      cancellationReason: string;
    };
    cancellationFee?: number;
    refundAmount?: number;
  }>;

  /**
   * Get available appointment slots
   */
  getAvailableSlots(params: {
    serviceId: string;
    providerId?: string;
    locationId: string;
    date: string;
  }): Promise<AvailableSlotsResponse>;
}

export function createAppointmentsApi(client: ApiClient): AppointmentsApi {
  return {
    async list(params) {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.status) searchParams.set('status', params.status);
      if (params?.upcoming) searchParams.set('upcoming', 'true');
      if (params?.past) searchParams.set('past', 'true');
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);

      const queryString = searchParams.toString();
      const url = queryString
        ? `${patientEndpoints.appointments.list}?${queryString}`
        : patientEndpoints.appointments.list;

      const response = await client.get<{
        data: Appointment[];
        meta: { page: number; limit: number; total: number; totalPages: number };
      }>(url);

      return {
        appointments: response.data,
        meta: response.meta!,
      };
    },

    async get(id: string) {
      const response = await client.get<{ data: Appointment }>(
        patientEndpoints.appointments.get(id)
      );
      return response.data;
    },

    async book(data: BookAppointmentRequest) {
      const response = await client.post<{
        data: {
          message: string;
          appointment: Appointment;
          confirmationNumber: string;
          depositRequired: boolean;
          depositAmount?: number;
        };
      }>(patientEndpoints.appointments.book, data);
      return response.data;
    },

    async reschedule(id: string, data: RescheduleRequest) {
      const response = await client.patch<{
        data: {
          message: string;
          appointment: any;
          rescheduleFee?: number;
        };
      }>(patientEndpoints.appointments.reschedule(id), data);
      return response.data;
    },

    async cancel(id: string, data: CancelRequest) {
      const response = await client.delete<{
        data: {
          message: string;
          appointment: any;
          cancellationFee?: number;
          refundAmount?: number;
        };
      }>(patientEndpoints.appointments.cancel(id), { body: data } as any);
      return response.data;
    },

    async getAvailableSlots(params) {
      const searchParams = new URLSearchParams({
        serviceId: params.serviceId,
        locationId: params.locationId,
        date: params.date,
      });
      if (params.providerId) {
        searchParams.set('providerId', params.providerId);
      }

      const response = await client.get<{ data: AvailableSlotsResponse }>(
        `${patientEndpoints.appointments.availableSlots}?${searchParams.toString()}`
      );
      return response.data;
    },
  };
}
