// src/app/services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface pour les notifications
export interface Notification {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getNotifications(): Observable<Notification[]> {
    const headers = this.getHeaders();
    return this.http.get<Notification[]>(`${this.apiUrl}/api/notifications`, { headers });
  }

  getUnreadNotifications(): Observable<Notification[]> {
    const headers = this.getHeaders();
    return this.http.get<Notification[]>(`${this.apiUrl}/api/notifications/unread`, { headers });
  }

  markAsRead(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.put<void>(`${this.apiUrl}/api/notifications/${id}/read`, {}, { headers });
  }

  deleteNotification(id: number): Observable<void> {
    const headers = this.getHeaders();
    return this.http.delete<void>(`${this.apiUrl}/api/notifications/${id}`, { headers });
  }
}

