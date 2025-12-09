export interface Appointment {
  id: string;
  patientId: string;
  practitionerId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'arrived' | 'completed' | 'cancelled';
}

export interface MedicalSpa {
  id: string;
  name: string;
  subdomain: string;
  settings: Record<string, any>;
}
