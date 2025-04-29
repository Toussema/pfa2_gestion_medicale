
// src/app/rendez-vous/rendez-vous.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RendezVous } from '../../models/rendez-vous';
import { FooterComponent} from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
@Component({
  selector: 'app-gestion-rendezvous',  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule,FooterComponent,HeaderComponent],
   templateUrl: './gestion-rendezvous.component.html',
  styleUrl: './gestion-rendezvous.component.scss'
})
export class GestionRendezvousComponent implements OnInit {
  rendezVousList: RendezVous[] = [];
  disponibilites: any[] = [];
  selectedDisponibiliteId: number | null = null;
  medecinId: number | null = null;
  currentUser: any = null;
  doctorDetails: any = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.currentUser = this.authService.decodeToken(token);
      this.medecinId = +this.route.snapshot.queryParamMap.get('medecinId')! || null;
      if (this.currentUser.role === 'patient' && this.medecinId) {
        this.loadDoctorDetails();
        this.loadDisponibilites();
      }
      this.loadRendezVous();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadDoctorDetails(): void {
    this.authService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctorDetails = doctors.find(d => d.id === this.medecinId);
      }
    });
  }

  loadDisponibilites(): void {
    if (this.medecinId) {
      this.authService.getDisponibilitesByMedecinId(this.medecinId).subscribe({
        next: (disponibilites) => { this.disponibilites = disponibilites.filter(d => d.estDisponible); } // Filtrer les disponibilités disponibles
      });
    }
  }

  loadRendezVous(): void {
    if (this.currentUser.role === 'patient') {
      this.authService.getPatientRendezVous().subscribe({
        next: (rendezVous) => this.rendezVousList = rendezVous
      });
    } else if (this.currentUser.role === 'medecin') {
      this.authService.getMedecinRendezVous().subscribe({
        next: (rendezVous) => this.rendezVousList = rendezVous
      });
    }
  }

  prendreRendezVous(): void {
    if (this.medecinId && this.selectedDisponibiliteId) {
      this.authService.prendreRendezVous(this.medecinId, this.selectedDisponibiliteId).subscribe({
        next: () => {
          this.loadRendezVous();
          this.loadDisponibilites(); // Recharger pour mettre à jour la liste
          this.selectedDisponibiliteId = null;
        },
        error: (err) => console.error('Erreur lors de la prise de rendez-vous', err)
      });
    }
  }

  modifierRendezVous(rendezVous: RendezVous): void {
    if (rendezVous.statut === 'EN_ATTENTE') {
      // Logique pour modifier (par exemple, changer la disponibilité)
      this.selectedDisponibiliteId = rendezVous.disponibilite.id;
    }
  }

  annulerRendezVous(id: number): void {
    this.authService.updateRendezVous(id, 'ANNULE').subscribe({
      next: () => this.loadRendezVous()
    });
  }

  confirmerRendezVous(id: number): void {
    this.authService.updateRendezVous(id, 'CONFIRME').subscribe({
      next: () => {
        this.loadRendezVous();
        if (this.currentUser.role === 'patient' && this.medecinId) {
          this.loadDisponibilites(); // Recharger les disponibilités pour refléter l’indisponibilité
        }
      }
    });
  }

  goToDocuments(rendezVousId: number): void {
    this.router.navigate(['/documents'], { queryParams: { rendezVousId } });
  }
}