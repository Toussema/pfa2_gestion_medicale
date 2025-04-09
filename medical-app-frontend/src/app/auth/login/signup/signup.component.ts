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
    this.authService.signup(this.user).subscribe({
      next: (response) => {
        this.successMessage = JSON.parse(response).message;
        this.errorMessage = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error ? JSON.parse(err.error).message : 'Erreur lors de l’inscription';
        this.successMessage = '';
      }
    });
  }
}