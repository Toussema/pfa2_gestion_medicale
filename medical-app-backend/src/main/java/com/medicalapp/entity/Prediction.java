// src/main/java/com/medicalapp/entity/Prediction.java
package com.medicalapp.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Data
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private int age;

    @Column(nullable = false)
    private boolean hypertension;

    @Column(name = "heart_disease", nullable = false)
    private boolean heartDisease;

    @Column(name = "smoking_history", nullable = false)
    private String smokingHistory;

    @Column(nullable = false)
    private double bmi;

    @Column(name = "hba1c_level", nullable = false)
    private double hba1cLevel;

    @Column(name = "blood_glucose_level", nullable = false)
    private int bloodGlucoseLevel;

    @Column(nullable = false)
    private double probability;

    @Column(name = "prediction_date", nullable = false)
    private LocalDateTime predictionDate;
}