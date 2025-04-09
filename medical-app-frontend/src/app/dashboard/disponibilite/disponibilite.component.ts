// src/app/dashboard/disponibilite/disponibilite.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Disponibilite } from '../../models/disponibilites';

@Component({
  selector: 'app-disponibilite',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './disponibilite.component.html',
  styleUrls: ['./disponibilite.component.css']
})
export class DisponibiliteComponent implements OnInit {

  disponibilite: Disponibilite = {
    medecin: { id: 0 }, // Initialisation avec un objet medecin    
    jour: '',
    heureDebut: '',
    heureFin: ''
  };
  successMessage: string | null = null;
  errorMessage: string | null = null;
  disponibilites: Disponibilite[] = [];
  doctorName: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentDoctorDisponibilites();
    const token = this.authService.getToken();
    if (token) {
      const decoded = this.authService.decodeToken(token);
      if (decoded.role !== 'medecin') {
        this.router.navigate(['/home']); // Redirige si pas médecin
      } else {
        this.disponibilite.medecin.id = decoded.id; // Récupère l’ID du médecin connecté
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    this.authService.addDisponibilite(this.disponibilite).subscribe({
      next: (response) => {
        this.successMessage = 'Disponibilité ajoutée avec succès';
        this.errorMessage = null;
        this.resetForm();
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de l’ajout de la disponibilité';
        this.successMessage = null;
        console.error(err);
      }
    });
  } 

  resetForm(): void {
    this.disponibilite.jour = '';
    this.disponibilite.heureDebut = '';
    this.disponibilite.heureFin = '';
  }


  loadCurrentDoctorDisponibilites(): void {
    this.authService.getCurrentDoctor().subscribe({
      next: (doctor) => {
        this.doctorName = doctor.name; // Store the doctor's name (optional)
        this.disponibilites = doctor.disponibilites || []; // Load disponibilites
        console.log('Disponibilites for current doctor:', this.disponibilites);
      },
      error: (err) => {
        console.error('Error loading current doctor:', err);
      }
    });
  }
}