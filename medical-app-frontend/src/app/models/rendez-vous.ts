// src/app/models/rendez-vous.ts
export interface RendezVous {
    id?: number;
    patient: { id: number; name: string };
    medecin: { id: number; name: string; specialite: string };
    disponibilite: { id: number; jour: string; heureDebut: string; heureFin: string };
    datePrise: string;
    statut: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE';
  }