// src/app/documents/documents.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { HeaderComponent } from '../../shared/header/header.component';
@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule,FooterComponent,HeaderComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  rendezVousId: number | null = null;
  documents: any[] = [];
  selectedFile: File | null = null;
  errorMessage: string = '';
  currentUser: any = null;
  remarksInput: { [key: number]: string } = {}; // Stocke les remarques temporaires

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else {
      this.rendezVousId = +this.route.snapshot.queryParamMap.get('rendezVousId')! || null;
      const token = this.authService.getToken();
      if (token) {
        this.currentUser = this.authService.decodeToken(token);
      }
      if (this.rendezVousId) {
        this.loadDocuments();
      } else {
        this.errorMessage = 'Aucun rendez-vous sélectionné.';
      }
    }
  }

  loadDocuments(): void {
    if (this.rendezVousId) {
      this.authService.getDocumentsByRendezVousId(this.rendezVousId).subscribe({
        next: (documents) => {
          this.documents = documents;
          console.log(this.documents); // chaque doc doit avoir .isConsulted
        },
        error: (err) => {
          this.errorMessage = err.error || 'Erreur lors du chargement des documents.';
        }
      });
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadDocument(): void {
    if (!this.rendezVousId || !this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un rendez-vous etng  un fichier.';
      return;
    }
    this.authService.uploadDocument(this.rendezVousId, this.selectedFile).subscribe({
      next: () => {
        this.loadDocuments();
        this.selectedFile = null;
        this.errorMessage = 'Document envoyé avec succès !';
      },
      error: (err) => {
        this.errorMessage = err.error || 'Erreur lors de l\'envoi du document.';
      }
    });
  }

  downloadDocument(documentId: number, fileName: string): void {
    this.authService.downloadDocument(documentId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du téléchargement du document.';
      }
    });
  }

  markAsConsulted(documentId: number): void {
    this.authService.markDocumentAsConsulted(documentId).subscribe({
      next: () => this.loadDocuments(),
      error: (err) => {
        this.errorMessage = err.error || 'Erreur lors de la mise à jour de l’état.';
      }
    });
  }

  addRemarks(documentId: number): void {
    const remarks = this.remarksInput[documentId];
    if (!remarks) {
      this.errorMessage = 'Veuillez entrer une remarque.';
      return;
    }
    this.authService.addRemarksToDocument(documentId, remarks).subscribe({
      next: () => {
        this.loadDocuments();
        this.remarksInput[documentId] = ''; // Réinitialiser
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = err.error || 'Erreur lors de l’ajout de la remarque.';
      }
    });
  }
}