// src/main/java/com/medicalapp/controller/PredictionController.java
package com.medicalapp.controller;

import com.medicalapp.config.JwtUtil;
import com.medicalapp.service.PredictionService;
import com.medicalapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/prediction")
public class PredictionController {

    @Autowired
    private PredictionService predictionService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @PostMapping("/diabetes")
    public ResponseEntity<Double> predictDiabetes(@RequestBody Map<String, Object> patientData, @RequestHeader("Authorization") String token) {
        try {
            // Extraire le token JWT (enlever "Bearer " du début)
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(null);
            }
            String jwt = token.substring(7);

            // Extraire username et role depuis le token
            String username = jwtUtil.getUsernameFromToken(jwt);
            String role = jwtUtil.getRoleFromToken(jwt);

            // Récupérer l'utilisateur pour obtenir son ID
            Long userId = userService.findUserIdByUsername(username);
            if (userId == null) {
                return ResponseEntity.status(404).body(null);
            }

            Double probability = predictionService.predictDiabetes(patientData, userId, role);
            return ResponseEntity.ok(probability);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}