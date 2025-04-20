import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';

interface MedecinUser extends User {
  specialite: string;
  adresse: string;
  tel: string;
  gsm: string;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    RouterModule
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1 }),
        animate('300ms ease-in', style({ height: 0, opacity: 0 }))
      ])
    ])
  ]
})
export class AuthComponent implements OnInit {
  isActive = false;
  message = '';
  messageType: 'success' | 'error' = 'error';
  showMessage = false;
  isSubmitting = false;
  
  // Messages d'erreur spécifiques aux formulaires
  loginError = '';
  signupError = '';

  // Formulaire de connexion
  loginForm!: FormGroup;
  
  // Formulaire d'inscription
  signupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    // Initialisation supplémentaire si nécessaire
  }

  initForms(): void {
    // Formulaire de connexion
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Formulaire d'inscription avec validation réactive
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['patient', Validators.required],
      specialite: [''],
      adresse: [''],
      tel: ['', Validators.pattern(/^[0-9+\s-]{8,15}$/)],
      gsm: ['', Validators.pattern(/^[0-9+\s-]{8,15}$/)]
    });

    // Ajouter des validateurs conditionnels pour les champs de médecin
    this.signupForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'medecin') {
        this.signupForm.get('specialite')?.setValidators([Validators.required]);
        this.signupForm.get('adresse')?.setValidators([Validators.required]);
        this.signupForm.get('tel')?.setValidators([Validators.required, Validators.pattern(/^[0-9+\s-]{8,15}$/)]);
      } else {
        this.signupForm.get('specialite')?.clearValidators();
        this.signupForm.get('adresse')?.clearValidators();
        this.signupForm.get('tel')?.clearValidators();
      }
      
      // Mettre à jour l'état des validateurs
      this.signupForm.get('specialite')?.updateValueAndValidity();
      this.signupForm.get('adresse')?.updateValueAndValidity();
      this.signupForm.get('tel')?.updateValueAndValidity();
    });
  }

  toggleForm(showSignUp: boolean): void {
    this.isActive = showSignUp;
    this.clearFormErrors();
    this.hideMessage();
  }

  clearFormErrors(): void {
    this.loginError = '';
    this.signupError = '';
    
    // Réinitialiser l'état des formulaires
    if (!this.isActive) {
      this.loginForm.markAsPristine();
      this.loginForm.markAsUntouched();
    } else {
      this.signupForm.markAsPristine();
      this.signupForm.markAsUntouched();
    }
  }

  hideMessage(): void {
    this.showMessage = false;
    this.message = '';
  }

  onLogin(): void {
    this.loginError = '';
    
    // Marquer tous les champs comme touchés pour afficher les erreurs de validation
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.addShakeEffect('sign-in');
      return;
    }

    this.isSubmitting = true;
    
    const { email, password } = this.loginForm.value;
    
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.showToastMessage('Connexion réussie', 'success');
        
        // Délai court pour montrer le message avant la redirection
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
        this.loginError = err.error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
        this.addShakeEffect('sign-in');
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onSignup(): void {
    this.signupError = '';
    
    // Marquer tous les champs comme touchés pour afficher les erreurs de validation
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      this.addShakeEffect('sign-up');
      return;
    }

    this.isSubmitting = true;
    
    // Convertir les valeurs du formulaire en objet utilisateur
    const userData = this.signupForm.value as MedecinUser;
    
    this.authService.signup(userData).subscribe({
      next: () => {
        this.showToastMessage('Inscription réussie ! Vous pouvez maintenant vous connecter', 'success');
        this.toggleForm(false);
        this.signupForm.reset({
          role: 'patient'
        });
      },
      error: (err) => {
        this.signupError = err.error?.message || "Erreur lors de l'inscription. Veuillez réessayer.";
        this.addShakeEffect('sign-up');
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  private showToastMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    this.showMessage = true;
    
    // Masquer automatiquement le message après 5 secondes
    setTimeout(() => {
      this.showMessage = false;
    }, 5000);
  }

  // Ajouter une animation de secousse aux formulaires avec erreur
  private addShakeEffect(formClass: string): void {
    const form = document.querySelector(`.${formClass}`);
    if (form) {
      form.classList.add('shake-error');
      setTimeout(() => {
        form.classList.remove('shake-error');
      }, 500);
    }
  }
}