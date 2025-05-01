// src/app/dashboard/notification/notification.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/notification';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent, HeaderComponent]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  unreadNotifications: Notification[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading = true;
    this.error = null;

    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
        this.updateUnreadNotifications();
      },
      error: (error) => {
        this.error = error.message || 'Impossible de charger les notifications';
        this.loading = false;
      }
    });
  }

  updateUnreadNotifications(): void {
    this.unreadNotifications = this.notifications.filter(notification => !notification.isRead);
  }

  markAsRead(id: number): void {
    this.loading = true;
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
          this.notifications[index].isRead = true;
          this.updateUnreadNotifications();
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du marquage comme lu';
        this.loading = false;
      }
    });
  }

  deleteNotification(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.loading = true;
      this.notificationService.deleteNotification(id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== id);
          this.updateUnreadNotifications();
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Erreur lors de la suppression';
          this.loading = false;
        }
      });
    }
  }

  markAllAsRead(): void {
    this.loading = true;
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadNotifications = [];
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Erreur lors du marquage global';
        this.loading = false;
      }
    });
  }

  deleteAllNotifications(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      this.loading = true;
      this.notificationService.deleteAllNotifications().subscribe({
        next: () => {
          this.notifications = [];
          this.unreadNotifications = [];
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Erreur lors de la suppression globale';
          this.loading = false;
        }
      });
    }
  }
}