// src/main/java/com/medicalapp/service/PredictionService.java
package com.medicalapp.service;

import com.medicalapp.entity.Prediction;
import com.medicalapp.repository.PredictionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class PredictionService {

    private final RestTemplate restTemplate;
    private final String flaskApiUrl;
    private final PredictionRepository predictionRepository;

    public PredictionService(RestTemplate restTemplate, 
                            @Value("${flask.api.url:http://localhost:5000}") String flaskApiUrl,
                            PredictionRepository predictionRepository) {
        this.restTemplate = restTemplate;
        this.flaskApiUrl = flaskApiUrl;
        this.predictionRepository = predictionRepository;
    }

    public Double predictDiabetes(Map<String, Object> patientData, Long userId, String role) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(patientData, headers);

        Map<String, Object> response = restTemplate.exchange(
            flaskApiUrl + "/predict",
            HttpMethod.POST,
            entity,
            Map.class
        ).getBody();

        if (response != null && response.containsKey("probability")) {
            Double probability = ((Number) response.get("probability")).doubleValue();

            // Créer une nouvelle entité Prediction pour sauvegarder les données
            Prediction prediction = new Prediction();
            prediction.setUserId(userId);
            prediction.setRole(role);
            prediction.setGender((String) patientData.get("gender"));
            prediction.setAge(((Number) patientData.get("age")).intValue());
            prediction.setHypertension((Boolean) patientData.get("hypertension"));
            prediction.setHeartDisease((Boolean) patientData.get("heart_disease"));
            prediction.setSmokingHistory((String) patientData.get("smoking_history"));
            prediction.setBmi(((Number) patientData.get("bmi")).doubleValue());
            prediction.setHba1cLevel(((Number) patientData.get("HbA1c_level")).doubleValue());
            prediction.setBloodGlucoseLevel(((Number) patientData.get("blood_glucose_level")).intValue());
            prediction.setProbability(probability);
            prediction.setPredictionDate(LocalDateTime.now()); // Ajout de la date de prédiction

            // Sauvegarder dans la base de données
            predictionRepository.save(prediction);

            return probability;
        } else {
            throw new RuntimeException("Erreur lors de la prédiction");
        }
    }
}