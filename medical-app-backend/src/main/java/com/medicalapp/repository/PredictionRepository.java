// src/main/java/com/medicalapp/repository/PredictionRepository.java
package com.medicalapp.repository;

import com.medicalapp.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {
    List<Prediction> findByUserId(Long userId);
}