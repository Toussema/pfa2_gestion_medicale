// src/app/services/auth.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user';
import { Disponibilite } from '../models/disponibilites';
import { RendezVous } from '../models/rendez-vous';
import { Document } from '../models/document';


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
  private currentUser: User | null = null;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  signup(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        this.saveToken(response.token);
        this.currentUser = response.user;
      })
    );
  }

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/api/doctors`);
  }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/api/all-doctors`);
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      this.currentUser = null;
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

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Gérer les disponibilités
  addDisponibilite(disponibilite: Disponibilite): Observable<Disponibilite> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Disponibilite>(`${this.apiUrl}/api/disponibilites`, disponibilite, { headers });
  }

  getDisponibilitesByMedecinId(medecinId: number): Observable<Disponibilite[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Disponibilite[]>(`${this.apiUrl}/api/disponibilites/${medecinId}`, { headers });
  }

  getAllDisponibilitesByMedecinId(medecinId: number): Observable<Disponibilite[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Disponibilite[]>(`${this.apiUrl}/api/all-disponibilites/${medecinId}`, { headers });
  }

  updateDisponibilite(disponibiliteId: number, disponibilite: Disponibilite): Observable<Disponibilite> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Disponibilite>(`${this.apiUrl}/api/disponibilites/${disponibiliteId}`, disponibilite, { headers });
  }

  deleteDisponibilite(disponibiliteId: number): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/api/disponibilites/${disponibiliteId}`, { headers });
  }

  prendreRendezVous(medecinId: number, disponibiliteId: number): Observable<RendezVous> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = { medecinId: medecinId.toString(), disponibiliteId: disponibiliteId.toString() };
    return this.http.post<RendezVous>(`${this.apiUrl}/api/rendez-vous`, null, { headers, params });
  }

  getPatientRendezVous(): Observable<RendezVous[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<RendezVous[]>(`${this.apiUrl}/api/rendez-vous/patient`, { headers });
  }

  getMedecinRendezVous(): Observable<RendezVous[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<RendezVous[]>(`${this.apiUrl}/api/rendez-vous/medecin`, { headers });
  }

  updateRendezVous(id: number, statut: string): Observable<RendezVous> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = { statut };
    return this.http.put<RendezVous>(`${this.apiUrl}/api/rendez-vous/${id}`, null, { headers, params });
  }

  getProfile(): Observable<User> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(`${this.apiUrl}/api/profile`, { headers });
  }

  updateProfile(email: string, password: string, updatedUser: User): Observable<User> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = { email, password };
    return this.http.put<User>(`${this.apiUrl}/api/profile`, updatedUser, { headers, params });
  }

  deleteProfile(email: string, password: string): Observable<void> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = { email, password };
    return this.http.delete<void>(`${this.apiUrl}/api/profile`, { headers, params });
  }

  uploadDocument(rendezVousId: number, file: File): Observable<Document> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('rendezVousId', rendezVousId.toString());
    formData.append('file', file);
    return this.http.post<Document>(`${this.apiUrl}/api/documents/upload`, formData, { headers });
  }

  getDocumentsByRendezVousId(rendezVousId: number): Observable<Document[]> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Document[]>(`${this.apiUrl}/api/documents/rendez-vous/${rendezVousId}`, { headers });
  }

  downloadDocument(documentId: number): Observable<Blob> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/api/documents/download/${documentId}`, { headers, responseType: 'blob' });
  }

  markDocumentAsConsulted(documentId: number): Observable<Document> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Document>(`${this.apiUrl}/api/documents/consult/${documentId}`, null, { headers });
  }

  addRemarksToDocument(documentId: number, remarks: string): Observable<Document> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const params = { remarks };
    return this.http.put<Document>(`${this.apiUrl}/api/documents/remarks/${documentId}`, null, { headers, params });
  }
}