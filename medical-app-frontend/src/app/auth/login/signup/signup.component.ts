import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Ajout de FormsModule
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true, // Définir comme standalone
  imports: [FormsModule, CommonModule], // Importer FormsModule
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user: User = {
    name: '',
    email: '',
    password: '',
    role: 'patient' // Valeur par défaut
  };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    // Validation basique côté client
    if (!this.user.name || !this.user.email || !this.user.password || !this.user.role) {
      this.errorMessage = "Tous les champs obligatoires doivent être remplis.";
      return;
    }
  
    // Si médecin, vérifier les champs spécifiques
    if (this.user.role === 'medecin') {
      if (!this.user.specialite || !this.user.adresse || !this.user.tel || !this.user.gsm) {
        this.errorMessage = "Veuillez remplir tous les champs du médecin.";
        return;
      }
    }
  
    // Appel au service d'inscription
    this.authService.signup(this.user).subscribe({
      next: () => {
        this.successMessage = "Inscription réussie !";
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = "Erreur lors de l'inscription.";
        console.error(err);
      }
    });
  }
  
}