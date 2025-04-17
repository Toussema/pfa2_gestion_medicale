// src/app/doctors/doctors.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css']
})
export class DoctorsComponent implements OnInit, AfterViewInit {
  allDoctors: any[] = [];
  filteredDoctors: any[] = [];
  searchQuery: string = '';
  currentUser: { name: string; role: string } | null = null;
  selectedDoctor: any = null;
  private map: any | undefined;

  @ViewChild('map') mapElement!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAllDoctors();
    this.checkUser();
  }

  ngAfterViewInit(): void {
    // Initialisation différée dans toggleDoctor
  }

  loadAllDoctors(): void {
    this.authService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.allDoctors = doctors;
        this.filteredDoctors = [...this.allDoctors];
      },
      error: (err) => console.error('Erreur lors du chargement des médecins', err)
    });
  }

  searchDoctors(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      this.filteredDoctors = this.allDoctors.filter(doctor =>
        doctor.name.toLowerCase().includes(query) ||
        (doctor.adresse && doctor.adresse.toLowerCase().includes(query))
      );
    } else {
      this.filteredDoctors = [...this.allDoctors];
    }
  }

  checkUser(): void {
    const token = this.authService.getToken();
    if (token) {
      const decoded = this.authService.decodeToken(token);
      this.currentUser = { name: decoded.name, role: decoded.role };
    }
  }

  goToRendezVous(doctorId: number): void {
    if (this.currentUser?.role === 'patient') {
      this.router.navigate(['/rendez-vous'], { queryParams: { medecinId: doctorId } });
    } else {
      this.router.navigate(['/rendez-vous']);
    }
  }

  async toggleDoctor(doctor: any): Promise<void> {
    if (this.selectedDoctor?.id === doctor.id) {
      this.selectedDoctor = null;
      if (this.map) {
        this.map.remove();
        this.map = undefined;
      }
    } else {
      this.selectedDoctor = doctor;
      if (isPlatformBrowser(this.platformId)) {
        const L = (await import('leaflet')).default;
        setTimeout(() => this.initMap(doctor.adresse, L), 100); // Délai pour garantir le rendu
      }
    }
  }

  initMap(address: string, L: any): void {
    if (!address || !this.mapElement || !isPlatformBrowser(this.platformId)) return;

    console.log('Initialisation de la carte pour:', address);

    this.http.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`).subscribe({
      next: (results: any) => {
        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lon = parseFloat(results[0].lon);

          // Initialiser la carte Leaflet
          this.map = L.map(this.mapElement.nativeElement).setView([lat, lon], 15);

          // Ajouter la couche OpenStreetMap
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(this.map);

          // Configurer les icônes personnalisées
          const customIcon = L.icon({
            iconUrl: '/assets/marker-icon.png',
            iconRetinaUrl: '/assets/marker-icon-2x.png',
            shadowUrl: '/assets/marker-shadow.png',
            iconSize: [25, 41], // Taille de l’icône
            iconAnchor: [12, 41], // Point d’ancrage de l’icône
            popupAnchor: [1, -34], // Position de la popup par rapport à l’icône
            shadowSize: [41, 41] // Taille de l’ombre
          });

          // Ajouter un marqueur avec l’icône personnalisée
          L.marker([lat, lon], { icon: customIcon }).addTo(this.map)
            .bindPopup(address)
            .openPopup();

          // Forcer Leaflet à recalculer la taille
          setTimeout(() => {
            if (this.map) {
              this.map.invalidateSize();
            }
          }, 100);
        } else {
          console.error('Adresse non trouvée sur OpenStreetMap');
        }
      },
      error: (err) => console.error('Erreur lors du géocodage', err)
    });
  }
}