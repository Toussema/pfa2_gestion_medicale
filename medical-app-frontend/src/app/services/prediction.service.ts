// src/app/services/prediction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private apiUrl = 'http://localhost:8080'; // URL de Spring Boot

  constructor(private http: HttpClient) {}

  predictDiabetes(patientData: any): Observable<number> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<number>(`${this.apiUrl}/api/prediction/diabetes`, patientData, { headers });
  }
}