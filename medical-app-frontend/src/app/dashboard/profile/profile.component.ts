// src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule,HeaderComponent,FooterComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isEditing = false;
  showDeleteSection = false;
  updatedUser: any = {};
  emailForUpdate: string = '';
  passwordForUpdate: string = '';
  emailForDelete: string = '';
  passwordForDelete: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.loadProfile();
    }
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.resetUpdateForm();
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil', err);
        this.errorMessage = 'Impossible de charger les informations du profil.';
        this.router.navigate(['/login']);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.resetUpdateForm();
    }
    this.clearMessages();
  }

  toggleDeleteSection(): void {
    this.showDeleteSection = !this.showDeleteSection;
    if (!this.showDeleteSection) {
      this.emailForDelete = '';
      this.passwordForDelete = '';
    }
    this.clearMessages();
  }

  resetUpdateForm(): void {
    if (this.user) {
      this.updatedUser = { 
        name: this.user.name || '',
        email: this.user.email || '',
        adresse: this.user.adresse || '',
        tel: this.user.tel || '',
        gsm: this.user.gsm || '',
        specialite: this.user.specialite || ''
      };
      this.emailForUpdate = '';
      this.passwordForUpdate = '';
    }
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  updateProfile(): void {
    if (!this.emailForUpdate || !this.passwordForUpdate) {
      this.errorMessage = 'Veuillez entrer votre email et mot de passe pour confirmer.';
      return;
    }

    if (this.emailForUpdate !== this.user.email) {
      this.errorMessage = 'L\'email de confirmation ne correspond pas à votre email actuel.';
      return;
    }

    this.authService.updateProfile(this.emailForUpdate, this.passwordForUpdate, this.updatedUser).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;
        this.emailForUpdate = '';
        this.passwordForUpdate = '';
        this.successMessage = 'Profil mis à jour avec succès !';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error || 'Erreur lors de la mise à jour du profil.';
      }
    });
  }

  deleteAccount(): void {
    if (!this.emailForDelete || !this.passwordForDelete) {
      this.errorMessage = 'Veuillez entrer votre email et mot de passe pour confirmer la suppression.';
      return;
    }

    if (this.emailForDelete !== this.user.email) {
      this.errorMessage = 'L\'email de confirmation ne correspond pas à votre email actuel.';
      return;
    }

    this.authService.deleteProfile(this.emailForDelete, this.passwordForDelete).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/home'], { queryParams: { deleted: 'true' } });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error || 'Erreur lors de la suppression du compte.';
      }
    });
  }
}