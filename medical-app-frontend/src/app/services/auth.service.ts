// auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Disponibilite } from '../models/disponibilites';



export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialite: string;
  disponibilites: Disponibilite[];
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private apiUrl = 'http://localhost:8080';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object // Injecter PLATFORM_ID
  ) {}

  signup(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { responseType: 'text' });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getDoctors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/doctors`);
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) { // Vérifier si on est côté client
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) { // Vérifier si on est côté client
      return localStorage.getItem('token');
    }
    return null; // Retourner null côté serveur
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) { // Vérifier si on est côté client
      localStorage.removeItem('token');
    }
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  decodeToken(token: string): any {
    if (!token) return null;
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }

  // gerer les disponibilites
  addDisponibilite(disponibilite: Disponibilite): Observable<Disponibilite> {
    return this.http.post<Disponibilite>(`${this.apiUrl}/api/disponibilites`, disponibilite);
  }

  getDisponibilitesByMedecinId(medecinId: number): Observable<Disponibilite[]> {
    return this.http.get<Disponibilite[]>(`${this.apiUrl}/api/disponibilites/${medecinId}`);
  }

  getCurrentDoctor(): Observable<Doctor> {
    const token = localStorage.getItem('token'); // Adjust based on your auth setup
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Doctor>(`${this.apiUrl}/current-doctor`, { headers });
  }
}