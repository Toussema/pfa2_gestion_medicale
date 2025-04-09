import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = ''; // Ajout de la propriété errorMessage

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
  
      console.log('🔄 Tentative de connexion avec :', email);
  
      this.authService.login({ email, password }).subscribe({
        next: (response) => {
          console.log('✅ Connexion réussie ! Réponse reçue :', response);
          localStorage.setItem('token', response.token);
          this.errorMessage = '';
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('❌ Échec de la connexion :', err);
          this.errorMessage = err.error?.message || 'Erreur de connexion';
        }
      });
    } else {
      console.warn('⚠️ Formulaire invalide. Veuillez remplir tous les champs correctement.');
    }
  }
  
}