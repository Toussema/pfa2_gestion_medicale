import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictionService } from '../services/prediction.service';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.scss']
})
export class PredictionComponent {
  patientData = {
    gender: '',
    age: null,
    hypertension: false,
    heart_disease: false,
    smoking_history: '',
    bmi: null as  number | null,
    HbA1c_level: null,
    blood_glucose_level: null,
    height: null as number | null, // Ajout de la taille (en mètres)
    weight: null as number | null  // Ajout du poids (en kg)
  };
  probability: number | null = null;
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private predictionService: PredictionService) {}

  submitData() {
    this.errorMessage = '';
    this.probability = null;
    this.loading = true;

    // Validation simple
    if (
      !this.patientData.gender ||
      this.patientData.age === null ||
      this.patientData.height === null ||
      this.patientData.weight === null ||
      this.patientData.HbA1c_level === null ||
      this.patientData.blood_glucose_level === null ||
      !this.patientData.smoking_history
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.loading = false;
      return;
    }

    // Calcul de l'IMC
    this.patientData.bmi = this.patientData.weight / (this.patientData.height * this.patientData.height);

    this.predictionService.predictDiabetes(this.patientData).subscribe({
      next: (result) => {
        this.probability = result * 100; // Convertir en pourcentage
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la prédiction. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  getResultClass(): string {
    if (this.probability === null) return '';
    if (this.probability >= 70) return 'result-high';
    if (this.probability >= 30) return 'result-medium';
    return 'result-low';
  }
  downloadPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Titre
    doc.setFontSize(18);
    doc.text('Rapport de Prédiction du Diabète', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    const today = new Date().toISOString().split('T')[0];
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, 20, yPosition);
    yPosition += 10;

    // Section : Données du Patient
    doc.setFontSize(14);
    doc.text('Données du Patient', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.text(`Genre: ${this.patientData.gender === 'Male' ? 'Homme' : 'Femme'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Âge: ${this.patientData.age} ans`, 20, yPosition);
    yPosition += 8;
    doc.text(`Taille: ${this.patientData.height} m`, 20, yPosition);
    yPosition += 8;
    doc.text(`Poids: ${this.patientData.weight} kg`, 20, yPosition);
    yPosition += 8;
    doc.text(`IMC: ${this.patientData.bmi?.toFixed(1)}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Historique de tabagisme: ${this.patientData.smoking_history}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Niveau HbA1c: ${this.patientData.HbA1c_level}%`, 20, yPosition);
    yPosition += 8;
    doc.text(`Glucose sanguin: ${this.patientData.blood_glucose_level} mg/dL`, 20, yPosition);
    yPosition += 8;
    doc.text(`Hypertension: ${this.patientData.hypertension ? 'Oui' : 'Non'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Maladie cardiaque: ${this.patientData.heart_disease ? 'Oui' : 'Non'}`, 20, yPosition);
    yPosition += 15;

    // Section : Résultat de la Prédiction
    doc.setFontSize(14);
    doc.text('Résultat de la Prédiction', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(12);
    doc.text(`Probabilité de diabète: ${this.probability?.toFixed(2)}%`, 20, yPosition);
    yPosition += 8;
    const riskLevel = this.probability! >= 70 ? 'Élevé' : this.probability! >= 30 ? 'Moyen' : 'Faible';
    doc.text(`Niveau de risque: ${riskLevel}`, 20, yPosition);

    // Téléchargement du PDF
    doc.save(`prediction-diabete-${today}.pdf`);
  }
}