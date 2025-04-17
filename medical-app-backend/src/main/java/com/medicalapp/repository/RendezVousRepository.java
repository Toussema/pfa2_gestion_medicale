// src/main/java/com/medicalapp/repository/RendezVousRepository.java
package com.medicalapp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicalapp.entity.RendezVous;

public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {
    List<RendezVous> findByPatientId(Long patientId);
    List<RendezVous> findByMedecinId(Long medecinId);
    Optional<RendezVous> findByDisponibiliteId(Long disponibiliteId);
}