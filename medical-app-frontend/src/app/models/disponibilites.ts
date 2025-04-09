// src/app/models/disponibilite.ts
export interface Disponibilite {
    id?: number;
    medecin: { id: number }; // Objet medecin avec id
    jour: string; // Format ISO, ex. "2025-04-08"
    heureDebut: string; // ex. "09:00"
    heureFin: string; // ex. "17:00"
  }