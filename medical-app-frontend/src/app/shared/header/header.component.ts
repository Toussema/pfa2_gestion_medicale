import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path as needed
import { User } from '../../models/user'; // Import the actual User model

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent {
  isMenuOpen = false;
  isDepartmentOpen = false;
  isLoggedIn: boolean = false;
  isDoctor: boolean = false;

  constructor(private authService: AuthService) {
    this.updateUserState();
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
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-toggle') && !target.closest('.dropdown-menu')) {
      this.isDepartmentOpen = false;
    }
  }
}