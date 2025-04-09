// src/main/java/com/medicalapp/entity/Disponibilite.java
package com.medicalapp.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "disponibilites")
public class Disponibilite {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "medecin_id", nullable = false)
    @JsonBackReference
    private User medecin;

    @Column(name = "jour", nullable = false)
    private LocalDate jour;

    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;

    @Column(name = "heure_fin", nullable = false)
    private LocalTime heureFin;

    // Constructeurs
    public Disponibilite() {}

    public Disponibilite(User medecin, LocalDate jour, LocalTime heureDebut, LocalTime heureFin) {
        this.medecin = medecin;
        this.jour = jour;
        this.heureDebut = heureDebut;
        this.heureFin = heureFin;
    }

    // Getters et setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getMedecin() { return medecin; }
    public void setMedecin(User medecin) { this.medecin = medecin; }
    public LocalDate getJour() { return jour; }
    public void setJour(LocalDate jour) { this.jour = jour; }
    public LocalTime getHeureDebut() { return heureDebut; }
    public void setHeureDebut(LocalTime heureDebut) { this.heureDebut = heureDebut; }
    public LocalTime getHeureFin() { return heureFin; }
    public void setHeureFin(LocalTime heureFin) { this.heureFin = heureFin; }
}