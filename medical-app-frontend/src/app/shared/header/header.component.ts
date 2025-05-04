// src/app/shared/header/header.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path as needed
import { NotificationService, Notification } from '../../services/notification.service'; // Import NotificationService
import { User } from '../../models/user'; // Import the actual User model

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  isDepartmentOpen = false;
  isLoggedIn: boolean = false;
  isDoctor: boolean = false;
  unreadNotifications: Notification[] = []; // Propriété pour stocker les notifications non lues
  showPreview: boolean = false; // Propriété pour gérer l'affichage de l'aperçu

  constructor(private authService: AuthService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.updateUserState();
    this.loadUnreadNotifications(); // Charger les notifications non lues
  }

  private updateUserState(): void {
    const user: User | null = this.authService.getCurrentUser();
    console.log('Current User:', user); // Debug: Log the user object
    this.isLoggedIn = !!user;
    this.isDoctor = user?.role === 'medecin';
    console.log('isLoggedIn:', this.isLoggedIn, 'isDoctor:', this.isDoctor); // Debug: Log state
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) {
      this.isDepartmentOpen = false;
    }
  }

  toggleDepartment(): void {
    this.isDepartmentOpen = !this.isDepartmentOpen;
  }

  logout(): void {
    this.authService.logout(); // Call the logout method from AuthService
    this.updateUserState(); // Update the state after logout
    this.unreadNotifications = []; // Réinitialiser les notifications après déconnexion
  }

  loadUnreadNotifications(): void {
    if (this.isLoggedIn) {
      this.notificationService.getUnreadNotifications().subscribe({
        next: (notifications) => {
          this.unreadNotifications = notifications;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des notifications non lues', error);
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-toggle') && !target.closest('.dropdown-menu')) {
      this.isDepartmentOpen = false;
    }
  }
}