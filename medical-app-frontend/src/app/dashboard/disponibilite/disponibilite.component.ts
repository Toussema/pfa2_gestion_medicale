import { FooterComponent } from './../../shared/footer/footer.component';
import { HeaderComponent } from './../../shared/header/header.component';
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
  imports: [CommonModule, FormsModule, RouterModule,FooterComponent,HeaderComponent],
  templateUrl: './disponibilite.component.html',
  styleUrls: ['./disponibilite.component.css']
})
export class DisponibiliteComponent implements OnInit {
  disponibilite: Disponibilite = {
    medecin: { id: 0 },
    jour: '',
    heureDebut: '',
    heureFin: '',
    estDisponible: true
  };
  successMessage: string | null = null;
  errorMessage: string | null = null;
  disponibilites: Disponibilite[] = [];
  editingDisponibilite: Disponibilite | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded = this.authService.decodeToken(token);
      if (decoded.role !== 'medecin') {
        this.router.navigate(['/home']);
      } else {
        this.disponibilite.medecin.id = decoded.id;
        this.loadDisponibilites();
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.editingDisponibilite && this.editingDisponibilite.id) {
      // Mode modification
      const updatedDisponibilite: Disponibilite = {
        id: this.editingDisponibilite.id,
        medecin: { id: this.disponibilite.medecin.id },
        jour: this.disponibilite.jour,
        heureDebut: this.disponibilite.heureDebut,
        heureFin: this.disponibilite.heureFin,
        estDisponible: true
      };
      this.authService.updateDisponibilite(this.editingDisponibilite.id, updatedDisponibilite).subscribe({
        next: () => {
          this.successMessage = 'Disponibilité modifiée avec succès';
          this.errorMessage = null;
          this.resetForm();
          this.loadDisponibilites();
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de la modification de la disponibilité';
          this.successMessage = null;
          console.error('Erreur modification:', err);
        }
      });
    } else {
      // Mode ajout
      this.authService.addDisponibilite(this.disponibilite).subscribe({
        next: () => {
          this.successMessage = 'Disponibilité ajoutée avec succès';
          this.errorMessage = null;
          this.resetForm();
          this.loadDisponibilites();
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de l’ajout de la disponibilité';
          this.successMessage = null;
          console.error('Erreur ajout:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.disponibilite = {
      medecin: { id: this.disponibilite.medecin.id },
      jour: '',
      heureDebut: '',
      heureFin: '',
      estDisponible: true
    };
    this.editingDisponibilite = null;
  }

  loadDisponibilites(): void {
    const medecinId = this.disponibilite.medecin.id;
    if (medecinId) {
      this.authService.getAllDisponibilitesByMedecinId(medecinId).subscribe({
        next: (disponibilites) => {
          console.log('Disponibilités reçues:', disponibilites);
          this.disponibilites = disponibilites.filter(disp => {
            if (!disp.id) {
              console.warn('Disponibilité sans ID détectée:', disp);
              return false;
            }
            return true;
          });
        },
        error: (err) => {
          console.error('Erreur lors du chargement des disponibilités:', err);
          this.errorMessage = 'Erreur lors du chargement des disponibilités';
        }
      });
    }
  }

  editDisponibilite(disponibilite: Disponibilite): void {
    console.log('Tentative de modification:', disponibilite);
    if (!disponibilite || !disponibilite.id || typeof disponibilite.id !== 'number') {
      this.errorMessage = 'Erreur : Disponibilité invalide ou sans identifiant';
      console.error('Disponibilité invalide:', disponibilite);
      return;
    }
    this.editingDisponibilite = { ...disponibilite };
    this.disponibilite = {
      id: disponibilite.id,
      medecin: { id: disponibilite.medecin?.id ?? this.disponibilite.medecin.id },
      jour: disponibilite.jour,
      heureDebut: disponibilite.heureDebut,
      heureFin: disponibilite.heureFin,
      estDisponible: disponibilite.estDisponible
    };
    console.log('Formulaire rempli avec:', this.disponibilite);
  }

  deleteDisponibilite(disponibiliteId: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce créneau ?')) {
      this.authService.deleteDisponibilite(disponibiliteId).subscribe({
        next: () => {
          this.successMessage = 'Disponibilité supprimée avec succès';
          this.errorMessage = null;
          this.loadDisponibilites();
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors de la suppression de la disponibilité';
          this.successMessage = null;
          console.error('Erreur suppression:', err);
        }
      });
    }
  }
}