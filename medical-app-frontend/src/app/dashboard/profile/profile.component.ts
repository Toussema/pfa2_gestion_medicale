// src/app/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isEditing = false;
  updatedUser: any = {};
  emailForUpdate: string = '';
  passwordForUpdate: string = '';
  emailForDelete: string = '';
  passwordForDelete: string = '';
  errorMessage: string = '';

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
        this.updatedUser = { ...user }; // Copie pour modification
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil', err);
        this.router.navigate(['/login']);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.errorMessage = '';
  }

  updateProfile(): void {
    if (!this.emailForUpdate || !this.passwordForUpdate) {
      this.errorMessage = 'Veuillez entrer votre email et mot de passe pour confirmer.';
      return;
    }
    this.authService.updateProfile(this.emailForUpdate, this.passwordForUpdate, this.updatedUser).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;
        this.emailForUpdate = '';
        this.passwordForUpdate = '';
        this.errorMessage = 'Profil mis à jour avec succès !';
      },
      error: (err) => {
        this.errorMessage = err.error || 'Erreur lors de la mise à jour du profil.';
      }
    });
  }

  deleteAccount(): void {
    if (!this.emailForDelete || !this.passwordForDelete) {
      this.errorMessage = 'Veuillez entrer votre email et mot de passe pour confirmer.';
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      this.authService.deleteProfile(this.emailForDelete, this.passwordForDelete).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de la suppression du compte.';
        }
      });
    }
  }
}