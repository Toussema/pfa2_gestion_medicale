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
      next: (doctors) => this.doctors = doctors,
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
}