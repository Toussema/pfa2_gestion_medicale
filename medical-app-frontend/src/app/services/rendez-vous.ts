import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Récupère le token JWT depuis le localStorage
   */
  private getToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Récupère tous les rendez-vous du patient connecté
   */
  getPatientRendezVous(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/api/rendez-vous/patient`, { headers });
  }

  /**
   * Prend un nouveau rendez-vous
   */
  prendreRendezVous(rendezVousData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}/api/rendez-vous`, rendezVousData, { headers });
  }

  /**
   * Annule un rendez-vous
   */
  annulerRendezVous(rendezVousId: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/api/rendez-vous/${rendezVousId}/annuler`, {}, { headers });
  }

  /**
   * Récupère les détails d'un rendez-vous
   */
  getRendezVousDetails(rendezVousId: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}/api/rendez-vous/${rendezVousId}`, { headers });
  }

  /**
   * Modifie un rendez-vous existant
   */
  modifierRendezVous(rendezVousId: string, rendezVousData: any): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/api/rendez-vous/${rendezVousId}`, rendezVousData, { headers });
  }

  /**
   * Récupère les disponibilités d'un médecin
   */
  getMedecinDisponibilites(medecinId: string, date?: string): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let url = `${this.apiUrl}/api/disponibilites/medecin/${medecinId}`;
    
    if (date) {
      url += `?date=${date}`;
    }
    
    return this.http.get(url, { headers });
  }
}