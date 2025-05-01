// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Notification } from '../models/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/notifications';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Aucun token trouvé dans le localStorage');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: any) {
    console.error('Une erreur est survenue:', error);
    return throwError(() => new Error(error.message || 'Erreur serveur'));
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      map(response => response.map(item => ({
        id: item.id,
        userId: item.userId || item.user_id,
        message: item.message,
        createdAt: item.createdAt || item.created_at,
        isRead: item.isRead || item.is_read
      }))),
      catchError(this.handleError)
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<any[]>(`${this.apiUrl}/unread`, { headers: this.getHeaders() }).pipe(
      map(response => response.map(item => ({
        id: item.id,
        userId: item.userId || item.user_id,
        message: item.message,
        createdAt: item.createdAt || item.created_at,
        isRead: item.isRead || item.is_read
      }))),
      catchError(this.handleError)
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/all`, { headers: this.getHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
}