import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule, FooterComponent, HeaderComponent],
  templateUrl: './doctors.component.html',
  styleUrls: ['./doctors.component.css'],
  animations: [
    trigger('cardAnimation', [
      state('collapsed', style({
        height: '*',
      })),
      state('expanded', style({
        height: '*',
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-in-out')
      ])
    ]),
    trigger('expandDetails', [
      state('void', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('visible', style({
        height: '*',
        opacity: '1'
      })),
      transition('void <=> visible', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class DoctorsComponent implements OnInit, AfterViewInit {
  allDoctors: any[] = [];
  filteredDoctors: any[] = [];
  searchQuery: string = '';
  currentUser: { name: string; role: string } | null = null;
  selectedDoctor: any = null;
  selectedFilter: string = 'all'; // Nouvelle propriété pour le filtre
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

  filterDoctors(): void {
    let filtered = [...this.allDoctors];

    // Filtrer par spécialité
    if (this.selectedFilter !== 'all') {
      const specialtyMap: { [key: string]: string } = {
        cat1: 'Cardiology',
        cat2: 'Dental',
        cat3: 'Neurology',
        cat4: 'Medicine',
        cat5: 'Pediatric',
        cat6: 'Traumatology'
      };
      filtered = filtered.filter(doctor => 
        doctor.specialite?.toLowerCase() === specialtyMap[this.selectedFilter]?.toLowerCase()
      );
    }

    // Appliquer la recherche par nom, spécialité ou adresse
    const query = this.searchQuery.trim().toLowerCase();
    if (query) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(query) ||
        (doctor.specialite && doctor.specialite.toLowerCase().includes(query)) ||
        (doctor.adresse && doctor.adresse.toLowerCase().includes(query))
      );
    }

    this.filteredDoctors = filtered;
  }

  searchDoctors(): void {
    this.filterDoctors(); // Réutiliser la logique de filtrage combinée
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
        setTimeout(async () => {
          try {
            const L = (await import('leaflet')).default;
            this.initMap(doctor.adresse, L);
          } catch (error) {
            console.error('Erreur lors du chargement de Leaflet', error);
          }
        }, 300);
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

          this.map = L.map(this.mapElement.nativeElement).setView([lat, lon], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(this.map);

          const customIcon = L.icon({
            iconUrl: '/assets/marker-icon.png',
            iconRetinaUrl: '/assets/marker-icon-2x.png',
            shadowUrl: '/assets/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });

          L.marker([lat, lon], { icon: customIcon }).addTo(this.map)
            .bindPopup(address)
            .openPopup();

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