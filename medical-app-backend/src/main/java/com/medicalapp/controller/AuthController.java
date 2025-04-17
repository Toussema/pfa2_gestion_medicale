package com.medicalapp.controller;

import java.security.Principal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.medicalapp.config.JwtUtil;
import com.medicalapp.entity.User;
import com.medicalapp.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping(value = "/register", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> register(@RequestBody User user) {
        logger.info("Received register request for email: {}", user.getEmail());
        logger.debug("User details: name={}, email={}, role={}", user.getName(), user.getEmail(), user.getRole());
        try {
            User savedUser = userService.registerUser(user);
            logger.info("User registered successfully: id={}, email={}", savedUser.getId(), savedUser.getEmail());
            return ResponseEntity.status(201).body("{\"message\": \"Inscription réussie\"}");
        } catch (RuntimeException e) {
            logger.error("Registration failed for email {}: {}", user.getEmail(), e.getMessage());
            return ResponseEntity.badRequest().body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        logger.info("Received login request for email: {}", loginRequest.getEmail());
        try {
            User user = userService.findByEmail(loginRequest.getEmail());
            logger.info("User found: id={}, email={}", user.getId(), user.getEmail());
            if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                logger.warn("Password mismatch for email: {}", loginRequest.getEmail());
                return ResponseEntity.status(401).body("{\"message\": \"Identifiants incorrects\"}");
            }
            String token = jwtUtil.generateToken(user.getId().toString(), user.getEmail(), user.getRole(), user.getName());
            logger.info("Token generated for email {}: {}", user.getEmail(), token);
            return ResponseEntity.ok(new LoginResponse(token, user));
        } catch (RuntimeException e) {
            logger.error("Login failed for email {}: {}", loginRequest.getEmail(), e.getMessage());
            return ResponseEntity.status(401).body("{\"message\": \"" + e.getMessage() + "\"}");
        }
    }

    // Nouveau endpoint pour le médecin connecté (optionnel)
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    static class LoginResponse {
        private final String token;
        private final User user;

        public LoginResponse(String token, User user) {
            this.token = token;
            this.user = user;
        }

        public String getToken() { return token; }
        public User getUser() { return user; }
    }
}