import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PredictionService } from '../services/prediction.service';

@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    bmi: null,
    HbA1c_level: null,
    blood_glucose_level: null
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
      this.patientData.bmi === null ||
      this.patientData.HbA1c_level === null ||
      this.patientData.blood_glucose_level === null ||
      !this.patientData.smoking_history
    ) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.loading = false;
      return;
    }

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
}