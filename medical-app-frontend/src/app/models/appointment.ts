// appointment.ts
export interface Appointment {
    id: string;
    patientName?: string;
    medecinName?: string;
    jour: string;
    debut: string;
    fin: string;
    statut: string;
  }