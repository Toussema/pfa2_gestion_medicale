import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  doctors: any[] = [];
  currentUser: { name: string; role: string } | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.checkUser();
  }

  loadDoctors(): void {
    this.authService.getDoctors().subscribe({
      next: (doctors) => {
        // Filtrer les disponibilités disponibles pour chaque médecin
        this.doctors = doctors.map(doctor => ({
          ...doctor,
          disponibilites: doctor.disponibilites.filter((disp: any) => disp.estDisponible)
        })).filter(doctor => doctor.disponibilites.length > 0); // Ne montrer que les médecins avec des disponibilités
      },
      error: (err) => console.error('Erreur lors du chargement des médecins', err)
    });
  }

  checkUser(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded = this.authService.decodeToken(token); // À implémenter dans AuthService
      this.currentUser = { name: decoded.name, role: decoded.role };
    }
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/home']);
  }

  goToRendezVous(doctorId: number): void {
    if (this.currentUser?.role === 'patient') {
      this.router.navigate(['/rendez-vous'], { queryParams: { medecinId: doctorId } });
    } else {
      this.router.navigate(['/rendez-vous']);
    }
  }

  // Méthode pour recharger les médecins si nécessaire (par exemple après confirmation)
  refreshDoctors(): void {
    this.loadDoctors();
  }
}