// src/main/java/com/medicalapp/repository/DocumentRepository.java
package com.medicalapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.medicalapp.entity.Document;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByRendezVousId(Long rendezVousId);
}