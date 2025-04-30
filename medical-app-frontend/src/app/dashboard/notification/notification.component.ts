// src/app/dashboard/notification/notification.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Ajout pour ngClass, ngFor, ngIf, et pipe date
import { RouterLink } from '@angular/router'; // Ajout pour routerLink
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  standalone: true, // Marquer comme autonome
  imports: [CommonModule] // Importer les modules nécessaires
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  unreadNotifications: Notification[] = [];
  showAllNotifications: boolean = true; // Toujours afficher la liste

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getNotifications().subscribe({
      next: (notifications) => {
        console.log('Notifications récupérées :', notifications); // Log pour déboguer
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des notifications', error);
      }
    });

    this.notificationService.getUnreadNotifications().subscribe({
      next: (unread) => {
        console.log('Notifications non lues récupérées :', unread); // Log pour déboguer
        this.unreadNotifications = unread;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des notifications non lues', error);
      }
    });
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
        console.log(`Notification ${id} marquée comme lue`);
        this.loadNotifications(); // Recharger les notifications
      },
      error: (error) => {
        console.error('Erreur lors du marquage comme lu', error);
      }
    });
  }

  deleteNotification(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) {
      this.notificationService.deleteNotification(id).subscribe({
        next: () => {
          console.log(`Notification ${id} supprimée`);
          this.loadNotifications(); // Recharger les notifications
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la notification', error);
        }
      });
    }
  }

  toggleNotifications(): void {
    this.showAllNotifications = !this.showAllNotifications;
  }
}
