// src/main/java/com/medicalapp/repository/DisponibiliteRepository.java
package com.medicalapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicalapp.entity.Disponibilite;

public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {
    List<Disponibilite> findByMedecinId(Long medecinId);
}