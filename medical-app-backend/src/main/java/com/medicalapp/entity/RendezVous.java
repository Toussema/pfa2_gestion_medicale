// src/main/java/com/medicalapp/entity/RendezVous.java
package com.medicalapp.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "rendez_vous")
public class RendezVous {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;

    @ManyToOne
    @JoinColumn(name = "medecin_id", nullable = false)
    private User medecin;

    @ManyToOne
    @JoinColumn(name = "disponibilite_id", nullable = false)
    private Disponibilite disponibilite;

    private LocalDateTime datePrise;

    @Enumerated(EnumType.STRING)
    private StatutRendezVous statut;

    public enum StatutRendezVous {
        EN_ATTENTE, CONFIRME, ANNULE
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }
    public User getMedecin() { return medecin; }
    public void setMedecin(User medecin) { this.medecin = medecin; }
    public Disponibilite getDisponibilite() { return disponibilite; }
    public void setDisponibilite(Disponibilite disponibilite) { this.disponibilite = disponibilite; }
    public LocalDateTime getDatePrise() { return datePrise; }
    public void setDatePrise(LocalDateTime datePrise) { this.datePrise = datePrise; }
    public StatutRendezVous getStatut() { return statut; }
    public void setStatut(StatutRendezVous statut) { this.statut = statut; }
}