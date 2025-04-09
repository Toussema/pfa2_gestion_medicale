// user.ts
export interface User {
    id?: string;
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'medecin';
    specialite?: string;
    adresse?: string;
    tel?: string;
    gsm?: string;
  }